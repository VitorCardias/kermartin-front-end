// Serviço para comunicação com a API

import axios from 'axios';
import { type AuthTokens, type LoginParams, type CadastroParams } from '../types/auth';

const API_URL = 'https://kermartin-api.onrender.com'
//const API_URL = 'http://localhost:8080'

/**
 * Instância Axios para requisições autenticadas
 *  */
export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptador de Requicições para a API:
 * - Função: Adicionar o token em todas as requisições.
 */
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptador de Requicições para a API:
 * - Função: Lidar com erros 403 (token expirado)
 */
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber um erro 403 e não for uma tentativa de refresh
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Interceptador: Recebeu erro 403 para a requisição:", originalRequest.url);

      try {
        // Tenta renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log("Interceptador: Refresh token não encontrado no localStorage.");
          throw new Error('Refresh token não encontrado');
        }

        console.log("Interceptador: Tentando obter novo token com refreshToken:", refreshToken);
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        console.log("Interceptador: Resposta do refresh token:", response.data);
        const { token, refreshToken: newRefreshToken } = response.data;

        // Atualiza os tokens no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log("Interceptador: Novos tokens salvos no localStorage:", { token, newRefreshToken });

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log("Interceptador: Refazendo a requisição original:", originalRequest.url, "com novo token.");
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Interceptador: Erro ao renovar o token:", refreshError);
        // Se não conseguir renovar, limpa os tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log("Interceptador: Falha no refresh token. Tokens locais removidos.");

        // Redireciona explicitamente para a página de login
        authService.redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    console.log("Interceptador: Erro na resposta (não é 401 ou já foi retentado):", error);
    return Promise.reject(error);
  }
);

/**
 * Serviço de Autenticação
 */
export const authService = {

  // Cadastro de Escritório
  cadastro: async (data: CadastroParams): Promise<void> => {
    await axios.post(`${API_URL}/auth/escritorio/register`, data);
  },

  // Login de Usuario
  login: async (credentials: LoginParams): Promise<AuthTokens> => {
    const response = await axios.post<AuthTokens>(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  // Atualizar token utilizando o refreshToken
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await axios.post<AuthTokens>(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    });
    return response.data;
  },

  // Logout (limpa dados locais)
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Redirecionar para login (útil em vários cenários)
  redirectToLogin: (): void => {
    window.location.href = '/login';
  },

  // Verificar se o usuário está autenticado
  estaAutenticado: (): boolean => {
    return !!localStorage.getItem('token');
  },

}