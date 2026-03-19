// src/proxy.ts

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { siteConfig } from '@/config/site' // Added for RBAC

export async function proxy(request: NextRequest) {
  // 1. Create a response object that we can modify
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Initialize the Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Securely check if the user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  // 4. THE BOUNCER LOGIC
  const isAccessingDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isAccessingLogin = request.nextUrl.pathname === '/login'

  // KICK OUT: If trying to access dashboard without being logged in
  if (!user && isAccessingDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // LET IN: If already logged in, skip the login page and go straight to dashboard
  if (user && isAccessingLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 5. ROLE-BASED ACCESS CONTROL (RBAC) - Added here safely
  if (user) {
    const currentPath = request.nextUrl.pathname;
    const allFeatures = siteConfig.sidebarCategories.flatMap(cat => cat.items);
    const requestedFeature = allFeatures.find(f => currentPath.startsWith(f.href));

    if (requestedFeature && requestedFeature.allowedRoles) {
      const userRole = user.user_metadata?.role || 'student';
      
      // If the user's role isn't allowed, redirect them back to the main dashboard
      if (!requestedFeature.allowedRoles.includes(userRole)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse
}

// 5. Tell the bouncer which routes to monitor (Ignore static files and images)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};