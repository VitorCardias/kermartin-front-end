import { useState } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import { obterDataFormatoCorreto } from "../types/TiposDemandas";

export type DemandaAPI = {
  id: string;
  criador: { id: string };
  clienteDto?: { 
    id: string,
    nome?: string
  }
  titulo: string;
  descricao: string | null;
  prioridadeDemanda: string;
  statusDemanda: string;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  porcentagemConclusao: number;
};

export type Demanda = DemandaAPI;

/*
type PaginacaoResponse = {
  content: DemandaAPI[];
  totalPages: number;
};
*/

export const useDemandas = () => {
  const perfil = usePerfil();
  const [demandas] = useState<Demanda[]>([]);
  const [loading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas] = useState(1);
  const itensPorPagina = 10;

  // Função para buscar demandas com paginação
  /*
  const buscarDemandas = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);
      const response = await authApi.get<PaginacaoResponse>(`/demanda/listar-por-escritorio/${perfil.id}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      const demandasFormatadas: Demanda[] = response.data.content.map((demanda: DemandaAPI) => ({
        ...demanda,
        escritorioId: demanda.criador.id,
      }));

      setDemandas(demandasFormatadas);
      setTotalPaginas(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar demandas:", error);
      setLoading(false);
    }
  };
  */

  // Função para cadastrar uma nova demanda
  const cadastrarDemanda = async (novaDemandaData: Omit<Demanda, 'id' | 'criador'>): Promise<Demanda | null> => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado para cadastro.");
        return null; // Retorna null ou lança um erro em caso de problema
      }

      // A API espera o criador com id [17]
      const payload = {
        criador: { id: perfil.id },
        ...novaDemandaData,
      };

      // Faz a chamada POST para a API. Esperamos a demanda criada no corpo da resposta
      const response = await authApi.post<DemandaAPI>("/demanda", payload);

      // Formata a demanda retornada pela API e a retorna
      if (response.data && response.data.id) {
        const demandaCriada: Demanda = {
          ...response.data
        };
        return demandaCriada;
      }

      console.error("Cadastro realizado, mas a API não retornou a demanda esperada.");
      return null; // Retorna null se a resposta não estiver no formato esperado.

    } catch (error) {
      console.error("Erro ao cadastrar demanda:", error);
      // Pode-se tratar o erro:
      // (ex: exibir um toast) no componente que chamou esta função
      // throw error; 
      // Opcional: lançar o erro para ser capturado externamente
      return null; // Retorna null em caso de erro
    }
  };

  // Função para editar uma demanda existente
  const editarDemanda = async (demandaEditada: Demanda): Promise<Demanda | null> => {
    try {
      // Chamada PUT para a API. Esperamos a demanda atualizada no corpo da resposta
      const demandaEditadaPayload: Demanda = {
        ...demandaEditada,
        inicioPrazo: obterDataFormatoCorreto(demandaEditada.inicioPrazo),
        conclusaoPrazo: obterDataFormatoCorreto(demandaEditada.conclusaoPrazo)
      }
      const response = await authApi.put<DemandaAPI>("/demanda", demandaEditadaPayload);

      // Formata a demanda retornada pela API e a retorna
      if (response.data && response.data.id) {
        const demandaAtualizada: Demanda = {
          ...response.data
        };
        return demandaAtualizada;
      }

      console.error("Edição realizada, mas a API não retornou a demanda esperada.");
      return null; // Retorna null se a resposta não estiver no formato esperado

    } catch (error) {
      console.error("Erro ao editar demanda:", error);
      // Você pode querer tratar o erro no componente que chamou esta função
      // throw error; 
      // Opcional: lançar o erro
      return null; // Retorna null em caso de erro [15]
    }
  };

  // Função para deletar uma demanda existente
  const deletarDemanda = async (demandaParaDeletar: Demanda) => {
    try {
      
      // Chamada Delete para a API.
      await authApi.delete(`/demanda/${demandaParaDeletar.id}`);
      return true;

    } catch (error) {
      console.error("Erro ao editar demanda:", error);
      return null;
    }
  }

  return {
    demandas,
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    cadastrarDemanda,
    editarDemanda,
    deletarDemanda
  };
};
