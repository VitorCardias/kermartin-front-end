import React from "react";
import editaricon from "../assets/icon-editar.svg";
import deletaricon from "../assets/icon-deletar.svg";

type Etapa = {
  id: string;
  titulo: string;
  conclusaoPrazo?: string | null;
  porcentagemConclusao: number;
};

type CardEtapaProps = {
  etapa: Etapa;
  indice: number;
  isSelected: boolean;
  onClick: (etapaId: string) => void;
};

const CardEtapa: React.FC<CardEtapaProps> = ({ etapa, indice, isSelected, onClick }) => {
  return (
    <article
      onClick={() => onClick(etapa.id)}
      className={`border rounded-xl p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-blue border-2 shadow-md bg-blue/5"
          : etapa.porcentagemConclusao > 0
          ? "border-blue hover:border-blue/60"
          : "border-default hover:border-gray-400"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-main font-bold">
            {indice + 1}. {etapa.titulo}
          </h3>
          <p className="text-xs text-muted mt-1">
            Prazo:{" "}
            {etapa.conclusaoPrazo
              ? new Date(etapa.conclusaoPrazo).toLocaleDateString("pt-BR")
              : "Sem prazo"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row"> 
                <img src={editaricon} alt="Ícone de editar" className="w-4 h-4" />
                <img src={deletaricon} alt="Ícone de deletar" className="w-4 h-4 ml-2" />
            </div>
            <span className="text-xs text-muted font-semibold">{etapa.porcentagemConclusao}%</span>
        </div>
      </div>
      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue rounded-full"
          style={{ width: `${etapa.porcentagemConclusao}%` }}
        />
      </div>
    </article>
  );
};

export default CardEtapa;