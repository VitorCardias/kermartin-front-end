import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { authApi } from "../api/AuthService";

type PerfilUsuario = {
  id: string;
  username: string;
  tipoUsuario: "Escritorio" | "Funcionario";
  nomeEscritorio: string;
  idEscritorio: string;
};

export const usePerfil = () => {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    if (usuario) {
      authApi.get<PerfilUsuario>("/usuario/perfil/" + usuario.username) // Usando authApi
        .then((response) => setPerfil(response.data))
        .catch((error) => console.error("Erro ao obter perfil:", error));
    }
  }, [usuario]);

  return perfil;
};

