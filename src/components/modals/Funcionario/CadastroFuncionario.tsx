import React, { useState } from "react";
import type { CreateFuncionario, Funcionario } from "../../../Hooks/useFuncionarios";
import { 
  formatarEmail, 
  formatarTexto, 
  removerFormatacao,
  formatarCPFEnquantoDigita
} from "../../../utils/formatters";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";
// import { authApi } from "../../../api/AuthService"; // ⚠️ Comentado: Aguardando endpoints no backend

type CadastroFuncionarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCadastro: (novoFuncionario: CreateFuncionario) => Promise<void>;
};

type ErrosCampo = {
  nomeCompleto?: string;
  cpf?: string;
  qualificacaoFuncionario?: string;
  emailCadastro?: string;
  nomeUsuario?: string;
  senha?: string;
};

const CadastroFuncionario: React.FC<CadastroFuncionarioModalProps> = ({ isOpen, onClose, onCadastro }) => {
  if (!isOpen) return null;
  const formId = "cadastro-funcionario-form";

  const [formData, setFormData] = useState<Funcionario>({
    id: "",
    nomeCompleto: "",
    nomeUsuario: "",
    emailCadastro: "",
    cpf: "",
    senha: "",
    qualificacaoFuncionario: "",
  });

  const [errosCampo, setErrosCampo] = useState<ErrosCampo>({});

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

  const [loading, setLoading] = useState(false);

  // Validações específicas por campo (síncronas)
  const validarCampo = (name: string, value: string): string | null => {
    switch (name) {
      case "nomeCompleto":
        if (!value.trim()) return "Nome completo é obrigatório";
        if (value.trim().length < 5) return "Nome deve ter no mínimo 5 caracteres";
        return null;
      
      case "cpf":
        if (!value.trim()) return "CPF é obrigatório";
        const cpfLimpo = removerFormatacao(value);
        if (cpfLimpo.length !== 11) return "CPF deve conter 11 dígitos";
        return null;
      
      case "qualificacaoFuncionario":
        if (!value.trim()) return "Qualificação/Cargo é obrigatório";
        if (value.trim().length < 3) return "Qualificação deve ter no mínimo 3 caracteres";
        return null;
      
      case "emailCadastro":
        if (!value.trim()) return "E-mail é obrigatório";
        if (!value.includes("@") || !value.includes(".")) return "E-mail inválido";
        return null;
      
      case "nomeUsuario":
        if (!value.trim()) return "Nome de usuário é obrigatório";
        if (value.trim().length < 3) return "Usuário deve ter no mínimo 3 caracteres";
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return "Usuário deve conter apenas letras, números, _ e -";
        return null;
      
      case "senha":
        if (!value.trim()) return "Senha é obrigatória";
        if (value.length < 6) return "Senha deve ter no mínimo 6 caracteres";
        return null;
      
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") {
      novoValor = formatarCPFEnquantoDigita(value);
    }

    setFormData({ ...formData, [name]: novoValor });

    // Validar campo em tempo real (validações síncronas)
    const erro = validarCampo(name, novoValor);
    setErrosCampo(prev => ({
      ...prev,
      [name]: erro
    }));
  };

  const validateForm = (): ErrosCampo => {
    const erros: ErrosCampo = {};
    
    Object.keys(formData).forEach((key) => {
      if (key !== "id" && key !== "senha") {
        const erro = validarCampo(key, formData[key as keyof Funcionario] as string);
        if (erro) erros[key as keyof ErrosCampo] = erro;
      }
    });

    // Validação específica para senha
    const erroSenha = validarCampo("senha", formData.senha);
    if (erroSenha) erros.senha = erroSenha;

    return erros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validacaoErros = validateForm();
    if (Object.keys(validacaoErros).length > 0) {
      setErrosCampo(validacaoErros);
      setAlert({
        isOpen: true,
        titulo: "Erros na Validação",
        mensagem: "Por favor, corrija os campos destacados em vermelho.",
        tipo: "erro",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { id: _idIgnorado, ...novoFuncionarioData } = formData;
      
      const novoFuncionario: CreateFuncionario = {
        nomeCompleto: formatarTexto(novoFuncionarioData.nomeCompleto),
        nomeUsuario: novoFuncionarioData.nomeUsuario.trim(),
        emailCadastro: formatarEmail(novoFuncionarioData.emailCadastro),
        cpf: removerFormatacao(novoFuncionarioData.cpf), 
        senha: novoFuncionarioData.senha,
        qualificacaoFuncionario: formatarTexto(novoFuncionarioData.qualificacaoFuncionario),
      } as Funcionario;

      await onCadastro(novoFuncionario);
      
      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Funcionário cadastrado com sucesso!",
        tipo: "sucesso",
      });

      // Limpar o formulário
      setFormData({ id: "", nomeCompleto: "", nomeUsuario: "", emailCadastro: "", cpf: "", senha: "", qualificacaoFuncionario: "" });
      setErrosCampo({});
      
    } catch (error: any) {
      console.error("Erro ao cadastrar funcionário:", error);
      
      const errosApi: ErrosCampo = {};
      let mensagem = error.response?.data?.message || error.message || "Erro desconhecido ao cadastrar funcionário";

      // Se a API retornar validações de campo estruturadas
      if (error.response?.data?.erros && typeof error.response.data.erros === 'object') {
        Object.entries(error.response.data.erros).forEach(([campo, msg]: [string, any]) => {
          errosApi[campo as keyof ErrosCampo] = msg;
        });
      }

      // Se houver mensagem de erro 400, tentar mapear para campos
      if (error.response?.status === 400 || error.response?.status === 409) {
        const msgLower = mensagem.toLowerCase();

        // Detectar duplicações
        if (msgLower.includes('email') && msgLower.includes('existe')) {
          errosApi.emailCadastro = "Este e-mail já está cadastrado no sistema";
        }
        if (msgLower.includes('usuario') && (msgLower.includes('existe') || msgLower.includes('duplicate'))) {
          errosApi.nomeUsuario = "Este nome de usuário já existe no sistema";
        }
        if (msgLower.includes('usuário') && (msgLower.includes('existe') || msgLower.includes('duplicate'))) {
          errosApi.nomeUsuario = "Este nome de usuário já existe no sistema";
        }
        if (msgLower.includes('cpf') && msgLower.includes('existe')) {
          errosApi.cpf = "Este CPF já está cadastrado no sistema";
        }
        if (msgLower.includes('nome') && msgLower.includes('existe')) {
          errosApi.nomeCompleto = "Este nome de funcionário já existe no sistema";
        }

        // Se não encontrou erro específico, mostrar genérico
        if (Object.keys(errosApi).length === 0) {
          mensagem = error.response?.data?.message || "Erro ao cadastrar. Verifique os dados e tente novamente.";
        }
      }

      if (Object.keys(errosApi).length > 0) {
        setErrosCampo(errosApi);
        mensagem = "Verifique os campos destacados em vermelho";
      }

      setAlert({
        isOpen: true,
        titulo: "Erro ao Cadastrar",
        mensagem: mensagem,
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
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Cadastro Colaborador</Titulo>
        </div>
        <form id={formId} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-4">Informações Pessoais</p>
          
          {/* Nome Completo */}
          <div>
            <label className="block text-primary font-medium text-sm mb-1">Nome Completo</label>
            <input
              type="text"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                errosCampo.nomeCompleto
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Digite o nome do funcionário"
              required
            />
            {errosCampo.nomeCompleto && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.nomeCompleto}</p>
            )}
          </div>

          {/* CPF e Qualificação */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                  errosCampo.cpf
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="000.000.000-00"
                required
              />
              {errosCampo.cpf && (
                <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.cpf}</p>
              )}
            </div>
            <div className="w-full">
              <label className="block text-primary font-medium text-sm mb-1">Qualificação / Cargo</label>
              <input
                type="text"
                name="qualificacaoFuncionario"
                value={formData.qualificacaoFuncionario}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                  errosCampo.qualificacaoFuncionario
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Ex: Sócio / Advogado"
                required
              />
              {errosCampo.qualificacaoFuncionario && (
                <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.qualificacaoFuncionario}</p>
              )}
            </div>
          </div>

          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-6 sm:mt-8">Acesso ao Sistema</p>
          
          {/* Email */}
          <div>
            <label className="block text-primary font-medium text-sm mb-1">E-mail</label>
            <input
              type="email"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                errosCampo.emailCadastro
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="email@email.com"
              required
            />
            {errosCampo.emailCadastro && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.emailCadastro}</p>
            )}
          </div>

          {/* Nome Usuário e Senha */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm mb-1">Nome Usuário</label>
              <input
                type="text"
                name="nomeUsuario"
                value={formData.nomeUsuario}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                  errosCampo.nomeUsuario
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Usuário para login"
                required
              />
              {errosCampo.nomeUsuario && (
                <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.nomeUsuario}</p>
              )}
            </div>
            <div className="w-full">
              <label className="block text-primary font-medium text-sm mb-1">Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                  errosCampo.senha
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Digite uma senha segura"
                required
              />
              {errosCampo.senha && (
                <p className="text-red-500 text-xs mt-1">⚠️ {errosCampo.senha}</p>
              )}
            </div>
          </div>
        </form>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Cancelar
          </button>
          <button 
            type="submit"
            form={formId}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-md transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
        <AlertModal 
          isOpen={alert.isOpen}
          titulo={alert.titulo}
          mensagem={alert.mensagem}
          tipo={alert.tipo}
          zIndexClass="z-[80]"
          mostrarBotaoCancelar={false}
          onCancel={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") onClose();
          }}
          onConfirm={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") onClose();
          }}
        />
      </div>
    </div>
  );
};

export default CadastroFuncionario;
