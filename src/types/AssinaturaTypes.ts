
export const StatusAssinatura = {
  ATIVO: 'Ativo',
  EM_CANCELAMENTO: 'Em Cancelamento',
  CANCELADO: 'Cancelado',
  PENDENTE_PAGAMENTO: 'Pendente Pagamento',
  PERIODO_TESTE: 'Período de Teste'
} as const;

export type StatusAssinatura = typeof StatusAssinatura[keyof typeof StatusAssinatura];

export interface AssinaturaResponseDTO {
    id: string;
    nomePlano: string;
    nomeEscritorio: string;
    status: string;
    inicioVigencia: string;
    fimVigencia: string;
    provedor: string;
}

export interface CriarAssinaturaDTO {
    escritorioId: string;
    planoId: string;
    provedorPagamento?: string;
    statusInicial?: string;
}

export interface TrocarPlanoDTO {
    novoPlanoId: string;
}

export interface EscritorioSelectOption {
    id: string;
    razaoSocial: string;
}

export interface PlanoSelectOption {
    id: string;
    nome: string;
}