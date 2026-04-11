import { useState, useCallback } from "react";
import { type FiltrosDemanda, type FiltrosFuncionario, type FiltrosCliente, type FiltrosTarefa } from "../types/Filtros";

type FiltrosDisponíveis = FiltrosDemanda | FiltrosFuncionario | FiltrosCliente | FiltrosTarefa;

export const useFiltros = <T extends FiltrosDisponíveis>(filtrosIniciais: T) => {
  const [filtros, setFiltros] = useState<T>(filtrosIniciais);
  const [filtroAtivo, setFiltroAtivo] = useState<keyof T | null>(null);

  // Atualizar um filtro específico
  const atualizarFiltro = useCallback((chave: keyof T, valor: any) => {
    setFiltros(prev => {
      const novosFiltros = { ...prev, [chave]: valor };
      // Remove filtros vazios/nulos
      if (valor === null || valor === undefined || valor === "") {
        delete novosFiltros[chave];
      }
      return novosFiltros;
    });
    setFiltroAtivo(chave);
  }, []);

  // Atualizar múltiplos filtros de uma vez
  const atualizarMultiplosFiltros = useCallback((novosFiltros: Partial<T>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Limpar um filtro específico
  const limparFiltro = useCallback((chave: keyof T) => {
    setFiltros(prev => {
      const novosFiltros = { ...prev };
      delete novosFiltros[chave];
      return novosFiltros;
    });
  }, []);

  // Limpar todos os filtros
  const limparTodosFiltros = useCallback(() => {
    setFiltros(filtrosIniciais);
  }, [filtrosIniciais]);

  // Verificar se há filtros ativos
  const temFiltrosAtivos = useCallback(() => {
    return Object.keys(filtros).length > 0;
  }, [filtros]);

  // Obter quantidade de filtros ativos
  const contagemFiltrosAtivos = useCallback(() => {
    return Object.keys(filtros).length;
  }, [filtros]);

  return {
    filtros,
    filtroAtivo,
    atualizarFiltro,
    atualizarMultiplosFiltros,
    limparFiltro,
    limparTodosFiltros,
    temFiltrosAtivos,
    contagemFiltrosAtivos,
  };
};