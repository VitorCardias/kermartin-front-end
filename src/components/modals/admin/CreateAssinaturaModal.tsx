import { useEffect, useState } from "react";
import type { EscritorioSelectOption, PlanoSelectOption } from "../../../types/AssinaturaTypes";
import { authApi } from "../../../api/AuthService";
import { AssinaturaService } from "../../../service/AssinaturaService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const CreateAssinaturaModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [escritorios, setEscritorios] = useState<EscritorioSelectOption[]>([]);
    const [planos, setPlanos] = useState<PlanoSelectOption[]>([]);
    const [selectedEscritorio, setSelectedEscritorio] = useState('');
    const [selectedPlano, setSelectedPlano] = useState('');
    const [statusInicial, setStatusInicial] = useState('Ativo');
    const [erro, setErro] = useState<string|null>(null);

    // Carrega as listas ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            setErro(null);
            authApi.get('/escritorio').then(res => setEscritorios(res.data)).catch(console.error);
            authApi.get('/plano').then(res => setPlanos(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        if(!selectedEscritorio || !selectedPlano) {
            setErro("Selecione um escritório e um plano.");
            return;
        }

        try {
            await AssinaturaService.criar({
                escritorioId: selectedEscritorio,
                planoId: selectedPlano,
                statusInicial: statusInicial,
                provedorPagamento: 'Manual'
            });
            onSave();
        } catch (error: any) {
            // Tenta pegar a mensagem de erro do backend (ex: "Escritório já possui assinatura")
            const msg = error.response?.data?.message || "Erro ao criar assinatura.";
            setErro(msg);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Nova Assinatura</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                
                {erro && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}

                <form onSubmit={handleSubmit}>
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Escritório</label>
                    <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
                    value={selectedEscritorio}
                    onChange={e => setSelectedEscritorio(e.target.value)}
                    required
                    >
                    <option value="">Selecione um escritório</option>
                    {escritorios.map(e => (
                        <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                    ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Plano</label>
                    <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
                    value={selectedPlano}
                    onChange={e => setSelectedPlano(e.target.value)}
                    required
                    >
                    <option value="">Selecione um plano</option>
                    {planos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Status Inicial</label>
                    <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
                    value={statusInicial}
                    onChange={e => setStatusInicial(e.target.value)}
                    >
                    <option value="Ativo">Ativo</option>
                    <option value="PeriodoTeste">Período de Teste</option>
                    <option value="Cancelado">Cancelado (Histórico)</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                    >
                    Criar Assinatura
                    </button>
                </div>
                </form>
            </div>
        </div>
    );

}