/**
 * Utilitários para formatação de dados
 */

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatarCPF(cpf: string): string {
  const apenasNumeros = cpf.replace(/\D/g, "");
  if (apenasNumeros.length !== 11) return cpf;
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata CPF enquanto o usuário digita (input masking)
 * Aceita apenas números e formata automaticamente
 */
export function formatarCPFEnquantoDigita(cpf: string): string {
  const apenasNumeros = cpf.replace(/\D/g, "").slice(0, 11);
  
  if (apenasNumeros.length <= 3) {
    return apenasNumeros;
  } else if (apenasNumeros.length <= 6) {
    return apenasNumeros.replace(/(\d{3})(\d+)/, "$1.$2");
  } else if (apenasNumeros.length <= 9) {
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  } else {
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}

/**
 * Formata CNPJ para o padrão 00.000.000/0000-00
 */
export function formatarCNPJ(cnpj: string): string {
  const apenasNumeros = cnpj.replace(/\D/g, "");
  if (apenasNumeros.length !== 14) return cnpj;
  return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Formata CNPJ enquanto o usuário digita (input masking)
 * Aceita apenas números e formata automaticamente
 */
export function formatarCNPJEnquantoDigita(cnpj: string): string {
  const apenasNumeros = cnpj.replace(/\D/g, "").slice(0, 14);
  
  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  } else if (apenasNumeros.length <= 5) {
    return apenasNumeros.replace(/(\d{2})(\d+)/, "$1.$2");
  } else if (apenasNumeros.length <= 8) {
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  } else if (apenasNumeros.length <= 12) {
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  } else {
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
}

/**
 * Formata telefone para o padrão (11) 9999-9999 ou (11) 99999-9999
 */
export function formatarTelefone(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, "");
  
  if (apenasNumeros.length === 10) {
    // (11) 9999-9999
    return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (apenasNumeros.length === 11) {
    // (11) 99999-9999
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  return telefone;
}

/**
 * Formata telefone enquanto o usuário digita (input masking)
 * Aceita apenas números e formata automaticamente
 */
export function formatarTelefoneEnquantoDigita(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, "").slice(0, 11);
  
  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  } else if (apenasNumeros.length <= 6) {
    return apenasNumeros.replace(/(\d{2})(\d+)/, "($1) $2");
  } else if (apenasNumeros.length <= 10) {
    return apenasNumeros.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  } else {
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
}

/**
 * Remove espaços em branco desnecessários e converte email para minúsculas
 */
export function formatarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Limpa um campo de texto removendo espaços extras
 */
export function formatarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

/**
 * Remove caracteres especiais de um documento (CPF/CNPJ)
 */
export function removerFormatacao(valor: string): string {
  return valor.replace(/\D/g, "");
}
