import React, { useState } from "react";
import type { Funcionario, AlterarSenhaFuncionarioForm } from "../../hooks/useFuncionarios";


type AlterarSenhaFuncionarioModalProps = {
  funcionario: Funcionario;
  onClose: () => void;
  onCloseEditarFuncionarioModal: () => void;
  onAlterarSenha: (dadosParaEdicaoDeSenha: AlterarSenhaFuncionarioForm) => void;
};

const AlterarSenhaFuncionarioModal: React.FC<AlterarSenhaFuncionarioModalProps> = ({ funcionario, onClose, onAlterarSenha, onCloseEditarFuncionarioModal }) => {
  const [formData, setFormData] = useState<AlterarSenhaFuncionarioForm>({
    idFuncionario: funcionario.id,
    novaSenha: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onAlterarSenha(formData);
    onClose();
    onCloseEditarFuncionarioModal();
  };

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay para fechar o modal ao clicar fora */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto z-50">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Editar Funcionário</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="novaSenha" className="text-lg font-medium text-gray-700">Nova Senha:</label>
            <div className="relative">
              <input
                id="novaSenha"
                type={showPassword ? "text" : "password"} // Altera o tipo do input baseado no estado showPassword
                name="novaSenha"
                value={formData.novaSenha ?? ""} // Usando o campo novaSenha do formData
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black text-gray-800"
                autoComplete="new-password" // Adicionado para tentar prevenir o preenchimento automático por parte do navegador (por senhas já salvas no navegador)
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className="form-checkbox h-5 w-5 text-black rounded-md focus:ring-black"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600 select-none">Mostrar</label>
              </div>
            </div>
          </div>

          <hr className="h-px my-8 bg-gray-300 border-0"></hr>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md transition duration-200 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-lg"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md transition duration-200 ease-in-out hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaFuncionarioModal;