import { useState, useEffect } from "react";
import { usePerfil } from "./usePerfil";
import { authApi } from "../api/AuthService";
import { cacheService } from "../utils/cacheService";

type FuncionarioParaFiltro = {
  id: string;
  nomeCompleto: string;
}

export const useFuncionariosParaFiltro = () => {
  const perfil = usePerfil();
  const [funcionariosParaFiltro, setFuncionariosParaFiltro] = useState<FuncionarioParaFiltro[]>([]);
  const [loading, setLoading] = useState(true);
  const cacheKey = `funcionarios:para-filtro:${perfil?.idEscritorio || "sem-escritorio"}`;


  // Função para buscar funcionários para filtragem
  const buscarFuncionariosParaFiltro = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);

      const funcionarios = await cacheService.fetch<FuncionarioParaFiltro[]>(
        cacheKey,
        async () => {
          const response = await authApi.get(`/funcionario/listar-para-filtro`, {
            params: { escritorioID: perfil.idEscritorio },
          });
          return response.data;
        },
        60 * 1000
      );

      setFuncionariosParaFiltro(funcionarios);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setLoading(false);
    }
  }


  useEffect(() => {
    if (perfil?.id) {
      buscarFuncionariosParaFiltro();
    }
  }, [perfil, cacheKey]);

  return {
    loading,
    buscarFuncionariosParaFiltro,
    funcionariosParaFiltro
  };

};
