// Página de Cadastro
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { type CadastroParams } from '../types/auth';
import { authApi } from '../api/AuthService';

interface IPlano {
  id: string,
  nome: string
}

export const Cadastro: React.FC = () => {  
  const [formData, setFormData] = useState<CadastroParams>({
    nomeUsuario: '',
    emailCadastro: '',
    senha: '',
    tipoUsuario: 'Escritorio',
    razaoSocial: '',
    cnpj: '',
    planoDTO: {
      id: '',
    },
  });
  const { cadastro, error, carregando } = useAuth();
  const navigate = useNavigate();
  const [planos, setPlanos] = useState<IPlano[]>([]);

  useEffect(() => {
    const buscarPlanos = async () => {
      try {
        const response = await authApi.get(`/plano`);

        console.log("Resposta da API:", response.data); 

        const data = response.data;
        setPlanos(data);

        if (data && data.lenght > 0) {
          setFormData(prevFormData => ({
            ...prevFormData,
            planoDTO: {
              id: data[0].id
            }
          }));
        }

      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    buscarPlanos(); // Chama a função
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Verificamos se o campo que mudou é o nosso seletor de planos
    if (name === 'planoId') {
      setFormData((prev) => ({
        ...prev,
        planoDTO: {
          id: value, // Atualizamos apenas o id dentro do planoDTO
        },
      }));
    } else {
      // Se for qualquer outro campo, usamos a lógica que você já tinha
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cadastro(formData);
    
    // Se não houver erro após o registro, redireciona para o login
    if (!error) {
      navigate('/login');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Cadastro de Escritório</h2>
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-md border border-red-500/30">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700">Nome de Usuário:</label>
            <input
              type="text"
              id="nomeUsuario"
              name="nomeUsuario"
              value={formData.nomeUsuario}
              onChange={handleChange}
              required
              placeholder="Digite seu nome de usuário"
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="emailCadastro" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="emailCadastro"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              required
              placeholder="Digite seu email"
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha:</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="Digite sua senha"
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">Razão Social:</label>
            <input
              type="text"
              id="razaoSocial"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
              placeholder="Digite a razão social"
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ:</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
              placeholder="Digite o CNPJ"
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Dentro do seu <form> */}

          {planos.length > 0 ? (
            // Se a condição (planos.length > 0) for VERDADEIRA, renderiza o seletor
            <div className="space-y-2">
              <label htmlFor="plano" className="block text-sm font-medium text-gray-700">Escolha seu Plano:</label>
              <select
                id="plano"
                name="planoId"
                value={formData.planoDTO.id || ''} // Corrigido para usar o planoId do formData
                onChange={handleChange}     // Corrigido para passar a função diretamente
                required
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled>Selecione um plano</option>
                {planos.map(plano => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // Se a condição for FALSA, renderiza uma mensagem de carregamento
            <div className="text-center text-gray-500">
              <p>Carregando planos...</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gray-900 text-white py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};