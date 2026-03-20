import { useState } from 'react';

export const useTarefa = (dataVencimento: string, responsaveisIniciais: string[] = []) => {
    const [expandido, setExpandido] = useState(false);
    const [checked, setChecked] = useState(false);
    const [animatingCheck, setAnimatingCheck] = useState(false);
    const [responsaveis, setResponsaveis] = useState<string[]>(responsaveisIniciais);
    const [tarefaFinalizada, setTarefaFinalizada] = useState(false);

    const extrairData = (data: string) => {
        if (!data) return null;

        const apenasData = data.split(' ')[0];
        const partes = apenasData.split('-');   

        if (partes.length !== 3) return null;

        let dia, mes, ano;

        if (partes[0].length === 4) {
            // Formato ISO (YYYY-MM-DD)
            [ano, mes, dia] = partes;
        } else {
            // Formato BR (DD/MM/YYYY)
            [dia, mes, ano] = partes;
        }
        
        return { dia, mes, ano };
    }

    const formatarDataExibicao = (data: string) => {
        const dataExtraida = extrairData(data);
        if (!dataExtraida) return data;

        const { dia, mes, ano } = dataExtraida;
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    }

    // Função para calcular dias até vencer
    const calcularDiasAteVencer = (data: string) => {
        const dataExtraida = extrairData(data);
        if (!dataExtraida) return 0;

        const { dia, mes, ano } = dataExtraida;

        const dataVencimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
        const hoje = new Date();

        // Zerando horas para comparar só as datas
        hoje.setHours(0, 0, 0, 0);
        dataVencimento.setHours(0, 0, 0, 0);
        
        // calcula a diferença em milissegundos das duas datas
        const diferenca = dataVencimento.getTime() - hoje.getTime();
        // converte a diferença em dias
        const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

        return dias;
    };

    // Função para gerar o texto de vencimento
    const gerarTextoVencimento = (data: string) => {
        const dias = calcularDiasAteVencer(data);

        if (tarefaFinalizada) {
            return "Finalizada";
        }

        if (dias === 0) {
            return "Hoje";
        } else if (dias === 1) {
            return "Amanhã";
        } else if (dias > 1) {
            return `${dias} dias`;
        } else {
            return "Vencido";
        }
    };

    // Função para determinar a cor baseada nos dias faltando
    const obterCorVencimento = (data: string) => {
        const dias = calcularDiasAteVencer(data);

        if (tarefaFinalizada) {
            return "#16A34A"; // Verde - Finalizada
        }

        if (dias <= -1) {
            return "#B91C1C"; // Vermelho - Vencido
        } else if (dias <= 2 && dias >= 0) {
            return "#B45309"; // Amarelo/Laranja - Atenção
        } else {
            return ""; // Cor padrão (text-muted)
        }
    };

    // Função para determinar o status baseado em responsáveis e finalização
// Função para determinar o status baseado na hierarquia de regras
    const obterStatus = (): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
        // 1. O check de finalizado tem prioridade máxima
        if (tarefaFinalizada) {
            return 'finalizado';
        }

        // 2. Se não está finalizada, verificamos se está vencida
        const diasRestantes = calcularDiasAteVencer(dataVencimento);
        if (diasRestantes < 0) {
            return 'atrasada';
        }

        // 3. Se está no prazo, verificamos se há responsáveis alocados
        if (responsaveis.length === 0) {
            return 'aguardando';
        }

        // 4. Se não está finalizada, não está atrasada e tem responsável:
        return 'andamento';
    };

    // Função para obter o texto de responsáveis
    const obterTextoResponsaveis = (): string => {
        if (responsaveis.length === 0) {
            return 'Sem Atribuições';
        }
        return responsaveis.join(', ');
    };

    const toggleExpandir = () => {
        setExpandido(!expandido);
    };

    const toggleChecked = () => {
        setChecked(!checked);
        setAnimatingCheck(true);
        setTimeout(() => setAnimatingCheck(false), 400);
    };

    const toggleFinalizada = () => {
        setTarefaFinalizada(!tarefaFinalizada);
    };

    const toggleTemEquipe = (novoResponsavel: string) => {
        setResponsaveis((prev) => {
            if (prev.includes(novoResponsavel)) {
                return prev.filter((r) => r !== novoResponsavel);
            } else {
                return [...prev, novoResponsavel];
            }
        });
    };

    const adicionarResponsavel = (novoResponsavel: string) => {
        setResponsaveis((prev) => {
            if (!prev.includes(novoResponsavel) && novoResponsavel.trim() !== '') {
                return [...prev, novoResponsavel];
            }
            return prev;
        });
    };

    const removerResponsavel = (responsavel: string) => {
        setResponsaveis((prev) => prev.filter((r) => r !== responsavel));
    };

    const temEquipe = responsaveis.length > 0;
    const textoVencimento = gerarTextoVencimento(dataVencimento);
    const corVencimento = obterCorVencimento(dataVencimento);
    const textoResponsaveis = obterTextoResponsaveis();

    return {
        expandido,
        checked,
        animatingCheck,
        textoVencimento,
        corVencimento,
        tarefaFinalizada,
        responsaveis,
        temEquipe,
        textoResponsaveis,
        formatarDataExibicao,
        obterStatus,
        toggleExpandir,
        toggleChecked,
        toggleFinalizada,
        toggleTemEquipe,
        adicionarResponsavel,
        removerResponsavel,
    };
};