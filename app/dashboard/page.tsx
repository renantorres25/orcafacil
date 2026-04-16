'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orcamentoId = searchParams.get('orcamento')
  const linkGerado = orcamentoId ? `${window.location.origin}/orcamento/${orcamentoId}` : null

  function copiarLink() {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado)
      alert('Link copiado!')
    }
  }

  function enviarWhatsApp() {
    if (linkGerado) {
      const msg = `Olá! Segue o link do seu orçamento: ${linkGerado}`
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {linkGerado && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <p className="text-green-700 font-semibold text-lg mb-2">✓ Orçamento criado!</p>
            <p className="text-green-600 text-sm mb-4">Copie o link e envie para o seu cliente:</p>
            <div className="bg-white rounded-lg border border-green-200 px-4 py-3 text-sm text-gray-600 break-all mb-4">
              {linkGerado}
            </div>
            <div className="flex gap-3">
              <button onClick={copiarLink} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                Copiar link
              </button>
              <button onClick={enviarWhatsApp} className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600">
                Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, bem-vindo ao OrcaFácil!</h1>
            <p className="text-gray-500">Gerencie seus orçamentos em um só lugar</p>
          </div>
          <button
            onClick={() => router.push('/novo-orcamento')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
            + Novo orçamento
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Orçamentos enviados</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Aprovados</p>
            <p className="text-3xl font-bold text-green-600 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Valor em aberto</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">R$ 0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Orçamentos recentes</h2>
          <p className="text-gray-400 text-center py-8">Nenhum orçamento ainda. Crie o primeiro!</p>
        </div>

      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}