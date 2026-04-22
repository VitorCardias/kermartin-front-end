import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi, authService, setShowToastCallback } from '../api/AuthService';
import { useToast } from '../components/Toast';
import { type Usuario, type CadastroParams } from '../types/auth';
import { cacheService } from '../utils/cacheService';

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

const PERFIL_STORAGE_KEY = 'perfilUsuario';

interface AuthProviderProps {
  children: ReactNode;
}

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

  const tokenExpirado = (token: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.exp) return false;
      const agoraEmSegundos = Date.now() / 1000;
      return decoded.exp <= agoraEmSegundos + 10;
    } catch {
      return true;
    }
  };

  const salvarPerfilLocal = (perfilUsuario: PerfilUsuario) => {
    localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(perfilUsuario));
  };

  const carregarPerfilLocal = (): PerfilUsuario | null => {
    try {
      const raw = localStorage.getItem(PERFIL_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PerfilUsuario;
    } catch {
      return null;
    }
  };

  const buscarPerfil = useCallback(async (username: string) => {
    try {
      const response = await authApi.get<PerfilUsuario>(`/usuario/perfil/${username}`);
      setPerfil(response.data);
      salvarPerfilLocal(response.data);
    } catch {
      setPerfil(null);
      localStorage.removeItem(PERFIL_STORAGE_KEY);
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
        let token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token || !refreshToken) {
          setEstaAutenticado(false);
          setUsuario(null);
          setPerfil(null);
          localStorage.removeItem(PERFIL_STORAGE_KEY);
          return;
        }

        if (tokenExpirado(token)) {
          try {
            const tokens = await authService.refreshToken(refreshToken);
            localStorage.setItem('token', tokens.token);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            token = tokens.token;
          } catch {
            authService.logout();
            setUsuario(null);
            setPerfil(null);
            setEstaAutenticado(false);
            localStorage.removeItem(PERFIL_STORAGE_KEY);
            return;
          }
        }

        const user = getUsuarioFromToken(token);
        if (!user) {
          authService.logout();
          setUsuario(null);
          setPerfil(null);
          setEstaAutenticado(false);
          localStorage.removeItem(PERFIL_STORAGE_KEY);
          return;
        }

        setUsuario(user);
        setEstaAutenticado(true);

        const perfilCache = carregarPerfilLocal();
        if (perfilCache) {
          setPerfil(perfilCache);
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

  const login = async (username: string, senha: string) => {
    setCarregando(true);
    setError(null);

    try {
      const tokens = await authService.login({ username, senha });

      localStorage.setItem('token', tokens.token);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      const user = getUsuarioFromToken(tokens.token);

      if (!user) {
        throw new Error('Token de autenticacao invalido');
      }

      setUsuario(user);
      setEstaAutenticado(true);
      void buscarPerfil(user.username);
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setError(msg);
      setEstaAutenticado(false);
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const cadastro = async (formData: Omit<CadastroParams, 'planoDTO'>) => {
    setCarregando(true);
    setError(null);

    try {
      await authService.cadastro({
        ...formData,
        planoDTO: {
          id: '',
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
      setEstaAutenticado(false);
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    authService.logout();
    cacheService.clearAll();
    setUsuario(null);
    setPerfil(null);
    setEstaAutenticado(false);
    localStorage.removeItem(PERFIL_STORAGE_KEY);
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
