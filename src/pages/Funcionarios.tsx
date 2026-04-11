import React, { useState } from "react";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/filtros/FiltroPesquisar";
import CardFuncionario from "../components/CardFuncionario";
import CadastroFuncionario from "../components/modals/Funcionario/CadastroFuncionario";
import EditarFuncionario from "../components/modals/Funcionario/EditarFuncionario";
import { useFuncionarios, type Funcionario } from "../Hooks/useFuncionarios";

const Funcionarios: React.FC = () => {
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<(Funcionario & { statusConta?: string }) | undefined>(undefined);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const { funcionarios, loading, cadastrarFuncionario, editarFuncionario, alterarSenhaFuncionario } = useFuncionarios();

  const normalizarTexto = (valor?: string) =>
    (valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const termoNormalizado = normalizarTexto(termoPesquisa);

  const funcionariosFiltrados = funcionarios.filter((funcionario) =>
    normalizarTexto(funcionario.nomeCompleto).includes(termoNormalizado) ||
    normalizarTexto(funcionario.emailCadastro).includes(termoNormalizado) ||
    normalizarTexto(funcionario.qualificacaoFuncionario).includes(termoNormalizado)
  );

  const handleEditarFuncionario = (funcionario: Funcionario & { statusConta?: string }) => {
    setFuncionarioSelecionado(funcionario);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
          <div className="flex flex-col gap-1">
            <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Funcionarios</Titulo>
            <p className="text-muted text-xs sm:text-sm">Total de {funcionarios.length} funcionarios cadastrados</p>
          </div>
          <button
            className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
            onClick={() => setModalCadastroOpen(true)}
          >
            Cadastrar Funcionario
          </button>
        </div>

        <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
          <Pesquisar
            label="Pesquisar Funcionario:"
            placeholder="Digite o nome, email ou qualificacao..."
            onSearch={setTermoPesquisa}
          />
        </div>

        <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
          {loading ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">Carregando funcionarios...</p>
            </div>
          ) : funcionariosFiltrados.length === 0 ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">
                {termoPesquisa ? "Nenhum funcionario encontrado" : "Nenhum funcionario cadastrado"}
              </p>
            </div>
          ) : (
            funcionariosFiltrados.map((funcionario) => (
              <CardFuncionario
                key={funcionario.id}
                nome={funcionario.nomeCompleto}
                email={funcionario.emailCadastro}
                cargo={funcionario.qualificacaoFuncionario}
                funcionario={funcionario}
                onEditar={handleEditarFuncionario}
              />
            ))
          )}
        </div>
      </div>

      <CadastroFuncionario
        isOpen={modalCadastroOpen}
        onClose={() => setModalCadastroOpen(false)}
        onCadastro={cadastrarFuncionario}
      />

      {funcionarioSelecionado && (
        <EditarFuncionario
          funcionario={funcionarioSelecionado}
          onClose={() => {
            setFuncionarioSelecionado(undefined);
          }}
          onUpdate={editarFuncionario}
          alterarSenha={alterarSenhaFuncionario}
        />
      )}
    </>
  );
};

export default Funcionarios;
