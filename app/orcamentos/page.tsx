'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

// Função mais robusta — funciona com qualquer case
function tc(str) {
  if (!str) return ''
  return str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export default function Orcamentos() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(null)
  const [editando, setEditando] = useState(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data } = await supabase.from('orcamentos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOrcamentos(data || [])
    const { data: perfilData } = await supabase.from('perfis').select('*').eq('user_id', user.id).single()
    setPerfil(perfilData)
    setCarregando(false)
  }

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    await supabase.from('orcamentos').delete().eq('id', id)
    setModalAberto(null); carregar()
  }

  async function marcarConcluido(id) {
    await supabase.from('orcamentos').update({ status: 'concluido' }).eq('id', id)
    setModalAberto(null); carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvandoEdicao(true)
    const totalEditado = editando.itens.reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0)
    await supabase.from('orcamentos').update({
      cliente: editando.cliente, telefone: editando.telefone,
      endereco: editando.endereco || '', complemento: editando.complemento || '',
      itens: editando.itens, total: totalEditado, observacoes: editando.observacoes || ''
    }).eq('id', editando.id)
    setSalvandoEdicao(false); setEditando(null); setModalAberto(null); carregar()
  }

  const filtrados = orcamentos.filter(o => {
    const matchFiltro = filtro === 'todos' || o.status === filtro
    const matchBusca = o.cliente.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const total = orcamentos.length
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length
  const pendentes = orcamentos.filter(o => o.status === 'pendente').length
  const recusados = orcamentos.filter(o => o.status === 'recusado').length
  const concluidos = orcamentos.filter(o => o.status === 'concluido').length

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
    if (status === 'concluido') return { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', label: 'Concluído' }
    return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Pendente' }
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  function copiarLink(id) {
    navigator.clipboard.writeText(`${window.location.origin}/orcamento/${id}`)
    alert('Link copiado!')
  }

  function enviarWhatsApp(o) {
    const link = `${window.location.origin}/orcamento/${o.id}`
    const telefone = o.telefone?.replace(/\D/g, '')
    const nomeEmpresa = perfil?.nome_empresa || 'OrcaFácil'
    const msg = `Olá ${o.cliente}! 👋\n\nPreparei seu orçamento com todos os detalhes do serviço solicitado.\n\n📄 Clique no link abaixo para visualizar e aprovar:\n${link}\n\n✅ Serviço profissional\n✅ Transparência nos valores\n✅ Agilidade no atendimento\n\nQualquer dúvida estou à disposição! 😊\n\n— ${nomeEmpresa}`
    if (telefone) {
      window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`)
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    }
  }

  const inputStyle = {
    width: '100%', background: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  const cards = [
    { label: 'Total', value: total, color: '#6366f1', icon: '📋', f: 'todos' },
    { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳', f: 'pendente' },
    { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅', f: 'aprovado' },
    { label: 'Concluídos', value: concluidos, color: '#a5b4fc', icon: '🏁', f: 'concluido' },
    { label: 'Recusados', value: recusados, color: '#f87171', icon: '❌', f: 'recusado' },
  ]

  // Rótulos dos filtros no plural
  const filtroLabel = { todos: 'Todos', pendente: 'Pendentes', aprovado: 'Aprovados', concluido: 'Concluídos', recusado: 'Recusados' }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 768px) {
          .orc-cards { grid-template-columns: repeat(2, 1fr) !important; }
          .orc-filtros { gap: 6px !important; }
          .orc-filtros button { font-size: 11px !important; padding: 6px 10px !important; }
        }
        .orc-linha:hover { background: rgba(99,102,241,0.05) !important; }
      `}</style>

      <Sidebar ativa="/orcamentos" />

      {/* Modal */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => { setModalAberto(null); setEditando(null) }}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#2a2d3e', borderRadius: '2px', margin: '0 auto 20px' }} />
            {!editando ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: '#f1f5f9' }}>{tc(modalAberto.cliente)}</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {(() => { const s = getStatusColor(modalAberto.status); return <span style={{ background: s.bg, color: s.text, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{s.label}</span> })()}
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>{formatarData(modalAberto.created_at)}</span>
                    </div>
                  </div>
                  <button onClick={() => setModalAberto(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#a5b4fc' }}>R$ {parseFloat(modalAberto.total).toFixed(2).replace('.', ',')}</span>
                </div>
                {modalAberto.itens?.length > 0 && (
                  <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>🔧 Serviços</div>
                    {modalAberto.itens.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < modalAberto.itens.length - 1 ? '1px solid #2a2d3e' : 'none' }}>
                        <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.descricao}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc' }}>R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                )}
                {modalAberto.telefone && (
                  <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📱 WhatsApp</div>
                    <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{modalAberto.telefone}</div>
                  </div>
                )}
                {modalAberto.endereco && (
                  <div style={{ background: '#1e2130', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📍 Endereço</div>
                    <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{modalAberto.endereco}</div>
                    {modalAberto.complemento && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{modalAberto.complemento}</div>}
                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(modalAberto.endereco)}`, '_blank')}
                      style={{ marginTop: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      🗺️ Abrir no Maps
                    </button>
                  </div>
                )}
                {modalAberto.observacoes && (
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📝 Observações</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>{modalAberto.observacoes}</div>
                  </div>
                )}
                {modalAberto.data_agendamento && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📅 Agendado para</div>
                    <div style={{ fontSize: '14px', color: '#34d399', fontWeight: 600 }}>
                      {new Date(modalAberto.data_agendamento).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {new Date(modalAberto.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => copiarLink(modalAberto.id)} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#a5b4fc', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>🔗 Copiar link</button>
                  <button onClick={() => enviarWhatsApp(modalAberto)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>📲 Reenviar pelo WhatsApp</button>
                  <button onClick={() => setEditando({ ...modalAberto })} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>✏️ Editar orçamento</button>
                  {modalAberto.status === 'aprovado' && (
                    <button onClick={() => marcarConcluido(modalAberto.id)} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>✅ Marcar como concluído</button>
                  )}
                  <div style={{ height: '1px', background: '#2a2d3e', margin: '2px 0' }} />
                  <button onClick={() => excluir(modalAberto.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>🗑️ Excluir orçamento</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>✏️ Editar</h2>
                  <button onClick={() => setEditando(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Voltar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>Nome do cliente</label><input type="text" value={editando.cliente} onChange={(e) => setEditando({ ...editando, cliente: e.target.value })} style={inputStyle} /></div>
                  <div><label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>WhatsApp</label><input type="text" value={editando.telefone} onChange={(e) => setEditando({ ...editando, telefone: e.target.value })} style={inputStyle} /></div>
                  <div><label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>📍 Endereço</label><input type="text" value={editando.endereco || ''} placeholder="Ex: Rua das Flores, 123" onChange={(e) => setEditando({ ...editando, endereco: e.target.value })} style={inputStyle} /></div>
                  <div><label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>🏠 Complemento</label><input type="text" value={editando.complemento || ''} placeholder="Ex: Portão azul..." onChange={(e) => setEditando({ ...editando, complemento: e.target.value })} style={inputStyle} /></div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>Itens</label>
                    {editando.itens.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" value={item.descricao} placeholder="Descrição" onChange={(e) => { const n = [...editando.itens]; n[index] = { ...n[index], descricao: e.target.value }; setEditando({ ...editando, itens: n }) }} style={{ ...inputStyle, flex: 1 }} />
                        <input type="number" value={item.valor} placeholder="R$" onChange={(e) => { const n = [...editando.itens]; n[index] = { ...n[index], valor: e.target.value }; setEditando({ ...editando, itens: n }) }} style={{ ...inputStyle, width: '90px' }} />
                        {editando.itens.length > 1 && <button onClick={() => setEditando({ ...editando, itens: editando.itens.filter((_, i) => i !== index) })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', width: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>×</button>}
                      </div>
                    ))}
                    <button onClick={() => setEditando({ ...editando, itens: [...editando.itens, { descricao: '', valor: '' }] })} style={{ background: 'transparent', border: '1px dashed #2a2d3e', color: '#6366f1', padding: '8px', borderRadius: '8px', width: '100%', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>+ Adicionar item</button>
                  </div>
                  <div><label style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>Observações</label><textarea value={editando.observacoes || ''} onChange={(e) => setEditando({ ...editando, observacoes: e.target.value })} placeholder="Ex: Cliente prefere horário da tarde..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.5' }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total</span>
                    <span style={{ color: '#a5b4fc', fontWeight: 700 }}>R$ {editando.itens.reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button onClick={salvarEdicao} disabled={salvandoEdicao} style={{ background: salvandoEdicao ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: salvandoEdicao ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Orçamentos 📋</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gerencie todos os seus orçamentos</p>
          </div>
          <button className="novo-btn" onClick={() => router.push('/novo-orcamento')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif" }}>+ Novo</button>
        </div>

        {/* Cards — 5 colunas desktop, 2 colunas mobile */}
        <div className="orc-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {cards.map((card) => (
            <div key={card.label} onClick={() => setFiltro(card.f)} style={{
              background: filtro === card.f ? 'rgba(99,102,241,0.1)' : '#16181f',
              border: filtro === card.f ? '1px solid rgba(99,102,241,0.35)' : '1px solid #1e2130',
              borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px' }}>{card.icon}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Busca e filtros com plural */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '14px' }}>🔍</span>
            <input type="text" placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)}
              style={{ width: '100%', background: '#16181f', border: '1px solid #1e2130', borderRadius: '10px', padding: '10px 16px 10px 40px', color: '#f1f5f9', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <div className="orc-filtros" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['todos', 'pendente', 'aprovado', 'concluido', 'recusado'] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: filtro === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#16181f',
                color: filtro === f ? 'white' : '#6b7280',
                border: filtro === f ? '1px solid transparent' : '1px solid #1e2130',
              }}>
                {filtroLabel[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #1e2130' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>{filtrados.length} {filtrados.length === 1 ? 'orçamento' : 'orçamentos'}</span>
          </div>
          {carregando ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Nenhum orçamento encontrado.</p>
            </div>
          ) : (
            <div>
              {filtrados.map((o) => {
                const status = getStatusColor(o.status)
                return (
                  <div key={o.id} className="orc-linha" onClick={() => setModalAberto(o)}
                    style={{ padding: '13px 18px', borderBottom: '1px solid #1e2130', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc(o.cliente)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span style={{ background: status.bg, color: status.text, padding: '1px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{status.label}</span>
                        <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
                        <span style={{ fontSize: '11px', color: '#4b5563' }}>{formatarData(o.created_at)}</span>
                        {o.observacoes && <span style={{ fontSize: '11px' }}>📝</span>}
                        {o.endereco && <span style={{ fontSize: '11px' }}>📍</span>}
                        {o.data_agendamento && <span style={{ fontSize: '11px' }}>📅</span>}
                      </div>
                    </div>
                    <span style={{ color: '#4b5563', fontSize: '16px' }}>›</span>
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