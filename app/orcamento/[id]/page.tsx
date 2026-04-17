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
    const mensagem = `✅ Orçamento APROVADO!\n\nCliente: ${orcamento.cliente}\nTotal: R$ ${parseFloat(orcamento.total).toFixed(2).replace('.', ',')}`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  async function recusar() {
    await supabase.from('orcamentos').update({ status: 'recusado' }).eq('id', id)
    setResposta('recusado')
  }

  if (carregando) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p>Carregando orçamento...</p>
      </div>
    </div>
  )

  if (!orcamento) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
        <p>Orçamento não encontrado.</p>
      </div>
    </div>
  )

  const nomeEmpresa = perfil?.nome_empresa || 'OrcaFácil'
  const especialidade = perfil?.especialidade || ''

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)',
      fontFamily: "'DM Sans', sans-serif", padding: '32px 16px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        {/* Header com dados do prestador */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white',
            border: '1px solid #e2e8f0', borderRadius: '100px', padding: '8px 20px',
            marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.5px', fontWeight: 500 }}>ORÇAMENTO PROFISSIONAL</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, margin: '0 0 4px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{nomeEmpresa}</h1>

          {especialidade && <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 12px' }}>{especialidade}</p>}

          {(perfil?.instagram || perfil?.email) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {perfil?.instagram && (
                <a href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'white',
                  border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 14px',
                  fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}>📸 @{perfil.instagram}</a>
              )}
              {perfil?.email && (
                <a href={`mailto:${perfil.email}`} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'white',
                  border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 14px',
                  fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}>✉️ {perfil.email}</a>
              )}
            </div>
          )}
        </div>

        {/* Card principal */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '20px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Cliente</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif" }}>{orcamento.cliente}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Total</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif" }}>
                R$ {parseFloat(orcamento.total).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {orcamento.telefone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#64748b'
              }}>
                <span>📱</span><span>{orcamento.telefone}</span>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Serviços inclusos
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {orcamento.itens.map((item, index) => (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: 'white', fontWeight: 700, flexShrink: 0
                    }}>{index + 1}</div>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{item.descricao}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
              borderRadius: '14px', border: '1px solid rgba(99,102,241,0.15)'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Total do orçamento</span>
              <span style={{
                fontSize: '22px', fontWeight: 800, fontFamily: "'Syne', sans-serif",
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>R$ {parseFloat(orcamento.total).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Botões */}
        {resposta === '' && orcamento.status === 'pendente' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={aprovar} style={{
              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
              padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,0.35)', fontFamily: "'DM Sans', sans-serif"
            }}>✓ Aprovar orçamento</button>
            <button onClick={recusar} style={{
              background: 'white', color: '#ef4444', border: '1px solid #fecaca',
              padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}>Recusar</button>
          </div>
        )}

        {(resposta === 'aprovado' || orcamento.status === 'aprovado') && (
          <div style={{ background: 'white', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(16,185,129,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <p style={{ color: '#15803d', fontWeight: 700, fontSize: '18px', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>Orçamento aprovado!</p>
            <p style={{ color: '#4ade80', fontSize: '14px', margin: 0 }}>{nomeEmpresa} foi notificado e entrará em contato em breve.</p>
          </div>
        )}

        {(resposta === 'recusado' || orcamento.status === 'recusado') && (
          <div style={{ background: 'white', border: '1px solid #fecaca', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>😔</div>
            <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '18px', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>Orçamento recusado.</p>
            <p style={{ color: '#f87171', fontSize: '14px', margin: 0 }}>{nomeEmpresa} será informado.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
            Powered by <span style={{ fontWeight: 600, color: '#8b5cf6' }}>OrcaFácil</span>
          </p>
        </div>

      </div>
    </div>
  )
}
