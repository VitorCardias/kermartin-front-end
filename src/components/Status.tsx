import React from 'react';
import aguardando from '../assets/status-aguardando.svg';
import andamento from '../assets/status-andamento.svg';
import finalizado from '../assets/status-finalizado.svg';
import atrasada from '../assets/status-atrasada.svg';

interface StatusProps {
    status: 'aguardando' | 'andamento' | 'finalizado' | 'atrasada';
}

const Status: React.FC<StatusProps> = ({ status }) => {
    let statusImage;
    let statusText;
    let statusBgColor = 'bg-status-wait';
    let statusTextColor = 'text-status-wait';

    switch (status) {
        case 'aguardando':
            statusImage = aguardando;
            statusText = 'Aguardando Equipe';
            statusBgColor = 'bg-status-wait';
            statusTextColor = 'text-status-wait';
            break;
        case 'andamento':
            statusImage = andamento;
            statusText = 'Em andamento';
            statusBgColor = 'bg-status-inprogress';
            statusTextColor = 'text-status-inprogress';
            break;
        case 'finalizado':
            statusImage = finalizado;
            statusText = 'Finalizado';
            statusBgColor = 'bg-status-completed';
            statusTextColor = 'text-status-completed';
            break;
        case 'atrasada':
            statusImage = atrasada;
            statusText = 'Atrasada';
            statusBgColor = 'bg-status-delayed';
            statusTextColor = 'text-status-delayed';
            break;
        default:
            statusImage = aguardando;
            statusText = 'Aguardando Equipe';
            statusBgColor = 'bg-status-wait';
            statusTextColor = 'text-status-wait';
    }

    return (
        <div className={`flex flex-row items-center gap-2 ${statusBgColor} rounded-full px-2 py-1 w-fit whitespace-nowrap`}>
            <img className='w-4 h-4 shrink-0' src={statusImage} alt="Status" />
            <p className={`text-xs uppercase font-medium tracking-tight ${statusTextColor}`}>{statusText}</p>
        </div>
    );
}

export default Status;