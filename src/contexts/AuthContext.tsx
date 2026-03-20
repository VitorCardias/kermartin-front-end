// Contexto para gerenciar estado de autenticação globalmente

import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { type Usuario } from '../types/auth';
import { authService } from '../api/AuthService';
import { jwtDecode } from 'jwt-decode';

type PerfilUsuario = {
  id: string;
  username: string;
  tipoUsuario: "Escritorio" | "Funcionario";
  nomeEscritorio: string;
  idEscritorio: string;
};

interface AuthContextType {
  usuario: Usuario | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  error: string | null;
  estaAutenticado: boolean;
  login: (username: string, senha: string) => Promise<Usuario | null>;
  cadastro: (formData: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  
  // Extrair informações do token JWT
  const getUsuarioFromToken = (token: string): Usuario => {
    try {
      const decoded: any = jwtDecode(token);
      return {
        username: decoded.sub,
        roles: decoded.roles
      };
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return { 
        username: '',
        roles: [] 
      };
    }
  };

  // Buscar perfil do usuário
  const buscarPerfil = async (username: string) => {
    try {
      const { authApi } = await import('../api/AuthService');
      const response = await authApi.get<PerfilUsuario>(`/usuario/perfil/${username}`);
      setPerfil(response.data);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
    }
  };

  // Verificar se há um token salvo ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      setCarregando(true);

      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token || !refreshToken) {
          setEstaAutenticado(false);
          setUsuario(null);
          setPerfil(null);
          setCarregando(false);
          return;
        }

        try {
          const usuario = getUsuarioFromToken(token);
          setUsuario(usuario);
          setEstaAutenticado(true);
          // Buscar perfil em background (não bloqueia a verificação)
          buscarPerfil(usuario.username);
          setCarregando(false);
        } catch (error) {
          try {
            const tokens = await authService.refreshToken(refreshToken);
            localStorage.setItem('token', tokens.token);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            const usuario = getUsuarioFromToken(tokens.token);
            setUsuario(usuario);
            setEstaAutenticado(true);
            buscarPerfil(usuario.username);
            setCarregando(false);
          } catch (refreshError) {
            authService.logout();
            setUsuario(null);
            setPerfil(null);
            setEstaAutenticado(false);
            setCarregando(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setCarregando(false);
      }
    };

    checkAuth();
  }, []);

  
  // Função para login
  const login = async (username: string, senha: string) => {
    setCarregando(true);
    setError(null);
    
    try {
      const tokens = await authService.login({ username, senha });
      
      // Salvar tokens
      localStorage.setItem('token', tokens.token);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Extrair informações do usuário do token
      const user = getUsuarioFromToken(tokens.token);
      setUsuario(user);
      setEstaAutenticado(true);

      // Buscar perfil em background
      buscarPerfil(user.username);

      // Retornar o usuario
      return user;

    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao fazer login');
      setEstaAutenticado(false);

      return null;

    } finally {
      setCarregando(false);
    }
  };
  
  // Função para cadastro de escritorio
  const cadastro = async (formData: any) => {
    setCarregando(true);
    setError(null);
    
    try {
      await authService.cadastro(formData);
      // Após o registro bem-sucedido, decidir:
      // 1. Redirecionar para a página de login
      // 2. Fazer login automaticamente
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setCarregando(false);
    }
  };
  
  // Função para logout
  const logout = () => {
    authService.logout();
    setUsuario(null);
    setPerfil(null);
    setEstaAutenticado(false);
    // Redireciona para a página de login após o logout usando o serviço
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}