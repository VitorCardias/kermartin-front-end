import React, { useState, useEffect } from 'react';

interface EscritorioEditData {
  id: string;
  razaoSocial: string;
  cnpj: string;
  emailCadastro: string;
}

interface EditEscritorioModalProps {
  escritorio: EscritorioEditData | null; 
  isOpen: boolean;                       
  onClose: () => void;                  
  onSave: (data: EscritorioEditData) => Promise<void>;
}

export const EditEscritorioModal: React.FC<EditEscritorioModalProps> = ({ escritorio, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EscritorioEditData | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (escritorio) {
      setFormData(escritorio);
    }
  }, [escritorio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      setCarregando(true);
      await onSave(formData); 
      setCarregando(false);
      onClose(); 
    }
  };

  if (!isOpen || !formData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm transform-gpu flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Editar Escritório</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Campo Razão Social */}
            <div>
              <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">Razão Social</label>
              <input
                type="text"
                id="razaoSocial"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campo CNPJ */}
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="emailCadastro" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="emailCadastro"
                name="emailCadastro"
                value={formData.emailCadastro}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};