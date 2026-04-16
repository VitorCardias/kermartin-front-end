import { useState, useMemo } from "react";
import { type TarefaAPI } from "./useTarefa";

export const useCardTarefa = (dataVencimento: string | null | undefined, responsaveis: string[], tarefa?: TarefaAPI) => {
  const [expandido, setExpandido] = useState(false);
  const [checked, setChecked] = useState(false);
  const [animatingCheck, setAnimatingCheck] = useState(false);

  // Parse de data igual ao CardDemanda
  const parseData = (valor?: string | null): Date | null => {
    if (!valor) return null;

    try {
      if (valor.includes('T')) {
        const iso = new Date(valor);
        return isNaN(iso.getTime()) ? null : iso;
      }

      const normalizada = valor.trim();
      const [dataParte, horaParte] = normalizada.split(' ');
      if (!dataParte) return null;

      if (dataParte.includes('-')) {
        const partes = dataParte.split('-');
        if (partes.length === 3) {
          if (partes[0].length === 4) {
            const [ano, mes, dia] = partes;
            const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
            const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
            return isNaN(dt.getTime()) ? null : dt;
          }
          const [dia, mes, ano] = partes;
          const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
          const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
          return isNaN(dt.getTime()) ? null : dt;
        }
      }

      if (dataParte.includes('/')) {
        const [dia, mes, ano] = dataParte.split('/');
        const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
        const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
        return isNaN(dt.getTime()) ? null : dt;
      }

      const fallback = new Date(normalizada);
      return isNaN(fallback.getTime()) ? null : fallback;
    } catch (error) {
      console.error('Erro ao fazer parse da data:', valor, error);
      return null;
    }
  };

  // Calcular dias até vencimento
  const calcularDiasVencimento = (data: string | null | undefined): number => {
    try {
      const dataVencimento = parseData(data);
      if (!dataVencimento) return 0;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataVencimento.setHours(0, 0, 0, 0);

      const diffTime = dataVencimento.getTime() - hoje.getTime();
      const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDias;
    } catch (error) {
      console.error('Erro ao calcular dias de vencimento:', error);
      return 0;
    }
  };

  const diasVencimento = useMemo(() => calcularDiasVencimento(dataVencimento), [dataVencimento]);

  // Formatador de data para exibição
  const formatarDataExibicao = (data: string | null | undefined): string => {
    if (!data) return "Sem data";

    try {
      const dataObj = parseData(data);
      if (!dataObj) {
        console.warn('Não foi possível fazer parse da data:', data);
        return "Sem data";
      }

      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();

      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', data, error);
      return "Sem data";
    }
  };

  // Determinar status baseado no status da tarefa ou dias de vencimento
  const obterStatus = (): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
    if (checked) return 'finalizado';
    
    // Se a tarefa tiver status, usar ele
    if (tarefa?.status) {
      const statusBruto = tarefa.status.toLowerCase();
      if (statusBruto.includes('finalizada') || statusBruto.includes('finalizada')) return 'finalizado';
      if (statusBruto.includes('atrasada') || statusBruto.includes('atrasada')) return 'atrasada';
      if (statusBruto.includes('andamento')) return 'andamento';
      if (statusBruto.includes('aguardando')) return 'aguardando';
    }

    // Caso contrário, calcular pelo vencimento
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
      return { texto: 'Hoje', cor: '#F59E0B' };
    }
    if (diasVencimento === 1) {
      return { texto: 'Amanhã', cor: '#F59E0B' };
    }
    if (diasVencimento <= 3) {
      return { texto: `${diasVencimento} dias`, cor: '#F59E0B' };
    }
    return { texto: `${diasVencimento} dias`, cor: '#64748b' };
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
    formatarDataExibicao,
  };
};