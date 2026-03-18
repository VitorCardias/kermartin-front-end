import React, { useState } from "react";
import type { AlterarSenhaFuncionarioForm, Funcionario } from "../../../Hooks/useFuncionarios";
import AlterarSenhaFuncionarioModal from "./AlterarSenhaFuncionarioModal";

type FuncionarioEditModalProps =
 {
  funcionario: Funcionario;
  onClose: () => void;
  onUpdate: (funcionarioEditado: Funcionario) => void;
  alterarSenha: (alterarSenhaFuncionarioRequest: AlterarSenhaFuncionarioForm) => void;
};

const FuncionarioEditModal: React.FC<FuncionarioEditModalProps> = ({ funcionario, onClose, onUpdate, alterarSenha }) => {
  const [formData, setFormData] = useState({ ...funcionario });
  const [modalEditarSenhaFuncionario, setModalEditarSenhaFuncionario] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Editar Funcionário</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nome Completo", name: "nomeCompleto" },
            { label: "CPF", name: "cpf" },
            { label: "Qualificação", name: "qualificacaoFuncionario" },
            { label: "Email", name: "emailCadastro", type: "email" },
            { label: "Nome de Usuário", name: "nomeUsuario" },
            { label: "Status da Conta", name: "statusConta" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name} className="flex flex-col">
              <label className="text-lg font-medium">{label}:</label>
              <input
                type={type}
                name={name}
                value={formData[name as keyof Funcionario] ?? ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>
          ))}

          {/* Alterar Senha */}
          <div>
            <label className="text-lg font-medium">Senha:</label>
            <button type="button" onClick={() => setModalEditarSenhaFuncionario(true)} className="w-full p-3 px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Aterar Senha
            </button>
          </div>

          <hr className="h-px my-8 bg-gray-300 border-0"></hr>

          <div className="flex justify-end gap-4 mt-6">
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Salvar Alterações
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Modal de edição */}
      {modalEditarSenhaFuncionario && <AlterarSenhaFuncionarioModal 
      funcionario={funcionario} 
      onClose={() => setModalEditarSenhaFuncionario(false)} 
      onAlterarSenha={alterarSenha}
      onCloseEditarFuncionarioModal={() => onClose()}
      />}

    </div>
  );
};

export default FuncionarioEditModal;

