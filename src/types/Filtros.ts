// Tipos base para todos os filtros
export interface FiltroBase {
  busca?: string;
  [key: string]: any;
}

// Filtros específicos por entidade
export interface FiltrosDemanda extends FiltroBase {
  busca?: string;
  status?: string;
  prioridade?: string;
  funcionarioId?: string;
  clienteId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltrosFuncionario extends FiltroBase {
  busca?: string;
  ativo?: boolean;
}

export interface FiltrosCliente extends FiltroBase {
  busca?: string;
  tipo?: string; // PF ou PJ
  ativo?: boolean;
}

export interface FiltrosTarefa extends FiltroBase {
  busca?: string;
  status?: string;
  prioridade?: string;
  funcionarioId?: string;
  etapaId?: string;
  demandaId?: string;
  dataVencimento?: string;
}