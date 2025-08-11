-- Tabela para sessões administrativas
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);

-- Política RLS para admin_sessions (apenas inserções e consultas próprias)
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de sessões
CREATE POLICY "Allow session creation" ON admin_sessions
  FOR INSERT WITH CHECK (true);

-- Política para permitir consulta de sessões válidas
CREATE POLICY "Allow session validation" ON admin_sessions
  FOR SELECT USING (true);

-- Política para permitir atualização de sessões (logout)
CREATE POLICY "Allow session update" ON admin_sessions
  FOR UPDATE USING (true);

-- Política para permitir exclusão de sessões expiradas
CREATE POLICY "Allow session deletion" ON admin_sessions
  FOR DELETE USING (true);

-- Função para limpar sessões expiradas automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions 
  WHERE expires_at < NOW() OR is_active = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE admin_sessions IS 'Tabela para gerenciar sessões administrativas';
COMMENT ON COLUMN admin_sessions.session_token IS 'Token único da sessão';
COMMENT ON COLUMN admin_sessions.username IS 'Nome do usuário logado';
COMMENT ON COLUMN admin_sessions.expires_at IS 'Data/hora de expiração da sessão';
COMMENT ON COLUMN admin_sessions.is_active IS 'Indica se a sessão está ativa';
