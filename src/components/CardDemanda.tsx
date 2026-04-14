import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Titulo from './Titulo';
import Status from './Status';
import Prioridade from './Prioridade';
import ModalAlerta from './modals/AlertModal';
import { useTarefa } from '../Hooks/useTarefa';
import { useEquipe } from '../Hooks/useEquipe';

interface CardDemandaProps {
    titulo?: string;
    cliente?: string;
    status?: 'aguardando' | 'andamento' | 'finalizado' | 'atrasada';
    prioridade?: 'baixa' | 'media' | 'alta';
    dataVencimento?: string;
    responsaveis?: string[];
    onDelete?: () => void;
    demanda?: any;
    onEdit?: (demanda: any) => void;
    onStatusChanged?: (demandaAtualizada: any) => void;
}

const CardDemanda: React.FC<CardDemandaProps> = ({
    titulo = "Solicitar Extrato Analítico",
    cliente = "Banco XYZ",
    prioridade = "baixa",
    status,
    dataVencimento = "",
    responsaveis = [],
    onDelete,
    demanda,
    onEdit
}) => {
    const navigate = useNavigate();
    const { 
        textoVencimento, corVencimento,
        toggleExpandir, formatarDataExibicao } = useTarefa(dataVencimento, responsaveis);

    const { membrosEquipe } = useEquipe(demanda?.id || "");
    const [modalOpen, setModalOpen] = useState(false);

    const normalizarStatus = (statusBruto?: string): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
        switch (statusBruto) {
            case 'RequerindoEquipe':
            case 'aguardando':
                return 'aguardando';
            case 'EmAndamento':
            case 'andamento':
                return 'andamento';
            case 'Finalizada':
            case 'finalizado':
                return 'finalizado';
            case 'Atrasada':
            case 'atrasada':
                return 'atrasada';
            default:
                return 'aguardando';
        }
    };

    const parseData = (valor?: string): Date | null => {
        if (!valor) return null;

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
    };

    const handleConfirmarDelete = () => {
        setModalOpen(false);
        if (onDelete) {
            onDelete();
        }
    };

    const handleAbrirDemanda = () => {
        if (!demanda?.id) {
            toggleExpandir();
            return;
        }

        navigate(`/demanda/${demanda.id}`, {
            state: {
                demanda,
            },
        });
    };

    const statusBase = demanda?.statusDemanda || status;
    let statusParaComponente = normalizarStatus(statusBase);

    const dataVencimentoDate = parseData(dataVencimento);
    if (statusParaComponente !== 'finalizado' && dataVencimentoDate) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const vencimento = new Date(dataVencimentoDate);
        vencimento.setHours(0, 0, 0, 0);

        if (vencimento.getTime() < hoje.getTime()) {
            statusParaComponente = 'atrasada';
        }
    }

    let corBordaCard = 'border-l-aguardando';
    if (statusParaComponente === 'andamento') corBordaCard = 'border-l-andamento';
    if (statusParaComponente === 'finalizado') corBordaCard = 'border-l-finalizado';
    if (statusParaComponente === 'atrasada') corBordaCard = 'border-l-atrasada';

    // Mapeia os nomes vindos diretamente do useEquipe
    const nomesEquipeBuscada = membrosEquipe?.map(m => m.funcionarioDTO.nomeCompleto) || [];

    // Prioridade de exibição dos responsáveis
    const equipeExibicao = responsaveis.length > 0 
        ? responsaveis 
        : nomesEquipeBuscada.length > 0 
            ? nomesEquipeBuscada 
            : (demanda?.responsavelList?.map((r: any) => r.nome || r.funcionarioDTO?.nomeCompleto) || []);

    return (
        <>
            <div 
                className={`w-full sm:w-5/6 lg:w-4/5 bg-white rounded-lg shadow-md flex flex-col ${corBordaCard} border-l-6 cursor-pointer overflow-hidden transition-all duration-300`}
                onClick={handleAbrirDemanda}
            >
                <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
                    <div className='flex flex-row gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0'>
                        <div className='flex-1 min-w-0'>
                            <div className='flex flex-row gap-2 mb-2 items-center flex-wrap'>
                                <Status status={statusParaComponente} />
                                <Prioridade prioridade={prioridade} />
                            </div>
                            <Titulo tamanho="text-sm sm:text-base md:text-lg">{titulo} - {cliente}</Titulo>
                            <div className='flex flex-col sm:flex-row gap-1 sm:gap-3 md:gap-5 text-muted text-xs sm:text-xs md:text-sm'>
                                <p style={statusParaComponente === 'finalizado' ? {} : { color: corVencimento }} className='truncate'>
                                    Vence em: {formatarDataExibicao(dataVencimento)} ({statusParaComponente === 'finalizado' ? 'Finalizada' : textoVencimento})
                                </p>
                                <p className='truncate'>
                                    Responsável: {equipeExibicao.length > 0 ? equipeExibicao.join(', ') : 'Sem Atribuições'}
                                </p>
                            </div>
                        </div>
                    </div>
                
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0 w-full sm:w-auto'>
                        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1 sm:gap-2'>
                            <button 
                                className='text-xs sm:text-xs md:text-sm bg-primary text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap order-2 sm:order-1'
                                onClick={(e) => { e.stopPropagation(); onEdit?.(demanda); }}
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalAlerta
                isOpen={modalOpen}
                titulo="Excluir Tarefa"
                mensagem={`Tem certeza que deseja excluir a tarefa "${titulo}"? Esta ação não pode ser desfeita.`}
                botaoCancelar="Cancelar"
                botaoConfirmar="Excluir"
                tipo="erro"
                onCancel={() => setModalOpen(false)}
                onConfirm={handleConfirmarDelete}
            />
        </>
    );
}

export default CardDemanda;
