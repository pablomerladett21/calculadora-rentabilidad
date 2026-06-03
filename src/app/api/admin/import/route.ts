import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/route-client'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { parseCsv } from '@/lib/csv'

function normalizeBillingCycle(value: string | null | undefined) {
  const normalized = (value || 'monthly').trim().toLowerCase()
  return ['yearly', 'anual', 'annual'].includes(normalized) ? 'yearly' : 'monthly'
}

function normalizeExpenseType(value: string | null | undefined) {
  const normalized = (value || 'software').trim().toLowerCase()

  if (['utility', 'services', 'servicio', 'servicios', 'luz', 'agua', 'internet'].includes(normalized)) return 'utility'
  if (['tax', 'impuesto', 'impuestos'].includes(normalized)) return 'tax'
  if (['insurance', 'seguro', 'seguros'].includes(normalized)) return 'insurance'
  if (['rent', 'alquiler', 'renta'].includes(normalized)) return 'rent'
  if (['salary', 'sueldos', 'sueldo', 'personal', 'nomina'].includes(normalized)) return 'salary'
  if (['other', 'otro', 'otros'].includes(normalized)) return 'other'
  return 'software'
}

function parseSafeFloat(val: string | undefined | null, fallback = 0) {
  const parsed = Number.parseFloat(val || '0')
  return isNaN(parsed) ? fallback : parsed
}

function parseSafeInt(val: string | undefined | null, fallback = 0) {
  const parsed = Number.parseInt(val || '0', 10)
  return isNaN(parsed) ? fallback : parsed
}

function buildProductPayloads(rows: Record<string, string>[], userId: string) {
  return rows
    .filter((row) => row.product_name || row.nombre || row.producto)
    .map((row) => {
      const productName = row.product_name || row.nombre || row.producto
      const materialCost = parseSafeFloat(row.material_cost || row.costo_material || row.costo)
      const timeInvestedHours = parseSafeFloat(row.time_invested_hours || row.horas)
      const hourlyRate = parseSafeFloat(row.hourly_rate || row.tarifa_hora)
      const desiredMarginPercent = parseSafeFloat(row.desired_margin_percent || row.margen, 30)
      const stockQuantity = parseSafeInt(row.stock_quantity || row.stock, 0)
      const stockAlertThreshold = parseSafeInt(row.stock_alert_threshold || row.umbral, 5)
      const totalCost = materialCost + (timeInvestedHours * hourlyRate)
      const suggestedPrice = desiredMarginPercent < 100
        ? totalCost / (1 - (desiredMarginPercent / 100))
        : totalCost

      return {
        user_id: userId,
        product_name: productName,
        material_cost: materialCost,
        time_invested_hours: timeInvestedHours,
        hourly_rate: hourlyRate,
        desired_margin_percent: desiredMarginPercent,
        suggested_price: suggestedPrice,
        stock_quantity: stockQuantity,
        stock_alert_threshold: stockAlertThreshold,
      }
    })
}

type SubscriptionPayload = {
  user_id: string
  name: string
  cost: number
  billing_cycle: 'monthly' | 'yearly'
  category: string | null
  expense_type: string
}

function buildSubscriptionPayloads(rows: Record<string, string>[], userId: string): SubscriptionPayload[] {
  return rows
    .map((row) => {
      const name = row.name || row.nombre || row.proveedor
      if (!name) return null

      return {
        user_id: userId,
        name,
        cost: parseSafeFloat(row.cost || row.costo),
        billing_cycle: normalizeBillingCycle(row.billing_cycle || row.ciclo),
        category: row.category || row.categoria || null,
        expense_type: normalizeExpenseType(row.expense_type || row.tipo_de_gasto || row.tipo),
      }
    })
    .filter((payload): payload is SubscriptionPayload => Boolean(payload))
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteSupabaseClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const formData = await request.formData()
  const clientId = String(formData.get('clientId') || '')
  const importKind = String(formData.get('importKind') || '')
  const file = formData.get('file')

  if (!clientId) {
    return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo CSV invalido' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCsv(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El CSV no tiene filas para importar' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  if (importKind === 'products') {
    const payloads = buildProductPayloads(rows, clientId)

    if (payloads.length === 0) {
      return NextResponse.json({ error: 'No se encontraron productos validos en el CSV' }, { status: 400 })
    }

    let imported = 0
    for (const payload of payloads) {
      const { data: inserted, error } = await admin
        .from('products_roi')
        .insert(payload)
        .select('id')
        .single()

      if (error || !inserted) continue
      imported += 1

      if ((payload.stock_quantity || 0) > 0) {
        await admin.from('stock_movements').insert({
          user_id: clientId,
          product_id: inserted.id,
          movement_type: 'in',
          quantity: payload.stock_quantity,
          reason: `Stock inicial importado por admin para ${payload.product_name}`,
        })
      }
    }

    const jsonResponse = NextResponse.json({ ok: true, imported })
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie)
    })
    return jsonResponse
  }

  if (importKind === 'subscriptions') {
    const payloads = buildSubscriptionPayloads(rows, clientId)

    if (payloads.length === 0) {
      return NextResponse.json({ error: 'No se encontraron gastos validos en el CSV' }, { status: 400 })
    }

    let imported = 0
    for (const payload of payloads) {
      const { error } = await admin.from('subscriptions').insert(payload)
      if (!error) imported += 1
    }

    const jsonResponse = NextResponse.json({ ok: true, imported })
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie)
    })
    return jsonResponse
  }

  return NextResponse.json({ error: 'Tipo de importacion invalido' }, { status: 400 })
}
