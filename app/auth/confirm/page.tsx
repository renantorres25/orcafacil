'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../superbase'

export default function Confirm() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    async function verificar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('success')
      } else {
        // Tenta pegar da URL hash
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error) {
          setStatus('error')
        } else {
          setStatus('success')
        }
      }
    }
    verificar()
  }, [])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p style={{ fontSize: '14px', margin: 0 }}>Confirmando seu e-mail...</p>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px' }}>Link inválido</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>Este link de confirmação expirou ou já foi usado.</p>
        <button onClick={() => router.push('/')} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Ir para o login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>

        {/* Ícone animado */}
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>
          ✅
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px' }}>
          E-mail confirmado!
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 8px' }}>
          Bem-vindo ao <span style={{ color: '#a5b4fc', fontWeight: 600 }}>OrçaFácil</span>!
        </p>
        <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 32px' }}>
          Sua conta está pronta. Agora é só entrar e começar a criar orçamentos profissionais.
        </p>

        {/* Card de boas-vindas */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 600 }}>O que você pode fazer agora</div>
          {[
            { icon: '📋', text: 'Criar orçamentos profissionais em segundos' },
            { icon: '📲', text: 'Enviar direto pelo WhatsApp para o cliente' },
            { icon: '✅', text: 'Cliente aprova com um clique' },
            { icon: '📅', text: 'Agendar e organizar seus serviços' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: i < 3 ? '1px solid #1e2130' : 'none' }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}>
          Entrar no OrçaFácil 🚀
        </button>

      </div>
    </div>
  )
}