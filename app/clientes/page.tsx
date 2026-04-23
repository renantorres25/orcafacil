'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import { Sidebar } from '../dashboard/page'
import type { Cliente } from '../types'

function tc(str: string) {
  if (!str) return ''
  return str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export default function Clientes() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: orcamentosData } = await supabase
      .from('orcamentos').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const clientesMap = new Map()
    for (const o of (orcamentosData || [])) {
      const key = o.telefone || o.cliente
      if (!clientesMap.has(key)) {
        clientesMap.set(key, { nome: o.cliente, telefone: o.telefone, orcamentos: [], ultimoServico: o.created_at })
      }
      const c = clientesMap.get(key)
      c.orcamentos.push(o)
      if (new Date(o.created_at) > new Date(c.ultimoServico)) c.ultimoServico = o.created_at
    }
    setClientes(Array.from(clientesMap.values()))
    setCarregando(false)
  }

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  )

  const totalClientes = clientes.length
  const comServico = clientes.filter(c => c.orcamentos.some(o => o.status === 'aprovado' || o.status === 'concluido')).length

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  function getStatusColor(status: string) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    if (status === 'concluido') return { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', label: 'Concluído' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  function enviarWhatsApp(telefone: string, nome: string) {
    const numero = telefone.replace(/\D/g, '')
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(`Olá ${nome}! Tudo bem?`)}`)
  }

  // Stats do cliente selecionado
  const statsCliente = clienteSelecionado ? {
    total: clienteSelecionado.orcamentos.length,
    fechados: clienteSelecionado.orcamentos.filter(o => o.status === 'aprovado' || o.status === 'concluido').length,
    pendentes: clienteSelecionado.orcamentos.filter(o => o.status === 'pendente').length,
    faturado: clienteSelecionado.orcamentos.filter(o => o.status === 'aprovado' || o.status === 'concluido').reduce((acc, o) => acc + parseFloat(o.total || 0), 0),
  } : null

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 768px) {
          .cli-cards { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .cli-item:hover { border-color: rgba(99,102,241,0.3) !important; background: #1a1c26 !important; }
      `}</style>

      <Sidebar ativa="/clientes" />

      {/* Modal histórico */}
      {clienteSelecionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setClienteSelecionado(null)}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#2a2d3e', borderRadius: '2px', margin: '0 auto 20px' }} />

            {/* Header cliente */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
                  {tc(clienteSelecionado.nome).charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: '0 0 2px', color: '#f1f5f9' }}>{tc(clienteSelecionado.nome)}</h2>
                  {clienteSelecionado.telefone && <div style={{ fontSize: '12px', color: '#6b7280' }}>📱 {clienteSelecionado.telefone}</div>}
                </div>
              </div>
              <button onClick={() => setClienteSelecionado(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Stats compactos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Orçamentos', value: statsCliente.total, color: '#6366f1' },
                { label: 'Fechados', value: statsCliente.fechados, color: '#10b981' },
                { label: 'Pendentes', value: statsCliente.pendentes, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1e2130', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Faturado */}
            <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Total faturado com este cliente</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>R$ {statsCliente.faturado.toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Ações */}
            {clienteSelecionado.telefone && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => enviarWhatsApp(clienteSelecionado.telefone, clienteSelecionado.nome)}
                  style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  📲 WhatsApp
                </button>
                <button onClick={() => { router.push('/novo-orcamento'); setClienteSelecionado(null) }}
                  style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  📋 Novo orçamento
                </button>
              </div>
            )}

            {/* Histórico */}
            <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Histórico</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {clienteSelecionado.orcamentos.map((o) => {
                const status = getStatusColor(o.status)
                return (
                  <div key={o.id} style={{ background: '#1e2130', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500, marginBottom: '2px' }}>
                        {o.itens?.map(i => tc(i.descricao)).join(', ') || 'Serviço'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4b5563' }}>{formatarData(o.created_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#a5b4fc', marginBottom: '3px' }}>R$ {o.total.toFixed(2).replace('.', ',')}</div>
                      <span style={{ background: status.bg, color: status.text, padding: '1px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>{status.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Clientes 👥</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>{totalClientes} {totalClientes === 1 ? 'cliente' : 'clientes'} cadastrados</p>
          </div>
          <button onClick={() => router.push('/novo-orcamento')} className="novo-btn" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
            + Novo orçamento
          </button>
        </div>

        {/* 2 cards relevantes */}
        <div className="cli-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total de clientes</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#6366f1', fontFamily: "'Syne', sans-serif" }}>{totalClientes}</div>
            </div>
            <span style={{ fontSize: '24px' }}>👥</span>
          </div>
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Com serviço fechado</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', fontFamily: "'Syne', sans-serif" }}>{comServico}</div>
            </div>
            <span style={{ fontSize: '24px' }}>✅</span>
          </div>
        </div>

        {/* Busca */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '14px' }}>🔍</span>
          <input type="text" placeholder="Buscar por nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%', background: '#16181f', border: '1px solid #1e2130', borderRadius: '10px', padding: '10px 16px 10px 40px', color: '#f1f5f9', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
        </div>

        {/* Lista */}
        {carregando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
              {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente ainda.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtrados.map((c, index) => {
              const fechados = c.orcamentos.filter(o => o.status === 'aprovado' || o.status === 'concluido').length
              const ultimoStatus = c.orcamentos[0]?.status
              const statusColor = getStatusColor(ultimoStatus)
              return (
                <div key={index} className="cli-item" onClick={() => setClienteSelecionado(c)} style={{
                  background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px',
                  padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif" }}>
                      {tc(c.nome).charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc(c.nome)}</div>
                      <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                        {c.telefone ? `📱 ${c.telefone} · ` : ''}{formatarData(c.ultimoServico)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>{c.orcamentos.length} {c.orcamentos.length === 1 ? 'orçamento' : 'orçamentos'}</div>
                    {fechados > 0 && <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>{fechados} fechado{fechados > 1 ? 's' : ''}</div>}
                  </div>
                  <span style={{ color: '#4b5563', fontSize: '14px', flexShrink: 0 }}>›</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}