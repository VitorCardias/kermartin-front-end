import type React from "react";
import Titulo from "./Titulo";
import emailIcon from '../assets/icon-email.svg';

interface CardFuncionarioProps {
    nome?: string;
    email?: string;
    cargo?: string;
}

const CardFuncionario: React.FC<CardFuncionarioProps> = ({ 
    nome = "Vitor Serra Cardias", 
    email = "vitor.cardias@example.com", 
    cargo = "Desenvolvedor / Analista de Sistemas" 
}) => {

    return (
        <div className="w-full max-w-full md:w-4/5">
            <div className="p-3 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center bg-white rounded-lg shadow-md border-2 border-default cursor-pointer transition-all duration-300 hover:shadow-lg">
                {/* Seção de Informações */}
                <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto'>
                    <div className='flex-1 min-w-0'>
                        <p className="uppercase font-bold text-blue text-xs sm:text-sm">{cargo}</p>
                        <Titulo tamanho="text-base sm:text-lg md:text-xl">{nome}</Titulo>
                        <div className='flex flex-row gap-1 sm:gap-2 text-muted text-xs sm:text-sm items-center'>
                            <img src={emailIcon} alt="Email" className="w-4 h-4 flex-shrink-0" />
                            <p className='truncate'>{email}</p>
                        </div>
                    </div>
                </div>
                
                {/* Seção de Estatísticas e Ações */}
                <div className='flex flex-col items-start sm:items-center justify-between gap-4 sm:gap-6 w-full sm:w-auto shrink-0'>
                    {/* Estatísticas */}
                    <div className='flex flex-row items-center justify-start gap-4 sm:gap-6 w-full sm:w-auto'>
                        <div className="flex flex-col items-center justify-center uppercase">
                            <p className="text-muted text-base sm:text-lg font-bold">05</p>
                            <p className="text-muted text-xs sm:text-sm font-bold">Tarefas</p>
                        </div>
                        <div className="flex flex-col items-center justify-center uppercase">
                            <p className="text-muted text-base sm:text-lg font-bold">0</p>
                            <p className="text-muted text-xs sm:text-sm font-bold">Atrasadas</p>
                        </div>
                    </div>
                    
                    {/* Botões */}
                    <div className='flex flex-row items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto'>
                        <button 
                            className='flex-1 sm:flex-none text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap'
                            onClick={(e) => { e.stopPropagation();}}
                        >
                            Editar
                        </button>
                        <button 
                            className='flex-1 sm:flex-none text-xs sm:text-sm bg-blue text-white px-3 sm:px-4 py-2 rounded text-light hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap'
                            onClick={(e) => { e.stopPropagation();}}
                        >
                            Ver Tarefas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardFuncionario;