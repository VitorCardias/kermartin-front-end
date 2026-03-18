import React from 'react';
import alerta from '../../assets/status-atrasada.svg';
import confirmacao from '../../assets/status-finalizado.svg';

interface ModalAlertaProps {
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    botaoCancelar?: string;
    botaoConfirmar?: string;
    onCancel?: () => void;
    onConfirm: () => void;
    tipo?: 'aviso' | 'erro' | 'sucesso';
    mostrarBotaoCancelar?: boolean;
}

const ModalAlerta: React.FC<ModalAlertaProps> = ({
    isOpen,
    titulo,
    mensagem,
    botaoCancelar = "Cancelar",
    botaoConfirmar = "Confirmar",
    onCancel,
    onConfirm,
    tipo = 'aviso',
    mostrarBotaoCancelar = true
}) => {
    if (!isOpen) return null;

    const coresBotao = {
        aviso: 'bg-yellow-500 hover:bg-yellow-600',
        erro: 'bg-red-500 hover:bg-red-600',
        sucesso: 'bg-green-500 hover:bg-green-600'
    };

    const coresIcone = {
        aviso: 'text-yellow-500',
        erro: 'text-red-500',
        sucesso: 'text-green-500'
    };

    return (
        <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`text-2xl ${coresIcone[tipo]}`}>
                        {tipo === 'aviso' && <img src={alerta} alt="Alerta" className="w-10 h-10"/>}
                        {tipo === 'erro' && <img src={alerta} alt="Erro" className="w-10 h-10"/>}
                        {tipo === 'sucesso' && <img src={confirmacao} alt="Sucesso" className="w-10 h-10"/>}
                    </div>
                    <h2 className="text-lg font-semibold text-primary">{titulo}</h2>
                </div>

                <p className="text-gray-600 text-sm mb-6">{mensagem}</p>

                <div className="flex gap-3 justify-end">
                    {mostrarBotaoCancelar && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm font-medium"
                        >
                            {botaoCancelar}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded transition text-sm font-medium ${coresBotao[tipo]}`}
                    >
                        {botaoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAlerta;