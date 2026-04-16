export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Orça<span className="text-blue-600">Fácil</span>
        </h1>
        <p className="text-lg text-gray-600">
          Orçamentos profissionais para autônomos em minutos
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar na sua conta</h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors">
            Entrar
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Criar conta grátis
          </span>
        </p>
      </div>

    </div>
  );
}