'use client'
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, bem-vindo ao OrcaFácil!</h1>
            <p className="text-gray-500">Gerencie seus orçamentos em um só lugar</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
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