import { useState } from 'react';

export const useTarefa = (dataVencimento: string, responsaveisIniciais: string[] = []) => {
    const [expandido, setExpandido] = useState(false);
    const [checked, setChecked] = useState(false);
    const [animatingCheck, setAnimatingCheck] = useState(false);
    const [responsaveis, setResponsaveis] = useState<string[]>(responsaveisIniciais);
    const [tarefaFinalizada, setTarefaFinalizada] = useState(false);

    const parseData = (data: string): Date | null => {
        if (!data) return null;

        const normalizada = data.trim();
        if (!normalizada) return null;

        if (normalizada.includes('T')) {
            const iso = new Date(normalizada);
            return isNaN(iso.getTime()) ? null : iso;
        }

        const [dataParte, horaParte] = normalizada.split(' ');
        if (!dataParte) return null;

        const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');

        if (dataParte.includes('-')) {
            const partes = dataParte.split('-');
            if (partes.length === 3) {
                if (partes[0].length === 4) {
                    const [ano, mes, dia] = partes;
                    const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
                    return isNaN(dt.getTime()) ? null : dt;
                }

                const [dia, mes, ano] = partes;
                const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
                return isNaN(dt.getTime()) ? null : dt;
            }
        }

        if (dataParte.includes('/')) {
            const [dia, mes, ano] = dataParte.split('/');
            const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
            return isNaN(dt.getTime()) ? null : dt;
        }

        const fallback = new Date(normalizada);
        return isNaN(fallback.getTime()) ? null : fallback;
    };

    const formatarDataExibicao = (data: string) => {
        const dt = parseData(data);
        if (!dt) return data;

        const dia = String(dt.getDate()).padStart(2, '0');
        const mes = String(dt.getMonth() + 1).padStart(2, '0');
        const ano = dt.getFullYear();

        return `${dia}/${mes}/${ano}`;
    }

    // Fun��o para calcular dias at� vencer
    const calcularDiasAteVencer = (data: string) => {
        const dataVencimentoCalculada = parseData(data);
        if (!dataVencimentoCalculada) return 0;

        const hoje = new Date();

        // Zerando horas para comparar s� as datas
        hoje.setHours(0, 0, 0, 0);
        dataVencimentoCalculada.setHours(0, 0, 0, 0);

        // calcula a diferen�a em milissegundos das duas datas
        const diferenca = dataVencimentoCalculada.getTime() - hoje.getTime();
        // converte a diferen�a em dias
        const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

        return dias;
    };

    // Fun��o para gerar o texto de vencimento
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

    // Fun��o para determinar a cor baseada nos dias faltando
    const obterCorVencimento = (data: string) => {
        const dias = calcularDiasAteVencer(data);

        if (tarefaFinalizada) {
            return "#16A34A"; // Verde - Finalizada
        }

        if (dias <= -1) {
            return "#B91C1C"; // Vermelho - Vencido
        } else if (dias <= 2 && dias >= 0) {
            return "#B45309"; // Amarelo/Laranja - Aten��o
        } else {
            return ""; // Cor padr�o (text-muted)
        }
    };

    // Fun��o para determinar o status baseado na hierarquia de regras
    const obterStatus = (): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
        // 1. O check de finalizado tem prioridade m�xima
        if (tarefaFinalizada) {
            return 'finalizado';
        }

        // 2. Se n�o est� finalizada, verificamos se est� vencida
        const diasRestantes = calcularDiasAteVencer(dataVencimento);
        if (diasRestantes < 0) {
            return 'atrasada';
        }

        // 3. Se est� no prazo, verificamos se h� respons�veis alocados
        if (responsaveis.length === 0) {
            return 'aguardando';
        }

        // 4. Se n�o est� finalizada, n�o est� atrasada e tem respons�vel:
        return 'andamento';
    };

    // Fun��o para obter o texto de respons�veis
    const obterTextoResponsaveis = (): string => {
        if (responsaveis.length === 0) {
            return 'Sem Atribui��es';
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
