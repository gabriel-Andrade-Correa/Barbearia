-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS - BARBEARIA
-- =====================================================

-- 1. TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_package TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PACOTES DE SERVIÇOS
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- duração em minutos
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- 3. TABELA DE CONFIGURAÇÕES ADMINISTRATIVAS
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  working_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
  working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  blocked_dates TEXT[] DEFAULT ARRAY[]::TEXT[],
  blocked_time_slots JSONB DEFAULT '[]'::jsonb
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir pacotes de serviços padrão
INSERT INTO service_packages (name, price, duration, description) VALUES
('Corte Masculino', 25.00, 30, 'Corte tradicional masculino'),
('Barba', 20.00, 20, 'Acabamento de barba'),
('Corte + Barba', 40.00, 45, 'Corte completo com barba'),
('Hidratação', 15.00, 15, 'Hidratação capilar'),
('Pigmentação', 30.00, 30, 'Pigmentação de cabelo ou barba')
ON CONFLICT DO NOTHING;

-- Inserir configurações administrativas iniciais
INSERT INTO admin_settings (working_hours, working_days, blocked_dates, blocked_time_slots) VALUES
(
  '{"start": "08:00", "end": "18:00"}',
  ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  ARRAY[]::TEXT[],
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONFIGURAÇÕES DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para appointments
CREATE POLICY "Permitir todas as operações em appointments" ON appointments
  FOR ALL USING (true);

-- Políticas para service_packages
CREATE POLICY "Permitir leitura de pacotes ativos" ON service_packages
  FOR SELECT USING (active = true);

CREATE POLICY "Permitir atualização de pacotes" ON service_packages
  FOR UPDATE USING (true);

-- Políticas para admin_settings
CREATE POLICY "Permitir todas as operações em admin_settings" ON admin_settings
  FOR ALL USING (true);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);

-- Índices para service_packages
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(active);
CREATE INDEX IF NOT EXISTS idx_service_packages_price ON service_packages(price);

-- =====================================================
-- FUNÇÕES ÚTEIS (OPCIONAIS)
-- =====================================================

-- Função para verificar se um horário está disponível
CREATE OR REPLACE FUNCTION is_time_slot_available(
  check_date DATE,
  check_time TIME
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointment_date = check_date 
    AND appointment_time = check_time 
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;

-- Função para obter horários disponíveis de um dia
CREATE OR REPLACE FUNCTION get_available_times(check_date DATE)
RETURNS TABLE(available_time TIME) AS $$
BEGIN
  RETURN QUERY
  SELECT t.time_slot
  FROM (
    SELECT generate_series(
      '08:00'::TIME, 
      '18:00'::TIME, 
      '30 minutes'::INTERVAL
    )::TIME AS time_slot
  ) t
  WHERE NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointment_date = check_date 
    AND appointment_time = t.time_slot 
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;
