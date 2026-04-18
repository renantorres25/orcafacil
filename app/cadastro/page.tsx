'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'

export default function Cadastro() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [concluido, setConcluido] = useState(false)

  function proximoPasso() {
    setErro('')
    if (step === 1) {
      if (!nomeEmpresa.trim()) { setErro('Digite o nome da sua empresa ou seu nome.'); return }
      if (!especialidade.trim()) { setErro('Digite sua especialidade.'); return }
      setStep(2)
    }
  }

  async function finalizar() {
    setErro('')
    if (!email.trim()) { setErro('Digite seu e-mail.'); return }
    if (!senha) { setErro('Digite uma senha.'); return }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }

    setCarregando(true)
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      setErro('Erro ao criar conta: ' + error.message)
      setCarregando(false)
      return
    }

    // Salva o perfil automaticamente
    if (data.user) {
      await supabase.from('perfis').upsert({
        user_id: data.user.id,
        nome_empresa: nomeEmpresa,
        especialidade,
        telefone,
      }, { onConflict: 'user_id' })
    }

    setCarregando(false)
    setConcluido(true)
  }

  const inputStyle = {
    width: '100%', background: '#0f1117', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '13px 16px', color: '#f1f5f9',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  const labelStyle = {
    fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px',
    textTransform: 'uppercase' as const, marginBottom: '7px', display: 'block'
  }

  if (concluido) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px' }}>Conta criada!</h1>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 8px' }}>Enviamos um e-mail de confirmação para</p>
        <p style={{ color: '#a5b4fc', fontSize: '15px', fontWeight: 600, margin: '0 0 28px' }}>{email}</p>
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.7 }}>
            <div>1. Abra seu e-mail</div>
            <div>2. Clique no link de confirmação</div>
            <div>3. Volte aqui e faça login</div>
          </div>
        </div>
        <button onClick={() => router.push('/')} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
          Ir para o login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>
            OrçaFácil
          </div>
          <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>Crie sua conta grátis</p>
        </div>

        {/* Progresso */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#6366f1' : '#1e2130', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '24px', padding: '28px' }}>

          {step === 1 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>Sobre você</h2>
                <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>Essas informações aparecem nos seus orçamentos</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Nome da empresa ou seu nome</label>
                  <input type="text" placeholder="Ex: Elétrica do João" value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && proximoPasso()}
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Especialidade</label>
                  <input type="text" placeholder="Ex: Eletricista, Encanador, Pintor..." value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && proximoPasso()}
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>📱 WhatsApp <span style={{ color: '#4b5563', textTransform: 'none', fontWeight: 400 }}>(opcional)</span></label>
                  <input type="text" placeholder="Ex: 11999999999" value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && proximoPasso()}
                    style={inputStyle} />
                </div>

                {erro && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#f87171' }}>
                    {erro}
                  </div>
                )}

                <button onClick={proximoPasso} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '4px', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1 }}>←</button>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px' }}>Acesso à conta</h2>
                  <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>E-mail e senha para entrar no app</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" placeholder="seu@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Senha <span style={{ color: '#4b5563', textTransform: 'none', fontWeight: 400 }}>(mín. 6 caracteres)</span></label>
                  <input type="password" placeholder="••••••••" value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Confirmar senha</label>
                  <input type="password" placeholder="••••••••" value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && finalizar()}
                    style={inputStyle} />
                </div>

                {erro && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#f87171' }}>
                    {erro}
                  </div>
                )}

                <button onClick={finalizar} disabled={carregando} style={{ width: '100%', background: carregando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '4px', boxShadow: carregando ? 'none' : '0 4px 20px rgba(99,102,241,0.3)' }}>
                  {carregando ? 'Criando conta...' : 'Criar minha conta 🚀'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', margin: '4px 0 0' }}>
                  Ao criar a conta você concorda com os termos de uso
                </p>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4b5563' }}>
          Já tem conta?{' '}
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, padding: 0 }}>
            Entrar
          </button>
        </p>

      </div>
    </div>
  )
}