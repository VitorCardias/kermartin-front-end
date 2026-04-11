import React from "react";
import { type FiltrosDemanda } from "../../types/Filtros";

interface FiltrosDemandaProps {
  filtros: FiltrosDemanda;
  contagemFiltrosAtivos: number;
  atualizarFiltro: (chave: keyof FiltrosDemanda, valor: any) => void;
  limparFiltro: (chave: keyof FiltrosDemanda) => void;
  limparTodosFiltros: () => void;
  clientes: Array<{ id: string; nome: string }>;
  funcionarios: Array<{ id: string; nome: string }>;
  statuses: string[];
  prioridades: string[];
}

const FiltrosDemandas: React.FC<FiltrosDemandaProps> = ({
  filtros,
  contagemFiltrosAtivos,
  atualizarFiltro,
  limparFiltro,
  limparTodosFiltros,
  clientes,
  funcionarios,
  statuses,
  prioridades,
}) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filtros</h2>
        {contagemFiltrosAtivos > 0 && (
          <button
            onClick={limparTodosFiltros}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Limpar Todos ({contagemFiltrosAtivos})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Busca */}
        <div>
          <label className="block text-sm font-medium mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Título ou descrição..."
            value={filtros.busca || ""}
            onChange={(e) => atualizarFiltro("busca", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            value={filtros.clienteId || ""}
            onChange={(e) => atualizarFiltro("clienteId", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Todos os clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
          {filtros.clienteId && (
            <button
              onClick={() => limparFiltro("clienteId")}
              className="text-xs text-blue-500 mt-1 hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {/* Funcionário */}
        <div>
          <label className="block text-sm font-medium mb-1">Funcionário</label>
          <select
            value={filtros.funcionarioId || ""}
            onChange={(e) => atualizarFiltro("funcionarioId", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Todos os funcionários</option>
            {funcionarios.map((func) => (
              <option key={func.id} value={func.id}>
                {func.nome}
              </option>
            ))}
          </select>
          {filtros.funcionarioId && (
            <button
              onClick={() => limparFiltro("funcionarioId")}
              className="text-xs text-blue-500 mt-1 hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filtros.status || ""}
            onChange={(e) => atualizarFiltro("status", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Todos os status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium mb-1">Prioridade</label>
          <select
            value={filtros.prioridade || ""}
            onChange={(e) => atualizarFiltro("prioridade", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Todas as prioridades</option>
            {prioridades.map((prior) => (
              <option key={prior} value={prior}>
                {prior}
              </option>
            ))}
          </select>
        </div>

        {/* Data Range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">De</label>
            <input
              type="date"
              value={filtros.dataInicio || ""}
              onChange={(e) => atualizarFiltro("dataInicio", e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Até</label>
            <input
              type="date"
              value={filtros.dataFim || ""}
              onChange={(e) => atualizarFiltro("dataFim", e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosDemandas;