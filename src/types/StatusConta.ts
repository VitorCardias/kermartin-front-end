
export const StatusConta = {
    PendenteValidacao: "PendenteValidacao",
    Ativo: "Ativo",
    Inativo: "Inativo",
    Bloqueado: "Bloqueado"
} as const;
export type StatusConta = typeof StatusConta[keyof typeof StatusConta];
