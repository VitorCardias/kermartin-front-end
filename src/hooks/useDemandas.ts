import { useState, useEffect } from "react";
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

export const useDemandas = () => {
  const perfil = usePerfil();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 10;

  // Função para buscar demandas do escritório
  const buscarDemandas = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);
      // Buscar todas as demandas do escritório combinando todos os status
      const statuses = ['Finalizada', 'EmAndamento', 'RequerindoEquipe', 'Cancelada', 'Atrasada'];
      let todasAsDemandas: Demanda[] = [];

      for (const status of statuses) {
        try {
          const response = await authApi.get<any>(`/demanda/listar-por-escritorio-statusdemanda/${status}`, {
            params: { page: paginaAtual, size: itensPorPagina },
          });

          const demandasData = Array.isArray(response.data)
            ? response.data
            : response.data.content || [];

          todasAsDemandas = [...todasAsDemandas, ...demandasData];
        } catch (error) {
          console.warn(`Erro ao buscar demandas com status ${status}:`, error);
        }
      }

      setDemandas(todasAsDemandas);
    } catch (error) {
      console.error("Erro ao buscar demandas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar demandas ao carregar ou quando a página muda
  useEffect(() => {
    if (perfil?.id) {
      buscarDemandas();
    }
  }, [perfil?.id, paginaAtual]);

  // Função para cadastrar uma nova demanda
  const cadastrarDemanda = async (novaDemandaData: Omit<Demanda, 'id' | 'criador'>): Promise<Demanda | null> => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado para cadastro.");
        return null;
      }

      const payload = {
        criador: { id: perfil.id },
        ...novaDemandaData,
      };

      console.log("Payload completo enviado para API:", JSON.stringify(payload, null, 2));

      const response = await authApi.post<DemandaAPI>("/demanda", payload);

      if (response.data && response.data.id) {
        const demandaCriada: Demanda = {
          ...response.data
        };
        return demandaCriada;
      }

      console.error("Cadastro realizado, mas a API não retornou a demanda esperada.");
      return null;

    } catch (error: any) {
      console.error("Erro ao cadastrar demanda:", error);
      if (error.response?.data) {
        console.error("Detalhes do erro da API:", JSON.stringify(error.response.data, null, 2));
      }
      if (error.response?.status === 400) {
        console.error("Erro 400: Verifique os campos obrigatórios e o formato dos dados");
      }
      return null;
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
  const deletarDemanda = async (demandaId: string) => {
    try {
      // Chamada Delete para a API.
      await authApi.delete(`/demanda/${demandaId}`);
      return true;

    } catch (error) {
      console.error("Erro ao deletar demanda:", error);
      return null;
    }
  }

  return {
    demandas,
    loading,
    paginaAtual,
    setPaginaAtual,
    itensPorPagina,
    buscarDemandas,
    cadastrarDemanda,
    editarDemanda,
    deletarDemanda
  };
};
