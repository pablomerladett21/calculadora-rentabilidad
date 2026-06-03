import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/route-client'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { isAdminEmail, normalizeBillingStatus } from '@/lib/admin'

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteSupabaseClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body;
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ error: 'JSON malformado o invalido' }, { status: 400 })
  }

  const clientId = body?.clientId
  const billingStatus = normalizeBillingStatus(body?.billingStatus)

  if (!clientId) {
    return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { error } = await admin
    .from('profiles')
    .update({ billing_status: billingStatus })
    .eq('id', clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const jsonResponse = NextResponse.json({ ok: true })
  response.cookies.getAll().forEach((cookie) => {
    jsonResponse.cookies.set(cookie)
  })
  return jsonResponse
}
