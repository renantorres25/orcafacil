'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../superbase'
import { use } from 'react'

export default function PaginaOrcamento({ params }) {
  const { id } = use(params)
  const [orcamento, setOrcamento] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [resposta, setResposta] = useState('')

  useEffect(() => {
    async function buscarOrcamento() {
      const { data } = await supabase.from('orcamentos').select('*').eq('id', id).single()
      if (data) {
        setOrcamento(data)
        if (data.user_id) {
          const { data: perfilData } = await supabase.from('perfis').select('*').eq('user_id', data.user_id).single()
          setPerfil(perfilData)
        }
      }
      setCarregando(false)
    }
    buscarOrcamento()
  }, [id])

  async function aprovar() {
    await supabase.from('orcamentos').update({ status: 'aprovado' }).eq('id', id)
    setResposta('aprovado')
    const whatsapp = perfil?.telefone ? perfil.telefone.replace(/\D/g, '') : '5517991630883'
    const numero = whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`
    const mensagem = `✅ *Orçamento APROVADO!*\n\nOlá! Sou ${orcamento.cliente} e acabei de aprovar o orçamento.\n\n📋 *Detalhes:*\n• Cliente: ${orcamento.cliente}\n• Total: R$ ${parseFloat(orcamento.total).toFixed(2).replace('.', ',')}\n\nAguardo o contato para agendarmos o serviço! 😊`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  async function recusar() {
    await supabase.from('orcamentos').update({ status: 'recusado' }).eq('id', id)
    setResposta('recusado')
  }

  if (carregando) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#4b5563' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p>Carregando orçamento...</p>
      </div>
    </div>
  )

  if (!orcamento) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#4b5563' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
        <p>Orçamento não encontrado.</p>
      </div>
    </div>
  )

  const nomeEmpresa = perfil?.nome_empresa || 'OrcaFácil'
  const especialidade = perfil?.especialidade || ''

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9', padding: '24px 16px 40px' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header empresa */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '100px', padding: '6px 16px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '11px', color: '#34d399', letterSpacing: '0.8px', fontWeight: 600 }}>ORÇAMENTO PROFISSIONAL</span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 4px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {nomeEmpresa}
          </h1>
          {especialidade && <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 12px' }}>{especialidade}</p>}

          {(perfil?.instagram || perfil?.email) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {perfil?.instagram && (
                <a href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
                  📸 @{perfil.instagram}
                </a>
              )}
              {perfil?.email && (
                <a href={`mailto:${perfil.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
                  ✉️ {perfil.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Card do cliente e total */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '20px', padding: '20px 24px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>Para</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif" }}>{orcamento.cliente}</div>
              {orcamento.telefone && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>📱 {orcamento.telefone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>Total</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif" }}>R$ {parseFloat(orcamento.total).toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div style={{ background: '#16181f', border: '1px solid #1e2130', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#4b5563', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>🔧 Serviços inclusos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {orcamento.itens.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#1e2130', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 700, flexShrink: 0 }}>{index + 1}</div>
                  <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 500 }}>{item.descricao}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#a5b4fc', flexShrink: 0, marginLeft: '12px' }}>R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af' }}>Total do orçamento</span>
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              R$ {parseFloat(orcamento.total).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Botões de ação */}
        {resposta === '' && orcamento.status === 'pendente' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <button onClick={aprovar} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
              ✓ Aprovar orçamento
            </button>
            <button onClick={recusar} style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '14px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Recusar
            </button>
          </div>
        )}

        {(resposta === 'aprovado' || orcamento.status === 'aprovado') && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginTop: '4px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <p style={{ color: '#34d399', fontWeight: 700, fontSize: '18px', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>Orçamento aprovado!</p>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px' }}>Muito obrigado pela confiança 🙏</p>
            <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>{nomeEmpresa} entrará em contato para agendar.</p>
          </div>
        )}

        {(resposta === 'recusado' || orcamento.status === 'recusado') && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginTop: '4px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>😔</div>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '18px', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>Orçamento recusado.</p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{nomeEmpresa} será informado.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '11px', color: '#2a2d3e' }}>Powered by <span style={{ fontWeight: 600, color: '#6366f1' }}>OrcaFácil</span></p>
        </div>

      </div>
    </div>
  )
}