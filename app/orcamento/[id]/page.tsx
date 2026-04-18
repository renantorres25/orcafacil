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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
        <p style={{ fontSize: '14px', margin: 0 }}>Carregando orçamento...</p>
      </div>
    </div>
  )

  if (!orcamento) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>❌</div>
        <p style={{ fontSize: '14px', margin: 0 }}>Orçamento não encontrado.</p>
      </div>
    </div>
  )

  // Capitaliza primeira letra de cada palavra
  function capitalize(str) {
    return str?.replace(/\b\w/g, l => l.toUpperCase()) || ''
  }

  const nomeEmpresa = capitalize(perfil?.nome_empresa || 'OrcaFácil')
  const especialidade = perfil?.especialidade || ''
  const totalFormatado = `R$ ${parseFloat(orcamento.total).toFixed(2).replace('.', ',')}`

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header da empresa */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>● Orçamento Profissional</div>
              {/* AJUSTE 1: nome em capitalize, não uppercase */}
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, margin: 0, color: '#0f172a' }}>{nomeEmpresa}</h1>
              {especialidade && <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>{especialidade}</p>}
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
              {nomeEmpresa.charAt(0).toUpperCase()}
            </div>
          </div>

          {(perfil?.instagram || perfil?.email) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {perfil?.instagram && (
                <a href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, background: '#eef2ff', padding: '4px 10px', borderRadius: '6px' }}>
                  @{perfil.instagram}
                </a>
              )}
              {perfil?.email && (
                <a href={`mailto:${perfil.email}`} style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, background: '#eef2ff', padding: '4px 10px', borderRadius: '6px' }}>
                  {perfil.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Card do cliente */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', padding: '18px 20px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>Orçamento para</div>
            {/* AJUSTE 1: capitalize no nome do cliente também */}
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif", marginBottom: '4px' }}>{capitalize(orcamento.cliente)}</div>
            {orcamento.telefone && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>📱 {orcamento.telefone}</div>
            )}
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Valor total</span>
            {/* AJUSTE 2: fonte menor e sem itálico no valor */}
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1', fontFamily: "'DM Sans', sans-serif" }}>{totalFormatado}</span>
          </div>
        </div>

        {/* Serviços */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>Serviços inclusos</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {orcamento.itens.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>{index + 1}</div>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{item.descricao}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', flexShrink: 0, marginLeft: '8px' }}>
                  R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#eef2ff', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4338ca' }}>Total do orçamento</span>
            {/* AJUSTE 2: fonte normal sem itálico no total também */}
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#4338ca', fontFamily: "'DM Sans', sans-serif" }}>{totalFormatado}</span>
          </div>
        </div>

        {/* AJUSTE 3: ícones menores nos diferenciais */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {[
            { icon: '✅', text: 'Serviço profissional e garantido' },
            { icon: '💬', text: 'Transparência total nos valores' },
            { icon: '⚡', text: 'Agilidade no atendimento' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '13px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Botões */}
        {resposta === '' && orcamento.status === 'pendente' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={aprovar} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '17px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.3px' }}>
              ✓ Aprovar orçamento
            </button>
            <button onClick={recusar} style={{ background: 'white', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Recusar
            </button>
          </div>
        )}

        {(resposta === 'aprovado' || orcamento.status === 'aprovado') && (
          <div style={{ background: 'white', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
            <p style={{ color: '#15803d', fontWeight: 700, fontSize: '18px', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Orçamento aprovado!</p>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 4px' }}>Obrigado pela confiança! 🙏</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{nomeEmpresa} entrará em contato para agendar o serviço.</p>
          </div>
        )}

        {(resposta === 'recusado' || orcamento.status === 'recusado') && (
          <div style={{ background: 'white', border: '1px solid #fecaca', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>😔</div>
            <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '18px', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Orçamento recusado.</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{nomeEmpresa} será notificado.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>Powered by <span style={{ fontWeight: 600, color: '#8b5cf6' }}>OrcaFácil</span></p>
        </div>
      </div>
    </div>
  )
}