import React, { useState } from "react";
import AlertModal from "../AlertModal";
import type { AlterarSenhaFuncionarioForm } from "../../../Hooks/useFuncionarios";

type AlterarSenhaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAlterarSenha: (dadosParaEdicaoDeSenha: AlterarSenhaFuncionarioForm) => Promise<void>;
  idFuncionario?: string;
  nomeUsuario?: string;
};

const AlterarSenhaModal: React.FC<AlterarSenhaModalProps> = ({
  isOpen,
  onClose,
  onAlterarSenha,
  idFuncionario = "",
  nomeUsuario = "Funcionário",
}) => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

  const validarSenha = (senha: string, confirmacao: string): string | null => {
    if (!senha.trim()) return "Senha é obrigatória";
    if (senha.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    if (senha !== confirmacao) return "As senhas não correspondem";
    return null;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmar = async () => {
    const erro = validarSenha(novaSenha, confirmarSenha);
    if (erro) {
      setErroSenha(erro);
      return;
    }

    setLoading(true);
    try {
      await onAlterarSenha({
        idFuncionario,
        novaSenha,
      });

      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Senha alterada com sucesso!",
        tipo: "sucesso",
      });

      // Limpar formulário
      setNovaSenha("");
      setConfirmarSenha("");
      setErroSenha(null);

      // Fechar modal após alerta
      setTimeout(() => {
        setAlert({ ...alert, isOpen: false });
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);

      let mensagem = error.response?.data?.message || error.message || "Erro ao alterar senha";

      // Tratamento de erros específicos
      if (error.response?.status === 400) {
        if (mensagem.toLowerCase().includes("senha atual")) {
          mensagem = "Senha atual incorreta";
        }
        if (mensagem.toLowerCase().includes("igual")) {
          mensagem = "A nova senha não pode ser igual à anterior";
        }
      }

      setAlert({
        isOpen: true,
        titulo: "Erro ao Alterar Senha",
        mensagem: mensagem,
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    if (!loading) {
      setNovaSenha("");
      setConfirmarSenha("");
      setErroSenha(null);
      setShowPassword(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-[60] p-4">
        <div className="w-full max-w-md bg-white rounded-xl border border-gray-300 shadow-2xl">
          {/* Header */}
          <div className="w-full bg-light border-b-2 border-default">
            <h2 className="text-xl sm:text-2xl font-bold text-primary p-4 sm:p-6">
              Alterar Senha de Acesso
            </h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Info */}
            <p className="text-sm text-muted">
              Alterando senha de: <span className="font-semibold text-primary">{nomeUsuario}</span>
            </p>

            {/* Nova Senha */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setErroSenha(null);
                  }}
                  disabled={loading}
                  className={`w-full px-3 sm:px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                    erroSenha
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={togglePasswordVisibility}
                    disabled={loading}
                    className="form-checkbox h-4 w-4 text-primary rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showPassword" className="ml-2 text-xs text-gray-600 select-none">
                    Mostrar
                  </label>
                </div>
              </div>
              {erroSenha && (
                <p className="text-red-500 text-xs mt-1">⚠️ {erroSenha}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">
                Confirmar Senha
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  setErroSenha(null);
                }}
                disabled={loading}
                className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition ${
                  erroSenha
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Confirme a nova senha"
                autoComplete="new-password"
              />
            </div>
            {/* Botões */}
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleFechar}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
              >
                {loading ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
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
    </>
  );
};

export default AlterarSenhaModal;

