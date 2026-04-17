'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'

interface Item {
  descricao: string
  valor: string
}

export default function NovoOrcamento() {
  const router = useRouter()
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [itens, setItens] = useState<Item[]>([{ descricao: '', valor: '' }])
  const [salvando, setSalvando] = useState(false)

  function adicionarItem() {
    setItens([...itens, { descricao: '', valor: '' }])
  }

  function removerItem(index: number) {
    setItens(itens.filter((_, i) => i !== index))
  }

  function atualizarItem(index: number, campo: string, valor: string) {
    const novosItens = [...itens]
    novosItens[index] = { ...novosItens[index], [campo]: valor }
    setItens(novosItens)
  }

  const total = itens.reduce((soma, item) => {
    return soma + (parseFloat(item.valor) || 0)
  }, 0)

  async function gerarOrcamento() {
    if (!cliente) { alert('Preencha o nome do cliente!'); return }
    if (itens.every(i => !i.descricao)) { alert('Adicione pelo menos um item!'); return }

    setSalvando(true)

    // Busca o usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Você precisa estar logado!'); setSalvando(false); return }

    // Filtra itens vazios antes de salvar
    const itensFiltrados = itens.filter(i => i.descricao.trim() !== '')

    const { data, error } = await supabase
      .from('orcamentos')
      .insert({ 
        cliente, 
        telefone, 
        itens: itensFiltrados, 
        total,
        user_id: user.id,
        status: 'pendente'
      })
      .select()

    if (error) { alert('Erro ao salvar: ' + error.message); setSalvando(false); return }
    const id = data[0].id
    router.push(`/dashboard?orcamento=${id}`)
  }

  const inputStyle = {
    width: '100%',
    background: '#0f1117',
    border: '1px solid #1e2130',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  const labelStyle = {
    fontSize: '12px',
    color: '#6b7280',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    display: 'block'
  }

  const cardStyle = {
    background: '#16181f',
    border: '1px solid #1e2130',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'DM Sans', sans-serif",
      color: '#f1f5f9',
      padding: '40px 24px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => router.back()} style={{
            background: '#16181f', border: '1px solid #1e2130',
            color: '#6b7280', padding: '8px 16px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif"
          }}>← Voltar</button>
          <div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, margin: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Novo orçamento</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#4b5563' }}>Preencha os dados e gere o link</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>👤 Dados do cliente</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nome do cliente</label>
              <input type="text" placeholder="Ex: João Silva" value={cliente} onChange={(e) => setCliente(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input type="text" placeholder="Ex: (11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>🔧 Itens do serviço</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {itens.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text" placeholder="Descrição do serviço" value={item.descricao}
                  onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  type="number" placeholder="R$ 0" value={item.valor}
                  onChange={(e) => atualizarItem(index, 'valor', e.target.value)}
                  style={{ ...inputStyle, width: '120px' }}
                />
                {itens.length > 1 && (
                  <button onClick={() => removerItem(index)} style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', width: '36px', height: '36px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>×</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={adicionarItem} style={{
            marginTop: '16px', background: 'transparent', border: '1px dashed #2a2d3e',
            color: '#6366f1', padding: '10px', borderRadius: '10px', width: '100%',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif"
          }}>+ Adicionar item</button>
        </div>

        <div style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
          border: '1px solid rgba(99,102,241,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>Total</span>
            <span style={{
              fontSize: '32px', fontWeight: 800, fontFamily: "'Syne', sans-serif",
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <button onClick={gerarOrcamento} disabled={salvando} style={{
          width: '100%',
          background: salvando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', border: 'none', padding: '16px', borderRadius: '14px',
          fontSize: '16px', fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer',
          boxShadow: salvando ? 'none' : '0 4px 24px rgba(99,102,241,0.4)',
          fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
        }}>
          {salvando ? 'Salvando...' : '🔗 Gerar link do orçamento'}
        </button>

      </div>
    </div>
  )
}
