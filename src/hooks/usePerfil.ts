import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const usePerfil = () => {
  const { perfil } = useContext(AuthContext);
  return perfil;
};

