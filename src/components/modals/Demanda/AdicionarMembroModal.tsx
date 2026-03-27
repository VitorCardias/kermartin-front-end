import React, { useState } from "react";
import { useFuncionarios } from "../../../Hooks/useFuncionarios";
import AlertModal from "../AlertModal";

type AdicionarMembroModalProps = {
  idDemanda: string;
  onClose: () => void;
  onAdicionado: () => void;
};

const AdicionarMembroModal: React.FC<AdicionarMembroModalProps> = ({ 
  idDemanda, 
  onClose, 
  onAdicionado 
}) => {
  const { funcionarios, loading, paginaAtual, setPaginaAtual, totalPaginas } = useFuncionarios();
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);
  const [adicionandoMembro, setAdicionandoMembro] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

  const obterDataAtualFormato = () => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
  };

  const adicionarMembro = async () => {
    if (!funcionarioSelecionado) {
      setAlert({
        isOpen: true,
        titulo: "Erro",
        mensagem: "Selecione um funcionário",
        tipo: "erro",
      });
      return;
    }

    setAdicionandoMembro(true);
    try {
      const { authApi } = await import("../../../api/AuthService");
      await authApi.post("/membro-equipe-demanda", {
        demandaDTO: { id: idDemanda },
        funcionarioDTO: { id: funcionarioSelecionado },
        inicioParticipacao: obterDataAtualFormato()
      });

      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Membro adicionado com sucesso!",
        tipo: "sucesso",
      });

      setTimeout(() => {
        onAdicionado();
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Erro ao adicionar membro à equipe:", error);
      setAlert({
        isOpen: true,
        titulo: "Erro",
        mensagem: "Erro ao adicionar membro. Tente novamente.",
        tipo: "erro",
      });
    } finally {
      setAdicionandoMembro(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-white rounded-xl border border-gray-300 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-6">Adicionar Membro à Equipe</h3>

          {loading ? (
            <p className="text-lg text-gray-600">Carregando funcionários...</p>
          ) : (
            <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {funcionarios.map((funcionario) => (
                <li
                  key={funcionario.id}
                  onClick={() => setFuncionarioSelecionado(funcionario.id)}
                  className={`p-4 border border-gray-300 rounded-md cursor-pointer transition ${
                    funcionarioSelecionado === funcionario.id 
                      ? "bg-blue-100 border-blue-500" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="text-lg font-medium">{funcionario.nomeCompleto}</p>
                  <p className="text-gray-600 text-sm">{funcionario.qualificacaoFuncionario}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 mb-6">
              <button
                onClick={() => setPaginaAtual(paginaAtual - 1)}
                disabled={paginaAtual === 0 || loading}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 text-sm"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-700">
                Página {paginaAtual + 1} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(paginaAtual + 1)}
                disabled={paginaAtual + 1 >= totalPaginas || loading}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 text-sm"
              >
                Próxima
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={adicionandoMembro}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={adicionarMembro}
              disabled={!funcionarioSelecionado || adicionandoMembro}
              className={`px-6 py-2 rounded-md text-white text-sm font-medium transition ${
                funcionarioSelecionado && !adicionandoMembro
                  ? "bg-primary hover:brightness-110 cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              {adicionandoMembro ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
        mostrarBotaoCancelar={false}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />
    </>
  );
};

export default AdicionarMembroModal;
