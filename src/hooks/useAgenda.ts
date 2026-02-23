import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import type { TarefaDemandaAPI } from "./useTarefasDemandas";

export const useAgenda = (tipoUsuario: "Escritorio" | "Funcionario", ano: number, mes: number) => {
  const perfil = usePerfil();
  const [tarefas, setTarefas] = useState<TarefaDemandaAPI[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarTarefasAgenda = async () => {
    if (!perfil?.id) return;

    setLoading(true);
    try {
      const endpoint = tipoUsuario === "Escritorio"
        ? `/tarefa-etapa/agenda/escritorio/${perfil.id}?ano=${ano}&mes=${mes}`
        : `/tarefa-etapa/agenda/funcionario/${perfil.id}?ano=${ano}&mes=${mes}`;

      const response = await authApi.get(endpoint);
      setTarefas(response.data); 
    } catch (error) {
      console.error("Erro ao buscar tarefas da agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarTarefa = async (idTarefa: string) => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`);
      await buscarTarefasAgenda(); // Recarrega a agenda após deletar
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw error;
    }
  };

  useEffect(() => {
    buscarTarefasAgenda();
  }, [tipoUsuario, ano, mes, perfil?.id]);

  // NOVO: Retornar a função deletarTarefa
  return { tarefas, loading, buscarTarefasAgenda, deletarTarefa };
};