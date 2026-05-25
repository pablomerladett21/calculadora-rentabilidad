export interface ProductRecord {
  id: string
  user_id: string
  product_name: string
  material_cost: number
  time_invested_hours: number
  hourly_rate: number
  desired_margin_percent: number
  suggested_price: number
  stock_quantity: number | null
  stock_alert_threshold: number | null
  created_at: string | null
}

export interface CatalogProduct extends ProductRecord {
  sales_count: number
}

export interface SubscriptionRecord {
  id: string
  user_id: string
  name: string
  cost: number | string
  billing_cycle: 'monthly' | 'yearly'
  category: string | null
  expense_type: string | null
  created_at: string | null
}

export interface SalesOrderItemRecord {
  id?: string
  order_id?: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
}

export interface SalesOrderRecord {
  id: string
  user_id: string
  customer_name: string | null
  customer_phone: string | null
  status: 'quote' | 'finalized'
  subtotal: number
  total_amount: number
  currency_symbol: string
  notes: string | null
  created_at: string
  items: SalesOrderItemRecord[]
}

export interface BusinessProfileRecord {
  id: string
  email: string | null
  business_name: string | null
  logo_url: string | null
  currency_symbol: string
  business_address: string | null
  business_phone: string | null
  website_url: string | null
  instagram_handle: string | null
  whatsapp_phone: string | null
  billing_status: 'trial' | 'paid' | 'disabled'
  is_founder?: boolean | null
}

export interface AdminClientRecord {
  id: string
  email: string
  business_name: string | null
  billing_status: 'trial' | 'paid' | 'disabled'
  product_count: number
  subscription_count: number
  sales_count: number
  created_at: string | null
}
