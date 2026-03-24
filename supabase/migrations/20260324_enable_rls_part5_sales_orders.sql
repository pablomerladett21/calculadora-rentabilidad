-- ============================================
-- PARTE 5: Políticas para SALES_ORDERS
-- ============================================

DROP POLICY IF EXISTS "Users can view own sales orders" ON sales_orders;
CREATE POLICY "Users can view own sales orders" ON sales_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sales orders" ON sales_orders;
CREATE POLICY "Users can insert own sales orders" ON sales_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sales orders" ON sales_orders;
CREATE POLICY "Users can update own sales orders" ON sales_orders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sales orders" ON sales_orders;
CREATE POLICY "Users can delete own sales orders" ON sales_orders
  FOR DELETE USING (auth.uid() = user_id);
