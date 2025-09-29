import type { TarefaComAtribuicao } from "../../hooks/useTarefasFuncionario";


type ConfirmacaoConcluirModalProps = {
    tarefa: TarefaComAtribuicao;
    onClose: () => void;
    onConcluir: (idAtribuicao: string) => void;
}

const ConfirmacaoConcluirModal: React.FC<ConfirmacaoConcluirModalProps> = ({ tarefa, onClose, onConcluir }) => {

    return (
        // Overlay principal (fundo escuro)
        <div
            onClick={onClose}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}
            aria-modal="true"
            role="dialog"
        >
            {/* Painel do Modal */}
            <div
                onClick={(e) => e.stopPropagation()} // Impede que o clique no painel feche o modal
                className={`relative w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out`}
            >
                
                {/* Ícone de Sucesso/Confirmação */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                </div>

                {/* Título e Descrição */}
                <div className="text-center">
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">Confirmar Conclusão de Tarefa</h3>
                    <div className="mt-4 text-base text-gray-600">
                        <p>Você tem certeza que deseja marcar a tarefa "<strong>{tarefa.tarefaEtapaDTO.titulo}</strong>" como concluída? Essa ação não poderá ser desfeita.</p>
                    </div>
                </div>

                
                {/* Botões de Ação */}
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={() => onConcluir(tarefa.idAtribuicaoFuncionario)}
                        className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-gray-200 px-6 py-3 text-base font-semibold text-gray-800 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                </div>

                
            </div>
        </div>

    )

}

export default ConfirmacaoConcluirModal;