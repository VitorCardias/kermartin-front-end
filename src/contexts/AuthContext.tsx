import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { authApi, authService, setShowToastCallback } from '../api/AuthService';
import { useToast } from '../components/Toast';
import { type CadastroParams, type Usuario } from '../types/auth';
import { cacheService } from '../utils/cacheService';
import { authStorage } from '../utils/authStorage';

type PerfilUsuario = {
  id: string;
  username: string;
  tipoUsuario: 'Escritorio' | 'Funcionario';
  nomeEscritorio: string;
  idEscritorio: string;
};

type TokenPayload = {
  sub?: string;
  roles?: string[];
  exp?: number;
};

type ApiErrorPayload = {
  message?: string;
};

interface AuthContextType {
  usuario: Usuario | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  error: string | null;
  estaAutenticado: boolean;
  login: (username: string, senha: string) => Promise<Usuario | null>;
  cadastro: (formData: Omit<CadastroParams, 'planoDTO'>) => Promise<void>;
  cadastroComLogin: (
    formData: Omit<CadastroParams, 'planoDTO'>,
    username: string,
    senha: string
  ) => Promise<Usuario | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const { showToast } = useToast();

  const getUsuarioFromToken = (token: string): Usuario | null => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.sub) return null;

      return {
        username: decoded.sub,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      };
    } catch {
      return null;
    }
  };

  const tokenExpirado = (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.exp) return false;
      const agoraEmSegundos = Date.now() / 1000;
      return decoded.exp <= agoraEmSegundos + 10;
    } catch {
      return true;
    }
  };

  const salvarPerfilLocal = (perfilUsuario: PerfilUsuario): void => {
    authStorage.setProfile(perfilUsuario);
  };

  const carregarPerfilLocal = (): PerfilUsuario | null => authStorage.getProfile<PerfilUsuario>();

  const buscarPerfil = useCallback(async (username: string) => {
    try {
      const response = await authApi.get<PerfilUsuario>(`/usuario/perfil/${username}`);
      const perfilResponse = response.data;

      if (perfilResponse.username !== username) {
        throw new Error('Perfil recebido nao corresponde ao usuario autenticado');
      }

      setPerfil(perfilResponse);
      salvarPerfilLocal(perfilResponse);
    } catch {
      setPerfil(null);
      authStorage.clearProfile();
    }
  }, []);

  useEffect(() => {
    setShowToastCallback((msg, type = 'info') => {
      showToast(msg, type);
    });
  }, [showToast]);

  useEffect(() => {
    const checkAuth = async () => {
      setCarregando(true);
      setError(null);

      try {
        let token = authStorage.getAccessToken();
        const refreshToken = authStorage.getRefreshToken();

        if (!token || !refreshToken) {
          setEstaAutenticado(false);
          setUsuario(null);
          setPerfil(null);
          authStorage.clearProfile();
          return;
        }

        if (tokenExpirado(token)) {
          try {
            const tokens = await authService.refreshToken(refreshToken);
            authStorage.setTokens(tokens.token, tokens.refreshToken);
            token = tokens.token;
          } catch {
            authService.logout();
            setUsuario(null);
            setPerfil(null);
            setEstaAutenticado(false);
            authStorage.clearProfile();
            return;
          }
        }

        const user = getUsuarioFromToken(token);
        if (!user) {
          authService.logout();
          setUsuario(null);
          setPerfil(null);
          setEstaAutenticado(false);
          authStorage.clearProfile();
          return;
        }

        setUsuario(user);
        setEstaAutenticado(true);

        const perfilCache = carregarPerfilLocal();
        if (perfilCache?.username === user.username) {
          setPerfil(perfilCache);
        } else {
          authStorage.clearProfile();
        }

        void buscarPerfil(user.username);
      } catch {
        setUsuario(null);
        setPerfil(null);
        setEstaAutenticado(false);
      } finally {
        setCarregando(false);
      }
    };

    void checkAuth();
  }, [buscarPerfil]);

  const login = async (username: string, senha: string): Promise<Usuario | null> => {
    setCarregando(true);
    setError(null);

    try {
      const tokens = await authService.login({ username, senha });
      authStorage.setTokens(tokens.token, tokens.refreshToken);
      const user = getUsuarioFromToken(tokens.token);

      if (!user) {
        throw new Error('Token de autenticacao invalido');
      }

      setUsuario(user);
      setEstaAutenticado(true);
      void buscarPerfil(user.username);
      return user;
    } catch (err) {
      const msg = getErrorMessage(err, 'Erro ao fazer login');
      setError(msg);
      setEstaAutenticado(false);
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const cadastro = async (formData: Omit<CadastroParams, 'planoDTO'>): Promise<void> => {
    setCarregando(true);
    setError(null);

    try {
      await authService.cadastro({
        ...formData,
        planoDTO: {
          id: '',
        },
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Erro ao cadastrar');
      setError(errorMessage);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  const cadastroComLogin = async (
    formData: Omit<CadastroParams, 'planoDTO'>,
    username: string,
    senha: string
  ): Promise<Usuario | null> => {
    setCarregando(true);
    setError(null);

    try {
      await authService.cadastro({
        ...formData,
        planoDTO: {
          id: '',
        },
      });

      return await login(username, senha);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao cadastrar'));
      setEstaAutenticado(false);
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    cacheService.clearAll();
    setUsuario(null);
    setPerfil(null);
    setEstaAutenticado(false);
    authService.redirectToLogin();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        carregando,
        error,
        estaAutenticado,
        login,
        cadastro,
        cadastroComLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
