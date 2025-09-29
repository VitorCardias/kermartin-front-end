import { useEffect, useState } from "react";
import { usePerfil } from "./usePerfil";

import { authApi } from "../api/AuthService";
import type { TipoCliente } from "../types/TiposClientes";

interface ClienteAPI {
  id: string;
  nome: string;
  escritorioDTO: { id: string };
  numeroTelefoneContato: string;
  numeroWhatsAppContato: string;
  emailContato: string;
  endereco: string;
};

export interface ClientePessoaFisica extends ClienteAPI {
  tipoCliente: typeof TipoCliente.PessoaFisica;
  cpf: string;
}

export interface ClientePessoaJuridica extends ClienteAPI {
  tipoCliente: typeof TipoCliente.PessoaJuridica;
  cnpj: string;
}

// Discriminated Union: O tipo Cliente é um ou outro
export type Cliente = ClientePessoaFisica | ClientePessoaJuridica;

export type NovoClientePessoaFisica = Omit<ClientePessoaFisica, 'id' | 'escritorioDTO'>;

export type NovoClientePessoaJuridica = Omit<ClientePessoaJuridica, 'id' | 'escritorioDTO'>;

export type NovoCliente = NovoClientePessoaFisica | NovoClientePessoaJuridica;

type PaginacaoResponse = {
  content: Cliente[];
  totalPages: number;
};

export const useClientes = () => {
  const perfil = usePerfil();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10; // Número de clientes por página

  // Função para buscar clientes
  const buscarClientes = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);
      const response = await authApi.get<PaginacaoResponse>(`/cliente/listar-por-escritorio/${perfil.idEscritorio}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setClientes(response.data.content);
      setTotalPaginas(response.data.totalPages);

    } catch (error) {
      console.error("Erro ao buscar clientes: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar um cliente
  const editarCliente = async (cliente: Cliente) => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      await authApi.put("/cliente", {
        ...cliente
      });

      await buscarClientes(); // Recarrega a lista após a edição

    } catch (erro) {
      console.error("Erro ao editar cliente: ", erro);
    }
  };

  // Função para cadastrar um novo cliente
  const criarCliente = async (novoCliente: NovoCliente ) => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      await authApi.post("/cliente", {
        ...novoCliente,
        escritorioDTO: {id : perfil.idEscritorio}
      });

      await buscarClientes(); // Recarrega a lista após o cadastro

    } catch (error) {
      console.error("Erro ao criar novo cliente: ", error);
    }
  };


  useEffect(() => {
    if (perfil?.id) {
      buscarClientes();
    }
  }, [perfil, paginaAtual]);

  return {
    clientes, 
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    editarCliente,
    criarCliente,
  }

}