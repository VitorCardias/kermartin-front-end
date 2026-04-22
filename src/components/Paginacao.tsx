import React from 'react';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  loading: boolean;
  onAnterior: () => void;
  onProxima: () => void;
  onIrPara?: (pagina: number) => void;
}

const Paginacao: React.FC<PaginacaoProps> = ({
  paginaAtual,
  totalPaginas,
  loading,
  onAnterior,
  onProxima,
  onIrPara,
}) => {
  if (totalPaginas <= 1) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value, 10);
    if (onIrPara && valor > 0 && valor <= totalPaginas) {
      onIrPara(valor - 1);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 p-3 sm:p-4">
      <button
        onClick={onAnterior}
        disabled={paginaAtual === 0 || loading}
        className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition"
      >
        ← Anterior
      </button>

      <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
        <input
          type="number"
          min="1"
          max={totalPaginas}
          value={paginaAtual + 1}
          onChange={handleInputChange}
          disabled={loading}
          className="w-16 px-2 sm:px-3 py-2 border border-gray-300 rounded text-center font-semibold text-sm sm:text-base"
        />
        <span className="text-gray-600 text-sm sm:text-base">de {totalPaginas}</span>
      </div>

      <button
        onClick={onProxima}
        disabled={paginaAtual === totalPaginas - 1 || loading}
        className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition"
      >
        Próxima →
      </button>
    </div>
  );
};

export default Paginacao;
