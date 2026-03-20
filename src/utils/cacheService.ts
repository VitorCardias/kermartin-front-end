/**
 * Sistema de cache simples em memória
 * Reduz requisições desnecessárias à API
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
};

const cache = new Map<string, CacheEntry<any>>();

export const cacheService = {
  /**
   * Obter dados do cache
   */
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data as T;
  },

  /**
   * Armazenar dados no cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  /**
   * Limpar cache específico
   */
  clear(key: string): void {
    cache.delete(key);
  },

  /**
   * Limpar todo o cache
   */
  clearAll(): void {
    cache.clear();
  },

  /**
   * Wrapper para requisições com cache
   */
  async fetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Verificar cache primeiro
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Se não houver no cache, fazer requisição
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  },
};
