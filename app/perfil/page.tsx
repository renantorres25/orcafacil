'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'
import { Sidebar } from '../dashboard/page'

export default function Perfil() {
  const router = useRouter()
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('perfis').select('*').eq('user_id', user.id).single()
      if (data) {
        setNomeEmpresa(data.nome_empresa || '')
        setEspecialidade(data.especialidade || '')
        setTelefone(data.telefone || '')
      }
      setCarregando(false)
    }
    carregarPerfil()
  }, [])

  async function salvar() {
    setSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('perfis').upsert({
      user_id: user.id,
      nome_empresa: nomeEmpresa,
      especialidade,
      telefone
    }, { onConflict: 'user_id' })
    if (error) {
      setMensagem('Erro ao salvar: ' + error.message)
    } else {
      setMensagem('Perfil salvo com sucesso!')
      setTimeout(() => setMensagem(''), 3000)
    }
    setSalvando(false)
  }

  const inputStyle = {
    width: '100%', background: '#0f1117', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  const labelStyle = {
    fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px',
    textTransform: 'uppercase' as const, marginBottom: '8px', display: 'block'
  }

  if (carregando) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <Sidebar ativa="/perfil" />

      <div style={{ marginLeft: '240px', padding: '40px' }}>
        <div style={{ maxWidth: '560px' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              Meu Perfil ⚙️
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
              Essas informações aparecem nos seus orçamentos
            </p>
          </div>

          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <label style={labelStyle}>Nome da empresa ou seu nome</label>
                <input type="text" placeholder="Ex: Elétrica do João" value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Especialidade</label>
                <input type="text" placeholder="Ex: Eletricista, Encanador, Pedreiro..." value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp para notificações</label>
                <input type="text" placeholder="Ex: 11999999999" value={telefone}
                  onChange={(e) => setTelefone(e.target.value)} style={inputStyle} />
              </div>

              {mensagem && (
                <div style={{
                  background: mensagem.includes('Erro') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${mensagem.includes('Erro') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
                  color: mensagem.includes('Erro') ? '#f87171' : '#34d399', textAlign: 'center'
                }}>{mensagem}</div>
              )}

              <button onClick={salvar} disabled={salvando} style={{
                width: '100%',
                background: salvando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600, cursor: salvando ? 'not-allowed' : 'pointer',
                boxShadow: salvando ? 'none' : '0 4px 24px rgba(99,102,241,0.35)',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
              }}>
                {salvando ? 'Salvando...' : 'Salvar perfil'}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
