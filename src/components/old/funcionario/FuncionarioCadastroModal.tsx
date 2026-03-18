import React, { useState } from "react";
import type { Funcionario } from "../../../Hooks/useFuncionarios";

type FuncionarioCadastroModalProps = {
  onClose: () => void;
  onCadastro: (novoFuncionario: Funcionario) => void;
};

const FuncionarioCadastroModal: React.FC<FuncionarioCadastroModalProps> = ({ onClose, onCadastro }) => {
  const [formData, setFormData] = useState({
    id: "",
    nomeCompleto: "",
    nomeUsuario: "",
    emailCadastro: "",
    cpf: "",
    senha: "",
    qualificacaoFuncionario: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoFuncionario = {
      ...formData,
    }

    //console.log("Dados sendo enviados:", novoFuncionario);
    onCadastro(novoFuncionario);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Cadastrar Funcionário</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nome Completo", name: "nomeCompleto" },
            { label: "Nome de Usuário", name: "nomeUsuario" },
            { label: "Email", name: "emailCadastro", type: "email" },
            { label: "CPF", name: "cpf" },
            { label: "Senha", name: "senha", type: "password" },
            { label: "Qualificação", name: "qualificacaoFuncionario" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name} className="flex flex-col">
              <label className="text-lg font-medium">{label}:</label>
              <input
                type={type}
                name={name}
                value={(formData[name as keyof Funcionario] as string) ?? ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button type="submit"
              className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Cadastrar
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncionarioCadastroModal;
