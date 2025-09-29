import React, { useState } from "react";
import { useFuncionarios } from "../../hooks/useFuncionarios";
import FuncionarioModal from "./FuncionarioModal";
import FuncionarioEditModal from "./FuncionarioEditModal";
import FuncionarioCadastroModal from "./FuncionarioCadastroModal";
import { type Funcionario } from "../../hooks/useFuncionarios";

const FuncionarioList: React.FC = () => {
  const { funcionarios, loading, paginaAtual, setPaginaAtual, totalPaginas, cadastrarFuncionario, editarFuncionario, alterarSenhaFuncionario} = useFuncionarios();
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white text-gray-900 p-8 rounded-md shadow-sm">
      
      <div className="flex justify-between items-center"> 
        <h3 className="text-2xl font-semibold mb-6">Gerenciamento de Funcionários</h3>
        <button
          onClick={() => setModalCadastroAberto(true)}
          className="mb-4 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
        > Cadastrar Funcionário </button>
      </div>

      {loading ? (
        <p className="text-lg text-gray-600">Carregando funcionários...</p>
        ) : (
          <>
            <ul className="space-y-4">
              {funcionarios.map((funcionario) => (
                <li
                  key={funcionario.id}
                  className="flex justify-between items-center p-6 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <span
                    onClick={() => setFuncionarioSelecionado(funcionario)}
                    className="text-lg hover:underline"
                  >
                    <strong>{funcionario.nomeCompleto}</strong> — {funcionario.qualificacaoFuncionario}
                  </span>
                  <button
                    onClick={() => setFuncionarioEditando(funcionario)}
                    className="px-4 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>

          {/* Paginação aprimorada */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-lg font-medium">Página {paginaAtual + 1} de {totalPaginas}</span>
            <button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual + 1 >= totalPaginas}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
          
        </>
      )}

      {/* Modal de detalhes */}
      {funcionarioSelecionado && <FuncionarioModal funcionario={funcionarioSelecionado} onClose={() => setFuncionarioSelecionado(null)} />}

      {/* Modal de edição */}
      {funcionarioEditando && <FuncionarioEditModal funcionario={funcionarioEditando} onClose={() => setFuncionarioEditando(null)} onUpdate={editarFuncionario} alterarSenha={alterarSenhaFuncionario} />}

      {/* Modal de cadastro */}
      {modalCadastroAberto && <FuncionarioCadastroModal onClose={() => setModalCadastroAberto(false)} onCadastro={cadastrarFuncionario} />}
    </div>
  );
};

export default FuncionarioList;



