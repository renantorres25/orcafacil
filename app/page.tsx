'use client'
import { useState } from 'react'
import { supabase } from './supernase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar() {
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setMensagem('E-mail ou senha incorretos.')
    } else {
      setMensagem('Login realizado com sucesso!')
    }
    setCarregando(false)
  }

  async function cadastrar() {
    setCarregando(true)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      setMensagem('Erro ao cadastrar: ' + error.message)
    } else {
      setMensagem('Cadastro realizado! Verifique seu e-mail.')
    }
    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">OrcaFácil</h1>
        <p className="text-lg text-gray-500">Orçamentos profissionais para autônomos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar na sua conta</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mensagem && (
            <p className="text-sm text-center text-blue-600">{mensagem}</p>
          )}

          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {carregando ? 'Aguarde...' : 'Entrar'}
          </button>

          <button
            onClick={cadastrar}
            disabled={carregando}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
          >
            Criar conta grátis
          </button>
        </div>
      </div>
    </div>
  )
}