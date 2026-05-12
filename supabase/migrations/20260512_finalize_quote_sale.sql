-- ============================================================
-- BizTracker: Convertir presupuesto en venta en una transaccion
-- ============================================================

CREATE OR REPLACE FUNCTION public.finalize_quote_sale(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_item RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.sales_orders
  SET status = 'finalized'
  WHERE id = p_order_id
    AND user_id = v_user_id
    AND status = 'quote';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found or already finalized';
  END IF;

  FOR v_item IN
    SELECT soi.product_id, soi.quantity
    FROM public.sales_order_items AS soi
    INNER JOIN public.sales_orders AS so
      ON so.id = soi.order_id
    WHERE soi.order_id = p_order_id
      AND so.user_id = v_user_id
  LOOP
    IF v_item.product_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.products_roi
    SET stock_quantity = GREATEST(0, stock_quantity - v_item.quantity)
    WHERE id = v_item.product_id
      AND user_id = v_user_id;

    INSERT INTO public.stock_movements (
      user_id,
      product_id,
      order_id,
      movement_type,
      quantity,
      reason
    ) VALUES (
      v_user_id,
      v_item.product_id,
      p_order_id,
      'out',
      v_item.quantity,
      'Presupuesto convertido a venta'
    );
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_quote_sale(UUID) TO authenticated;
