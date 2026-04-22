import { useEffect, useState } from "react";
import type { AssinaturaResponseDTO } from "../../types/AssinaturaTypes";
import { AssinaturaService } from "../../service/AssinaturaService";
import { CreateAssinaturaModal } from "../../components/modals/admin/CreateAssinaturaModal";

const formatDate = (dateStr: string) => {
    if(!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
};

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('ativo')) return 'bg-green-100 text-green-800';
    if (s.includes('cancelamento')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('cancelado')) return 'bg-red-100 text-red-800';
    if (s.includes('pendente')) return 'bg-orage-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
}

export const AdminAssinaturas: React.FC = () => {
    const [assinaturas, setAssinaturas] = useState<AssinaturaResponseDTO[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // --- Controle do Modal ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Dados ---
    const fetchDados = async () => {
        try {
            setCarregando(true);
            const data = await AssinaturaService.listarTodas();
            setAssinaturas(data);
        } catch (error) {
            console.error("Erro ao buscar assinaturas", error);
            setErro("Erro ao carregar assinaturas.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        fetchDados();
    }, []);

    // --- Ações ---

    const handleRenovar = async (id: string) => {
        if(!window.confirm("Deseja renovar esta assinatra por mais 1 mês")) return;
        try {
            await AssinaturaService.renovar(id);
            alert("Assinatura renovada com sucesso!");
            fetchDados();
        } catch (error) {
            alert("Erro ao renovar assinatura.");
        }
    };


    const handleCancelar = async (id: string) => {
        // Pergunta simples para definir se é imediato ou não
        // Se clicar OK = Imediato. Se Cancelar = Agendado. (Lógica simplificada para teste)
        // Para produção, ideal seria um Modal de confirmação com dois botões.
        
        // Usando window.confirm para simplificar:
        // Se o usuário quer cancelar, perguntamos o modo.
        const confirmar = window.confirm("Deseja realmente cancelar esta assinatura?");
        if (!confirmar) return;

        const imediato = window.confirm("O cancelamento deve ser IMEDIATO (Cortar acesso agora)?\n\n[OK] = Sim, cortar agora.\n[Cancelar] = Não, agendar para o fim do clico.");
        
        try {
            await AssinaturaService.cancelar(id, imediato);
            alert(imediato ? "Assinatura cancelada imediatamente." : "Cancelamento agendado para o fim do cliclo.");
            fetchDados();
        } catch (error) {
            alert("Erro ao cancelar assinatura.");
        }
    };

    if (carregando) return <div className="p-8">Carregando assinaturas...</div>
    if (erro) return <div className="p-8 text-red-600">{erro}</div>;

    return (
        <div className="p-8">
            
            <div className="flex justfy-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Assinaturas</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    Nova Assinatura
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escritório</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white devide-y divide-gray-200">
                        {assinaturas.map((assinatura) => (
                            <tr key={assinatura.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {assinatura.nomeEscritorio}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {assinatura.nomePlano}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assinatura.status)}`}>
                                        {assinatura.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(assinatura.fimVigencia)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"> 
                                    <button
                                        onClick={() => handleRenovar(assinatura.id)}
                                        className="text-green-600 hover:text-green-900 border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                                    >
                                        Renovar
                                    </button>
                                    <button
                                        onClick={() => handleCancelar(assinatura.id)}
                                        className="text-red-600 hover:text-red-900 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                    >
                                        Cancelar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {assinaturas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhuma assinatura encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateAssinaturaModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={() => {
                    setIsCreateModalOpen(false);
                    fetchDados();
                }}
            />
        </div>
    );
};