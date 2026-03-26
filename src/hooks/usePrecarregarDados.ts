import { useEffect } from 'react';
import { cacheService } from '../utils/cacheService';

/**
 * Hook para precarregar dados em background após o usuário estar na página
 * Útil para dados não-críticos que devem ser carregados de forma lazy
 * 
 * @param carregarDados Função que retorna Promise com os dados
 * @param chaveCache Chave para cachear os dados
 * @param ttlCache TTL do cache em ms (padrão: 5 minutos)
 * @param delayMs Delay em ms antes de começar o carregamento (padrão: 3000)
 */
export const usePrecarregarDados = (
  carregarDados: () => Promise<any>,
  chaveCache: string,
  ttlCache: number = 5 * 60 * 1000,
  delayMs: number = 3000
) => {
  useEffect(() => {
    // Começar carregamento após delay
    const timeout = setTimeout(async () => {
      try {
        // Verificar se já está no cache
        const emCache = cacheService.get(chaveCache);
        if (emCache) {
          console.log(`✓ Dados de "${chaveCache}" já estão em cache`);
          return;
        }

        // Se não estiver em cache, carregar
        console.log(`⏳ Precarregando "${chaveCache}"...`);
        const dados = await carregarDados();
        cacheService.set(chaveCache, dados, ttlCache);
        console.log(`✓ "${chaveCache}" precarregado e cacheado`);
      } catch (error) {
        console.warn(`⚠️ Erro ao precarregar "${chaveCache}":`, error);
      }
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [chaveCache, ttlCache, delayMs, carregarDados]);
};
