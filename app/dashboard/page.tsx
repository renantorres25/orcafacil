'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '../superbase'

// Componente de Sidebar reutilizável
export function Sidebar({ ativa }: { ativa: string }) {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      if (user) {
        const { data } = await supabase.from('perfis').select('*').eq('user_id', user.id).single()
        setPerfil(data)
      }
    }
    carregar()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const itens = [
    { icon: '▦', label: 'Dashboard', path: '/dashboard' },
    { icon: '◈', label: 'Orçamentos', path: '/orcamentos' },
    { icon: '◉', label: 'Clientes', path: '/clientes' },
    { icon: '◎', label: 'Relatórios', path: '/relatorios' },
    { icon: '⊙', label: 'Meu Perfil', path: '/perfil' },
  ]

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: '#16181f', borderRight: '1px solid #1e2130',
      display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 10
    }}>
      <div style={{ marginBottom: '40px', padding: '0 8px' }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>OrcaFácil</div>
        <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px', letterSpacing: '0.5px' }}>PAINEL PROFISSIONAL</div>
      </div>

      {/* Nome da empresa do perfil */}
      {perfil?.nome_empresa && (
        <div style={{
          marginBottom: '20px', padding: '10px 12px',
          background: 'rgba(99,102,241,0.08)', borderRadius: '10px',
          border: '1px solid rgba(99,102,241,0.15)'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Empresa</div>
          <div style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 600 }}>{perfil.nome_empresa}</div>
          {perfil.especialidade && <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{perfil.especialidade}</div>}
        </div>
      )}

      <nav style={{ flex: 1 }}>
        {itens.map((item) => {
          const active = ativa === item.path
          return (
            <div key={item.label} onClick={() => router.push(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
              background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              color: active ? '#a5b4fc' : '#6b7280',
              cursor: 'pointer', fontSize: '14px', fontWeight: active ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '12px', borderRadius: '12px', background: '#1e2130', border: '1px solid #2a2d3e' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Conta</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {usuario?.email || '...'}
        </div>
        <button onClick={sair} style={{
          width: '100%', padding: '8px', background: 'transparent',
          border: '1px solid #374151', borderRadius: '8px', color: '#6b7280',
          fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
        }}>Sair</button>
      </div>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orcamentoId = searchParams.get('orcamento')
  const linkGerado = orcamentoId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${orcamentoId}` : null
  const [orcamentos, setOrcamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [mostrarLink, setMostrarLink] = useState(!!orcamentoId)
  const [copiado, setCopiado] = useState(false)

  async function carregarOrcamentos(user) {
    const { data } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrcamentos(data || [])
  }

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      if (user) await carregarOrcamentos(user)
      setCarregando(false)
    }
    carregar()
  }, [])

  useEffect(() => {
    if (!usuario) return
    const interval = setInterval(() => carregarOrcamentos(usuario), 30000)
    return () => clearInterval(interval)
  }, [usuario])

  useEffect(() => {
    if (mostrarLink) {
      const timer = setTimeout(() => {
        setMostrarLink(false)
        router.replace('/dashboard')
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [mostrarLink])

  const total = orcamentos.length
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length
  const pendentes = orcamentos.filter(o => o.status === 'pendente').length
  const valorAberto = orcamentos
    .filter(o => o.status === 'pendente')
    .reduce((acc, o) => acc + parseFloat(o.total || 0), 0)

  function copiarLink() {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  function enviarWhatsApp() {
    if (linkGerado) {
      const msg = `Olá! Segue o link do seu orçamento: ${linkGerado}`
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    }
  }

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/dashboard" />

      <div style={{ marginLeft: '240px', padding: '32px 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Bem-vindo de volta 👋</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gerencie seus orçamentos com facilidade</p>
          </div>
          <button onClick={() => router.push('/novo-orcamento')} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif"
          }}>+ Novo orçamento</button>
        </div>

        {mostrarLink && linkGerado && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px',
            padding: '24px', marginBottom: '32px', position: 'relative'
          }}>
            <button onClick={() => { setMostrarLink(false); router.replace('/dashboard') }} style={{
              position: 'absolute', top: '12px', right: '16px',
              background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer'
            }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '16px' }}>Orçamento criado com sucesso!</span>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 16px',
              fontSize: '13px', color: '#9ca3af', wordBreak: 'break-all', marginBottom: '16px', border: '1px solid #1e2130'
            }}>{linkGerado}</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={copiarLink} style={{
                background: copiado ? '#047857' : '#059669', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>{copiado ? '✓ Copiado!' : 'Copiar link'}</button>
              <button onClick={enviarWhatsApp} style={{
                background: '#16a34a', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>📲 Enviar pelo WhatsApp</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total enviados', value: total, color: '#6366f1', icon: '📋' },
            { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅' },
            { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳' },
            { label: 'Valor em aberto', value: `R$ ${valorAberto.toFixed(2).replace('.', ',')}`, color: '#8b5cf6', icon: '💰' },
          ].map((card) => (
            <div key={card.label} style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>Orçamentos recentes</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#4b5563' }}>{total} no total</span>
              <button onClick={() => usuario && carregarOrcamentos(usuario)} style={{
                background: '#1e2130', border: '1px solid #2a2d3e', color: '#6b7280',
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}>↻ Atualizar</button>
            </div>
          </div>

          {carregando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
          ) : orcamentos.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Nenhum orçamento ainda. Crie o primeiro!</p>
              <button onClick={() => router.push('/novo-orcamento')} style={{
                marginTop: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>Criar orçamento</button>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '12px 24px', fontSize: '11px', color: '#4b5563',
                letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid #1e2130'
              }}>
                <span>Cliente</span><span>Total</span><span>Status</span><span>Ação</span>
              </div>
              {orcamentos.map((o) => {
                const status = getStatusColor(o.status)
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${o.id}`
                return (
                  <div key={o.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '16px 24px', borderBottom: '1px solid #1e2130', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#e2e8f0' }}>{o.cliente}</div>
                      {o.telefone && <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>{o.telefone}</div>}
                    </div>
                    <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '15px' }}>
                      R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}
                    </div>
                    <div>
                      <span style={{ background: status.bg, color: status.text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { navigator.clipboard.writeText(link); alert('Link copiado!') }} style={{
                        background: '#1e2130', border: '1px solid #2a2d3e', color: '#9ca3af',
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif"
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
