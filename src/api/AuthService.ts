import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { type AuthTokens, type CadastroParams, type LoginParams } from '../types/auth';
import type { ToastType } from '../components/Toast';
import { authStorage } from '../utils/authStorage';

const API_URL = import.meta.env.VITE_API_URL?.trim() || 'https://kermartin-api.onrender.com';

export let showToastCallback: ((msg: string, type: ToastType) => void) | null = null;

export const setShowToastCallback = (callback: (msg: string, type: ToastType) => void) => {
  showToastCallback = callback;
};

const emitToast = (message: string, type: ToastType = 'info') => {
  showToastCallback?.(message, type);
};

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) return metaToken;

  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const isMutationMethod = (method: string | undefined): boolean => {
  if (!method) return false;
  return ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase());
};

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type PaywallErrorPayload = {
  status?: 'PENDENTE_PAGAMENTO' | 'BLOQUEADO';
  erro?: string;
};

/**
 * Instancia Axios para requisicoes autenticadas
 */
export const authApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * Interceptador de Requisicoes:
 * - Adiciona o token Bearer em todas as requisicoes
 * - Injeta token CSRF em metodos mutaveis quando disponivel
 */
authApi.interceptors.request.use(
  (config) => {
    const headers = AxiosHeaders.from(config.headers);
    const token = authStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (isMutationMethod(config.method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de Respostas para tratar erros globais (403 com status de pagamento e 401 para refresh)
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<PaywallErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // Capturar erro 403 com status de pagamento
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      const isPaywallError =
        errorData?.status === 'PENDENTE_PAGAMENTO' || errorData?.status === 'BLOQUEADO';

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
          authStorage.clearTokens();
          authStorage.clearProfile();
          const mensagem = encodeURIComponent(errorData.erro || 'Seu escritorio nao possui um plano ativo no momento.');
          window.location.href = `/login?error=${mensagem}`;
          return Promise.reject(error);
        }
      }
    }

    // Tratar erro 401 (token expirado) - tentar refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Refresh token nao encontrado');
        }

        const response = await axios.post<AuthTokens>(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data;
        authStorage.setTokens(token, newRefreshToken);

        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set('Authorization', `Bearer ${token}`);
        originalRequest.headers = headers;

        return authApi(originalRequest);
      } catch (refreshError) {
        authStorage.clearTokens();
        authStorage.clearProfile();
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
    await axios.post(`${API_URL}/auth/escritorio/register`, data);
  },

  login: async (credentials: LoginParams): Promise<AuthTokens> => {
    const response = await axios.post<AuthTokens>(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  verificarStatusAcesso: async <T = unknown>(): Promise<T> => {
    const response = await authApi.get<T>('/assinaturas/status-acesso');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await axios.post<AuthTokens>(`${API_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  },

  logout: (): void => {
    authStorage.clearTokens();
    authStorage.clearProfile();
  },

  redirectToLogin: (): void => {
    window.location.href = '/login';
  },

  estaAutenticado: (): boolean => Boolean(authStorage.getAccessToken()),

  solicitarRecuperacaoSenha: async (email: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/esqueci-senha`, { email });
  },

  redefinirSenha: async (token: string, novaSenha: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/redefinir-senha`, { token, novaSenha });
  },
};
