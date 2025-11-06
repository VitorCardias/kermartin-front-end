// Contexto para gerenciar estado de autenticação globalmente

import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { type Usuario } from '../types/auth';
import { authService } from '../api/AuthService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  usuario: Usuario | null;
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
  

  // Verificar se há um token salvo ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      setCarregando(true); // Defina como true no início da verificação

      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token || !refreshToken) {
          setEstaAutenticado(false);
          setUsuario(null);
          setCarregando(false); // Verificação rápida: sem tokens
          return;
        }

        try {
          const usuario = getUsuarioFromToken(token);
          setUsuario(usuario);
          setEstaAutenticado(true);
          setCarregando(false); // Token válido
        } catch (error) {
          try {
            const tokens = await authService.refreshToken(refreshToken);
            localStorage.setItem('token', tokens.token);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            const usuario = getUsuarioFromToken(tokens.token);
            setUsuario(usuario);
            setEstaAutenticado(true);
            setCarregando(false); // Refresh bem-sucedido
          } catch (refreshError) {
            authService.logout();
            setUsuario(null);
            setEstaAutenticado(false);
            setCarregando(false); // Falha no refresh
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setCarregando(false); // Erro geral na verificação
      } finally {
        // O finally ainda pode ser útil para logs ou outras ações finais
        console.log('Verificação de autenticação concluída. Carregando:', carregando);
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
    setEstaAutenticado(false);
    // Redireciona para a página de login após o logout usando o serviço
    authService.redirectToLogin();
  };
  
  return (
    <AuthContext.Provider
      value={{
        usuario,
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