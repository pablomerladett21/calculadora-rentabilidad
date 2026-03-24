-- ============================================
-- PARTE 3: Políticas para SUBSCRIPTIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;
CREATE POLICY "Users can delete own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);
