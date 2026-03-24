-- ============================================
-- PARTE 4: Políticas para PRODUCTS_ROI
-- ============================================

DROP POLICY IF EXISTS "Users can view own products" ON products_roi;
CREATE POLICY "Users can view own products" ON products_roi
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own products" ON products_roi;
CREATE POLICY "Users can insert own products" ON products_roi
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own products" ON products_roi;
CREATE POLICY "Users can update own products" ON products_roi
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own products" ON products_roi;
CREATE POLICY "Users can delete own products" ON products_roi
  FOR DELETE USING (auth.uid() = user_id);
