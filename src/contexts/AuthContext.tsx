import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService } from '../services/adminAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se há uma sessão válida no sessionStorage
    const sessionToken = sessionStorage.getItem('admin_session_token');
    
    if (sessionToken) {
      // Valida a sessão no banco de dados
      adminAuthService.validateSession(sessionToken)
        .then((isValid) => {
          setIsAuthenticated(isValid);
          if (!isValid) {
            // Sessão inválida, remove do storage
            sessionStorage.removeItem('admin_session_token');
          }
        })
        .catch((error) => {
          console.error('Erro ao validar sessão:', error);
          sessionStorage.removeItem('admin_session_token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const sessionToken = await adminAuthService.login(username, password);
      
      if (sessionToken) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_session_token', sessionToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const sessionToken = sessionStorage.getItem('admin_session_token');
      if (sessionToken) {
        await adminAuthService.logout(sessionToken);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsAuthenticated(false);
      sessionStorage.removeItem('admin_session_token');
    }
  };

  // Mostra loading enquanto verifica a sessão
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 