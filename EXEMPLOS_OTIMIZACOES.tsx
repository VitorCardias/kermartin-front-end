/**
 * EXEMPLOS DE USO - Cache e Lazy Loading
 * 
 * Para melhorar ainda mais a performance, aqui estão exemplos de como usar
 * os novos serviços em seus hooks e componentes.
 */

// =============================================================================
// EXEMPLO 1: Usando cacheService em um Hook
// =============================================================================

import { useState, useEffect } from "react";
import { authApi } from "./src/api/AuthService";
import { cacheService } from "./src/utils/cacheService";

export const useClientesComCache = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarClientes = async () => {
      try {
        setLoading(true);
        // Usar cache com fetch automático
        const dados = await cacheService.fetch(
          "clientes-list", // Chave do cache
          () => authApi.get("/cliente").then(r => r.data), // Função de fetch
          10 * 60 * 1000 // TTL: 10 minutos
        );
        setClientes(dados);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarClientes();
  }, []);

  return { clientes, loading };
};

// =============================================================================
// EXEMPLO 2: Usando useLazyLoad para dados secundários
// =============================================================================

import { useLazyLoad } from "./src/Hooks/useLazyLoad";

export const useDemandasComLazyLoad = () => {
  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregamento principal (crítico)
  useEffect(() => {
    const buscar = async () => {
      const res = await authApi.get("/demanda");
      setDemandas(res.data);
      setLoading(false);
    };
    buscar();
  }, []);

  // Carregamento secundário com delay de 2 segundos
  // Isso NÃO bloqueia o usuário de interagir
  const { data: metadadosAdicionais } = useLazyLoad(
    () => authApi.get("/demanda/metadata").then(r => r.data),
    true,
    2000 // Espera 2 segundos antes de começar
  );

  return { demandas, loading, metadadosAdicionais };
};

// =============================================================================
// EXEMPLO 3: Combo - Cache + Lazy Load
// =============================================================================

export const useEquipesComCacheLazy = (idDemanda: string) => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregamento principal com cache
  useEffect(() => {
    const buscar = async () => {
      const cacheKey = `equipes-${idDemanda}`;
      const dados = await cacheService.fetch(
        cacheKey,
        () => authApi.get(`/equipe/${idDemanda}`).then(r => r.data),
        5 * 60 * 1000
      );
      setEquipes(dados);
      setLoading(false);
    };
    buscar();
  }, [idDemanda]);

  // Atualização opcional em background (não bloqueia)
  useLazyLoad(
    async () => {
      const dados = await authApi.get(`/equipe/${idDemanda}`).then(r => r.data);
      setEquipes(dados);
      // Limpar cache para próximas requisições buscarem dados frescos
      cacheService.clear(`equipes-${idDemanda}`);
    },
    true,
    30000 // Atualizar a cada 30 segundos em background
  );

  return { equipes, loading };
};

// =============================================================================
// EXEMPLO 4: Implementação em Componente React
// =============================================================================

import React from 'react';

interface Cliente {
  id: string;
  nome: string;
  [key: string]: any;
}

interface ClientesListProps {
  onSelect: (cliente: Cliente) => void;
}

const ClientesList: React.FC<ClientesListProps> = ({ onSelect }) => {
  // Usar o hook com cache
  const { clientes, loading } = useClientesComCache();

  // O loading deve ser bem rápido agora graças ao cache
  if (loading) {
    return <div className="animate-spin">Carregando...</div>;
  }

  return (
    <div className="space-y-2">
      {clientes.map((cliente: Cliente) => (
        <div
          key={cliente.id}
          onClick={() => onSelect(cliente)}
          className="p-3 border rounded cursor-pointer hover:bg-gray-100"
        >
          {cliente.nome}
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// EXEMPLO 5: Limpando Cache Manualmente
// =============================================================================

// Quando você cria/edita/deleta algo, limpe o cache:

const handleCriarCliente = async (novoCliente: any) => {
  const response = await authApi.post("/cliente", novoCliente);
  
  // IMPORTANTE: Limpar o cache para forçar atualização
  cacheService.clear("clientes-list");
  
  // Opcional: Limpar tudo
  // cacheService.clearAll();
  
  return response.data;
};

// =============================================================================
// DICAS IMPORTANTES
// =============================================================================

/**
 * 1. TTL (Time To Live):
 *    - Dados que mudam pouco: 10-30 minutos (300-1800 segundos)
 *    - Dados que mudam frequentemente: 1-5 minutos
 *    - Dados críticos: 30-60 segundos ou sem cache
 *
 * 2. Lazy Load Delay:
 *    - Dados não-críticos: 1-2 segundos após load
 *    - Atualizações em background: 30+ segundos
 *
 * 3. Quando Invalidar Cache:
 *    - Após criar novo recurso
 *    - Após editar recurso
 *    - Após deletar recurso
 *    - Manualmente quando necessário atualizar
 *
 * 4. Monitorar Performance:
 *    - DevTools -> Network: Verifique quantas requisições
 *    - DevTools -> Performance: Analise o flame graph
 *    - Medidas de Core Web Vitals
 */
