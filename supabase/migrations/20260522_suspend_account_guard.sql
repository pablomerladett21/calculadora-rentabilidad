-- ============================================================
-- Bloqueo de escritura para cuentas suspendidas
-- Aplicar en: Supabase Dashboard > SQL Editor
-- ============================================================

create schema if not exists private;

create or replace function private.is_account_active(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = private, public
as $$
  select coalesce(
    (
      select billing_status <> 'disabled'
      from public.profiles
      where id = p_user_id
    ),
    true
  );
$$;

grant execute on function private.is_account_active(uuid) to authenticated;

-- Perfiles: lectura normal, escritura permitida para el propio usuario
drop policy if exists "profiles_self_access" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Productos
drop policy if exists "Users can view own products" on products_roi;
drop policy if exists "Users can insert own products" on products_roi;
drop policy if exists "Users can update own products" on products_roi;
drop policy if exists "Users can delete own products" on products_roi;
drop policy if exists "products_owner_access" on products_roi;

create policy "products_select_own" on products_roi
  for select using (auth.uid() = user_id);

create policy "products_insert_active" on products_roi
  for insert with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "products_update_active" on products_roi
  for update using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "products_delete_active" on products_roi
  for delete using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

-- Suscripciones / gastos fijos
drop policy if exists "Users can view own subscriptions" on subscriptions;
drop policy if exists "Users can insert own subscriptions" on subscriptions;
drop policy if exists "Users can update own subscriptions" on subscriptions;
drop policy if exists "Users can delete own subscriptions" on subscriptions;

create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_active" on subscriptions
  for insert with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "subscriptions_update_active" on subscriptions
  for update using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "subscriptions_delete_active" on subscriptions
  for delete using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

-- Ventas / presupuestos
drop policy if exists "Users can view own sales orders" on sales_orders;
drop policy if exists "Users can insert own sales orders" on sales_orders;
drop policy if exists "Users can update own sales orders" on sales_orders;
drop policy if exists "Users can delete own sales orders" on sales_orders;
drop policy if exists "sales_owner_access" on sales_orders;

create policy "sales_select_own" on sales_orders
  for select using (auth.uid() = user_id);

create policy "sales_insert_active" on sales_orders
  for insert with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "sales_update_active" on sales_orders
  for update using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "sales_delete_active" on sales_orders
  for delete using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

-- Items de venta
drop policy if exists "items_owner_access" on sales_order_items;
drop policy if exists "Users can view own sales order items" on sales_order_items;
drop policy if exists "Users can insert own sales order items" on sales_order_items;
drop policy if exists "Users can update own sales order items" on sales_order_items;
drop policy if exists "Users can delete own sales order items" on sales_order_items;

create policy "sales_order_items_select_own" on sales_order_items
  for select using (
    exists (
      select 1
      from sales_orders
      where sales_orders.id = sales_order_items.order_id
        and sales_orders.user_id = auth.uid()
    )
  );

create policy "sales_order_items_insert_active" on sales_order_items
  for insert with check (
    exists (
      select 1
      from sales_orders
      where sales_orders.id = sales_order_items.order_id
        and sales_orders.user_id = auth.uid()
    )
    and private.is_account_active(auth.uid())
  );

create policy "sales_order_items_update_active" on sales_order_items
  for update using (
    exists (
      select 1
      from sales_orders
      where sales_orders.id = sales_order_items.order_id
        and sales_orders.user_id = auth.uid()
    )
    and private.is_account_active(auth.uid())
  )
  with check (
    exists (
      select 1
      from sales_orders
      where sales_orders.id = sales_order_items.order_id
        and sales_orders.user_id = auth.uid()
    )
    and private.is_account_active(auth.uid())
  );

create policy "sales_order_items_delete_active" on sales_order_items
  for delete using (
    exists (
      select 1
      from sales_orders
      where sales_orders.id = sales_order_items.order_id
        and sales_orders.user_id = auth.uid()
    )
    and private.is_account_active(auth.uid())
  );

-- Movimientos de stock
drop policy if exists "Users can view own stock movements" on stock_movements;
drop policy if exists "Users can insert own stock movements" on stock_movements;
drop policy if exists "Users can update own stock movements" on stock_movements;
drop policy if exists "Users can delete own stock movements" on stock_movements;
drop policy if exists "movements_owner_access" on stock_movements;

create policy "stock_movements_select_own" on stock_movements
  for select using (auth.uid() = user_id);

create policy "stock_movements_insert_active" on stock_movements
  for insert with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "stock_movements_update_active" on stock_movements
  for update using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );

create policy "stock_movements_delete_active" on stock_movements
  for delete using (
    auth.uid() = user_id
    and private.is_account_active(auth.uid())
  );
