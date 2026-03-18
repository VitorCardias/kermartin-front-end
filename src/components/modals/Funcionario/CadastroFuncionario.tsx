import React, { useState } from "react";
import type { Funcionario } from "../../../Hooks/useFuncionarios";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";

type CadastroFuncionarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCadastro: (novoFuncionario: Funcionario) => Promise<void>;
};

const CadastroFuncionario: React.FC<CadastroFuncionarioModalProps> = ({ isOpen, onClose, onCadastro }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Funcionario>({
    id: "",
    nomeCompleto: "",
    nomeUsuario: "",
    emailCadastro: "",
    cpf: "",
    senha: "",
    qualificacaoFuncionario: "",
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): string | null => {
    if (!formData.nomeCompleto.trim()) {
      return "Nome completo é obrigatório";
    }
    if (!formData.cpf.trim()) {
      return "CPF é obrigatório";
    }
    if (!formData.qualificacaoFuncionario.trim()) {
      return "Qualificação/Cargo é obrigatório";
    }
    if (!formData.emailCadastro.trim()) {
      return "E-mail é obrigatório";
    }
    if (!formData.emailCadastro.includes("@")) {
      return "E-mail inválido";
    }
    if (!formData.nomeUsuario.trim()) {
      return "Nome de usuário é obrigatório";
    }
    if (!formData.senha.trim() || formData.senha.length < 6) {
      return "Senha é obrigatória e deve ter no mínimo 6 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setAlert({
        isOpen: true,
        titulo: "Erro na Validação",
        mensagem: validationError,
        tipo: "erro",
      });
      return;
    }
    
    setLoading(true);
    try {
      const novoFuncionario = {
        ...formData,
      };

      await onCadastro(novoFuncionario);
      
      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Funcionário cadastrado com sucesso!",
        tipo: "sucesso",
      });

      // Limpar o formulário
      setFormData({
        id: "",
        nomeCompleto: "",
        nomeUsuario: "",
        emailCadastro: "",
        cpf: "",
        senha: "",
        qualificacaoFuncionario: "",
      });
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      setAlert({
        isOpen: true,
        titulo: "Erro ao Cadastrar",
        mensagem: error instanceof Error ? error.message : "Erro desconhecido ao cadastrar funcionário",
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10">
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Cadastro Funcionário</Titulo>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-4">Informações Pessoais</p>
          <div>
            <label className="block text-primary font-medium text-sm">Nome Completo</label>
            <input
              type="text"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Digite o nome do funcionário"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">Qualificação / Cargo</label>
              <input
                type="text"
                name="qualificacaoFuncionario"
                value={formData.qualificacaoFuncionario}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ex: Sócio / Advogado"
                required
              />
            </div>
          </div>
          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-6 sm:mt-8">Acesso ao Sistema</p>
          <div>
            <label className="block text-primary font-medium text-sm">E-mail</label>
            <input
              type="email"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="email@email.com"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">Nome Usuário</label>
              <input
                type="text"
                name="nomeUsuario"
                value={formData.nomeUsuario}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Usuário para login"
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Digite uma senha segura"
                required
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 mt-8 sm:mt-10">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-md transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
        <AlertModal 
          isOpen={alert.isOpen}
          titulo={alert.titulo}
          mensagem={alert.mensagem}
          tipo={alert.tipo}
          mostrarBotaoCancelar={false}
          onCancel={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") {
              onClose();
            }
          }}
          onConfirm={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") {
              onClose();
            }
          }}
        />
      </div>
    </div>
  );
};

export default CadastroFuncionario;
