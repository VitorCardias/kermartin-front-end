// Página de Cadastro
import React, { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { type CadastroParams } from '../types/auth';
import { authApi } from '../api/AuthService';

interface IPlano {
  id: string,
  nome: string
}

export default function Cadastro() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Kermartin</h1>
        <p className="text-center text-gray-600 mb-6">Criar Nova Conta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              id="nomeUsuario"
              type="text"
              name="nomeUsuario"
              value={formData.nomeUsuario}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Escolha um nome de usuário"
              required
            />
          </div>
          <div>
            <label htmlFor="emailCadastro" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="emailCadastro"
              type="email"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite seu email"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite uma senha"
              required
            />
          </div>

          <div>
            <label htmlFor="RazaoSocial" className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              id="RazaoSocial"
              type="text"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite a razão social"
              required
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Já tem uma conta?{' '}
          <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Entre aqui
          </a>
        </p>
      </div>
    </div>
  );
}
