-- ============================================
-- PARTE 6: Políticas para SALES_ORDER_ITEMS
-- ============================================

DROP POLICY IF EXISTS "Users can view own sales items" ON sales_order_items;
CREATE POLICY "Users can view own sales items" ON sales_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sales_orders 
      WHERE sales_orders.id = sales_order_items.order_id 
      AND sales_orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own sales items" ON sales_order_items;
CREATE POLICY "Users can insert own sales items" ON sales_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders 
      WHERE sales_orders.id = sales_order_items.order_id 
      AND sales_orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own sales items" ON sales_order_items;
CREATE POLICY "Users can delete own sales items" ON sales_order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sales_orders 
      WHERE sales_orders.id = sales_order_items.order_id 
      AND sales_orders.user_id = auth.uid()
    )
  );
