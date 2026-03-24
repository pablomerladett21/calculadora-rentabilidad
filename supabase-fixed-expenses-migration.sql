-- ============================================================
-- MIGRACIÓN: Gastos Fijos — Agregar columna expense_type
-- Copia y pega esto en el Editor SQL de Supabase
-- ============================================================

-- Agrega el campo 'expense_type' a la tabla de suscripciones.
-- Los registros existentes quedarán clasificados como 'software' por defecto.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS expense_type TEXT
  DEFAULT 'software'
  CHECK (expense_type IN ('software', 'utility', 'tax', 'insurance', 'rent', 'salary', 'other'));

-- ¡Migración completa!
