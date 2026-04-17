import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/filtros/FiltroPesquisar";
import CardFuncionario from "../components/CardFuncionario";
import CadastroFuncionario from "../components/modals/Funcionario/CadastroFuncionario";
import EditarFuncionario from "../components/modals/Funcionario/EditarFuncionario";
import { useFuncionarios, type Funcionario } from "../Hooks/useFuncionarios";
import { authApi } from "../api/AuthService";

const Funcionarios: React.FC = () => {
  const navigate = useNavigate();
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<(Funcionario & { statusConta?: string }) | undefined>(undefined);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const { funcionarios, loading, cadastrarFuncionario, editarFuncionario, alterarSenhaFuncionario } = useFuncionarios();
  const [resumoTarefasPorFuncionario, setResumoTarefasPorFuncionario] = useState<
    Record<string, { total: number; atrasadas: number }>
  >({});

  const parseData = (valor?: string | null): Date | null => {
    if (!valor) return null;
    const data = new Date(valor);
    return isNaN(data.getTime()) ? null : data;
  };

  useEffect(() => {
    const carregarResumoTarefas = async () => {
      if (!funcionarios.length) {
        setResumoTarefasPorFuncionario({});
        return;
      }

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      try {
        const entradas = await Promise.all(
          funcionarios.map(async (funcionario) => {
            try {
              const primeiraPagina = await authApi.get(`/tarefa-etapa/listar-por-funcionario/${funcionario.id}`, {
                params: { page: 0, size: 100 },
              });

              const extrairLista = (payload: any) =>
                Array.isArray(payload) ? payload : Array.isArray(payload?.content) ? payload.content : [];

              const tarefasPrimeiraPagina = extrairLista(primeiraPagina.data);
              const totalPages = Number(primeiraPagina.data?.totalPages || 1);

              if (totalPages <= 1) {
                const atrasadas = tarefasPrimeiraPagina.filter((tarefa: any) => {
                  const status = tarefa?.status;
                  const dataVencimento = parseData(tarefa?.conclusaoPrazo);
                  const atrasadaPorPrazo =
                    !!dataVencimento &&
                    dataVencimento.getTime() < hoje.getTime() &&
                    status !== "Finalizada" &&
                    status !== "Cancelada";
                  return status === "Atrasada" || atrasadaPorPrazo;
                }).length;

                return [funcionario.id, { total: tarefasPrimeiraPagina.length, atrasadas }] as const;
              }

              const paginasRestantes = await Promise.all(
                Array.from({ length: totalPages - 1 }, (_, index) =>
                  authApi.get(`/tarefa-etapa/listar-por-funcionario/${funcionario.id}`, {
                    params: { page: index + 1, size: 100 },
                  })
                )
              );

              const outrasTarefas = paginasRestantes.flatMap((response) => extrairLista(response.data));
              const tarefas = [...tarefasPrimeiraPagina, ...outrasTarefas];

              const atrasadas = tarefas.filter((tarefa: any) => {
                const status = tarefa?.status;
                const dataVencimento = parseData(tarefa?.conclusaoPrazo);
                const atrasadaPorPrazo =
                  !!dataVencimento &&
                  dataVencimento.getTime() < hoje.getTime() &&
                  status !== "Finalizada" &&
                  status !== "Cancelada";
                return status === "Atrasada" || atrasadaPorPrazo;
              }).length;

              return [funcionario.id, { total: tarefas.length, atrasadas }] as const;
            } catch (error) {
              console.error(`Erro ao carregar tarefas do funcionario ${funcionario.id}:`, error);
              return [funcionario.id, { total: 0, atrasadas: 0 }] as const;
            }
          })
        );

        setResumoTarefasPorFuncionario(Object.fromEntries(entradas));
      } catch (error) {
        console.error("Erro ao montar resumo de tarefas por funcionario:", error);
      }
    };

    carregarResumoTarefas();
  }, [funcionarios]);

  const normalizarTexto = (valor?: string) =>
    (valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const termoNormalizado = normalizarTexto(termoPesquisa);

  const funcionariosFiltrados = useMemo(
    () =>
      funcionarios.filter(
        (funcionario) =>
          normalizarTexto(funcionario.nomeCompleto).includes(termoNormalizado) ||
          normalizarTexto(funcionario.emailCadastro).includes(termoNormalizado) ||
          normalizarTexto(funcionario.qualificacaoFuncionario).includes(termoNormalizado)
      ),
    [funcionarios, termoNormalizado]
  );

  const handleEditarFuncionario = (funcionario: Funcionario & { statusConta?: string }) => {
    setFuncionarioSelecionado(funcionario);
  };

  const LoadingCards = () => (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      {[1, 2, 3].map((item) => (
        <div key={item} className="w-full sm:w-4/5 bg-white rounded-lg shadow-md border border-default p-4 sm:p-6 animate-pulse">
          <div className="h-4 w-36 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="h-3 w-2/3 bg-gray-100 rounded mb-4" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );

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
            <LoadingCards />
          ) : funcionariosFiltrados.length === 0 ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">
                {termoPesquisa ? "Nenhum funcionario encontrado" : "Nenhum funcionario cadastrado"}
              </p>
            </div>
          ) : (
            funcionariosFiltrados.map((funcionario) => {
              const resumo = resumoTarefasPorFuncionario[funcionario.id] || { total: 0, atrasadas: 0 };

              return (
                <CardFuncionario
                  key={funcionario.id}
                  nome={funcionario.nomeCompleto}
                  email={funcionario.emailCadastro}
                  cargo={funcionario.qualificacaoFuncionario}
                  funcionario={funcionario}
                  tarefasCount={resumo.total}
                  tarefasAtrasadasCount={resumo.atrasadas}
                  onEditar={handleEditarFuncionario}
                  onVerTarefas={(funcionarioSelecionadoCard) =>
                    navigate("/", {
                      state: { filtroInicial: { funcionariosIds: [funcionarioSelecionadoCard.id] } },
                    })
                  }
                />
              );
            })
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
