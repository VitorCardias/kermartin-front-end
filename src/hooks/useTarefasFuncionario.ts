import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";


type TarefaAPI = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  porcentagemConclusao: number;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  etapaDemandaDTO: { 
    id: string,
    titulo: string,
    demanda: {
      titulo: string
    }
  };
  criador: { id: string };
};

export type TarefaComAtribuicao = {
  tarefaEtapaDTO: TarefaAPI;
  idAtribuicaoFuncionario: string;
};


type PaginacaoResponse = {
  content: TarefaComAtribuicao[];
  totalPages: number;
};

export type TarefaFuncionario = Omit<TarefaAPI, "criador">;

export const useTarefasFuncionario = (idFuncionario: string) => {
  const [tarefas, setTarefas] = useState<TarefaComAtribuicao[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarTarefas = async () => {
    if (!idFuncionario) return;

    setLoading(true);
    try {
      const response = await authApi.get<PaginacaoResponse>(`/tarefa-etapa/listar-por-funcionario/${idFuncionario}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setTarefas(response.data.content)
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar tarefas do Funcionario: ", error);
    } finally {
      setLoading(false);
    }
  };

  const concluirTarefa = async (idAtribuicaoTarefa: string) => {
    if (!idFuncionario) {
      return console.log("O idFuncionario não foi atribuido no hook de useTarefasFuncionario ao tentar concluir a tarefa.")
    }

    try {
      const respose = await authApi.patch(
        `/membro-equipe-tarefa/concluir-tarefa?idAtribuicao=${idAtribuicaoTarefa}`
      );
      
      buscarTarefas();
      return respose;

    } catch (error) {
      console.error("Erro ao tentar finalizar a tarefa: ", error)
    }
  }

  useEffect(() => {
    buscarTarefas();
  }, [idFuncionario, paginaAtual]);

  return { tarefas, loading, paginaAtual, setPaginaAtual, totalPaginas, buscarTarefas, concluirTarefa };
};