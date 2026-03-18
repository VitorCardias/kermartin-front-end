import React from "react";
import type { Funcionario } from "../../../Hooks/useFuncionarios";

type FuncionarioModalProps = {
  funcionario: Funcionario | null;
  onClose: () => void;
};

const FuncionarioModal: React.FC<FuncionarioModalProps> = ({ funcionario, onClose }) => {
  if (!funcionario) return null;

  return (
    
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-md border border-gray-300 shadow-2xl text-left">
        <h3 className="text-2xl font-semibold mb-4">Detalhes do Funcionário</h3>
        <p className="text-lg"><strong>Nome:</strong> {funcionario.nomeCompleto}</p>
        <p className="text-lg"><strong>CPF:</strong> {funcionario.cpf}</p>
        <p className="text-lg"><strong>Qualificação:</strong> {funcionario.qualificacaoFuncionario}</p>
        <p className="text-lg"><strong>Email:</strong> {funcionario.emailCadastro}</p>
        <p className="text-lg"><strong>Nome de Usuário:</strong> {funcionario.nomeUsuario}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-black text-white rounded-md transition duration-300 hover:bg-gray-800"
        >
          Fechar
        </button>
      </div>
    </div>

  );
};

export default FuncionarioModal;
