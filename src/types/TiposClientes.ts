
// Definição do tipo de cliente
export const TipoCliente = {
  PessoaFisica: "pf",
  PessoaJuridica: "pj"
} as const;
export type TipoCliente = typeof TipoCliente[keyof typeof TipoCliente];

/**
 * Função para mostrar o tipo de cliente de modo amigavel na interface do usuario.
 *  */
export function formatarDisplayTipoCliente<TipoCliente>(tipo: TipoCliente): string {
  let displayAmigavel = "";

  switch (tipo) {
    case TipoCliente.PessoaFisica: {
      displayAmigavel = "Pessoa Física";
      break;
    }
    case TipoCliente.PessoaJuridica: {
      displayAmigavel = "Pessoa Jurídica";
      break;
    }
    default: {
      displayAmigavel = "Tipo de cliente não identificado.";
      break;
    }
  }

  return displayAmigavel;
}
