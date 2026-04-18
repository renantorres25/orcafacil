'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

function titleCase(str) {
  if (!str) return ''
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Relatorios() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth())
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data } = await supabase.from('orcamentos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOrcamentos(data || [])
    setCarregando(false)
  }

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const doMes = orcamentos.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === mesSelecionado && d.getFullYear() === anoSelecionado
  })

  const mesAnterior = mesSelecionado === 0 ? 11 : mesSelecionado - 1
  const anoAnterior = mesSelecionado === 0 ? anoSelecionado - 1 : anoSelecionado
  const doMesAnterior = orcamentos.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === mesAnterior && d.getFullYear() === anoAnterior
  })

  const faturadoMes = doMes.filter(o => o.status === 'aprovado' || o.status === 'concluido').reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
  const faturadoAnterior = doMesAnterior.filter(o => o.status === 'aprovado' || o.status === 'concluido').reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
  const crescimento = faturadoAnterior > 0 ? ((faturadoMes - faturadoAnterior) / faturadoAnterior * 100).toFixed(1) : null
  const aprovadosMes = doMes.filter(o => o.status === 'aprovado' || o.status === 'concluido').length
  const enviadosMes = doMes.length
  const taxaAprovacao = enviadosMes > 0 ? Math.round((aprovadosMes / enviadosMes) * 100) : 0
  const ticketMedio = aprovadosMes > 0 ? faturadoMes / aprovadosMes : 0

  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anoSelecionado, mesSelecionado - i, 1)
    const m = d.getMonth()
    const a = d.getFullYear()
    const fat = orcamentos.filter(o => {
      const od = new Date(o.created_at)
      return od.getMonth() === m && od.getFullYear() === a && (o.status === 'aprovado' || o.status === 'concluido')
    }).reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
    return { mes: meses[m].substring(0, 3), valor: fat, m, a }
  }).reverse()

  const maxValor = Math.max(...ultimos6Meses.map(m => m.valor), 1)

  const servicosMap = new Map()
  doMes.forEach(o => {
    o.itens?.forEach(item => {
      if (!item.descricao) return
      const key = item.descricao.toLowerCase()
      if (!servicosMap.has(key)) servicosMap.set(key, { nome: item.descricao, total: 0, count: 0 })
      servicosMap.get(key).total += parseFloat(item.valor || 0)
      servicosMap.get(key).count++
    })
  })
  const topServicos = Array.from(servicosMap.values()).sort((a, b) => b.total - a.total).slice(0, 5)

  function navMes(dir) {
    let novoMes = mesSelecionado + dir
    let novoAno = anoSelecionado
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    setMesSelecionado(novoMes)
    setAnoSelecionado(novoAno)
  }

  const card = {
    background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px', padding: '14px 16px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 768px) {
          .rel-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rel-full { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Sidebar ativa="/relatorios" />

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>

        {/* Header com seletor de mês */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Relatórios 📊</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Acompanhe seu desempenho</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#16181f', border: '1px solid #1e2130', borderRadius: '10px', padding: '6px 12px' }}>
            <button onClick={() => navMes(-1)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', minWidth: '110px', textAlign: 'center' }}>
              {meses[mesSelecionado]} {anoSelecionado}
            </span>
            <button onClick={() => navMes(1)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>›</button>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
        ) : (
          <>
            {/* 4 métricas compactas em 2x2 */}
            <div className="rel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>

              <div style={{ ...card, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Faturado</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px', letterSpacing: '-0.3px' }}>R$ {fmt(faturadoMes)}</div>
                {crescimento !== null && (
                  <div style={{ fontSize: '11px', color: parseFloat(crescimento) >= 0 ? '#34d399' : '#f87171' }}>
                    {parseFloat(crescimento) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(crescimento))}% vs anterior
                  </div>
                )}
              </div>

              <div style={card}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Enviados</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#6366f1', marginBottom: '4px' }}>{enviadosMes}</div>
                <div style={{ fontSize: '11px', color: '#4b5563' }}>{aprovadosMes} fechados</div>
              </div>

              <div style={card}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Aprovação</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>{taxaAprovacao}%</div>
                <div style={{ background: '#2a2d3e', borderRadius: '4px', height: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${taxaAprovacao}%`, background: '#10b981', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={card}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Ticket médio</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px', letterSpacing: '-0.3px' }}>R$ {fmt(ticketMedio)}</div>
                <div style={{ fontSize: '11px', color: '#4b5563' }}>por aprovado</div>
              </div>
            </div>

            {/* Gráfico compacto */}
            <div style={{ ...card, marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Faturamento — últimos 6 meses</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '90px' }}>
                {ultimos6Meses.map((m, i) => {
                  const altura = maxValor > 0 ? (m.valor / maxValor) * 100 : 0
                  const ativo = m.m === mesSelecionado && m.a === anoSelecionado
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      onClick={() => { setMesSelecionado(m.m); setAnoSelecionado(m.a) }}>
                      <div style={{ fontSize: '9px', color: '#4b5563' }}>
                        {m.valor > 0 ? `${(m.valor/1000).toFixed(1)}k` : ''}
                      </div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '60px' }}>
                        <div style={{
                          width: '100%', height: `${Math.max(altura, 6)}%`,
                          background: ativo ? '#6366f1' : '#1e2130',
                          borderRadius: '4px 4px 0 0',
                          border: ativo ? '1px solid rgba(99,102,241,0.4)' : '1px solid #2a2d3e',
                          transition: 'all 0.2s', minHeight: '6px'
                        }} />
                      </div>
                      <div style={{ fontSize: '10px', color: ativo ? '#a5b4fc' : '#4b5563', fontWeight: ativo ? 600 : 400 }}>{m.mes}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top serviços — largura total */}
            {topServicos.length > 0 && (
              <div style={{ ...card, marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>🔧 Top serviços do mês</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topServicos.map((s, i) => {
                    const pct = maxValor > 0 ? (s.total / topServicos[0].total) * 100 : 0
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, background: i === 0 ? '#6366f1' : '#1e2130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: i === 0 ? 'white' : '#6b7280' }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '13px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titleCase(s.nome)}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', flexShrink: 0, marginLeft: '8px' }}>R$ {s.total.toFixed(0)}</span>
                          </div>
                          <div style={{ background: '#2a2d3e', borderRadius: '3px', height: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? '#6366f1' : '#4b5563', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lista do mês */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Orçamentos de {meses[mesSelecionado]}</div>
                <span style={{ fontSize: '11px', color: '#4b5563' }}>{doMes.length} no total</span>
              </div>
              {doMes.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>Nenhum orçamento neste mês</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {doMes.map((o) => {
                    const cor = o.status === 'aprovado' ? { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
                      : o.status === 'concluido' ? { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', label: 'Concluído' }
                      : o.status === 'recusado' ? { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
                      : { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
                    return (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#1e2130', borderRadius: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>{titleCase(o.cliente)}</div>
                          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '1px' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: cor.bg, color: cor.text, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{cor.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#a5b4fc' }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}