'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

export default function Clientes() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    // Busca todos os orçamentos do usuário
    const { data: orcamentosData } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOrcamentos(orcamentosData || [])

    // Agrupa clientes únicos pelos orçamentos
    const clientesMap = new Map()
    for (const o of (orcamentosData || [])) {
      const key = o.telefone || o.cliente
      if (!clientesMap.has(key)) {
        clientesMap.set(key, {
          nome: o.cliente,
          telefone: o.telefone,
          orcamentos: [],
          totalFaturado: 0,
          ultimoServico: o.created_at
        })
      }
      const c = clientesMap.get(key)
      c.orcamentos.push(o)
      if (o.status === 'aprovado') c.totalFaturado += parseFloat(o.total || 0)
      if (new Date(o.created_at) > new Date(c.ultimoServico)) c.ultimoServico = o.created_at
    }

    setClientes(Array.from(clientesMap.values()))
    setCarregando(false)
  }

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  )

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  function enviarWhatsApp(telefone, nome) {
    const numero = telefone.replace(/\D/g, '')
    const msg = `Olá ${nome}! Tudo bem?`
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/clientes" />

      {/* Modal histórico do cliente */}
      {clienteSelecionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setClienteSelecionado(null)}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#2a2d3e', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: '#f1f5f9' }}>{clienteSelecionado.nome}</h2>
                {clienteSelecionado.telefone && (
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>📱 {clienteSelecionado.telefone}</div>
                )}
              </div>
              <button onClick={() => setClienteSelecionado(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#6366f1', fontFamily: "'Syne', sans-serif" }}>{clienteSelecionado.orcamentos.length}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Orçamentos</div>
              </div>
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', fontFamily: "'Syne', sans-serif" }}>{clienteSelecionado.orcamentos.filter(o => o.status === 'aprovado').length}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Aprovados</div>
              </div>
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399', fontFamily: "'Syne', sans-serif" }}>R$ {clienteSelecionado.totalFaturado.toFixed(2).replace('.', ',')}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Faturado</div>
              </div>
            </div>

            {/* Ações rápidas */}
            {clienteSelecionado.telefone && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => enviarWhatsApp(clienteSelecionado.telefone, clienteSelecionado.nome)} style={{
                  flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  color: '#34d399', padding: '12px', borderRadius: '12px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                }}>📲 Enviar WhatsApp</button>
                <button onClick={() => { router.push('/novo-orcamento'); setClienteSelecionado(null) }} style={{
                  flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  color: '#a5b4fc', padding: '12px', borderRadius: '12px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                }}>📋 Novo orçamento</button>
              </div>
            )}

            {/* Histórico */}
            <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Histórico de serviços
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clienteSelecionado.orcamentos.map((o) => {
                const status = getStatusColor(o.status)
                return (
                  <div key={o.id} style={{ background: '#1e2130', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500, marginBottom: '4px' }}>
                        {o.itens?.map(i => i.descricao).join(', ') || 'Serviço'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4b5563' }}>{formatarData(o.created_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px' }}>
                        R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}
                      </div>
                      <span style={{ background: status.bg, color: status.text, padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Clientes 👥</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
              {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'} cadastrados
            </p>
          </div>
          <button onClick={() => router.push('/novo-orcamento')} className="novo-btn" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif"
          }}>+ Novo orçamento</button>
        </div>

        {/* Cards resumo */}
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total de clientes', value: clientes.length, color: '#6366f1', icon: '👥' },
            { label: 'Com aprovação', value: clientes.filter(c => c.orcamentos.some(o => o.status === 'aprovado')).length, color: '#10b981', icon: '✅' },
            { label: 'Total faturado', value: `R$ ${clientes.reduce((acc, c) => acc + c.totalFaturado, 0).toFixed(2).replace('.', ',')}`, color: '#34d399', icon: '💵' },
          ].map((card) => (
            <div key={card.label} style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.icon}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }}>🔍</span>
          <input type="text" placeholder="Buscar cliente por nome ou telefone..." value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%', background: '#16181f', border: '1px solid #1e2130', borderRadius: '12px', padding: '12px 16px 12px 42px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
        </div>

        {/* Lista de clientes */}
        {carregando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
            <p style={{ color: '#4b5563', fontSize: '14px' }}>
              {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente ainda. Crie seu primeiro orçamento!'}
            </p>
            {!busca && (
              <button onClick={() => router.push('/novo-orcamento')} style={{
                marginTop: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>Criar orçamento</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtrados.map((c, index) => (
              <div key={index} onClick={() => setClienteSelecionado(c)} style={{
                background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px',
                padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif"
                  }}>
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                      {c.telefone && `📱 ${c.telefone} · `}
                      Último serviço: {formatarData(c.ultimoServico)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>
                    R$ {c.totalFaturado.toFixed(2).replace('.', ',')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                    {c.orcamentos.length} {c.orcamentos.length === 1 ? 'orçamento' : 'orçamentos'}
                  </div>
                </div>
                <div style={{ color: '#4b5563', fontSize: '16px', flexShrink: 0 }}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
