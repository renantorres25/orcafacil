import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/cadastro', '/auth/confirm']
const PUBLIC_PREFIXES = ['/orcamento/']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Optimistic check — reads from cookie, no network call
  const { data: { session } } = await supabase.auth.getSession()

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect authenticated users away from public auth pages
  if (isPublic && session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
