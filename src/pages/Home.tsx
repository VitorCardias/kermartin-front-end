import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900 p-6">
      <h1 className="text-4xl font-semibold mb-6">Bem vindo!</h1>
      <p className="max-w-2xl text-center text-lg leading-relaxed mb-8">
        Sistema integrado desenvolvido especificamente para escritórios jurídicos
        que simplifica o gerenciamento de processos, prazos, documentos, finanças
        e relacionamento com clientes em uma única plataforma intuitiva, permitindo
        que advogados economizem tempo em tarefas administrativas e foquem no que
        realmente importa: representar seus clientes com excelência.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-black text-white rounded-md transition duration-300 hover:bg-gray-800"
      >
        Acessar Plataforma
      </button>
    </div>
  );
};

export default Home;
