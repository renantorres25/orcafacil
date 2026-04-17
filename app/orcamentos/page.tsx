'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

export default function Orcamentos() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrcamentos(data || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  const filtrados = orcamentos.filter(o => {
    const matchFiltro = filtro === 'todos' || o.status === filtro
    const matchBusca = o.cliente.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const total = orcamentos.length
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length
  const pendentes = orcamentos.filter(o => o.status === 'pendente').length
  const recusados = orcamentos.filter(o => o.status === 'recusado').length

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  function copiarLink(id) {
    const link = `${window.location.origin}/orcamento/${id}`
    navigator.clipboard.writeText(link)
    alert('Link copiado!')
  }

  function enviarWhatsApp(o) {
    const link = `${window.location.origin}/orcamento/${o.id}`
    const msg = `Olá ${o.cliente}! Segue o link do seu orçamento: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/orcamentos" />

      <div style={{ marginLeft: '240px', padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              Orçamentos 📋
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
              Gerencie todos os seus orçamentos
            </p>
          </div>
          <button onClick={() => router.push('/novo-orcamento')} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif"
          }}>+ Novo orçamento</button>
        </div>

        {/* Cards resumo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total', value: total, color: '#6366f1', icon: '📋', filtro: 'todos' },
            { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅', filtro: 'aprovado' },
            { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳', filtro: 'pendente' },
            { label: 'Recusados', value: recusados, color: '#ef4444', icon: '❌', filtro: 'recusado' },
          ].map((card) => (
            <div key={card.label} onClick={() => setFiltro(card.filtro)} style={{
              background: filtro === card.filtro ? 'rgba(99,102,241,0.1)' : '#16181f',
              border: filtro === card.filtro ? '1px solid rgba(99,102,241,0.4)' : '1px solid #1e2130',
              borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{card.icon}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Busca e filtros */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%', background: '#16181f', border: '1px solid #1e2130',
                borderRadius: '12px', padding: '12px 16px 12px 42px', color: '#f1f5f9',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['todos', 'pendente', 'aprovado', 'recusado'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: filtro === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#16181f',
                color: filtro === f ? 'white' : '#6b7280',
                border: filtro === f ? 'none' : '1px solid #1e2130',
                transition: 'all 0.2s'
              }}>
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
              {filtrados.length} {filtrados.length === 1 ? 'orçamento' : 'orçamentos'}
            </span>
          </div>

          {carregando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Nenhum orçamento encontrado.</p>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                padding: '12px 24px', fontSize: '11px', color: '#4b5563',
                letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid #1e2130'
              }}>
                <span>Cliente</span>
                <span>Total</span>
                <span>Status</span>
                <span>Data</span>
                <span>Ações</span>
              </div>

              {filtrados.map((o) => {
                const status = getStatusColor(o.status)
                return (
                  <div key={o.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                    padding: '16px 24px', borderBottom: '1px solid #1e2130', alignItems: 'center',
                    transition: 'background 0.15s'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#e2e8f0' }}>{o.cliente}</div>
                      {o.telefone && <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>{o.telefone}</div>}
                    </div>
                    <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '15px' }}>
                      R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}
                    </div>
                    <div>
                      <span style={{
                        background: status.bg, color: status.text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600
                      }}>{status.label}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {formatarData(o.created_at)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => copiarLink(o.id)} style={{
                        background: '#1e2130', border: '1px solid #2a2d3e', color: '#9ca3af',
                        padding: '6px 10px', borderRadius: '8px', fontSize: '11px',
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                      }}>🔗 Link</button>
                      <button onClick={() => enviarWhatsApp(o)} style={{
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                        color: '#34d399', padding: '6px 10px', borderRadius: '8px', fontSize: '11px',
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                      }}>📲 WPP</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
