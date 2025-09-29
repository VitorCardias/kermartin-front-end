import { useState, useEffect } from "react";
import { usePerfil } from "./usePerfil";
import { authApi } from "../api/AuthService";

export type ClienteParaFiltro = {
  id: string;
  tipoCliente: string;
  nome: string;
}

export const useClientesParaFiltro = () => {
  const perfil = usePerfil();
  const [clientesParaFiltro, setClientesParaFiltro] = useState<ClienteParaFiltro[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar funcionários para filtragem
  const buscarClientesParaFiltro = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);

      const response = await authApi.get(`/cliente/listar-para-filtro`, {
        params: { escritorioID: perfil.idEscritorio },
      });

      setClientesParaFiltro(response.data);
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
  }, [perfil]);

  return {
    loading,
    buscarClientesParaFiltro,
    clientesParaFiltro
  };

};
