import React from 'react';
import baixa from '../assets/prio-baixa.svg';
import media from '../assets/prio-media.svg';
import alta from '../assets/prio-alta.svg';

interface PrioridadeProps {
    prioridade: 'baixa' | 'media' | 'alta';
}

const Prioridade: React.FC<PrioridadeProps> = ({ prioridade }) => {

    let statusImage;
    let prioridadeText;
    let colorText = 'text-baixa';

    switch (prioridade) {
        case 'baixa':
            prioridadeText = 'Baixa';
            statusImage = baixa;
            colorText = 'text-baixa';
            break;
        case 'media':
            prioridadeText = 'Média';
            statusImage = media;
            colorText = 'text-media';
            break;
        case 'alta':
            prioridadeText = 'Alta';
            statusImage = alta;
            colorText = 'text-alta';
            break;
        default:
            prioridadeText = 'Baixa';
            statusImage = baixa;
            colorText = 'text-baixa';
    }
    return (
        <div className="flex flex-row gap-1.5 items-center whitespace-nowrap">
            <img className='w-4 h-4 shrink-0' src={statusImage} alt="Prioridade" />
            <p className={`text-xs sm:text-sm uppercase font-medium tracking-tight ${colorText}`}>Prioridade {prioridadeText}</p>
        </div>
    );
}

export default Prioridade;  