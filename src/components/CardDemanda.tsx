import React, { useState } from 'react';
import Titulo from './Titulo';
import Status from './Status';
import Prioridade from './Prioridade';
import ModalAlerta from './modals/AlertModal';
import { useTarefa } from '../Hooks/useTarefa';

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
}

const CardDemanda: React.FC<CardDemandaProps> = ({
    titulo = "Solicitar Extrato Analítico",
    cliente = "Banco XYZ",
    prioridade = "baixa",
    dataVencimento = "",
    responsaveis = [],
    onDelete,
    demanda,
    onEdit
}) => {
    const { 
        textoVencimento, corVencimento,
        obterStatus, toggleExpandir, formatarDataExibicao } = useTarefa(dataVencimento, responsaveis);

    const [modalOpen, setModalOpen] = useState(false);
    let statusAtual = obterStatus();

    const handleConfirmarDelete = () => {
        setModalOpen(false);
        if (onDelete) {
            onDelete();
        }
    };

    let corBordaCard;
    let statusParaComponente: 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' = 'aguardando';
    switch (statusAtual) {
        case 'aguardando': corBordaCard = 'border-l-aguardando'; statusParaComponente = 'aguardando'; break;
        case 'andamento': corBordaCard = 'border-l-andamento'; statusParaComponente = 'andamento'; break;
        case 'finalizado': corBordaCard = 'border-l-finalizado'; statusParaComponente = 'finalizado'; break;
        case 'atrasada': corBordaCard = 'border-l-atrasada'; statusParaComponente = 'atrasada'; break;
        default: corBordaCard = 'border-l-aguardando';
    }

    // LÓGICA DE EXTRAÇÃO DE RESPONSÁVEIS:
    // Se a prop responsaveis vier vazia, mas tivermos o objeto demanda, extraímos de lá.
    const equipeExibicao = responsaveis.length > 0 
        ? responsaveis 
        : (demanda?.responsavelList?.map((r: any) => r.nome || r.funcionarioDTO?.nomeCompleto) || []);

    return (
        <>
            <div 
                className={`w-full sm:w-5/6 lg:w-4/5 bg-white rounded-lg shadow-md flex flex-col ${corBordaCard} border-l-6 cursor-pointer overflow-hidden transition-all duration-300`}
                onClick={toggleExpandir}
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
                                <p style={corVencimento ? { color: corVencimento } : {}} className='truncate'>
                                    Vence em: {formatarDataExibicao(dataVencimento)} ({textoVencimento})
                                </p>
                                {/* Utilizando a variável mapeada com redundância */}
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