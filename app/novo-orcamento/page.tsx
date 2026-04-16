'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../superbase'

interface Item {
  descricao: string
  valor: string
}

export default function NovoOrcamento() {
  const router = useRouter()
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [itens, setItens] = useState<Item[]>([{ descricao: '', valor: '' }])
  const [salvando, setSalvando] = useState(false)

  function adicionarItem() {
    setItens([...itens, { descricao: '', valor: '' }])
  }

  function removerItem(index: number) {
    setItens(itens.filter((_, i) => i !== index))
  }

  function atualizarItem(index: number, campo: string, valor: string) {
    const novosItens = [...itens]
    novosItens[index] = { ...novosItens[index], [campo]: valor }
    setItens(novosItens)
  }

  const total = itens.reduce((soma, item) => {
    return soma + (parseFloat(item.valor) || 0)
  }, 0)

  async function gerarOrcamento() {
    if (!cliente) {
      alert('Preencha o nome do cliente!')
      return
    }
    if (itens.every(i => !i.descricao)) {
      alert('Adicione pelo menos um item!')
      return
    }

    setSalvando(true)

    const { data, error } = await supabase
      .from('orcamentos')
      .insert({ cliente, telefone, itens, total })
      .select()

    if (error) {
      alert('Erro ao salvar: ' + error.message)
      setSalvando(false)
      return
    }

    const id = data[0].id
    router.push(`/dashboard?orcamento=${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Novo orçamento</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados do cliente</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Nome do cliente</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">WhatsApp</label>
              <input
                type="text"
                placeholder="Ex: (11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Itens do serviço</h2>
          <div className="flex flex-col gap-3">
            {itens.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Descrição do serviço"
                  value={item.descricao}
                  onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="R$ 0"
                  value={item.valor}
                  onChange={(e) => atualizarItem(index, 'valor', e.target.value)}
                  className="w-32 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {itens.length > 1 && (
                  <button onClick={() => removerItem(index)} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={adicionarItem} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
            + Adicionar item
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <button
          onClick={gerarOrcamento}
          disabled={salvando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          {salvando ? 'Salvando...' : 'Gerar link do orçamento'}
        </button>
      </div>
    </div>
  )
}