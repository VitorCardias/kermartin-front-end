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
    <div className={`w-full sm:w-4/5 bg-white rounded-lg shadow-md py-3 ${className}`}>
      {/* O container interno agora gerencia o scroll e os espaçamentos horizontais.
        O uso de 'no-scrollbar' requer uma pequena adição no seu CSS global.
      */}
      <div className="flex flex-nowrap overflow-x-auto items-center gap-4 text-muted px-4 sm:px-6 just justify-between no-scrollbar">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`shrink-0 px-1 py-1.5 text-sm font-medium border-b-2 transition cursor-pointer ${
            !valorAtivo
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 hover:text-blue-600 border-transparent hover:border-blue-600"
          }`}
        >
          {labelTodos}
        </button>

        {opcoes.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            className={`shrink-0 px-1 py-1.5 text-sm font-medium border-b-2 transition cursor-pointer ${
              valorAtivo === status.value
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 hover:text-blue-600 border-transparent hover:border-blue-600"
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