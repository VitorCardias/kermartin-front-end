import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import { converterDataTimeLocalParaISO } from "../types/TiposDemandas";

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

type PaginacaoResponse = {
  content: DemandaAPI[];
  totalPages: number;
};

export const useDemandas = () => {
  const perfil = usePerfil();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  // Função para buscar demandas com paginação
  const buscarDemandas = async () => {
    try {
      if (!perfil?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Vamos direto para a rota que o backend permite para este usuário
      const response = await authApi.get<PaginacaoResponse | DemandaAPI[]>(`/demanda`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      // Verifica a estrutura da resposta e adapta
      let demandasData: DemandaAPI[] = [];
      let totalPaginasData: number = 1;

      if (Array.isArray(response.data)) {
        // Se for um array direto
        demandasData = response.data;
        totalPaginasData = 1;
      } else if (response.data.content && Array.isArray(response.data.content)) {
        // Se for a estrutura com content e totalPages
        demandasData = response.data.content;
        totalPaginasData = response.data.totalPages || 1;
      }

      const demandasFormatadas: Demanda[] = demandasData.map((demanda: DemandaAPI) => ({
        ...demanda,
        escritorioId: demanda.criador.id,
      }));

      setDemandas(demandasFormatadas);
      setTotalPaginas(totalPaginasData);
      setLoading(false);
      
    } catch (error: any) {
      console.error("Erro ao buscar demandas:", error);
      setDemandas([]);
      setLoading(false);
    }
  };

  // Função para cadastrar uma nova demanda
  const cadastrarDemanda = async (novaDemandaData: Omit<Demanda, 'id' | 'criador'>): Promise<Demanda | null> => {
    try {
      if (!perfil?.idEscritorio) {
        console.error("Erro: Perfil do usuário não encontrado para cadastro.");
        return null; // Retorna null ou lança um erro em caso de problema
      }

      // A API espera o criador com id [17]
      const payload = {
        criador: { id: perfil.idEscritorio },
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
      // Converter as datas do formato datetime-local para ISO format
      const demandaEditadaPayload: any = {
        ...demandaEditada,
        inicioPrazo: demandaEditada.inicioPrazo ? converterDataTimeLocalParaISO(demandaEditada.inicioPrazo) : null,
        conclusaoPrazo: demandaEditada.conclusaoPrazo ? converterDataTimeLocalParaISO(demandaEditada.conclusaoPrazo) : null,
      };

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

    } catch (error: any) {
      console.error("Erro ao editar demanda:", error);
      return null; // Retorna null em caso de erro
    }
  };

  // Função para deletar uma demanda existente
  const deletarDemanda = async (demandaParaDeletar: Demanda | string) => {
    try {
      const demandaId = typeof demandaParaDeletar === 'string' ? demandaParaDeletar : demandaParaDeletar.id;
      
      // Chamada Delete para a API.
      await authApi.delete(`/demanda/${demandaId}`);
      return true;

    } catch (error) {
      console.error("Erro ao deletar demanda:", error);
      return null;
    }
  }

  // Chamar buscarDemandas quando o perfil estiver pronto
  useEffect(() => {
    if (perfil?.id) {
      buscarDemandas();
    }
  }, [perfil]);

  return {
    demandas,
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    buscarDemandas,
    cadastrarDemanda,
    editarDemanda,
    deletarDemanda
  };
};