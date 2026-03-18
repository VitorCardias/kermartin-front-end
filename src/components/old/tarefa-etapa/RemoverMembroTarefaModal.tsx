import { useEquipeTarefa, type MembroEquipeTarefa } from "../../../Hooks/useEquipeTarefa";

type AdicionarMembroModalProps = {
  membroEquipeTarefa: MembroEquipeTarefa | null;
  idTarefa: string;
  onClose: () => void;
  onRemovido: () => void;
};

const RemoverMembroTarefaModal: React.FC<AdicionarMembroModalProps> = ({ membroEquipeTarefa, onClose, onRemovido, idTarefa }) => {
  const { deletarMembroEquipe } = useEquipeTarefa(idTarefa);

  const removerMembro = async () => {
    if (membroEquipeTarefa) {
      try {
        await deletarMembroEquipe(membroEquipeTarefa.id);

        //console.log("[ DEBUG ] Feature: Simulando Remoção...")
        
        onRemovido(); // Recarrega a equipe na tela após remover membro
        onClose(); // Fecha o modal
      } catch (error) {
        console.error("Erro ao remover membro da equipe: ", error);
      }
    }
  };

  const renderizarConteudo = () => {
    if (membroEquipeTarefa) { 
      return <>
        <div className="mt-3 mb-3">
          <p>Tem Certeza que deseja remover este membro?</p>
          <p>Membro: {membroEquipeTarefa?.funcionarioDTO.nomeCompleto}</p>
        </div>

        <hr className="mt-2 border-gray-300"></hr>

        <div className="flex justify-end gap-4 mt-3">
          <button
            onClick={removerMembro}
            className="px-6 py-3 bg-red-300 text-red-700 rounded-md hover:bg-red-400 cursor-pointer"
          >
            Sim, remover!
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </>
    } else {
      return <>
        <div className="mt-3 mb-3">
          <p>Ouve um problema...</p>
          <p>Infelizmente, ao clicar no botão de remover, o sistema não conseguiu reconhecer o membro que você deseja remover.</p>
          <p>Se o problema persistir, contate o suporte.</p>
          <p>Obrigado.</p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </>
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-3">Remover Membro da Equipe da Tarefa</h3>
        {renderizarConteudo()}
      </div>
    </div>
  )

}

export default RemoverMembroTarefaModal;