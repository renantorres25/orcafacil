'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

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

  // Filtra por mês e ano selecionado
  const doMes = orcamentos.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === mesSelecionado && d.getFullYear() === anoSelecionado
  })

  // Mês anterior
  const mesAnterior = mesSelecionado === 0 ? 11 : mesSelecionado - 1
  const anoAnterior = mesSelecionado === 0 ? anoSelecionado - 1 : anoSelecionado
  const doMesAnterior = orcamentos.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === mesAnterior && d.getFullYear() === anoAnterior
  })

  // Métricas do mês
  const faturadoMes = doMes.filter(o => o.status === 'aprovado').reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
  const faturadoAnterior = doMesAnterior.filter(o => o.status === 'aprovado').reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
  const crescimento = faturadoAnterior > 0 ? ((faturadoMes - faturadoAnterior) / faturadoAnterior * 100).toFixed(1) : null
  const aprovadosMes = doMes.filter(o => o.status === 'aprovado').length
  const enviadosMes = doMes.length
  const taxaAprovacao = enviadosMes > 0 ? ((aprovadosMes / enviadosMes) * 100).toFixed(0) : 0
  const ticketMedio = aprovadosMes > 0 ? faturadoMes / aprovadosMes : 0

  // Gráfico dos últimos 6 meses
  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anoSelecionado, mesSelecionado - i, 1)
    const m = d.getMonth()
    const a = d.getFullYear()
    const fat = orcamentos
      .filter(o => {
        const od = new Date(o.created_at)
        return od.getMonth() === m && od.getFullYear() === a && o.status === 'aprovado'
      })
      .reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
    return { mes: meses[m].substring(0, 3), valor: fat, m, a }
  }).reverse()

  const maxValor = Math.max(...ultimos6Meses.map(m => m.valor), 1)

  // Top serviços
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

  // Top clientes
  const clientesMap = new Map()
  doMes.filter(o => o.status === 'aprovado').forEach(o => {
    const key = o.cliente
    if (!clientesMap.has(key)) clientesMap.set(key, { nome: o.cliente, total: 0, count: 0 })
    clientesMap.get(key).total += parseFloat(o.total || 0)
    clientesMap.get(key).count++
  })
  const topClientes = Array.from(clientesMap.values()).sort((a, b) => b.total - a.total).slice(0, 5)

  function navMes(dir) {
    let novoMes = mesSelecionado + dir
    let novoAno = anoSelecionado
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    setMesSelecionado(novoMes)
    setAnoSelecionado(novoAno)
  }

  const cardStyle = {
    background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '20px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/relatorios" />

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Relatórios 📊</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Acompanhe seu desempenho</p>
          </div>

          {/* Seletor de mês */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16181f', border: '1px solid #1e2130', borderRadius: '12px', padding: '8px 16px' }}>
            <button onClick={() => navMes(-1)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>‹</button>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', minWidth: '130px', textAlign: 'center' }}>
              {meses[mesSelecionado]} {anoSelecionado}
            </span>
            <button onClick={() => navMes(1)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>›</button>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
        ) : (
          <>
            {/* Cards principais */}
            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>

              {/* Faturado */}
              <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>💰 Faturado</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#a5b4fc', fontFamily: "'Syne', sans-serif" }}>
                  R$ {faturadoMes.toFixed(2).replace('.', ',')}
                </div>
                {crescimento !== null && (
                  <div style={{ fontSize: '12px', marginTop: '6px', color: parseFloat(crescimento) >= 0 ? '#34d399' : '#f87171' }}>
                    {parseFloat(crescimento) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(crescimento))}% vs mês anterior
                  </div>
                )}
              </div>

              {/* Orçamentos enviados */}
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>📋 Enviados</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#6366f1', fontFamily: "'Syne', sans-serif" }}>{enviadosMes}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px' }}>{aprovadosMes} aprovados</div>
              </div>

              {/* Taxa de aprovação */}
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>✅ Aprovação</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', fontFamily: "'Syne', sans-serif" }}>{taxaAprovacao}%</div>
                <div style={{ marginTop: '8px', background: '#1e2130', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${taxaAprovacao}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Ticket médio */}
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>🎯 Ticket médio</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', fontFamily: "'Syne', sans-serif" }}>
                  R$ {ticketMedio.toFixed(2).replace('.', ',')}
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px' }}>por serviço aprovado</div>
              </div>
            </div>

            {/* Gráfico de barras */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>📈 Faturamento — últimos 6 meses</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
                {ultimos6Meses.map((m, i) => {
                  const altura = maxValor > 0 ? (m.valor / maxValor) * 100 : 0
                  const ativo = m.m === mesSelecionado && m.a === anoSelecionado
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      onClick={() => { setMesSelecionado(m.m); setAnoSelecionado(m.a) }}>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {m.valor > 0 ? `R$${(m.valor/1000).toFixed(1)}k` : ''}
                      </div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '80px' }}>
                        <div style={{
                          width: '100%',
                          height: `${Math.max(altura, 4)}%`,
                          background: ativo ? 'linear-gradient(180deg, #6366f1, #8b5cf6)' : '#1e2130',
                          borderRadius: '6px 6px 0 0',
                          border: ativo ? '1px solid rgba(99,102,241,0.4)' : '1px solid #2a2d3e',
                          transition: 'all 0.2s',
                          minHeight: '8px'
                        }} />
                      </div>
                      <div style={{ fontSize: '11px', color: ativo ? '#a5b4fc' : '#4b5563', fontWeight: ativo ? 600 : 400 }}>{m.mes}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

              {/* Top serviços */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>🔧 Top serviços</h2>
                {topServicos.length === 0 ? (
                  <p style={{ color: '#4b5563', fontSize: '13px' }}>Nenhum serviço neste mês</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topServicos.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                            background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#1e2130',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: i === 0 ? 'white' : '#6b7280'
                          }}>{i + 1}</div>
                          <span style={{ fontSize: '13px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nome}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', flexShrink: 0, marginLeft: '8px' }}>
                          R$ {s.total.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top clientes */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>🏆 Top clientes</h2>
                {topClientes.length === 0 ? (
                  <p style={{ color: '#4b5563', fontSize: '13px' }}>Nenhum cliente aprovado neste mês</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topClientes.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                            background: i === 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e2130',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: i === 0 ? 'white' : '#6b7280'
                          }}>{i + 1}</div>
                          <span style={{ fontSize: '13px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', flexShrink: 0, marginLeft: '8px' }}>
                          R$ {c.total.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lista de orçamentos do mês */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                📋 Orçamentos de {meses[mesSelecionado]}
                <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 400, marginLeft: '8px' }}>{doMes.length} no total</span>
              </h2>
              {doMes.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '13px' }}>Nenhum orçamento neste mês</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {doMes.map((o) => {
                    const cor = o.status === 'aprovado' ? { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
                      : o.status === 'recusado' ? { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
                      : { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
                    return (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#1e2130', borderRadius: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>{o.cliente}</div>
                          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                            {new Date(o.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: cor.bg, color: cor.text, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{cor.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#a5b4fc' }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
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