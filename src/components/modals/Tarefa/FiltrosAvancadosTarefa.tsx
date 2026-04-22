import React, { useEffect, useRef, useState } from "react";
import { useClientesParaFiltro } from "../../../Hooks/useClientesParaFiltro";
import { useFuncionariosParaFiltro } from "../../../Hooks/useFuncionariosParaFiltro";
import { PrioridadeTarefa } from "../../../types/TiposTarefas";
import type { FiltrosTarefaAvancados } from "../../../Hooks/useTarefasListagem";

interface Option {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const newSelected = selectedValues.includes(id)
      ? selectedValues.filter((v) => v !== id)
      : [...selectedValues, id];

    onChange(newSelected);
  };

  return (
    <div className="relative w-full mt-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-left flex justify-between items-center text-main focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
      >
        <span className="truncate text-muted">
          {selectedValues.length === 0 ? placeholder : `${selectedValues.length} selecionado(s)`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Nenhuma opção encontrada</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.id)}
                  onChange={() => toggleOption(opt.id)}
                  className="w-4 h-4 mr-3 rounded border-gray-300 text-blue focus:ring-blue cursor-pointer"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface FiltrosAvancadosTarefaProps {
  filtrosAtivos: FiltrosTarefaAvancados;
  demandasOptions: Option[];
  onAtualizarFiltros: (filtros: Partial<FiltrosTarefaAvancados>) => void;
  onLimparFiltros: () => void;
  ocultarFiltroFuncionarios?: boolean;
}

const FiltrosAvancadosTarefa: React.FC<FiltrosAvancadosTarefaProps> = ({
  filtrosAtivos,
  demandasOptions,
  onAtualizarFiltros,
  onLimparFiltros,
  ocultarFiltroFuncionarios = false,
}) => {
  const { clientesParaFiltro } = useClientesParaFiltro();
  const { funcionariosParaFiltro } = useFuncionariosParaFiltro();

  const [busca, setBusca] = useState(filtrosAtivos.busca || "");
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState<string[]>(
    filtrosAtivos.prioridade || []
  );

  useEffect(() => {
    setBusca(filtrosAtivos.busca || "");
  }, [filtrosAtivos.busca]);

  useEffect(() => {
    setPrioridadeSelecionada(filtrosAtivos.prioridade || []);
  }, [filtrosAtivos.prioridade]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAtualizarFiltros({ busca: busca || undefined });
    }, 350);

    return () => clearTimeout(timeout);
  }, [busca, onAtualizarFiltros]);

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosAtivos.busca) count++;
    if (filtrosAtivos.demandasIds?.length) count += filtrosAtivos.demandasIds.length;
    if (filtrosAtivos.clientesIds?.length) count += filtrosAtivos.clientesIds.length;
    if (!ocultarFiltroFuncionarios && filtrosAtivos.funcionariosIds?.length) {
      count += filtrosAtivos.funcionariosIds.length;
    }
    if (filtrosAtivos.prioridade?.length) count += filtrosAtivos.prioridade.length;
    return count;
  };

  const atualizarDemandas = (selecionadas: string[]) => {
    onAtualizarFiltros({ demandasIds: selecionadas.length > 0 ? selecionadas : undefined });
  };

  const atualizarClientes = (selecionados: string[]) => {
    onAtualizarFiltros({ clientesIds: selecionados.length > 0 ? selecionados : undefined });
  };

  const atualizarFuncionarios = (selecionados: string[]) => {
    onAtualizarFiltros({ funcionariosIds: selecionados.length > 0 ? selecionados : undefined });
  };

  const togglePrioridade = (prioridade: string) => {
    const novaPrioridade = prioridadeSelecionada.includes(prioridade)
      ? prioridadeSelecionada.filter((p) => p !== prioridade)
      : [...prioridadeSelecionada, prioridade];

    setPrioridadeSelecionada(novaPrioridade);
    onAtualizarFiltros({ prioridade: novaPrioridade.length > 0 ? novaPrioridade : undefined });
  };

  const opcoesClientes = clientesParaFiltro?.map((c) => ({ id: String(c.id), label: c.nome })) || [];
  const opcoesFuncionarios =
    funcionariosParaFiltro?.map((f) => ({ id: String(f.id), label: f.nomeCompleto })) || [];

  return (
    <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex-1 min-w-0">
          <label className="text-muted font-semibold text-sm uppercase tracking-wide">Pesquisar tarefa</label>
          <input
            type="text"
            value={busca}
            placeholder="Digite o título, descrição, demanda ou cliente..."
            onChange={(e) => setBusca(e.target.value)}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${ocultarFiltroFuncionarios ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-4`}>
          <div className="min-w-0">
            <label className="text-muted font-semibold text-sm uppercase tracking-wide">Demandas</label>
            <MultiSelectDropdown
              options={demandasOptions}
              selectedValues={filtrosAtivos.demandasIds || []}
              onChange={atualizarDemandas}
              placeholder="Selecione as demandas"
            />
          </div>

          <div className="min-w-0">
            <label className="text-muted font-semibold text-sm uppercase tracking-wide">Clientes</label>
            <MultiSelectDropdown
              options={opcoesClientes}
              selectedValues={filtrosAtivos.clientesIds || []}
              onChange={atualizarClientes}
              placeholder="Selecione os clientes"
            />
          </div>

          {!ocultarFiltroFuncionarios && (
            <div className="min-w-0">
              <label className="text-muted font-semibold text-sm uppercase tracking-wide">Colaboradores</label>
              <MultiSelectDropdown
                options={opcoesFuncionarios}
                selectedValues={filtrosAtivos.funcionariosIds || []}
                onChange={atualizarFuncionarios}
                placeholder="Selecione os colaboradores"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <label className="w-full text-muted font-semibold text-sm uppercase tracking-wide">Prioridade</label>
            {PrioridadeTarefa.map((prioridade) => (
              <label key={prioridade} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prioridadeSelecionada.includes(prioridade)}
                  onChange={() => togglePrioridade(prioridade)}
                  className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue cursor-pointer"
                />
                {prioridade}
              </label>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-end">
          {contarFiltrosAtivos() > 0 && (
            <button
              type="button"
              onClick={onLimparFiltros}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer sm:w-auto"
            >
              Limpar filtros ({contarFiltrosAtivos()})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltrosAvancadosTarefa;
