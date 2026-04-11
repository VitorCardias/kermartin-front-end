import React from "react";

export type StatusFiltroOpcao = {
  label: string;
  value: string;
};

interface StatusFiltroProps {
  opcoes: StatusFiltroOpcao[];
  valorAtivo?: string;
  onChange: (value?: string) => void;
  labelTodos?: string;
  className?: string;
}

const StatusFiltro: React.FC<StatusFiltroProps> = ({
  opcoes,
  valorAtivo,
  onChange,
  labelTodos = "Todas",
  className = "",
}) => {
  return (
    <div className={`w-full sm:w-4/5 bg-white rounded-lg shadow-md px-4 sm:px-6 py-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between text-muted">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`px-3 py-1.5 text-xs sm:text-sm border-b-2 transition cursor-pointer ${
            !valorAtivo
              ? "text-blue border-blue"
              : "hover:text-blue border-transparent hover:border-blue"
          }`}
        >
          {labelTodos}
        </button>

        {opcoes.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            className={`px-3 py-1.5 text-xs sm:text-sm border-b-2 transition cursor-pointer ${
              valorAtivo === status.value
                ? "text-blue border-blue"
                : "hover:text-blue border-transparent hover:border-blue"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFiltro;
