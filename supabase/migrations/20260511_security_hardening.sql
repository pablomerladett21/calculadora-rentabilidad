-- ============================================================
-- BizTracker: Security Hardening (RLS reinforcement)
-- Aplicar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Asegurar que RLS esté habilitado en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_roi ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza de políticas antiguas (Opcional pero recomendado para evitar colisiones)
-- DROP POLICY IF EXISTS ...

-- 3. Refuerzo de Políticas para PROFILES (Evitar que usuarios vean otros perfiles)
DROP POLICY IF EXISTS "profiles_self_access" ON profiles;
CREATE POLICY "profiles_self_access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- 4. Refuerzo para PRODUCTS_ROI
DROP POLICY IF EXISTS "products_owner_access" ON products_roi;
CREATE POLICY "products_owner_access" ON products_roi
  FOR ALL USING (auth.uid() = user_id);

-- 5. Refuerzo para SALES_ORDERS
DROP POLICY IF EXISTS "sales_owner_access" ON sales_orders;
CREATE POLICY "sales_owner_access" ON sales_orders
  FOR ALL USING (auth.uid() = user_id);

-- 6. Refuerzo para SALES_ORDER_ITEMS (Acceso via JOIN con sales_orders)
-- Nota: En Supabase, para insertar items, el usuario debe ser dueño de la orden.
DROP POLICY IF EXISTS "items_owner_access" ON sales_order_items;
CREATE POLICY "items_owner_access" ON sales_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sales_orders
      WHERE sales_orders.id = sales_order_items.order_id
      AND sales_orders.user_id = auth.uid()
    )
  );

-- 7. Refuerzo para STOCK_MOVEMENTS
DROP POLICY IF EXISTS "movements_owner_access" ON stock_movements;
CREATE POLICY "movements_owner_access" ON stock_movements
  FOR ALL USING (auth.uid() = user_id);

-- 8. Restringir el rol 'anon' al mínimo absoluto (Idealmente solo login/register)
-- Supabase maneja esto con la API anon, pero asegúrate de no dar permisos innecesarios via GRANT.
