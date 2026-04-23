'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import { Sidebar } from '../dashboard/page'

export default function Perfil() {
  const router = useRouter()
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [email, setEmail] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')
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
        setInstagram(data.instagram || '')
        setEmail(data.email || '')
      }
      setCarregando(false)
    }
    carregarPerfil()
  }, [])

  async function salvar() {
    setSalvando(true); setErro(''); setSalvo(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSalvando(false); return }
    const { error } = await supabase.from('perfis').upsert({
      user_id: user.id, nome_empresa: nomeEmpresa, especialidade, telefone, instagram, email
    }, { onConflict: 'user_id' })
    if (error) { setErro('Erro ao salvar. Tente novamente.') }
    else { setSalvo(true); setTimeout(() => setSalvo(false), 3000) }
    setSalvando(false)
  }

  async function sair() {
    if (!confirm('Tem certeza que deseja sair?')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  const inputStyle = {
    width: '100%', background: '#0f1117', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  const labelStyle = {
    fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px',
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

      <div className="main-content" style={{ marginLeft: '240px', padding: '32px 40px' }}>
        <div style={{ maxWidth: '520px' }}>

          <div style={{ marginBottom: '24px' }}>
            <h1 className="page-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Meu Perfil ⚙️</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Essas informações aparecem nos seus orçamentos</p>
          </div>

          {/* Informações básicas */}
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '16px' }}>Informações básicas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nome da empresa ou seu nome</label>
                <input type="text" placeholder="Ex: Elétrica do João" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Especialidade</label>
                <input type="text" placeholder="Ex: Eletricista, Encanador..." value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '16px' }}>Contato</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>📱 WhatsApp</label>
                <input type="text" placeholder="Ex: 11999999999" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>✉️ E-mail profissional</label>
                <input type="email" placeholder="Ex: joao@empresa.com.br" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>📸 Instagram</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '14px' }}>@</span>
                  <input type="text" placeholder="seuinstagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} style={{ ...inputStyle, paddingLeft: '32px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {salvo && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', fontSize: '13px', color: '#34d399', textAlign: 'center', fontWeight: 500 }}>
              ✓ Perfil salvo com sucesso!
            </div>
          )}
          {erro && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', fontSize: '13px', color: '#f87171', textAlign: 'center' }}>
              {erro}
            </div>
          )}

          {/* Botão salvar */}
          <button onClick={salvar} disabled={salvando} style={{
            width: '100%', background: salvando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, cursor: salvando ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", marginBottom: '10px',
            boxShadow: salvando ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
          }}>
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>

          {/* Botão sair */}
          <button onClick={sair} style={{
            width: '100%', background: 'transparent', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.2)', padding: '13px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            Sair da conta
          </button>

        </div>
      </div>
    </div>
  )
}