import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/AuthService";

type EtapaAPI = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  porcentagemConclusao: number;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  criador: { id: string }; // Adicionando explicitamente o criador
};

export type EtapaDemanda = EtapaAPI;

type PaginacaoResponse = {
  content: EtapaAPI[];
  totalPages: number;
};

export const useEtapas = (idDemanda: string) => {
  const [etapas, setEtapas] = useState<EtapaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarEtapas = useCallback(async () => {
    try {
      if (!idDemanda) return;
      setLoading(true);
      const response = await authApi.get<PaginacaoResponse>(`/etapa-demanda/listar-por-demanda/${idDemanda}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });
      setEtapas(response.data.content);
      setTotalPaginas(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar etapas da demanda:", error);
      setLoading(false);
    }
  }, [idDemanda, paginaAtual, itensPorPagina]);

  // Função para deletar uma demanda existente
  const deletarEtapaDemanda = async (idEtapaDemandaParaDeletar: string) => {
    try {
      
      // Chamada Delete para a API.
      await authApi.delete(`/etapa-demanda/${idEtapaDemandaParaDeletar}`);
      buscarEtapas();
      return true;

    } catch (error) {
      console.error("Erro ao deletar Etapa-Demanda: ", error);
      return null;
    }
  }

  useEffect(() => {
    buscarEtapas();
  }, [buscarEtapas]);

  return { 
    etapas, 
    loading, 
    paginaAtual, 
    setPaginaAtual, 
    totalPaginas, 
    itensPorPagina, 
    buscarEtapas,
    deletarEtapaDemanda
  };
};
