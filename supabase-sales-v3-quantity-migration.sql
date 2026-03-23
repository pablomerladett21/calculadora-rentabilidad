-- ============================================================
-- MIGRACIÓN V3: Soporte para cantidades con decimales (fracciones)
-- Copia y pega esto en el Editor SQL de Supabase
-- ============================================================

-- Modificar la columna 'quantity' para que acepte decimales (Ej: 0.5, 1.5)
-- Se usa NUMERIC(12, 4) para permitir hasta 4 decimales de precisión.
ALTER TABLE public.sales_order_items ALTER COLUMN quantity TYPE NUMERIC(12, 4);

-- ¡Migración completa!
