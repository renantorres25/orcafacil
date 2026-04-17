'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './superbase'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar() {
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setMensagem('E-mail ou senha incorretos.')
      setTipoMensagem('erro')
      setCarregando(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function cadastrar() {
    setCarregando(true)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      setMensagem('Erro ao cadastrar: ' + error.message)
      setTipoMensagem('erro')
      setCarregando(false)
    } else {
      setMensagem('Cadastro realizado! Verifique seu e-mail.')
      setTipoMensagem('sucesso')
      setCarregando(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#0f1117',
    border: '1px solid #1e2130',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>OrcaFácil</div>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
            Orçamentos profissionais para autônomos
          </p>
        </div>

        <div style={{
          background: '#16181f', border: '1px solid #1e2130',
          borderRadius: '24px', padding: '32px',
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700,
            color: '#f1f5f9', margin: '0 0 24px'
          }}>Entrar na sua conta</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px',
                textTransform: 'uppercase' as const, marginBottom: '8px', display: 'block'
              }}>E-mail</label>
              <input
                type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && entrar()}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{
                fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px',
                textTransform: 'uppercase' as const, marginBottom: '8px', display: 'block'
              }}>Senha</label>
              <input
                type="password" placeholder="••••••••" value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && entrar()}
                style={inputStyle}
              />
            </div>

            {mensagem && (
              <div style={{
                background: tipoMensagem === 'erro' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${tipoMensagem === 'erro' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
                color: tipoMensagem === 'erro' ? '#f87171' : '#34d399', textAlign: 'center'
              }}>{mensagem}</div>
            )}

            <button onClick={entrar} disabled={carregando} style={{
              width: '100%',
              background: carregando ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
              fontSize: '15px', fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer',
              boxShadow: carregando ? 'none' : '0 4px 24px rgba(99,102,241,0.35)',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', marginTop: '4px'
            }}>
              {carregando ? 'Aguarde...' : 'Entrar'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#1e2130' }} />
              <span style={{ fontSize: '12px', color: '#4b5563' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: '#1e2130' }} />
            </div>

            <button onClick={cadastrar} disabled={carregando} style={{
              width: '100%', background: 'transparent', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)', padding: '14px', borderRadius: '12px',
              fontSize: '15px', fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
            }}>
              Criar conta grátis
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#374151' }}>
          Powered by <span style={{ color: '#6366f1', fontWeight: 600 }}>OrcaFácil</span>
        </p>

      </div>
    </div>
  )
}
