import { useState } from "react";
import type { NovoCliente } from "../../../hooks/useClientes";
import type { TipoCliente } from "../../../types/TiposClientes";
import clsx from "clsx";
import FormularioCadastroPessoaFisica from "./FormularioCadastroPessoaFisica";
import FormularioCadastroPessoaJuridica from "./FormularioCadastroPessoaJuridica";

type CadastroClienteModalProps = {
  onClose: () => void;
  onCadastro: (novoCliente: NovoCliente) => void;
};

const CadastroClienteModal: React.FC<CadastroClienteModalProps> = ({ onClose, onCadastro }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoCliente | null>(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Cadastrar Cliente</h3>
        
        {/* ETAPA 1: Seletor de Tipo */}
        <div className="mb-6">
          <label className="text-lg font-medium">Tipo de Cliente:</label>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setTipoSelecionado('pf')}
              className={clsx("px-6 py-3 rounded-md flex-1", {
                'bg-black text-white': tipoSelecionado === 'pf',
                'bg-gray-200 text-gray-800': tipoSelecionado !== 'pf'
              })}
            >
              Pessoa Física
            </button>
            <button 
              onClick={() => setTipoSelecionado('pj')}
              className={clsx("px-6 py-3 rounded-md flex-1", {
                'bg-black text-white': tipoSelecionado === 'pj',
                'bg-gray-200 text-gray-800': tipoSelecionado !== 'pj'
              })}
            >
              Pessoa Jurídica
            </button>
          </div>
        </div>

        <hr className="my-6" />

        {/* ETAPA 2: Renderização Condicional do Formulário */}
        {tipoSelecionado === 'pf' && (
          <FormularioCadastroPessoaFisica onCadastro={onCadastro} onClose={onClose} />
        )}

        {tipoSelecionado === 'pj' && (
          <FormularioCadastroPessoaJuridica onCadastro={onCadastro} onClose={onClose} />
        )}

      </div>
    </div>
  );
};

export default CadastroClienteModal;