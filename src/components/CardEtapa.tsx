import React, { useState } from "react";
import editaricon from "../assets/icon-editar.svg";
import deletaricon from "../assets/icon-deletar.svg";
import EditarEtapa from "./modals/Etapa/EditarEtapa";
import AlertModal from "./modals/AlertModal";
import { useEtapas } from "../Hooks/useEtapas";

type Etapa = {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade?: string;
  status?: string;
  conclusaoPrazo?: string | null;
  porcentagemConclusao: number;
  inicioPrazo?: string | null;
  criador?: { id: string };
};

type CardEtapaProps = {
  etapa: Etapa;
  indice: number;
  isSelected: boolean;
  onClick: (etapaId: string, isMultiple: boolean) => void;
  idDemanda: string;
  onEtapaAtualizada?: () => void;
};

const CardEtapa: React.FC<CardEtapaProps> = ({ 
  etapa, 
  indice, 
  isSelected, 
  onClick, 
  idDemanda,
  onEtapaAtualizada 
}) => {
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [alertDelete, setAlertDelete] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: "aviso" | "erro" | "sucesso";
  }>({ isOpen: false, titulo: "", mensagem: "", tipo: "aviso" });

  const { deletarEtapaDemanda, buscarEtapas } = useEtapas(idDemanda);

  const handleCardClick = (e: React.MouseEvent) => {
    // Se clicou em um botão ou área sensível, não seleciona
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    
    onClick(etapa.id, true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalEditarAberto(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAlertDelete({
      isOpen: true,
      titulo: "Confirmar Exclusão",
      mensagem: `Tem certeza que deseja deletar a etapa "${etapa.titulo}"? Esta ação não pode ser desfeita.`,
      tipo: "aviso",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const sucesso = await deletarEtapaDemanda(etapa.id);
      if (sucesso) {
        setAlertDelete({
          isOpen: true,
          titulo: "Sucesso",
          mensagem: "Etapa deletada com sucesso!",
          tipo: "sucesso",
        });
        await buscarEtapas();
        onEtapaAtualizada?.();
      } else {
        setAlertDelete({
          isOpen: true,
          titulo: "Erro",
          mensagem: "Erro ao deletar a etapa. Tente novamente.",
          tipo: "erro",
        });
      }
    } catch (error: any) {
      console.error("Erro ao deletar etapa:", error);
      setAlertDelete({
        isOpen: true,
        titulo: "Erro ao Deletar",
        mensagem: error?.response?.data?.message || "Erro ao deletar etapa. Tente novamente.",
        tipo: "erro",
      });
    }
  };

  const formatarData = (data: string | null | undefined): string => {
    if (!data) return "Sem prazo";
    
    try {
      // Trata diferentes formatos de data
      const date = new Date(data);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return "Sem prazo";
      }
      
      // Formata para dd/mm/yyyy
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Sem prazo";
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
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
                ? formatarData(etapa.conclusaoPrazo)
                : "Sem prazo"}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row gap-2">
              <button
                onClick={handleEditClick}
                className="hover:opacity-70 transition"
                title="Editar etapa"
              >
                <img src={editaricon} alt="Ícone de editar" className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="hover:opacity-70 transition"
                title="Deletar etapa"
              >
                <img src={deletaricon} alt="Ícone de deletar" className="w-4 h-4" />
              </button>
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

      <EditarEtapa
        isOpen={modalEditarAberto}
        etapa={etapa as any}
        idDemanda={idDemanda}
        onClose={() => setModalEditarAberto(false)}
        onSuccess={onEtapaAtualizada}
      />

      <AlertModal
        isOpen={alertDelete.isOpen && alertDelete.tipo !== "sucesso"}
        titulo={alertDelete.titulo}
        mensagem={alertDelete.mensagem}
        tipo={alertDelete.tipo}
        botaoConfirmar={alertDelete.tipo === "aviso" ? "Deletar" : "Ok"}
        mostrarBotaoCancelar={alertDelete.tipo === "aviso"}
        onCancel={() => setAlertDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (alertDelete.tipo === "aviso") {
            handleConfirmDelete();
          } else {
            setAlertDelete((prev) => ({ ...prev, isOpen: false }));
          }
        }}
      />

      {alertDelete.tipo === "sucesso" && alertDelete.isOpen && (
        <AlertModal
          isOpen={true}
          titulo={alertDelete.titulo}
          mensagem={alertDelete.mensagem}
          tipo="sucesso"
          onConfirm={() => setAlertDelete((prev) => ({ ...prev, isOpen: false }))}
          mostrarBotaoCancelar={false}
        />
      )}
    </>
  );
};

export default CardEtapa;