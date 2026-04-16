import React, { useState } from 'react';
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
}

const CardTarefa: React.FC<CardTarefaProps> = ({
    tarefa,
    titulo = "Solicitar Extrato Analítico",
    prioridade = "baixa",
    dataVencimento = "21/03/2026",
    responsaveis = ['João Silva', 'Maria Oliveira'],
    descricao = "Sem descrição",
    onDelete,
    onEditSuccess,
}) => {
    const { 
        expandido, checked, animatingCheck, textoVencimento, corVencimento,
        obterStatus, toggleExpandir, toggleChecked, toggleFinalizada 
    } = useCardTarefa(dataVencimento, responsaveis);

    const [modalOpen, setModalOpen] = useState(false);
    const [editarModalOpen, setEditarModalOpen] = useState(false);
    const statusAtual = obterStatus();

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

    const handleEditSuccess = () => {
        setEditarModalOpen(false);
        if (onEditSuccess) {
            onEditSuccess();
        }
    };

    return (
        <>
            <div 
                className="w-full bg-white rounded-lg shadow-md flex flex-col border-2 border-default cursor-pointer overflow-hidden transition-all duration-300"
                onClick={toggleExpandir}
            >
                <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
                    <div className='flex flex-row gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0'>
                        <img 
                            src={`${checked ? `${checkBox}` : `${uncheckBox}`}`} 
                            alt="Tarefa" 
                            className={`mr-1 w-6 sm:w-7 md:w-9 shrink-0 ${animatingCheck ? 'animate-check' : ''}`}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleChecked();
                                toggleFinalizada();
                            }}
                        />
                        <div className='flex-1 min-w-0'>
                            <div className='flex flex-row gap-2 mb-2 items-center flex-wrap'>
                                <Status status={statusAtual} />
                                <Prioridade prioridade={prioridade} />
                            </div>
                            <Titulo tamanho="text-sm sm:text-base md:text-lg">{titulo}</Titulo>
                            <div className='flex flex-col sm:flex-row gap-1 sm:gap-3 md:gap-5 text-muted text-xs sm:text-xs md:text-sm'>
                                <p style={corVencimento ? { color: corVencimento } : {}} className='truncate'>
                                    Vence em: {dataVencimento} ({textoVencimento})
                                </p>
                                <p className='truncate'>Responsável: {responsaveis.join(', ')}</p>
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
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed w-full">
                            {descricao}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de confirmação de exclusão */}
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

            {/* Modal de editar tarefa */}
            {tarefa && (
                <EditarTarefa
                    isOpen={editarModalOpen}
                    onClose={() => setEditarModalOpen(false)}
                    tarefa={tarefa}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}

export default CardTarefa;