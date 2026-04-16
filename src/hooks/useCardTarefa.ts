import { useState, useMemo } from "react";

export const useCardTarefa = (dataVencimento: string, responsaveis: string[]) => {
  const [expandido, setExpandido] = useState(false);
  const [checked, setChecked] = useState(false);
  const [animatingCheck, setAnimatingCheck] = useState(false);

  // Calcular dias até vencimento
  const calcularDiasVencimento = (data: string): number => {
    try {
      const [dia, mes, ano] = data.split('/').map(Number);
      const dataVencimento = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const diffTime = dataVencimento.getTime() - hoje.getTime();
      const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDias;
    } catch {
      return 0;
    }
  };

  const diasVencimento = useMemo(() => calcularDiasVencimento(dataVencimento), [dataVencimento]);

  // Determinar status baseado nos dias
  const obterStatus = (): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
    if (checked) return 'finalizado';
    if (diasVencimento < 0) return 'atrasada';
    if (diasVencimento <= 3) return 'andamento';
    return 'aguardando';
  };

  // Determinar cor e texto de vencimento
  const obterTextoVencimento = (): { texto: string; cor: string } => {
    if (diasVencimento < 0) {
      return { texto: `${Math.abs(diasVencimento)} dias atrasado`, cor: '#EF4444' };
    }
    if (diasVencimento === 0) {
      return { texto: 'Vence hoje', cor: '#F59E0B' };
    }
    if (diasVencimento === 1) {
      return { texto: 'Vence amanhã', cor: '#F59E0B' };
    }
    if (diasVencimento <= 3) {
      return { texto: `${diasVencimento} dias`, cor: '#F59E0B' };
    }
    return { texto: `${diasVencimento} dias`, cor: '#10B981' };
  };

  const vencimentoInfo = useMemo(() => obterTextoVencimento(), [diasVencimento]);

  const toggleExpandir = () => {
    setExpandido(!expandido);
  };

  const toggleChecked = () => {
    setAnimatingCheck(true);
    setChecked(!checked);
    setTimeout(() => {
      setAnimatingCheck(false);
    }, 600);
  };

  const toggleFinalizada = () => {
    // Lógica para marcar como finalizada no backend, se necessário
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
  };
};