import axios from 'axios';
import { type AuthTokens, type LoginParams, type CadastroParams } from '../types/auth';
import type { ToastType } from '../components/Toast';

const API_URL = 'https://kermartin-api.onrender.com';
// const API_URL = 'http://localhost:8080'

export let showToastCallback: ((msg: string, type: ToastType) => void) | null = null;

export const setShowToastCallback = (callback: (msg: string, type: ToastType) => void) => {
  showToastCallback = callback;
};

const emitToast = (message: string, type: ToastType = 'info') => {
  showToastCallback?.(message, type);
};

/**
 * Instancia Axios para requisicoes autenticadas
 */
export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptador de Requisicoes:
 * - Adiciona o token Bearer em todas as requisicoes
 */
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de Respostas para tratar erros globais (403 com status de pagamento e 401 para refresh)
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Capturar erro 403 com status de pagamento
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      const isPaywallError =
        errorData?.status && (errorData.status === 'PENDENTE_PAGAMENTO' || errorData.status === 'BLOQUEADO');

      if (isPaywallError) {
        if (errorData.status === 'PENDENTE_PAGAMENTO') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/planos') && !currentPath.includes('/pagamento')) {
            emitToast(errorData.erro || 'Seu escritorio precisa regularizar o plano para continuar.', 'info');
            window.location.href = '/planos?paymentPending=true';
          }
          return Promise.reject(error);
        }

        if (errorData.status === 'BLOQUEADO') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          const mensagem = encodeURIComponent(
            errorData.erro || 'Seu escritorio nao possui um plano ativo no momento.'
          );
          window.location.href = `/login?error=${mensagem}`;
          return Promise.reject(error);
        }
      }
    }

    // Tratar erro 401 (token expirado) - tentar refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('Refresh token nao encontrado');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        authService.redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Servico de Autenticacao
 */
export const authService = {
  cadastro: async (data: CadastroParams): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/escritorio/register`, data);
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials: LoginParams): Promise<AuthTokens> => {
    try {
      const response = await axios.post<AuthTokens>(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verificarStatusAcesso: async (): Promise<any> => {
    const response = await authApi.get('/assinaturas/status-acesso');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    try {
      const response = await axios.post<AuthTokens>(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  redirectToLogin: (): void => {
    window.location.href = '/login';
  },

  estaAutenticado: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  solicitarRecuperacaoSenha: async (email: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/esqueci-senha`, { email });
  },

  redefinirSenha: async (token: string, novaSenha: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/redefinir-senha`, { token, novaSenha });
  },
};
