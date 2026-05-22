import { NextResponse, type NextRequest } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/route-client'

function buildProfileName(email: string | undefined) {
  if (!email) return null

  const [localPart] = email.split('@')
  if (!localPart) return null

  const cleaned = localPart.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) return null

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectPath = requestUrl.searchParams.get('redirect') || '/dashboard'
  const response = NextResponse.redirect(new URL(redirectPath, request.url))
  const supabase = createRouteSupabaseClient(request, response)

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profileError && existingProfile) {
      await supabase
        .from('profiles')
        .update({
          email: user.email || null,
        })
        .eq('id', user.id)
    } else if (!existingProfile && !profileError) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || null,
        business_name: buildProfileName(user.email),
        billing_status: 'trial',
      })
    }
  }

  return response
}
