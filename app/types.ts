export interface ItemOrcamento {
  descricao: string
  valor: string
}

export interface Orcamento {
  id: string
  user_id: string
  cliente: string
  telefone: string
  endereco: string
  complemento?: string
  observacoes?: string
  itens: ItemOrcamento[]
  total: number
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido'
  created_at: string
  data_agendamento?: string | null
}

export interface Perfil {
  user_id: string
  nome_empresa: string
  especialidade?: string
  telefone?: string
  email?: string
  instagram?: string
}

export interface Cliente {
  nome: string
  telefone: string
  orcamentos: Orcamento[]
  ultimoServico: string
}
