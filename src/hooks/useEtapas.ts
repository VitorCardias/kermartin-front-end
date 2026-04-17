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
  criador: { id: string };
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
      if (!idDemanda) {
        console.warn("ID da demanda não fornecido");
        setLoading(false);
        return;
      }
      setLoading(true);
      const response = await authApi.get<PaginacaoResponse>(
        `/etapa-demanda/listar-por-demanda/${idDemanda}`,
        {
          params: { page: paginaAtual, size: itensPorPagina },
        }
      );
      
      console.log("Resposta de etapas:", response.data);
      
      if (response.data && response.data.content) {
        setEtapas(response.data.content);
        setTotalPaginas(response.data.totalPages);
      } else {
        console.warn("Resposta vazia ou sem estrutura esperada");
        setEtapas([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar etapas da demanda:", error);
      setEtapas([]);
      setLoading(false);
    }
  }, [idDemanda, paginaAtual, itensPorPagina]);

  const cadastrarEtapa = async (etapaPayload: any): Promise<EtapaAPI | null> => {
    try {
      const formatarDataParaAPI = (dateTimeStr: string | null): string | null => {
        if (!dateTimeStr) return null;
        const date = new Date(dateTimeStr);
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, "0");
        const minutos = String(date.getMinutes()).padStart(2, "0");
        const segundos = String(date.getSeconds()).padStart(2, "0");
        return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
      };

      const etapaFormatada = {
        ...etapaPayload,
        demandaDTO: { id: etapaPayload.demandaDTO?.id || etapaPayload.idDemanda },
        inicioPrazo: formatarDataParaAPI(etapaPayload.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(etapaPayload.conclusaoPrazo),
      };

      console.log("Enviando etapa formatada:", etapaFormatada);

      const response = await authApi.post<EtapaAPI>("/etapa-demanda", etapaFormatada);
      
      console.log("Resposta do cadastro:", response);

      // Aguarda um pouco antes de buscar para garantir que foi persistido no servidor
      setTimeout(() => {
        buscarEtapas();
      }, 500);

      return response.data || null;
    } catch (error) {
      console.error("Erro ao cadastrar etapa:", error);
      throw error; // Propaga o erro para o modal tratar
    }
  };

  const deletarEtapaDemanda = async (idEtapaDemandaParaDeletar: string) => {
    try {
      await authApi.delete(`/etapa-demanda/${idEtapaDemandaParaDeletar}`);
      buscarEtapas();
      return true;
    } catch (error) {
      console.error("Erro ao deletar Etapa-Demanda: ", error);
      return false;
    }
  };

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
    cadastrarEtapa,
    deletarEtapaDemanda,
  };
};
