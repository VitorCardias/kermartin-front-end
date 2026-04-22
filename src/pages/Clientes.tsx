import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../components/Titulo";
import CardCliente from "../components/CardCliente";
import CadastroCliente from "../components/modals/Cliente/CadastroCliente";
import EditarCliente from "../components/modals/Cliente/EditarCliente";
import { useClientes } from "../Hooks/useClientes";
import type { Cliente } from "../Hooks/useClientes";
import { authApi } from "../api/AuthService";
import { TipoCliente } from "../types/TiposClientes";

const parseData = (valor?: string | null): Date | null => {
  if (!valor) return null;
  const dt = new Date(valor);
  if (!isNaN(dt.getTime())) return dt;

  const [dataParte, horaParte] = String(valor).split(" ");
  if (dataParte?.includes("-")) {
    const partes = dataParte.split("-");
    if (partes.length === 3) {
      let dia = "01";
      let mes = "01";
      let ano = "1970";

      if (partes[0].length === 4) {
        [ano, mes, dia] = partes;
      } else {
        [dia, mes, ano] = partes;
      }

      const [h = "00", m = "00", s = "00"] = (horaParte || "").split(":");
      const local = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(h), Number(m), Number(s));
      return isNaN(local.getTime()) ? null : local;
    }
  }

  return null;
};

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { criarCliente, clientes, editarCliente, loading } = useClientes();
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [tiposClienteSelecionados, setTiposClienteSelecionados] = useState<Array<"PF" | "PJ">>([]);
  const [resumoDemandasPorCliente, setResumoDemandasPorCliente] = useState<
    Record<string, { total: number; atrasadas: number }>
  >({});

  const mapearTipoClienteSigla = (tipo?: string | null): "PF" | "PJ" | undefined => {
    const tipoNormalizado = String(tipo || "").toLowerCase();
    if (tipoNormalizado === TipoCliente.PessoaFisica || tipoNormalizado.includes("fisica")) return "PF";
    if (tipoNormalizado === TipoCliente.PessoaJuridica || tipoNormalizado.includes("juridica")) return "PJ";
    return undefined;
  };

  const toggleTipoCliente = (tipo: "PF" | "PJ") => {
    setTiposClienteSelecionados((prev) =>
      prev.includes(tipo) ? prev.filter((valor) => valor !== tipo) : [...prev, tipo]
    );
  };

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const response = await authApi.get("/demanda");
        const demandas = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const resumo: Record<string, { total: number; atrasadas: number }> = {};

        demandas.forEach((demanda: any) => {
          const clienteId = demanda?.clienteDto?.id;
          if (!clienteId) return;

          if (!resumo[clienteId]) resumo[clienteId] = { total: 0, atrasadas: 0 };
          resumo[clienteId].total += 1;

          const status = demanda?.statusDemanda;
          const dataVencimento = parseData(demanda?.conclusaoPrazo);
          const atrasadaPorPrazo =
            !!dataVencimento &&
            dataVencimento.getTime() < hoje.getTime() &&
            status !== "Finalizada" &&
            status !== "Cancelada";

          if (status === "Atrasada" || atrasadaPorPrazo) {
            resumo[clienteId].atrasadas += 1;
          }
        });

        setResumoDemandasPorCliente(resumo);
      } catch (error) {
        console.error("Erro ao carregar resumo de demandas por cliente:", error);
      }
    };

    carregarResumo();
  }, [clientes.length]);

  const clientesFiltrados = useMemo(
    () =>
      clientes.filter(
        (cliente) => {
          const correspondePesquisa =
            cliente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            cliente.emailContato.toLowerCase().includes(termoPesquisa.toLowerCase());

          if (!correspondePesquisa) return false;
          if (tiposClienteSelecionados.length === 0) return true;

          const siglaTipoCliente = mapearTipoClienteSigla(cliente.tipoCliente);
          return !!siglaTipoCliente && tiposClienteSelecionados.includes(siglaTipoCliente);
        }
      ),
    [clientes, termoPesquisa, tiposClienteSelecionados]
  );

  const LoadingCards = () => (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full sm:w-4/5 bg-white rounded-lg shadow-md border-l-6 border-l-gray-200 p-4 sm:p-6 animate-pulse"
        >
          <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="h-3 w-2/3 bg-gray-100 rounded mb-3" />
          <div className="h-8 w-28 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
          <div className="flex flex-col gap-1">
            <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Clientes</Titulo>
            <p className="text-muted text-xs sm:text-sm">Total de {clientes.length} clientes cadastrados</p>
          </div>
          <button
            className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
          >
            Cadastrar Cliente
          </button>
        </div>
        <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-2 min-w-0">
              <label className="text-muted font-semibold text-sm uppercase tracking-wide">Pesquisar cliente</label>
              <input
                type="text"
                value={termoPesquisa}
                placeholder="Digite o nome ou email do cliente..."
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-muted font-semibold text-sm uppercase tracking-wide">Tipo de cliente</label>
              <div className="flex flex-row gap-4">
                {(["PF", "PJ"] as const).map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tiposClienteSelecionados.includes(tipo)}
                      onChange={() => toggleTipoCliente(tipo)}
                      className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue cursor-pointer"
                    />
                    {tipo}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
          {loading ? (
            <LoadingCards />
          ) : clientesFiltrados.length === 0 ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">
                {termoPesquisa ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
              </p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => {
              const resumo = resumoDemandasPorCliente[cliente.id] || { total: 0, atrasadas: 0 };

              return (
                <CardCliente
                  key={cliente.id}
                  nome={cliente.nome}
                  email={cliente.emailContato}
                  tipo={cliente.tipoCliente}
                  demandasCount={resumo.total}
                  demandasAtrasadasCount={resumo.atrasadas}
                  onEditar={() => setClienteEditando(cliente)}
                  onVerDemandas={() =>
                    navigate("/demanda", {
                      state: { filtroInicial: { clientesIds: [cliente.id] } },
                    })
                  }
                />
              );
            })
          )}
        </div>
      </div>
      {modalOpen && (
        <CadastroCliente
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCadastro={async (novoCliente) => {
            await criarCliente(novoCliente);
          }}
        />
      )}
      {clienteEditando && (
        <EditarCliente
          isOpen={!!clienteEditando}
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onEditar={async (clienteAtualizado) => {
            await editarCliente(clienteAtualizado);
          }}
        />
      )}
    </>
  );
};

export default Clientes;
