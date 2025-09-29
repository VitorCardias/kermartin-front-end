import React, { useState } from "react";
import { useFuncionarios } from "../../hooks/useFuncionarios";
import { authApi } from "../../api/AuthService";

type AdicionarMembroModalProps = {
  idDemanda: string;
  onClose: () => void;
  onAdicionado: () => void;
};

const AdicionarMembroModal: React.FC<AdicionarMembroModalProps> = ({ idDemanda, onClose, onAdicionado }) => {
  const { funcionarios, loading, paginaAtual, setPaginaAtual, totalPaginas } = useFuncionarios();
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);

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
    if (!funcionarioSelecionado) return;

    try {
      await authApi.post("/membro-equipe-demanda", {
        demandaDTO: { id: idDemanda },
        funcionarioDTO: { id: funcionarioSelecionado },
        inicioParticipacao: obterDataAtualFormato()
      });

      onAdicionado(); // Recarrega a equipe na tela após adicionar membro
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao adicionar membro à equipe:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Adicionar Membro à Equipe</h3>

        {loading ? (
          <p className="text-lg text-gray-600">Carregando funcionários...</p>
        ) : (
          <ul className="space-y-4">
            {funcionarios.map((funcionario) => (
              <li
                key={funcionario.id}
                onClick={() => setFuncionarioSelecionado(funcionario.id)}
                className={`p-4 border border-gray-300 rounded-md cursor-pointer transition ${
                  funcionarioSelecionado === funcionario.id ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                <p className="text-lg font-medium">{funcionario.nomeCompleto}</p>
                <p className="text-gray-600">{funcionario.qualificacaoFuncionario}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Paginação aprimorada */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 0}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
          >
            Anterior
          </button>
          <span className="text-lg font-medium text-gray-700">
            Página {paginaAtual + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual + 1 >= totalPaginas}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
          >
            Próxima
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={adicionarMembro}
            disabled={!funcionarioSelecionado}
            className={`px-6 py-3 rounded-md transition ${
              funcionarioSelecionado ? "bg-black text-white hover:bg-gray-800" : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Adicionar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdicionarMembroModal;
