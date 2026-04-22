import { useCallback, useState } from 'react';
import { type FiltrosCliente, type FiltrosDemanda, type FiltrosFuncionario, type FiltrosTarefa } from '../types/Filtros';

type FiltrosDisponiveis = FiltrosDemanda | FiltrosFuncionario | FiltrosCliente | FiltrosTarefa;

export const useFiltros = <T extends FiltrosDisponiveis>(filtrosIniciais: T) => {
  const [filtros, setFiltros] = useState<T>(filtrosIniciais);
  const [filtroAtivo, setFiltroAtivo] = useState<keyof T | null>(null);

  // Atualiza um filtro especifico com tipagem estrita
  const atualizarFiltro = useCallback(<K extends keyof T>(chave: K, valor: T[K]) => {
    setFiltros((prev) => {
      const novosFiltros = { ...prev, [chave]: valor };
      if (valor === null || valor === undefined || valor === '') {
        delete novosFiltros[chave];
      }
      return novosFiltros;
    });
    setFiltroAtivo(chave);
  }, []);

  // Atualiza multiplos filtros de uma vez
  const atualizarMultiplosFiltros = useCallback((novosFiltros: Partial<T>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  // Limpa um filtro especifico
  const limparFiltro = useCallback((chave: keyof T) => {
    setFiltros((prev) => {
      const novosFiltros = { ...prev };
      delete novosFiltros[chave];
      return novosFiltros;
    });
  }, []);

  // Limpa todos os filtros
  const limparTodosFiltros = useCallback(() => {
    setFiltros(filtrosIniciais);
  }, [filtrosIniciais]);

  // Verifica se ha filtros ativos
  const temFiltrosAtivos = useCallback(() => Object.keys(filtros).length > 0, [filtros]);

  // Obtem quantidade de filtros ativos
  const contagemFiltrosAtivos = useCallback(() => Object.keys(filtros).length, [filtros]);

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
