// src/proxy.ts

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { siteConfig } from '@/config/site' // Added for RBAC and Auth checks

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

  // 4. THE SMART BOUNCER LOGIC
  const currentPath = request.nextUrl.pathname
  const isAccessingDashboard = currentPath.startsWith('/dashboard')
  const isAccessingLogin = currentPath === '/login'

  // LET IN: If already logged in, skip the login page and go straight to dashboard
  if (user && isAccessingLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Check Dashboard Access dynamically based on siteConfig
  if (isAccessingDashboard) {
    // Flatten all features to search through them
    const allFeatures = siteConfig.sidebarCategories.flatMap(cat => cat.items)
    
    // FIX: Sort features by length descending so deeper paths (/dashboard/finder) 
    // are checked BEFORE shallow paths (/dashboard)
    const sortedFeatures = [...allFeatures].sort((a, b) => b.href.length - a.href.length);

    // Find if the current path matches a specific feature exactly, or is a sub-page of it
    const requestedFeature = sortedFeatures.find(f => 
      currentPath === f.href || currentPath.startsWith(`${f.href}/`)
    )

    // Default to strict: Dashboard root and unknown paths require login
    let requiresAuth = true
    if (requestedFeature) {
      requiresAuth = requestedFeature.requiresAuth
    }

    // SOFT GATE: If the route requires auth and there is no user logged in
    if (requiresAuth && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/locked' // Point to our new beautiful locked UI
      url.searchParams.set('redirectedFrom', currentPath) 
      return NextResponse.rewrite(url) // Using rewrite() keeps the layout and URL intact!
    }

    // 5. ROLE-BASED ACCESS CONTROL (RBAC)
    if (user && requestedFeature && requestedFeature.allowedRoles) {
      const userRole = user.user_metadata?.role || 'student'
      
      // If the user's role isn't allowed, redirect them safely back to the main overview
      if (!requestedFeature.allowedRoles.includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

// 6. Tell the bouncer which routes to monitor (Ignore static files and images)
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