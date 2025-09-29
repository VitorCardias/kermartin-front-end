import { useState, useEffect } from "react";
import { usePerfil } from "./usePerfil";
import { authApi } from "../api/AuthService";

type FuncionarioParaFiltro = {
  id: string;
  nomeCompleto: string;
}

export const useFuncionariosParaFiltro = () => {
  const perfil = usePerfil();
  const [funcionariosParaFiltro, setFuncionariosParaFiltro] = useState<FuncionarioParaFiltro[]>([]);
  const [loading, setLoading] = useState(true);


  // Função para buscar funcionários para filtragem
  const buscarFuncionariosParaFiltro = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);

      const response = await authApi.get(`/funcionario/listar-para-filtro`, {
        params: { escritorioID: perfil.idEscritorio },
      });

      setFuncionariosParaFiltro(response.data);
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
  }, [perfil]);

  return {
    loading,
    buscarFuncionariosParaFiltro,
    funcionariosParaFiltro
  };

};
