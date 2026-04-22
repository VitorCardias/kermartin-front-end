import React, { useState } from "react";
import type { AlterarSenhaFuncionarioForm, Funcionario } from "../../../Hooks/useFuncionarios";
import { 
  formatarEmail, 
  formatarTexto, 
  removerFormatacao,
  formatarCPFEnquantoDigita
} from "../../../utils/formatters";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";
import AlterarSenhaModal from "./AlterarSenha";

type EditarFuncionarioModalProps = {
  funcionario: Funcionario & { statusConta?: string };
  onClose: () => void;
  onUpdate: (funcionarioEditado: Funcionario & { statusConta?: string }) => Promise<void>;
  alterarSenha: (alterarSenhaFuncionarioRequest: AlterarSenhaFuncionarioForm) => Promise<void>;
};

type ErrosCampo = {
  nomeCompleto?: string;
  cpf?: string;
  qualificacaoFuncionario?: string;
  emailCadastro?: string;
  nomeUsuario?: string;
  statusConta?: string;
};

const EditarFuncionario: React.FC<EditarFuncionarioModalProps> = ({
  funcionario,
  onClose,
  onUpdate,
  alterarSenha,
}) => {
  const [formData, setFormData] = useState({
    ...funcionario,
    cpf: funcionario.cpf ? formatarCPFEnquantoDigita(funcionario.cpf) : "",
  });
  const [errosCampo, setErrosCampo] = useState<ErrosCampo>({});
  const [modalEditarSenha, setModalEditarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

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

      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let novoValor = value;

    // Aplicar máscara e limite ao CPF
    if (name === "cpf") {
      novoValor = formatarCPFEnquantoDigita(value);
    }

    setFormData({ ...formData, [name]: novoValor });
    setErrosCampo({ ...errosCampo, [name]: null });
  };

  const validateForm = (): ErrosCampo => {
    const erros: ErrosCampo = {};

    ["nomeCompleto", "cpf", "qualificacaoFuncionario", "emailCadastro", "nomeUsuario"].forEach((key) => {
      const valor = formData[key as keyof typeof formData] as string;
      const erro = validarCampo(key, valor);
      if (erro) erros[key as keyof ErrosCampo] = erro;
    });

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
      const funcionarioEditado = {
        ...formData,
        nomeCompleto: formatarTexto(formData.nomeCompleto),
        nomeUsuario: formData.nomeUsuario.trim(),
        emailCadastro: formatarEmail(formData.emailCadastro),
        cpf: removerFormatacao(formData.cpf),
        qualificacaoFuncionario: formatarTexto(formData.qualificacaoFuncionario),
      } as Funcionario & { statusConta?: string };

      await onUpdate(funcionarioEditado);

      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Funcionário atualizado com sucesso!",
        tipo: "sucesso",
      });

      setTimeout(() => {
        setAlert({ ...alert, isOpen: false });
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao atualizar funcionário:", error);

      const errosApi: ErrosCampo = {};
      let mensagem = error.response?.data?.message || error.message || "Erro desconhecido ao atualizar funcionário";

      if (error.response?.data?.erros && typeof error.response.data.erros === "object") {
        Object.entries(error.response.data.erros).forEach(([campo, msg]: [string, any]) => {
          errosApi[campo as keyof ErrosCampo] = msg;
        });
      }

      if (error.response?.status === 400 || error.response?.status === 409) {
        const msgLower = mensagem.toLowerCase();

        if (msgLower.includes("email") && msgLower.includes("existe")) {
          errosApi.emailCadastro = "Este e-mail já está cadastrado no sistema";
        }
        if (msgLower.includes("usuario") && (msgLower.includes("existe") || msgLower.includes("duplicate"))) {
          errosApi.nomeUsuario = "Este nome de usuário já existe no sistema";
        }
        if (msgLower.includes("usuário") && (msgLower.includes("existe") || msgLower.includes("duplicate"))) {
          errosApi.nomeUsuario = "Este nome de usuário já existe no sistema";
        }
        if (msgLower.includes("cpf") && msgLower.includes("existe")) {
          errosApi.cpf = "Este CPF já está cadastrado no sistema";
        }

        if (Object.keys(errosApi).length === 0) {
          mensagem = error.response?.data?.message || "Erro ao atualizar. Verifique os dados e tente novamente.";
        }
      }

      if (Object.keys(errosApi).length > 0) {
        setErrosCampo(errosApi);
        mensagem = "Verifique os campos destacados em vermelho";
      }

      setAlert({
        isOpen: true,
        titulo: "Erro ao Atualizar",
        mensagem: mensagem,
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10 flex-shrink-0">
          <Titulo tamanho="text-2xl sm:text-3xl p-3 sm:p-4 md:p-6">Editar Colaborador</Titulo>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 overflow-y-auto flex-grow">
          {/* INFORMAÇÕES PESSOAIS */}
          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-3 sm:mb-4 mt-2 sm:mt-3">Informações Pessoais</p>

          {/* Nome Completo */}
          <div>
            <label className="block text-primary font-medium text-xs sm:text-sm mb-1">Nome Completo</label>
            <input
              type="text"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-2 sm:px-3 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm transition ${
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-primary font-medium text-xs sm:text-sm mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                disabled={loading}
                maxLength={14}
                className={`w-full px-2 sm:px-3 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm transition ${
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
            <div className="w-full sm:w-1/2">
              <label className="block text-primary font-medium text-xs sm:text-sm mb-1">Qualificação / Cargo</label>
              <input
                type="text"
                name="qualificacaoFuncionario"
                value={formData.qualificacaoFuncionario}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-2 sm:px-3 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm transition ${
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

          {/* ACESSO AO SISTEMA */}
          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-3 sm:mb-4 mt-4 sm:mt-6 md:mt-8">Acesso ao Sistema</p>

          {/* Email */}
          <div>
            <label className="block text-primary font-medium text-xs sm:text-sm mb-1">E-mail</label>
            <input
              type="email"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-2 sm:px-3 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm transition ${
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

          {/* Nome Usuário e Status da Conta */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-primary font-medium text-xs sm:text-sm mb-1">Nome Usuário</label>
              <input
                type="text"
                name="nomeUsuario"
                value={formData.nomeUsuario}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-2 sm:px-3 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm transition ${
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
            <div className="w-full sm:w-1/2">
              <label className="block text-primary font-medium text-xs sm:text-sm mb-1">Status da Conta</label>
              <select
                name="statusConta"
                value={formData.statusConta || "Ativo"}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-2 sm:px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm transition"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* SEGURANÇA */}
          <div>
            <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-2 sm:mb-3 mt-4 sm:mt-6 md:mt-8">Segurança</p>
            <button
              type="button"
              onClick={() => setModalEditarSenha(true)}
              disabled={loading}
              className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 bg-primary text-white rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
            >
              Alterar senha de Acesso
            </button>
          </div>

          {/* Spacer para mobile */}
          <div className="h-2 sm:hidden" />
        </form>

        {/* Botões Sticky - Sempre na Parte de Baixo */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 bg-primary text-white rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
            onClick={handleSubmit}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

        {/* Modal de Alterar Senha */}
        <AlterarSenhaModal
          isOpen={modalEditarSenha}
          onClose={() => setModalEditarSenha(false)}
          onAlterarSenha={alterarSenha}
          idFuncionario={funcionario.id}
          nomeUsuario={formData.nomeUsuario}
        />

        {/* Alert Modal */}
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

export default EditarFuncionario;
