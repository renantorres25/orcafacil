'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Orcamento, Perfil } from '../types'

export const globalMobileCSS = `
  @media (max-width: 768px) {
    .sidebar-desktop { display: none !important; }
    .main-content { margin-left: 0 !important; padding: 20px 16px 90px 16px !important; }
    .bottom-nav { display: flex !important; }
    .hide-mobile { display: none !important; }
    .novo-btn { padding: 10px 16px !important; font-size: 13px !important; }
    .page-title { font-size: 22px !important; }
  }
  @media (min-width: 769px) {
    .bottom-nav { display: none !important; }
  }
`

const Icons = {
  home: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#a5b4fc' : 'none'} stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  orcamentos: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  clientes: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  agenda: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  relatorios: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  perfil: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

// AJUSTE 1: função titleCase global
function titleCase(str: string) {
  if (!str) return ''
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export function Sidebar({ ativa }: { ativa: string }) {
  const router = useRouter()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

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
    { key: 'home', label: 'Início', path: '/dashboard' },
    { key: 'orcamentos', label: 'Orçamentos', path: '/orcamentos' },
    { key: 'clientes', label: 'Clientes', path: '/clientes' },
    { key: 'agenda', label: 'Agenda', path: '/agenda' },
    { key: 'relatorios', label: 'Relatórios', path: '/relatorios' },
    { key: 'perfil', label: 'Perfil', path: '/perfil' },
  ]

  const itensSidebar = [
    { key: 'home', label: 'Dashboard', path: '/dashboard' },
    { key: 'orcamentos', label: 'Orçamentos', path: '/orcamentos' },
    { key: 'clientes', label: 'Clientes', path: '/clientes' },
    { key: 'agenda', label: 'Agenda', path: '/agenda' },
    { key: 'relatorios', label: 'Relatórios', path: '/relatorios' },
    { key: 'perfil', label: 'Meu Perfil', path: '/perfil' },
  ]

  return (
    <>
      <style>{globalMobileCSS}</style>
      <div className="sidebar-desktop" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px', background: '#16181f', borderRight: '1px solid #1e2130', display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 10 }}>
        <div style={{ marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OrcaFácil</div>
          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px', letterSpacing: '0.5px' }}>PAINEL PROFISSIONAL</div>
        </div>
        {perfil?.nome_empresa && (
          <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Empresa</div>
            <div style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 600 }}>{titleCase(perfil.nome_empresa)}</div>
            {perfil.especialidade && <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{perfil.especialidade}</div>}
          </div>
        )}
        <nav style={{ flex: 1 }}>
          {itensSidebar.map((item) => {
            const active = ativa === item.path
            return (
              <div key={item.key} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '4px', background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', color: active ? '#a5b4fc' : '#6b7280', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
                {Icons[item.key as keyof typeof Icons](active)}
                {item.label}
              </div>
            )
          })}
        </nav>
        <div style={{ padding: '12px', borderRadius: '12px', background: '#1e2130', border: '1px solid #2a2d3e' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Conta</div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.email || '...'}</div>
          <button onClick={sair} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#6b7280', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Sair</button>
        </div>
      </div>

      <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#16181f', borderTop: '1px solid #1e2130', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100, justifyContent: 'space-around', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
        {itens.map((item) => {
          const active = ativa === item.path
          return (
            <div key={item.key} onClick={() => router.push(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 8px', cursor: 'pointer', flex: 1, borderTop: active ? '2px solid #6366f1' : '2px solid transparent' }}>
              {Icons[item.key as keyof typeof Icons](active)}
              <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400, color: active ? '#a5b4fc' : '#4b5563' }}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orcamentoId = searchParams.get('orcamento')
  const linkGerado = orcamentoId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${orcamentoId}` : null
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [mostrarLink, setMostrarLink] = useState(!!orcamentoId)
  const [copiado, setCopiado] = useState(false)

  async function carregarOrcamentos(user: User) {
    const { data } = await supabase.from('orcamentos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOrcamentos(data || [])
  }

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      if (user) {
        await carregarOrcamentos(user)
        const { data: perfilData } = await supabase.from('perfis').select('*').eq('user_id', user.id).single()
        setPerfil(perfilData)
      }
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
      const timer = setTimeout(() => { setMostrarLink(false); router.replace('/dashboard') }, 10000)
      return () => clearTimeout(timer)
    }
  }, [mostrarLink])

  const total = orcamentos.length
  const pendentes = orcamentos.filter(o => o.status === 'pendente').length
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length
  const concluidos = orcamentos.filter(o => o.status === 'concluido').length
  const recusados = orcamentos.filter(o => o.status === 'recusado').length
  const aReceber = orcamentos.filter(o => o.status === 'aprovado').reduce((acc, o) => acc + o.total, 0)
  const faturado = orcamentos.filter(o => o.status === 'concluido').reduce((acc, o) => acc + o.total, 0)

  function copiarLink() {
    if (linkGerado) { navigator.clipboard.writeText(linkGerado); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }
  }

  function enviarWhatsApp() {
    if (!linkGerado) return
    const nomeEmpresa = perfil?.nome_empresa || 'OrcaFácil'
    const msg = `Olá, tudo bem? 👋\n\nPreparei seu orçamento com todos os detalhes do serviço solicitado.\n\n📄 Clique no link abaixo para visualizar e aprovar:\n${linkGerado}\n\n✅ Serviço profissional\n✅ Transparência nos valores\n✅ Agilidade no atendimento\n\nQualquer dúvida estou à disposição! 😊\n\n— ${nomeEmpresa}`
    const orcamentoAtual = orcamentos.find(o => o.id === orcamentoId)
    const telefone = orcamentoAtual?.telefone?.replace(/\D/g, '')
    if (telefone) {
      window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`)
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    }
  }

  function getStatusColor(status: string) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    if (status === 'concluido') return { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', label: 'Concluído' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  // AJUSTE 1: titleCase no nome da empresa
  const nomeEmpresa = titleCase(perfil?.nome_empresa || '')

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/dashboard" />

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Bem-vindo 👋</h1>
            {nomeEmpresa ? (
              <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{nomeEmpresa}</p>
            ) : (
              <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gerencie seus orçamentos</p>
            )}
          </div>
          <button className="novo-btn" onClick={() => router.push('/novo-orcamento')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif" }}>+ Novo</button>
        </div>

        {mostrarLink && linkGerado && (
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '24px', position: 'relative' }}>
            <button onClick={() => { setMostrarLink(false); router.replace('/dashboard') }} style={{ position: 'absolute', top: '12px', right: '16px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span>✅</span>
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '15px' }}>Orçamento criado!</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#9ca3af', wordBreak: 'break-all', marginBottom: '14px' }}>{linkGerado}</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={copiarLink} style={{ background: copiado ? '#047857' : '#059669', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{copiado ? '✓ Copiado!' : 'Copiar link'}</button>
              <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>📲 WhatsApp</button>
            </div>
          </div>
        )}

        {/* Cards financeiros */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '16px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>A receber</span>
              <span style={{ fontSize: '10px', color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                {aprovados} aprovado{aprovados !== 1 ? 's' : ''}
              </span>
            </div>
            {/* AJUSTE 2: fonte menor nos valores */}
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px', letterSpacing: '-0.3px' }}>R$ {fmt(aReceber)}</div>
            <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>Fechados, aguardando execução</div>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '16px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Faturado</span>
              <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                {concluidos} concluído{concluidos !== 1 ? 's' : ''}
              </span>
            </div>
            {/* AJUSTE 2: fonte menor nos valores */}
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#34d399', marginBottom: '4px', letterSpacing: '-0.3px' }}>R$ {fmt(faturado)}</div>
            <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>Executados e finalizados</div>
          </div>
        </div>

        {/* AJUSTE 4: cards menores com emoji menor e número proporcional */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: total, color: '#6366f1', icon: '📋' },
            { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳' },
            { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅' },
            { label: 'Recusados', value: recusados, color: '#f87171', icon: '❌' },
          ].map((card) => (
            <div key={card.label} style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px' }}>{card.icon}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Lista de orçamentos recentes */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Orçamentos recentes</h2>
            <button onClick={() => usuario && carregarOrcamentos(usuario)} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#6b7280', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>↻</button>
          </div>
          {carregando ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
          ) : orcamentos.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Nenhum orçamento ainda.</p>
              <button onClick={() => router.push('/novo-orcamento')} style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Criar orçamento</button>
            </div>
          ) : (
            <div>
              {orcamentos.map((o) => {
                const status = getStatusColor(o.status)
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/orcamento/${o.id}`
                return (
                  <div key={o.id} style={{ padding: '14px 20px', borderBottom: '1px solid #1e2130', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* AJUSTE 3: titleCase nos nomes dos clientes */}
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titleCase(o.cliente)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ background: status.bg, color: status.text, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{status.label}</span>
                        <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>R$ {o.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(link); alert('Link copiado!') }} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#9ca3af', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>🔗</button>
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