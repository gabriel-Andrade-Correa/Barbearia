import { supabase } from './supabase';

export interface AdminSession {
  id: string;
  session_token: string;
  username: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

class AdminAuthService {
  // Gera um token único para a sessão
  private generateSessionToken(): string {
    return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cria uma nova sessão no banco de dados
  async createSession(username: string): Promise<string | null> {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      const { data, error } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: sessionToken,
          username: username,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        return null;
      }

      return sessionToken;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }
  }

  // Valida uma sessão existente
  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      // Primeiro, limpa sessões expiradas
      await this.cleanupExpiredSessions();

      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }

  // Invalida uma sessão (logout)
  async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Erro ao invalidar sessão:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
      return false;
    }
  }

  // Limpa sessões expiradas
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
    }
  }

  // Verifica credenciais de login
  async login(username: string, password: string): Promise<string | null> {
    // Credenciais hardcoded (em produção, isso deveria estar no banco)
    if (username === 'Miguel' && password === '1234') {
      return await this.createSession(username);
    }
    return null;
  }

  // Logout
  async logout(sessionToken: string): Promise<boolean> {
    return await this.invalidateSession(sessionToken);
  }
}

export const adminAuthService = new AdminAuthService();
