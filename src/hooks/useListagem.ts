import { useState, useCallback, useEffect, useRef } from "react";

export interface ConfiguracaoLista {
  itensPorPagina?: number;
  filtrosIniciais?: Record<string, any>;
}

export interface ResultadoBusca<T> {
  content: T[];
  totalPages: number;
  number: number;
}

export interface FiltrosListagem {
  busca?: string;
  status?: string | string[];
  prioridade?: string | string[];
  [key: string]: any;
}

export const useListaPaginada = <T,>(
  buscaFn: (pagina: number, filtros: FiltrosListagem, limite: number) => Promise<ResultadoBusca<T>>,
  config: ConfiguracaoLista = {}
) => {
  const { itensPorPagina = 10, filtrosIniciais = {} } = config;

  const [itens, setItens] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosListagem>(filtrosIniciais);
  const [erro, setErro] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // Função que executa a busca
  const executarBusca = useCallback(
    async (pagina: number, filtrosAtivos: FiltrosListagem) => {
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
        setErro(err instanceof Error ? err.message : "Erro ao buscar dados");
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

  // Buscar quando filtros mudam (volta à página 0)
  useEffect(() => {
    executarBusca(0, filtros);
  }, [filtros, executarBusca]);

  const atualizarFiltro = useCallback((novosFiltros: Partial<FiltrosListagem>) => {
    setFiltros((prev) => {
      const proximo = { ...prev };
      let mudou = false;

      const saoIguais = (a: any, b: any) => {
        if (Array.isArray(a) || Array.isArray(b)) {
          if (!Array.isArray(a) || !Array.isArray(b)) return false;
          if (a.length !== b.length) return false;
          return a.every((item, index) => item === b[index]);
        }
        return a === b;
      };

      Object.entries(novosFiltros).forEach(([chave, valor]) => {
        if (!saoIguais((prev as any)[chave], valor)) {
          (proximo as any)[chave] = valor;
          mudou = true;
        }
      });

      return mudou ? proximo : prev;
    });
  }, []);

  const irParaPagina = useCallback((pagina: number) => {
    if (pagina >= 0 && pagina < totalPaginas) {
      executarBusca(pagina, filtros);
    }
  }, [totalPaginas, filtros, executarBusca]);

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

