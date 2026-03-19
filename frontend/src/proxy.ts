// src/proxy.ts

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { siteConfig } from '@/config/site'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({ request: { headers: request.headers } })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({ request: { headers: request.headers } })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const currentPath = request.nextUrl.pathname

  // ─── THE MAGIC REDIRECT HELPER ───
  // This ensures Supabase cookies are never destroyed during a redirect
  const safeRedirect = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    if (path === '/login') url.searchParams.set('next', currentPath)
    
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from the Supabase response to the new Redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 1. Let in: Skip login page if already authenticated
  if (user && currentPath === '/login') {
    return safeRedirect('/dashboard')
  }

  // 2. Find the requested feature (Sorted by length to prevent URL overlaps)
  const allFeatures = siteConfig.sidebarCategories.flatMap(cat => cat.items)
  const sortedFeatures = [...allFeatures].sort((a, b) => b.href.length - a.href.length)
  const requestedFeature = sortedFeatures.find(f => currentPath.startsWith(f.href))

  // 3. THE BOUNCER LOGIC
  if (requestedFeature) {
    
    // A. Requires Auth Check
    if (requestedFeature.requiresAuth && !user) {
      return safeRedirect('/login')
    }

    // B. Role-Based Access Control (RBAC) Check
    if (user && requestedFeature.allowedRoles) {
      const userRole = user.user_metadata?.role || 'student'
      
      if (!requestedFeature.allowedRoles.includes(userRole)) {
        console.warn(`Access Denied: User role '${userRole}' blocked from ${currentPath}`)
        return safeRedirect('/dashboard')
      }
    }
  }

  // 4. Fallback: Catch-all for dashboard domain
  if (!user && currentPath.startsWith('/dashboard') && !requestedFeature) {
    return safeRedirect('/login')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};