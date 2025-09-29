import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/AuthService";

type MembroEquipeAPI = {
  id: string;
  funcionarioDTO: {
    id: string;
    nomeCompleto: string;
    qualificacaoFuncionario: string;
  };
  inicioParticipacao: string;
  terminoParticipacao: string | null;
};

export type MembroEquipeDemanda = MembroEquipeAPI;

type PaginacaoResponse = {
  content: MembroEquipeAPI[];
  totalPages: number;
};

export const useEquipe = (idDemanda: string, gatilhoExterno?: number) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipeAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  // Função para buscar membros da equipe
  const buscarEquipe = useCallback(async () => {
    if (!idDemanda) {
      setMembrosEquipe([]);
      setTotalPaginas(1);
      setPaginaAtual(0);
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const response = await authApi.get<PaginacaoResponse>(`/membro-equipe-demanda/listar-todos-por-demanda/${idDemanda}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });
      setMembrosEquipe(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar membros da equipe: ", error);
      setMembrosEquipe([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [idDemanda, paginaAtual, itensPorPagina]); // buscarEquipe depende de idDemanda e paginaAtual

  const deletarMembroEquipe = useCallback(async (idDemanda: string) => {
    try {
      await authApi.delete(`/membro-equipe-demanda/${idDemanda}`)
    } catch (erro){
      console.error(
        "Erro ao tentar deletar membro da equipe.\n" +
        "LOCAL: Função hook deletarMembroEquipe.\n" +
        "ERRO:\n",
        erro
      );
    }
  }, [])

  useEffect(() => {
    buscarEquipe();
  }, [buscarEquipe, gatilhoExterno]);

  return { 
    membrosEquipe, 
    loading, 
    paginaAtual, 
    setPaginaAtual, 
    totalPaginas, 
    itensPorPagina, 
    buscarEquipe,
    deletarMembroEquipe
  };
};
