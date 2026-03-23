-- ============================================================
-- MIGRACIÓN: Módulo de Ventas - BizTracker
-- Copia y pega esto en el Editor SQL de Supabase
-- ============================================================

-- 1. Crear la tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products_roi(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sale_price   NUMERIC(10, 2) NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  total        NUMERIC(10, 2) GENERATED ALWAYS AS (sale_price * quantity) STORED,
  sold_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes        TEXT
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 3. Política RLS: cada usuario solo ve sus propias ventas
CREATE POLICY "Users can manage their own sales"
  ON public.sales
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Índice para consultas rápidas por fecha y usuario
CREATE INDEX IF NOT EXISTS sales_user_sold_at_idx ON public.sales(user_id, sold_at DESC);

-- ¡Listo! La tabla está configurada.
