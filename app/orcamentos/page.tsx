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
  const [modalAberto, setModalAberto] = useState(null)
  const [editando, setEditando] = useState(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data } = await supabase.from('orcamentos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOrcamentos(data || [])
    setCarregando(false)
  }

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    await supabase.from('orcamentos').delete().eq('id', id)
    setModalAberto(null)
    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvandoEdicao(true)
    const totalEditado = editando.itens.reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0)
    await supabase.from('orcamentos').update({ cliente: editando.cliente, telefone: editando.telefone, itens: editando.itens, total: totalEditado }).eq('id', editando.id)
    setSalvandoEdicao(false)
    setEditando(null)
    setModalAberto(null)
    carregar()
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
  const faturado = orcamentos.filter(o => o.status === 'aprovado').reduce((acc, o) => acc + parseFloat(o.total || 0), 0)

  function getStatusColor(status) {
    if (status === 'aprovado') return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Aprovado' }
    if (status === 'recusado') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Recusado' }
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
    window.open(`https://wa.me/?text=${encodeURIComponent(`Olá ${o.cliente}! Segue o link do seu orçamento: ${link}`)}`)
  }

  const inputStyle = {
    width: '100%', background: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/orcamentos" />

      {/* Modal */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => { setModalAberto(null); setEditando(null) }}>
          <div style={{ background: '#16181f', border: '1px solid #2a2d3e', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>

            {!editando ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>{modalAberto.cliente}</h2>
                  <button onClick={() => setModalAberto(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => copiarLink(modalAberto.id)} style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#a5b4fc', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>🔗 Copiar link do orçamento</button>
                  <button onClick={() => enviarWhatsApp(modalAberto)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>📲 Reenviar pelo WhatsApp</button>
                  <button onClick={() => setEditando({ ...modalAberto })} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>✏️ Editar orçamento</button>
                  <div style={{ height: '1px', background: '#2a2d3e', margin: '4px 0' }} />
                  <button onClick={() => excluir(modalAberto.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' as const }}>🗑️ Excluir orçamento</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>✏️ Editar orçamento</h2>
                  <button onClick={() => setEditando(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '16px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Voltar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>Nome do cliente</label>
                    <input type="text" value={editando.cliente} onChange={(e) => setEditando({ ...editando, cliente: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>WhatsApp</label>
                    <input type="text" value={editando.telefone} onChange={(e) => setEditando({ ...editando, telefone: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' }}>Itens</label>
                    {editando.itens.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" value={item.descricao} placeholder="Descrição"
                          onChange={(e) => { const n = [...editando.itens]; n[index] = { ...n[index], descricao: e.target.value }; setEditando({ ...editando, itens: n }) }}
                          style={{ ...inputStyle, flex: 1 }} />
                        <input type="number" value={item.valor} placeholder="R$"
                          onChange={(e) => { const n = [...editando.itens]; n[index] = { ...n[index], valor: e.target.value }; setEditando({ ...editando, itens: n }) }}
                          style={{ ...inputStyle, width: '100px' }} />
                        {editando.itens.length > 1 && (
                          <button onClick={() => setEditando({ ...editando, itens: editando.itens.filter((_, i) => i !== index) })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', width: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setEditando({ ...editando, itens: [...editando.itens, { descricao: '', valor: '' }] })} style={{ background: 'transparent', border: '1px dashed #2a2d3e', color: '#6366f1', padding: '8px', borderRadius: '8px', width: '100%', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>+ Adicionar item</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total</span>
                    <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '16px' }}>R$ {editando.itens.reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0).toFixed(2).replace('.', ',')}</span>
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

      <div style={{ marginLeft: '240px', padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Orçamentos 📋</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gerencie todos os seus orçamentos</p>
          </div>
          <button onClick={() => router.push('/novo-orcamento')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', fontFamily: "'DM Sans', sans-serif" }}>+ Novo orçamento</button>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total', value: total, color: '#6366f1', icon: '📋', f: 'todos' },
            { label: 'Aprovados', value: aprovados, color: '#10b981', icon: '✅', f: 'aprovado' },
            { label: 'Pendentes', value: pendentes, color: '#f59e0b', icon: '⏳', f: 'pendente' },
            { label: 'Recusados', value: recusados, color: '#ef4444', icon: '❌', f: 'recusado' },
          ].map((card) => (
            <div key={card.label} onClick={() => setFiltro(card.f)} style={{
              background: filtro === card.f ? 'rgba(99,102,241,0.1)' : '#16181f',
              border: filtro === card.f ? '1px solid rgba(99,102,241,0.4)' : '1px solid #1e2130',
              borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{card.icon}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: card.color, fontFamily: "'Syne', sans-serif" }}>{card.value}</div>
            </div>
          ))}
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>💵</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Faturado</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', fontFamily: "'Syne', sans-serif" }}>R$ {faturado.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>

        {/* Busca */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }}>🔍</span>
            <input type="text" placeholder="Buscar por nome do cliente..." value={busca} onChange={(e) => setBusca(e.target.value)}
              style={{ width: '100%', background: '#16181f', border: '1px solid #1e2130', borderRadius: '12px', padding: '12px 16px 12px 42px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['todos', 'pendente', 'aprovado', 'recusado'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: filtro === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#16181f',
                color: filtro === f ? 'white' : '#6b7280',
                border: filtro === f ? '1px solid transparent' : '1px solid #1e2130',
              }}>{f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2130' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{filtrados.length} {filtrados.length === 1 ? 'orçamento' : 'orçamentos'}</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 24px', fontSize: '11px', color: '#4b5563', letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid #1e2130' }}>
                <span>Cliente</span><span>Total</span><span>Status</span><span>Data</span><span>Ações</span>
              </div>
              {filtrados.map((o) => {
                const status = getStatusColor(o.status)
                return (
                  <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid #1e2130', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#e2e8f0' }}>{o.cliente}</div>
                      {o.telefone && <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>{o.telefone}</div>}
                    </div>
                    <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '15px' }}>R$ {parseFloat(o.total).toFixed(2).replace('.', ',')}</div>
                    <div><span style={{ background: status.bg, color: status.text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{status.label}</span></div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{formatarData(o.created_at)}</div>
                    <div>
                      <button onClick={() => setModalAberto(o)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>⚙️ Opções</button>
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
