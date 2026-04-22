import { useCallback, useEffect, useRef, useState } from 'react';

type FiltroValor = string | number | boolean | null | undefined | ReadonlyArray<string>;

export interface ConfiguracaoLista<TFiltros extends Record<string, FiltroValor>> {
  itensPorPagina?: number;
  filtrosIniciais?: Partial<TFiltros>;
}

export interface ResultadoBusca<T> {
  content: T[];
  totalPages: number;
  number: number;
}

export type FiltrosListagemBase = {
  busca?: string;
  status?: string | string[];
  prioridade?: string | string[];
} & Record<string, FiltroValor>;

export type FiltrosListagem = FiltrosListagemBase;

const saoIguais = (a: FiltroValor, b: FiltroValor): boolean => {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
  }
  return a === b;
};

export const useListaPaginada = <
  T,
  TFiltros extends FiltrosListagemBase = FiltrosListagemBase,
>(
  buscaFn: (pagina: number, filtros: TFiltros, limite: number) => Promise<ResultadoBusca<T>>,
  config: ConfiguracaoLista<TFiltros> = {}
) => {
  const { itensPorPagina = 10, filtrosIniciais = {} } = config;

  const [itens, setItens] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState<TFiltros>(filtrosIniciais as TFiltros);
  const [erro, setErro] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const executarBusca = useCallback(
    async (pagina: number, filtrosAtivos: TFiltros) => {
      const requestId = ++requestIdRef.current;
      try {
        setLoading(true);
        setErro(null);
        const resultado = await buscaFn(pagina, filtrosAtivos, itensPorPagina);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItens(resultado.content);
        setTotalPaginas(resultado.totalPages || 1);
        setPaginaAtual(resultado.number ?? pagina);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setErro(err instanceof Error ? err.message : 'Erro ao buscar dados');
        setItens([]);
        setTotalPaginas(1);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [buscaFn, itensPorPagina]
  );

  useEffect(() => {
    executarBusca(0, filtros);
  }, [filtros, executarBusca]);

  const atualizarFiltro = useCallback((novosFiltros: Partial<TFiltros>) => {
    setFiltros((prev) => {
      const proximo = { ...prev };
      let mudou = false;

      for (const [chave, valor] of Object.entries(novosFiltros) as Array<[keyof TFiltros, TFiltros[keyof TFiltros]]>) {
        const valorAnterior = prev[chave];
        if (!saoIguais(valorAnterior, valor)) {
          proximo[chave] = valor;
          mudou = true;
        }
      }

      return mudou ? proximo : prev;
    });
  }, []);

  const irParaPagina = useCallback(
    (pagina: number) => {
      if (pagina >= 0 && pagina < totalPaginas) {
        executarBusca(pagina, filtros);
      }
    },
    [totalPaginas, filtros, executarBusca]
  );

  const irProxima = useCallback(() => {
    if (paginaAtual + 1 < totalPaginas) {
      executarBusca(paginaAtual + 1, filtros);
    }
  }, [paginaAtual, totalPaginas, filtros, executarBusca]);

  const irAnterior = useCallback(() => {
    if (paginaAtual > 0) {
      executarBusca(paginaAtual - 1, filtros);
    }
  }, [paginaAtual, filtros, executarBusca]);

  const recarregar = useCallback(() => {
    executarBusca(paginaAtual, filtros);
  }, [paginaAtual, filtros, executarBusca]);

  return {
    itens,
    loading,
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    filtros,
    erro,
    atualizarFiltro,
    irParaPagina,
    irProxima,
    irAnterior,
    recarregar,
  };
};
