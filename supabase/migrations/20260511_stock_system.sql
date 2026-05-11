-- ============================================================
-- BizTracker: Sistema de Stock
-- Aplicar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Agregar columnas de stock a la tabla de productos
ALTER TABLE products_roi
  ADD COLUMN IF NOT EXISTS stock_quantity       NUMERIC  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER  NOT NULL DEFAULT 5;

-- 2. Crear tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id            UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id    UUID       NOT NULL REFERENCES products_roi(id) ON DELETE CASCADE,
  order_id      UUID       REFERENCES sales_orders(id) ON DELETE SET NULL,
  movement_type TEXT       NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity      NUMERIC    NOT NULL,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product  ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user     ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order    ON stock_movements(order_id);

-- 4. Row Level Security
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_movements" ON stock_movements;
CREATE POLICY "users_own_movements" ON stock_movements
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
