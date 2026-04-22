import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import type { TarefaDemandaAPI } from "./useTarefasDemandas";
import { cacheService } from "../utils/cacheService";

export const useAgenda = (tipoUsuario: "Escritorio" | "Funcionario", ano: number, mes: number) => {
  const perfil = usePerfil();
  const [tarefas, setTarefas] = useState<TarefaDemandaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheKey = `agenda:${tipoUsuario}:${perfil?.id || "sem-perfil"}:${ano}:${mes}`;

  const buscarTarefasAgenda = async () => {
    if (!perfil?.id) return;

    setLoading(true);
    try {
      const endpoint = tipoUsuario === "Escritorio"
        ? `/tarefa-etapa/agenda/escritorio/${perfil.id}?ano=${ano}&mes=${mes}`
        : `/tarefa-etapa/agenda/funcionario/${perfil.id}?ano=${ano}&mes=${mes}`;

      const tarefasAgenda = await cacheService.fetch<TarefaDemandaAPI[]>(
        cacheKey,
        async () => {
          const response = await authApi.get(endpoint);
          return response.data;
        },
        60 * 1000
      );

      setTarefas(tarefasAgenda);
    } catch (error) {
      console.error("Erro ao buscar tarefas da agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarTarefa = async (idTarefa: string) => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`);
      cacheService.clear(cacheKey);
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