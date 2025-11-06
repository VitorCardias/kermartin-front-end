/**
 * Tipos para a autenticação
 */

export interface CadastroParams {
  nomeUsuario: string;
  emailCadastro: string;
  senha: string;
  tipoUsuario: string;
  razaoSocial: string;
  cnpj: string;
  planoDTO: {
    id: string
  }
}

export interface LoginParams {
  username: string;
  senha: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

/*
type Roles = {
  name: string;
}
*/

export interface Usuario {
  username: string;
  tipoUsuario?: string;
  roles: string[];
}
