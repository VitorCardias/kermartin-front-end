import React, { useState, useEffect } from 'react';
import checkBox from '../assets/check-box.svg';
import uncheckBox from '../assets/uncheck-box.svg';
import arrow from '../assets/right-arrow.svg';
import Titulo from './Titulo';
import Status from './Status';
import Prioridade from './Prioridade';
import ModalAlerta from './modals/AlertModal';
import EditarTarefa from './modals/Tarefa/EditarTarefa';
import { useCardTarefa } from '../Hooks/useCardTarefa';
import { type TarefaAPI } from '../Hooks/useTarefa';

interface CardTarefaProps {
    tarefa?: TarefaAPI;
    titulo?: string;
    status?: 'aguardando' | 'andamento' | 'finalizado' | 'atrasada';
    prioridade?: 'baixa' | 'media' | 'alta';
    dataVencimento?: string;
    responsaveis?: string[];
    descricao?: string;
    onDelete?: () => void;
    onEditSuccess?: () => void;
    onStatusChange?: (tarefaId: string, novoStatus: string) => Promise<void>;

}

const CardTarefa: React.FC<CardTarefaProps> = ({
    tarefa,
    titulo = "",
    prioridade = "",
    dataVencimento = "",
    responsaveis = [],
    descricao = "Sem descrição",
    onDelete,
    onEditSuccess,
    onStatusChange,
}) => {
    // Usar dados da tarefa se disponível, caso contrário usar props
    const [tarefaAtual, setTarefaAtual] = useState<TarefaAPI | undefined>(tarefa);
    const [tituloAtual, setTituloAtual] = useState(titulo);
    const [descricaoAtual, setDescricaoAtual] = useState(descricao);
    const [prioridadeAtual, setPrioridadeAtual] = useState(prioridade);
    const [dataVencimentoAtual, setDataVencimentoAtual] = useState(dataVencimento);
    const [responsaveisAtual, setResponsaveisAtual] = useState(responsaveis);

    const handleStatusChange = async (novoStatus: string) => {
        if (!tarefaAtual?.id || !onStatusChange) return;

        await onStatusChange(tarefaAtual.id, novoStatus);

        setTarefaAtual((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                status: novoStatus,
            };
        });
    };

    const { 
        expandido, checked, animatingCheck, textoVencimento, corVencimento,
        obterStatus, toggleExpandir, toggleFinalizada, formatarDataExibicao
    } = useCardTarefa(dataVencimentoAtual, responsaveisAtual, tarefaAtual, handleStatusChange);

    const [modalOpen, setModalOpen] = useState(false);
    const [editarModalOpen, setEditarModalOpen] = useState(false);
    const statusAtual = obterStatus();

    // Atualizar dados quando a tarefa mudar
    useEffect(() => {
        if (tarefa) {
            setTarefaAtual(tarefa);
            setTituloAtual(tarefa.titulo || titulo);
            setDescricaoAtual(tarefa.descricao || descricao);
            setPrioridadeAtual(normalizarPrioridade(tarefa.prioridade));
            setDataVencimentoAtual(tarefa.conclusaoPrazo || dataVencimento);
            setResponsaveisAtual([tarefa.criador?.nome || 'Sem responsável']);
        }
    }, [tarefa, titulo, descricao, dataVencimento]);

    // Função para normalizar prioridade
    const normalizarPrioridade = (prio: string): 'baixa' | 'media' | 'alta' => {
        const prioLower = prio?.toLowerCase() || 'baixa';
        if (prioLower.includes('alta')) return 'alta';
        if (prioLower.includes('media')) return 'media';
        return 'baixa';
    };

    const prioridadeNormalizada = normalizarPrioridade(prioridadeAtual);
    const dataFormatada = formatarDataExibicao(dataVencimentoAtual);

    const handleExcluirClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalOpen(true);
    };

    const handleConfirmarDelete = () => {
        setModalOpen(false);
        if (onDelete) {
            onDelete();
        }
    };

    const handleEditarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditarModalOpen(true);
    };

    const handleEditSuccess = (tarefaAtualizada?: any) => {
        setEditarModalOpen(false);
        // Atualizar o estado local com os dados da tarefa atualizada
        if (tarefaAtualizada) {
            setTarefaAtual(tarefaAtualizada);
        }
        if (onEditSuccess) {
            onEditSuccess();
        }
    };

    return (
        <>
            <div 
                className={`w-full bg-white rounded-lg shadow-md flex flex-col cursor-pointer overflow-hidden transition-all duration-300`}
                onClick={toggleExpandir}
            >
                <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
                    <div className='flex flex-row gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0'>
                        <img 
                            src={`${checked ? `${checkBox}` : `${uncheckBox}`}`} 
                            alt="Tarefa" 
                            className={`mr-1 w-6 sm:w-7 md:w-9 shrink-0 ${animatingCheck ? 'animate-check' : ''}`}
                            onClick={async (e) => { 
                                e.stopPropagation(); 
                                try {
                                    await toggleFinalizada();
                                } catch (error) {
                                    console.error('Erro ao atualizar status da tarefa:', error);
                                }
                            }}
                        />
                        <div className='flex-1 min-w-0'>
                            <div className='flex flex-row gap-2 mb-2 items-center flex-wrap'>
                                <Status status={statusAtual} />
                                <Prioridade prioridade={prioridadeNormalizada} />
                            </div>
                            <Titulo tamanho="text-sm sm:text-base md:text-lg">{tituloAtual}</Titulo>
                            <div className='flex flex-col sm:flex-row gap-1 sm:gap-3 md:gap-5 text-muted text-xs sm:text-xs md:text-sm'>
                                <p style={corVencimento ? { color: corVencimento } : {}} className='text-status-completed'>
                                    Vence em: {dataFormatada} ({textoVencimento})
                                </p>
                                <p className='truncate'>Responsável: {responsaveisAtual.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0 w-full sm:w-auto'>
                        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1 sm:gap-2'>
                            <button 
                                className='text-xs sm:text-xs md:text-sm bg-primary text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap order-2 sm:order-1'
                                onClick={handleEditarClick}
                            >
                                Editar
                            </button>
                            <button 
                                className='text-xs sm:text-xs md:text-sm bg-red-500 text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap order-1 sm:order-2'
                                onClick={handleExcluirClick}
                            >
                                Excluir
                            </button>
                        </div>
                        <img 
                            src={arrow} 
                            alt="Detalhes" 
                            className={`w-5 sm:w-6 md:w-9 shrink-0 transition-transform duration-300 order-3 sm:order-3 ml-auto sm:ml-0 ${expandido ? 'rotate-90' : ''}`}
                        />
                    </div>
                </div>
                <div 
                    className={`transition-all duration-300 ease-in-out px-3 sm:px-4 md:px-6 ${expandido ? 'max-h-96 opacity-100 pb-4 sm:pb-6' : 'max-h-0 opacity-0 pb-0'}`}
                >
                    <div className="pt-3 sm:pt-4 border-t-2 border-default">
                        <h4 className="text-xs font-semibold text-muted uppercase mb-2">Descrição da Tarefa</h4>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {descricaoAtual}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de confirmação de exclusão */}
            <ModalAlerta
                isOpen={modalOpen}
                titulo="Excluir Tarefa"
                mensagem={`Tem certeza que deseja excluir a tarefa "${tituloAtual}"? Esta ação não pode ser desfeita.`}
                botaoCancelar="Cancelar"
                botaoConfirmar="Excluir"
                tipo="erro"
                onCancel={() => setModalOpen(false)}
                onConfirm={handleConfirmarDelete}
            />

            {/* Modal de editar tarefa */}
            {tarefaAtual && (
                <EditarTarefa
                    isOpen={editarModalOpen}
                    onClose={() => setEditarModalOpen(false)}
                    tarefa={tarefaAtual}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}

export default CardTarefa;
