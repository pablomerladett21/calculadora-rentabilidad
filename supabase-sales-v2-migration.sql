-- ============================================================
-- MIGRACIÓN: Ventas Multi-Producto y Presupuestos (V2)
-- Copia y pega esto en el Editor SQL de Supabase
-- ============================================================

-- 1. Tabla de Órdenes/Ventas (Cabecera)
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name   TEXT,
  customer_email  TEXT,
  customer_phone  TEXT,
  status          TEXT NOT NULL DEFAULT 'finalized', -- 'finalized' (venta), 'quote' (presupuesto)
  subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency_symbol TEXT DEFAULT '$',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Ítems (Detalle)
CREATE TABLE IF NOT EXISTS public.sales_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products_roi(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(12, 2) NOT NULL,
  total_price   NUMERIC(12, 2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY "Users can manage their own orders" 
  ON public.sales_orders FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own order items" 
  ON public.sales_order_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_orders 
      WHERE id = sales_order_items.order_id AND user_id = auth.uid()
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_orders 
      WHERE id = sales_order_items.order_id AND user_id = auth.uid()
    )
  );

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_sales_orders_user_status ON public.sales_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON public.sales_order_items(order_id);

-- Opcional: Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_orders_updated_at
    BEFORE UPDATE ON public.sales_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ¡Migración V2 completa!
