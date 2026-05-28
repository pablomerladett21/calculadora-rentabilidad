-- ============================================================
-- MIGRACIÓN: Gastos Variables — Nueva tabla variable_expenses
-- Copia y pega esto en el Editor SQL de Supabase
-- ============================================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS public.variable_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('shipping', 'packaging', 'marketing', 'supplies', 'freelance', 'other')),
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Habilitar RLS
ALTER TABLE public.variable_expenses ENABLE ROW LEVEL SECURITY;

-- 3. Política: cada usuario solo ve y gestiona los suyos
CREATE POLICY "Users can CRUD own variable expenses"
  ON public.variable_expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ¡Migración completa!
