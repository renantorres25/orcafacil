'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import { Sidebar } from '../dashboard/page'

export default function Agenda() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [diaSelecionado, setDiaSelecionado] = useState(new Date())
  const [modalAgendamento, setModalAgendamento] = useState(null)
  const [modalDetalhes, setModalDetalhes] = useState(null)
  const [dataInput, setDataInput] = useState('')
  const [horaInput, setHoraInput] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data } = await supabase
      .from('orcamentos').select('*').eq('user_id', user.id)
      .eq('status', 'aprovado').order('data_agendamento', { ascending: true })
    setOrcamentos(data || [])
    setCarregando(false)
  }

  async function salvarAgendamento() {
    if (!dataInput || !horaInput) { alert('Preencha data e horário!'); return }
    setSalvando(true)
    const dataHora = `${dataInput}T${horaInput}:00`
    await supabase.from('orcamentos').update({ data_agendamento: dataHora }).eq('id', modalAgendamento.id)
    setSalvando(false); setModalAgendamento(null); setDataInput(''); setHoraInput(''); carregar()
  }

  async function removerAgendamento(id) {
    await supabase.from('orcamentos').update({ data_agendamento: null }).eq('id', id)
    setModalDetalhes(null); carregar()
  }

  function getDiasDaSemana(base) {
    const inicio = new Date(base)
    const diaSemana = inicio.getDay()
    inicio.setDate(inicio.getDate() - diaSemana)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio); d.setDate(inicio.getDate() + i); return d
    })
  }

  const diasSemana = getDiasDaSemana(diaSelecionado)
  const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  function isMesmoDia(d1, d2) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  }

  const agendadosDia = orcamentos.filter(o => o.data_agendamento && isMesmoDia(new Date(o.data_agendamento), diaSelecionado))
    .sort((a, b) => new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime())

  const semAgendamento = orcamentos.filter(o => !o.data_agendamento)

  const diasComAgendamento = diasSemana.map(dia => ({
    dia, count: orcamentos.filter(o => o.data_agendamento && isMesmoDia(new Date(o.data_agendamento), dia)).length
  }))

  function formatarHora(dataStr) {
    return new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatarDataExtenso(d) {
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function navSemana(dir) {
    const nova = new Date(diaSelecionado); nova.setDate(nova.getDate() + dir * 7); setDiaSelecionado(nova)
  }

  const hoje = new Date()

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; padding: 20px 16px 90px 16px !important; }
          .agenda-grid { grid-template-columns: 1fr !important; }
        }
        .card-servico:hover { border-color: rgba(99,102,241,0.4) !important; background: #1a1c26 !important; }
      `}</style>

      <Sidebar ativa="/agenda" />

      {/* Modal detalhes do serviço */}
      {modalDetalhes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setModalDetalhes(null)}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#2a2d3e', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: '#f1f5f9' }}>{modalDetalhes.cliente}</h2>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Aprovado</span>
              </div>
              <button onClick={() => setModalDetalhes(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Horário agendado */}
            {modalDetalhes.data_agendamento && (
              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📅 Agendado</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#a5b4fc', fontFamily: "'Syne', sans-serif" }}>
                  {formatarHora(modalDetalhes.data_agendamento)} — {new Date(modalDetalhes.data_agendamento).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#a5b4fc', fontFamily: "'Syne', sans-serif" }}>R$ {parseFloat(modalDetalhes.total).toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Itens */}
            {modalDetalhes.itens?.length > 0 && (
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>🔧 Serviços</div>
                {modalDetalhes.itens.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < modalDetalhes.itens.length - 1 ? '1px solid #2a2d3e' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.descricao}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc' }}>R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Telefone */}
            {modalDetalhes.telefone && (
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📱 WhatsApp</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{modalDetalhes.telefone}</span>
                  <button onClick={() => window.open(`https://wa.me/55${modalDetalhes.telefone.replace(/\D/g,'')}`, '_blank')}
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    📲 Chamar
                  </button>
                </div>
              </div>
            )}

            {/* Endereço */}
            {modalDetalhes.endereco && (
              <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📍 Endereço</div>
                <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{modalDetalhes.endereco}</div>
                {modalDetalhes.complemento && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{modalDetalhes.complemento}</div>}
                <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(modalDetalhes.endereco)}`, '_blank')}
                  style={{ marginTop: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  🗺️ Abrir no Maps
                </button>
              </div>
            )}

            {/* Observações */}
            {modalDetalhes.observacoes && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📝 Observações</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>{modalDetalhes.observacoes}</div>
              </div>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button onClick={() => { setModalAgendamento(modalDetalhes); setDataInput(modalDetalhes.data_agendamento?.split('T')[0] || ''); setHoraInput(modalDetalhes.data_agendamento?.split('T')[1]?.slice(0,5) || ''); setModalDetalhes(null) }}
                style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ✏️ Editar horário
              </button>
              <button onClick={() => removerAgendamento(modalDetalhes.id)}
                style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ✕ Remover agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agendamento */}
      {modalAgendamento && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setModalAgendamento(null)}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#2a2d3e', borderRadius: '2px', margin: '0 auto 20px' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: '#f1f5f9' }}>📅 Agendar serviço</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 20px' }}>Cliente: <strong style={{ color: '#a5b4fc' }}>{modalAgendamento.cliente}</strong> — R$ {parseFloat(modalAgendamento.total).toFixed(2).replace('.', ',')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Data do serviço</label>
                <input type="date" value={dataInput} onChange={e => setDataInput(e.target.value)} style={{ width: '100%', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Horário</label>
                <input type="time" value={horaInput} onChange={e => setHoraInput(e.target.value)} style={{ width: '100%', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <button onClick={salvarAgendamento} disabled={salvando} style={{ background: salvando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {salvando ? 'Salvando...' : '✓ Confirmar agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Agenda 📅</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gerencie seus serviços agendados</p>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
        ) : (
          <>
            <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <button onClick={() => navSemana(-1)} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#9ca3af', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" }}>‹</button>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                  {diasSemana[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – {diasSemana[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => navSemana(1)} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#9ca3af', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {diasComAgendamento.map(({ dia, count }, i) => {
                  const isHoje = isMesmoDia(dia, hoje)
                  const isSelecionado = isMesmoDia(dia, diaSelecionado)
                  return (
                    <div key={i} onClick={() => setDiaSelecionado(new Date(dia))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: '12px', cursor: 'pointer', background: isSelecionado ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))' : 'transparent', border: isSelecionado ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '10px', color: isSelecionado ? '#a5b4fc' : '#4b5563', fontWeight: 600, textTransform: 'uppercase' }}>{diasNomes[i]}</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: isHoje ? '#6366f1' : isSelecionado ? '#f1f5f9' : '#9ca3af', fontFamily: "'Syne', sans-serif" }}>{dia.getDate()}</span>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: count > 0 ? (isSelecionado ? '#a5b4fc' : '#6366f1') : 'transparent' }} />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="agenda-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, margin: 0, color: '#f1f5f9', textTransform: 'capitalize' }}>{formatarDataExtenso(diaSelecionado)}</h2>
                  {isMesmoDia(diaSelecionado, hoje) && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.3)' }}>Hoje</span>}
                </div>

                {agendadosDia.length === 0 ? (
                  <div style={{ background: '#16181f', border: '1px dashed #2a2d3e', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
                    <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>Nenhum serviço agendado para este dia.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {agendadosDia.map((o) => (
                      <div key={o.id} className="card-servico" onClick={() => setModalDetalhes(o)}
                        style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start', borderLeft: '3px solid #6366f1', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ textAlign: 'center', minWidth: '52px' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#a5b4fc', fontFamily: "'Syne', sans-serif" }}>{formatarHora(o.data_agendamento)}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#f1f5f9', marginBottom: '4px' }}>{o.cliente}</div>
                          {o.telefone && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>📱 {o.telefone}</div>}
                          {o.endereco && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>📍 {o.endereco}</div>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                            {o.itens?.slice(0, 2).map((item, idx) => (
                              <span key={idx} style={{ background: '#1e2130', color: '#9ca3af', fontSize: '11px', padding: '3px 10px', borderRadius: '20px' }}>{item.descricao}</span>
                            ))}
                            {o.itens?.length > 2 && <span style={{ background: '#1e2130', color: '#6b7280', fontSize: '11px', padding: '3px 10px', borderRadius: '20px' }}>+{o.itens.length - 2}</span>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
                            <span style={{ fontSize: '12px', color: '#4b5563' }}>Toque para detalhes ›</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, margin: '0 0 14px', color: '#f1f5f9' }}>
                  ⏳ Aguardando agendamento
                  {semAgendamento.length > 0 && <span style={{ marginLeft: '8px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{semAgendamento.length}</span>}
                </h2>

                {semAgendamento.length === 0 ? (
                  <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                    <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>Todos agendados!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {semAgendamento.map(o => (
                      <div key={o.id} style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '14px', padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9', marginBottom: '4px' }}>{o.cliente}</div>
                        {o.telefone && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>📱 {o.telefone}</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#a5b4fc' }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
                          <button onClick={() => { setModalAgendamento(o); setDataInput(''); setHoraInput('') }}
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                            + Agendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}