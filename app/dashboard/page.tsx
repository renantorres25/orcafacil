'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '../superbase'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orcamentoId = searchParams.get('orcamento')
  const linkGerado = orcamentoId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${orcamentoId}` : null
  const [orcamentos, setOrcamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      if (user) {
        const { data } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setOrcamentos(data || [])
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  const total = orcamentos.length
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length
  const pendentes = orcamentos.filter(o => o.status === 'pendente').length
  const valorAberto = orcamentos
    .filter(o => o.status === 'pendente')
    .reduce((acc, o) => acc + parseFloat(o.total || 0), 0)

  function copiarLink() {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado)
      alert('Link copiado!')
    }
  }

  function enviarWhatsApp() {
    if (linkGerado) {
      const msg = `Olá! Segue o link do seu orçamento: ${linkGerado}`
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: '#dcfce7', text: '#15803d', label: 'Aprovado' }
    if (status === 'recusado') return { bg: '#fee2e2', text: '#dc2626', label: 'Recusado' }
    return { bg: '#fef9c3', text: '#a16207', label: 'Pendente' }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'DM Sans', sans-serif",
      color: '#f1f5f9'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '240px',
        background: '#16181f',
        borderRight: '1px solid #1e2130',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '40px', padding: '0 8px' }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '22px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>OrcaFácil</div>
          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px', letterSpacing: '0.5px' }}>PAINEL PROFISSIONAL</div>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { icon: '▦', label: 'Dashboard', active: true },
            { icon: '◈', label: 'Orçamentos', active: false },
            { icon: '◉', label: 'Clientes', active: false },
            { icon: '◎', label: 'Relatórios', active: false },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '4px',
              background: item.active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
              border: item.active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              color: item.active ? '#a5b4fc' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: item.active ? 600 : 400,
              transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{
          padding: '12px',
          borderRadius: '12px',
          background: '#1e2130',
          border: '1px solid #2a2d3e'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Conta</div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.email || '...'}
          </div>
          <button onClick={sair} style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#6b7280',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>Sair</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '240px', padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#f1f5f9',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>Bem-vindo de volta 👋</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
              Gerencie seus orçamentos com facilidade
            </p>
          </div>
          <button
            onClick={() => router.push('/novo-orcamento')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
              letterSpacing: '0.2px'
            }}>
            + Novo orçamento
          </button>
        </div>

        {/* Link gerado */}
        {linkGerado && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '16px' }}>Orçamento criado com sucesso!</span>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#9ca3af',
              wordBreak: 'break-all',
              marginBottom: '16px',
              border: '1px solid #1e2130'
            }}>{linkGerado}</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={copiarLink} style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Copiar link</button>
              <button onClick={enviarWhatsApp} style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>📲 Enviar pelo WhatsApp</button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total enviados', value: total, color: '#6366f1', icon: '📋' },
            { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅' },
            { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳' },
            { label: 'Valor em aberto', value: `R$ ${valorAberto.toFixed(2).replace('.', ',')}`, color: '#8b5cf6', icon: '💰' },
          ].map((card) => (
            <div key={card.label} style={{
              background: '#16181f',
              border: '1px solid #1e2130',
              borderRadius: '16px',
              padding: '24px',
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Lista de orçamentos */}
        <div style={{
          background: '#16181f',
          border: '1px solid #1e2130',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #1e2130',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>Orçamentos recentes</h2>
            <span style={{ fontSize: '12px', color: '#4b5563' }}>{total} no total</span>
          </div>

          {carregando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
          ) : orcamentos.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Nenhum orçamento ainda. Crie o primeiro!</p>
              <button onClick={() => router.push('/novo-orcamento')} style={{
                marginTop: '16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Criar orçamento</button>
            </div>
          ) : (
            <div>
              {/* Header da tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '12px 24px',
                fontSize: '11px',
                color: '#4b5563',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderBottom: '1px solid #1e2130'
              }}>
                <span>Cliente</span>
                <span>Total</span>
                <span>Status</span>
                <span>Ação</span>
              </div>
              {orcamentos.map((o) => {
                const status = getStatusColor(o.status)
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${o.id}`
                return (
                  <div key={o.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: '1px solid #1e2130',
                    alignItems: 'center',
                    transition: 'background 0.2s'
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
                        background: status.bg,
                        color: status.text,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>{status.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { navigator.clipboard.writeText(link); alert('Link copiado!') }} style={{
                        background: '#1e2130',
                        border: '1px solid #2a2d3e',
                        color: '#9ca3af',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>Copiar link</button>
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

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
