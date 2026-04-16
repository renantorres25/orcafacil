'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supernase'
import { use } from 'react'

export default function PaginaOrcamento({ params }) {
  const { id } = use(params)
  const [orcamento, setOrcamento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [resposta, setResposta] = useState('')

  useEffect(() => {
    async function buscarOrcamento() {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()
      console.log('data:', data, 'error:', error)
      setOrcamento(data)
      setCarregando(false)
    }
    buscarOrcamento()
  }, [id])

  async function aprovar() {
    await supabase.from('orcamentos').update({ status: 'aprovado' }).eq('id', id)
    setResposta('aprovado')
  }

  async function recusar() {
    await supabase.from('orcamentos').update({ status: 'recusado' }).eq('id', id)
    setResposta('recusado')
  }

  if (carregando) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>
  if (!orcamento) return <div className="min-h-screen flex items-center justify-center"><p>Orçamento não encontrado.</p></div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OrcaFácil</h1>
          <p className="text-gray-500">Orçamento profissional</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados do cliente</h2>
          <p className="text-gray-700"><span className="font-medium">Cliente:</span> {orcamento.cliente}</p>
          {orcamento.telefone && <p className="text-gray-700 mt-1"><span className="font-medium">WhatsApp:</span> {orcamento.telefone}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Itens do serviço</h2>
          <div className="flex flex-col gap-3">
            {orcamento.itens.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-gray-700">{item.descricao}</span>
                <span className="font-medium text-gray-900">R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <span className="text-lg font-semibold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">R$ {parseFloat(orcamento.total).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

       {resposta === '' && orcamento.status === 'pendente' && (
  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
    <button 
      onClick={aprovar}
      style={{backgroundColor: '#16a34a', color: 'white', width: '100%', padding: '16px', borderRadius: '12px', fontSize: '18px', fontWeight: '600', border: 'none', cursor: 'pointer'}}>
      ✓ Aprovar orçamento
    </button>
    <button 
      onClick={recusar}
      style={{backgroundColor: 'white', color: '#ef4444', width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', border: '1px solid #fca5a5', cursor: 'pointer'}}>
      Recusar
    </button>
  </div>
)}

        {(resposta === 'aprovado' || orcamento.status === 'aprovado') && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg">✓ Orçamento aprovado!</p>
            <p className="text-green-600 text-sm mt-1">O prestador de serviço será notificado.</p>
          </div>
        )}

        {(resposta === 'recusado' || orcamento.status === 'recusado') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold text-lg">Orçamento recusado.</p>
          </div>
        )}
      </div>
    </div>
  )
}