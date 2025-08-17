-- =====================================================
-- MIGRAÇÃO DE STATUS - ATUALIZAR PARA PORTUGUÊS
-- =====================================================
-- Execute este script para atualizar os status antigos para os novos em português

-- Atualizar status antigos para novos em português
UPDATE appointments SET status = 'pendente' WHERE status = 'pending';
UPDATE appointments SET status = 'confirmado' WHERE status = 'confirmed';
UPDATE appointments SET status = 'cancelado' WHERE status = 'cancelled';

-- Verificar se a migração foi bem-sucedida
SELECT 
  status,
  COUNT(*) as quantidade
FROM appointments 
GROUP BY status
ORDER BY status;
