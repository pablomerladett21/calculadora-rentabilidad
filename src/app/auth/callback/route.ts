import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

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

    if (!existingProfile && !profileError) {
      await supabase.from('profiles').insert({
        id: user.id,
        business_name: buildProfileName(user.email),
      })
    }
  }

  return response
}
