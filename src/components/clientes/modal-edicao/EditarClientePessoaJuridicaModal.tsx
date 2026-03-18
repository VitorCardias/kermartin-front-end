import { useEffect, useState } from "react";
import type { Cliente, ClientePessoaJuridica } from "../../../Hooks/useClientes";

type EditarClientePessoaJuridicaModalProps = {
  cliente: ClientePessoaJuridica;
  onClose: () => void;
  onUpdate: (clienteEditado: Cliente) => void;
};

const EditarClientePessoaJuridicaModal: React.FC<EditarClientePessoaJuridicaModalProps> = ({ cliente, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<ClientePessoaJuridica>(
    { 
      ...cliente,
    }
  );

  useEffect(() => {
    // Sincroniza o estado do formulário se a prop 'cliente' mudar
    setFormData({ ...cliente });
  }, [cliente]); // A dependência é a prop 'cliente'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <div className="">
          <h3 className="text-2xl font-semibold mb-6">Editar Cliente</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campos do Formulário  */}
          <div className="flex flex-col">
            <label className="text-lg font-medium">Nome:</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome}
              required={true} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">CNPJ:</label>
            <input 
              type="text" 
              name="cnpj" 
              value={formData.cnpj}
              required={false} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Numero de telefone:</label>
            <input 
              type="text" 
              name="numeroTelefoneContato" 
              value={formData.numeroTelefoneContato}
              required={false} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Numero de WhatsApp:</label>
            <input 
              type="text" 
              name="numeroWhatsAppContato" 
              value={formData.numeroWhatsAppContato} 
              required={false}
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Email:</label>
            <input 
              type="email" 
              name="emailContato" 
              value={formData.emailContato} 
              required={false}
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Endereço:</label>
            <input 
              type="text" 
              name="endereco" 
              value={formData.endereco} 
              required={false}
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          {/* Footer do Formulário */}
          <hr className="h-px my-8 bg-gray-300 border-0"></hr>
          <div className="flex justify-end gap-4 mt-6">
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Salvar Alterações
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancelar
            </button>
          </div>

        </form>   
      </div>
    </div>
  );

};

export default EditarClientePessoaJuridicaModal;