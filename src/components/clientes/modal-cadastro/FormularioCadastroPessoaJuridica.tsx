import { useState } from "react";
import type { NovoClientePessoaJuridica } from "../../../hooks/useClientes";

type FormularioCadastroPessoaJuridicaProps = {
  onClose: () => void;
  onCadastro: (novoCliente: NovoClientePessoaJuridica) => void;
};

const FormularioCadastroPessoaJuridica: React.FC<FormularioCadastroPessoaJuridicaProps> = ({ onClose, onCadastro }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    emailContato: '',
    numeroTelefoneContato: '',
    numeroWhatsAppContato: '',
    endereco: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCadastro({
      ...formData,
      tipoCliente: 'pj'
    });
    
    onClose();
  };

  return (
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
      <div className="flex justify-end gap-4 mt-6">
        <button type="submit" className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">Salvar Cliente</button>
        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancelar</button>
      </div>

    </form>
  );
};

export default FormularioCadastroPessoaJuridica;
