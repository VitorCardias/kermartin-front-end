import React from "react";
import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <h2>Oops!</h2>
      <p>A pagina que você tentou acessar não existe.</p>
      <p>Tente voltar a nossa página inicial:</p>
      <button onClick={() => navigate("/")}>Voltar à Página Inicial</button>
    </>
  );

}

export default NotFound;