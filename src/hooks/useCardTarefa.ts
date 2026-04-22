import { useState, useMemo, useEffect, useRef } from "react";
import { type TarefaAPI } from "./useTarefa";

export const useCardTarefa = (
  dataVencimento: string | null | undefined,
  _responsaveis: string[],
  tarefa?: TarefaAPI,
  onStatusChange?: (novoStatus: string) => Promise<void>,
  quantidadeMembrosEquipe: number = 0
) => {
  const [expandido, setExpandido] = useState(false);
  const [checked, setChecked] = useState(false);
  const [animatingCheck, setAnimatingCheck] = useState(false);
  const statusAntesDeFinalizar = useRef("RequerindoEquipe");

  const parseData = (valor?: string | null): Date | null => {
    if (!valor) return null;
    if (valor === "Sem data") return null;
    if (valor.includes("NaN")) return null;

    try {
      if (valor.includes("T")) {
        const iso = new Date(valor);
        return isNaN(iso.getTime()) ? null : iso;
      }

      const normalizada = valor.trim();
      const [dataParte, horaParte] = normalizada.split(" ");
      if (!dataParte) return null;

      if (dataParte.includes("-")) {
        const partes = dataParte.split("-");
        if (partes.length === 3) {
          if (partes[0].length === 4) {
            const [ano, mes, dia] = partes;
            const [hora = "00", minuto = "00", segundo = "00"] = (horaParte || "").split(":");
            const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
            return isNaN(dt.getTime()) ? null : dt;
          }
          const [dia, mes, ano] = partes;
          const [hora = "00", minuto = "00", segundo = "00"] = (horaParte || "").split(":");
          const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
          return isNaN(dt.getTime()) ? null : dt;
        }
      }

      if (dataParte.includes("/")) {
        const [dia, mes, ano] = dataParte.split("/");
        const [hora = "00", minuto = "00", segundo = "00"] = (horaParte || "").split(":");
        const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
        return isNaN(dt.getTime()) ? null : dt;
      }

      const fallback = new Date(normalizada);
      return isNaN(fallback.getTime()) ? null : fallback;
    } catch {
      return null;
    }
  };

  const calcularDiasVencimento = (data: string | null | undefined): number => {
    try {
      const dataVencimentoDate = parseData(data);
      if (!dataVencimentoDate) return 0;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataVencimentoDate.setHours(0, 0, 0, 0);

      const diffTime = dataVencimentoDate.getTime() - hoje.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const diasVencimento = useMemo(() => calcularDiasVencimento(dataVencimento), [dataVencimento]);

  const formatarDataExibicao = (data: string | null | undefined): string => {
    if (!data) return "Sem data";

    try {
      const dataObj = parseData(data);
      if (!dataObj) return "Sem data";

      const dia = String(dataObj.getDate()).padStart(2, "0");
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const ano = dataObj.getFullYear();

      return `${dia}/${mes}/${ano}`;
    } catch {
      return "Sem data";
    }
  };

  const statusEhFinalizado = (status?: string | null): boolean => {
    if (!status) return false;
    const statusNormalizado = status.toLowerCase();
    return statusNormalizado.includes("finalizada") || statusNormalizado.includes("finalizado");
  };

  useEffect(() => {
    const statusAtual = tarefa?.status || "";
    const estaFinalizada = statusEhFinalizado(statusAtual);

    setChecked(estaFinalizada);

    if (!estaFinalizada && statusAtual) {
      statusAntesDeFinalizar.current = statusAtual;
    }
  }, [tarefa?.id, tarefa?.status]);

  const obterStatus = (): "aguardando" | "andamento" | "finalizado" | "atrasada" => {
    if (checked) return "finalizado";

    if (tarefa?.status) {
      const statusBruto = tarefa.status.toLowerCase();
      if (statusBruto.includes("finalizada") || statusBruto.includes("finalizado")) return "finalizado";
      if (statusBruto.includes("atrasada") || statusBruto.includes("atrasado")) return "atrasada";
      if (statusBruto.includes("andamento")) return "andamento";
      if (statusBruto.includes("aguardando")) return "aguardando";
      if (statusBruto.includes("requerindo")) return "aguardando";
    }

    return "aguardando";
  };

  const obterTextoVencimento = (): { texto: string; cor: string } => {
    const status = obterStatus();
    if (status === "finalizado") return { texto: "Finalizada", cor: "#4CAF50" };
    if (diasVencimento < 0) return { texto: "Vencido", cor: "#EF4444" };
    if (diasVencimento === 0) return { texto: "Hoje", cor: "#F59E0B" };
    if (diasVencimento === 1) return { texto: "Amanha", cor: "#F59E0B" };
    if (diasVencimento <= 3) return { texto: `${diasVencimento} dias`, cor: "#F59E0B" };
    return { texto: `${diasVencimento} dias`, cor: "#64748b" };
  };

  const vencimentoInfo = useMemo(() => obterTextoVencimento(), [diasVencimento]);

  const toggleExpandir = () => {
    setExpandido(!expandido);
  };

  const toggleChecked = (valor: boolean) => {
    setAnimatingCheck(true);
    setChecked(valor);
    setTimeout(() => {
      setAnimatingCheck(false);
    }, 600);
  };

  const resolverStatusAoDesfinalizar = (): string => {
    const dataLimite = parseData(dataVencimento);
    const agora = new Date();

    if (dataLimite && dataLimite.getTime() < agora.getTime()) {
      return "Atrasada";
    }

    if (quantidadeMembrosEquipe > 0) {
      return "EmAndamento";
    }

    return "RequerindoEquipe";
  };

  const toggleFinalizada = async () => {
    const novoChecked = !checked;
    const statusAtual = tarefa?.status;

    if (!novoChecked && statusAtual && !statusEhFinalizado(statusAtual)) {
      statusAntesDeFinalizar.current = statusAtual;
    }

    const novoStatus = novoChecked
      ? "Finalizada"
      : resolverStatusAoDesfinalizar() || statusAntesDeFinalizar.current || "RequerindoEquipe";

    toggleChecked(novoChecked);

    if (!onStatusChange) return;

    try {
      await onStatusChange(novoStatus);
    } catch (error) {
      setChecked(!novoChecked);
      throw error;
    }
  };

  return {
    expandido,
    checked,
    animatingCheck,
    textoVencimento: vencimentoInfo.texto,
    corVencimento: vencimentoInfo.cor,
    obterStatus,
    toggleExpandir,
    toggleChecked,
    toggleFinalizada,
    formatarDataExibicao,
  };
};
