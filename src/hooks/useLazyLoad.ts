import { useState, useEffect, useRef } from "react";

/**
 * Hook para lazy loading de dados
 * Permite que dados não essenciais sejam carregados após o carregamento inicial
 * 
 * @param fetchFn Função de busca de dados
 * @param enabled Se o hook deve estar ativo
 * @param delay Delay em ms antes de iniciar o carregamento
 */
export const useLazyLoad = <T,>(
  fetchFn: () => Promise<T>,
  enabled: boolean = true,
  delay: number = 0
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled) return;

    // Limpar timeout anterior se houver
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, delay, fetchFn]);

  return { data, loading, error };
};
