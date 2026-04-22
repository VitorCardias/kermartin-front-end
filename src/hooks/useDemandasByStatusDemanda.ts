import { useState, useEffect, useCallback } from 'react';

import { usePerfil } from './usePerfil'; // Verifique o caminho do seu import
import type { Demanda, DemandaAPI } from './useDemandas'; // Verifique o caminho do seu import
import type { StatusDemandaTipo } from '../types/TiposDemandas'; // Verifique o caminho do seu import
import type { AxiosResponse } from 'axios';
import { authApi } from '../api/AuthService';

type PaginacaoResponseDemandaStatus = {
  content: DemandaAPI[];
  totalPages: number;
  number: number;
};

type DemandasPorStatusParams = {
  page: number;
  size: number;
  statusDemanda?: StatusDemandaTipo;
  funcionarioID?: string;
  clienteID?: string;
};

// A assinatura do hook permanece a mesma
export const useDemandsByStatus = (status: StatusDemandaTipo, filtro: string, tipoFiltro: 'funcionario' | 'cliente') => {
  const perfil = usePerfil();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const fetchDemandas = useCallback(async (pagina: number) => {
    if (!perfil?.id || !status) {
      setDemandas([]);
      setTotalPaginas(1);
      setLoading(false);
      return;
    }

    setLoading(true);

    let response: AxiosResponse<PaginacaoResponseDemandaStatus>;
    let endpoint = '';
    const params: DemandasPorStatusParams = {
      statusDemanda: status,
      page: pagina,
      size: itensPorPagina,
    };

    try {
      if (filtro === '') {
        endpoint = `/demanda/listar-por-escritorio-statusdemanda/${status}`;
        // Para a rota sem filtro, os parâmetros são um pouco diferentes
        delete params.statusDemanda; 
      } else {
        if (tipoFiltro === "funcionario") {
          endpoint = `/demanda/filtro-statusdemanda-funcionario`;
          params.funcionarioID = filtro;
        } else { // tipoFiltro === "cliente"
          endpoint = `/demanda/filtro-statusdemanda-cliente`;
          params.clienteID = filtro;
        }
      }
      
      response = await authApi.get(endpoint, { params });

      const demandasFormatadas: Demanda[] = response.data.content.map(
        (demanda: DemandaAPI) => ({ ...demanda })
      );

      setDemandas(demandasFormatadas);
      setTotalPaginas(response.data.totalPages);
      setPaginaAtual(response.data.number);
    } catch (error) {
      console.error(`Erro ao buscar demandas para o status ${status}: `, error);
    } finally {
      setLoading(false);
    }
    // As dependências do useCallback estão corretas
  }, [perfil?.id, status, itensPorPagina, filtro, tipoFiltro]);

  useEffect(() => {
    if (perfil?.id && status) {
      // A busca agora é chamada sempre que o filtro ou a aba mudam**
      fetchDemandas(0); // Sempre busca a primeira página ao mudar o filtro
    }
    // A dependência em 'fetchDemandas' garante que a busca seja refeita quando os filtros mudam
  }, [perfil?.id, status, fetchDemandas]);

  const mudarPagina = useCallback((novaPagina: number) => {
    if (novaPagina >= 0 && novaPagina < totalPaginas) {
      fetchDemandas(novaPagina);
    }
  }, [totalPaginas, fetchDemandas]);

  const refetchDemandas = useCallback(() => {
    if (perfil?.id && status) {
      fetchDemandas(paginaAtual);
    }
  }, [perfil?.id, status, paginaAtual, fetchDemandas]);

  return {
    demandas,
    loading,
    paginaAtual,
    totalPaginas,
    mudarPagina,
    refetchDemandas,
    hasDemandas: demandas.length > 0,
  };
};
