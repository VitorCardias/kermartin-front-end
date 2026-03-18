import type { Demanda } from "../../../Hooks/useDemandas";

type DemandaExcluirModalProps = {
  demanda: Demanda;
  onClose: () => void;
  onDelete: (demandaExlcuir: Demanda) => void;
};

const DemandaExcluirModal: React.FC<DemandaExcluirModalProps> = ({ demanda, onClose, onDelete }) => {

  const handleDelete = () => {
    onDelete(demanda);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4"> {/* Adicionei flex, justify-between e items-center */}
          <h3 className="text-2xl font-semibold">Excluir Demanda</h3>
        </div>

        <hr className="border-t border-gray-200 my-4" />

        <div>
          <p> Você tem certeza que deseja excluir esta demanda? </p>
          <p> Demanda de título: {demanda.titulo} </p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => handleDelete()}
            className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
            Sim, Excluir!
          </button>
          <button type="button" onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};

export default DemandaExcluirModal;