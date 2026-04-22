import { useState, useEffect } from "react";
import { usePerfil } from "./usePerfil";
import { authApi } from "../api/AuthService";
import { cacheService } from "../utils/cacheService";

export type ClienteParaFiltro = {
  id: string;
  tipoCliente: string;
  nome: string;
}

export const useClientesParaFiltro = () => {
  const perfil = usePerfil();
  const [clientesParaFiltro, setClientesParaFiltro] = useState<ClienteParaFiltro[]>([]);
  const [loading, setLoading] = useState(true);
  const cacheKey = `clientes:para-filtro:${perfil?.idEscritorio || "sem-escritorio"}`;

  // Função para buscar funcionários para filtragem
  const buscarClientesParaFiltro = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);

      const clientes = await cacheService.fetch<ClienteParaFiltro[]>(
        cacheKey,
        async () => {
          const response = await authApi.get(`/cliente/listar-para-filtro`, {
            params: { escritorioID: perfil.idEscritorio },
          });
          return response.data;
        },
        60 * 1000
      );

      setClientesParaFiltro(clientes);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar clientes para filtro: ", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (perfil?.id) {
      buscarClientesParaFiltro();
    }
  }, [perfil, cacheKey]);

  return {
    loading,
    buscarClientesParaFiltro,
    clientesParaFiltro
  };

};
