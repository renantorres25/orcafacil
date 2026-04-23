'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
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
    const mensagem = `✅ *Orçamento APROVADO!*\n\nOlá! Sou ${orcamento.cliente} e acabei de aprovar o orçamento.\n\n📋 *Detalhes:*\n• Cliente: ${orcamento.cliente}\n• Total: R$ ${orcamento.total.toFixed(2).replace('.', ',')}\n\nAguardo o contato para agendarmos o serviço! 😊`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  async function recusar() {
    await supabase.from('orcamentos').update({ status: 'recusado' }).eq('id', id)
    setResposta('recusado')
  }

  if (carregando) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <p style={{ fontSize: '14px', margin: 0, color: '#94a3b8' }}>Carregando orçamento...</p>
      </div>
    </div>
  )

  if (!orcamento) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>Orçamento não encontrado.</p>
      </div>
    </div>
  )

  function toTitleCase(str) {
    if (!str) return ''
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const nomeEmpresa = toTitleCase(perfil?.nome_empresa) || 'OrcaFácil'
  const especialidade = perfil?.especialidade || ''
  const nomeCliente = toTitleCase(orcamento.cliente)
  const totalFormatado = `R$ ${orcamento.total.toFixed(2).replace('.', ',')}`
  const jaRespondido = resposta !== '' || orcamento.status !== 'pendente'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Topo da empresa — compacto */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 20px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif"
          }}>
            {nomeEmpresa.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>{nomeEmpresa}</div>
            {especialidade && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{especialidade}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '4px 10px', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Verificado</span>
          </div>
        </div>

        {(perfil?.instagram || perfil?.email) && (
          <div style={{ maxWidth: '480px', margin: '10px auto 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {perfil?.instagram && (
              <a href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, background: '#eef2ff', padding: '4px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px' }}>📸</span> @{perfil.instagram}
              </a>
            )}
            {perfil?.email && (
              <a href={`mailto:${perfil.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, background: '#eef2ff', padding: '4px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px' }}>✉️</span> {perfil.email}
              </a>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 16px 40px' }}>

        {/* Para quem é + valor — destaque imediato */}
        <div style={{ background: '#6366f1', borderRadius: '18px', padding: '20px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
          <div style={{ position: 'absolute', bottom: -30, right: 20, width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>Orçamento para</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif", marginBottom: '12px' }}>{nomeCliente}</div>
          {orcamento.telefone && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>📱 {orcamento.telefone}</div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Valor total</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "'DM Sans', sans-serif" }}>{totalFormatado}</span>
          </div>
        </div>

        {/* Serviços */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>Serviços inclusos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            {orcamento.itens.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>{index + 1}</div>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.descricao}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155', flexShrink: 0, marginLeft: '10px' }}>
                  R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', background: '#eef2ff', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4338ca' }}>Total</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#4338ca' }}>{totalFormatado}</span>
          </div>
        </div>

        {/* Botões logo após os serviços */}
        {!jaRespondido && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <button onClick={aprovar} style={{
              width: '100%', background: '#16a34a', color: 'white', border: 'none',
              padding: '17px', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.2px'
            }}>
              ✓ Aprovar orçamento
            </button>
            <button onClick={recusar} style={{
              width: '100%', background: 'white', color: '#94a3b8',
              border: '1px solid #e2e8f0', padding: '13px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}>
              Recusar
            </button>
          </div>
        )}

        {/* Aprovado */}
        {(resposta === 'aprovado' || orcamento.status === 'aprovado') && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</div>
            <p style={{ color: '#15803d', fontWeight: 700, fontSize: '17px', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Orçamento aprovado!</p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px' }}>Obrigado pela confiança! 🙏</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{nomeEmpresa} entrará em contato para agendar.</p>
          </div>
        )}

        {/* Recusado */}
        {(resposta === 'recusado' || orcamento.status === 'recusado') && (
          <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>😔</div>
            <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '17px', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Orçamento recusado.</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{nomeEmpresa} será notificado.</p>
          </div>
        )}

        {/* Diferenciais — após botão */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 18px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>Por que nos escolher</div>
          {[
            { icon: '✅', titulo: 'Serviço garantido', desc: 'Qualidade e comprometimento em cada etapa' },
            { icon: '💬', titulo: 'Sem surpresas', desc: 'Preço fechado, sem cobranças extras' },
            { icon: '⚡', titulo: 'Atendimento rápido', desc: 'Resposta e execução com agilidade' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '14px', lineHeight: '1', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{item.titulo}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>
            Powered by <span style={{ fontWeight: 600, color: '#8b5cf6' }}>OrcaFácil</span>
          </p>
        </div>
      </div>
    </div>
  )
}