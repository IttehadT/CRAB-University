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

  // 1. Redirect logged-in users away from the login page
  if (user && currentPath === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Find the requested route in your Single Source of Truth
  const allFeatures = siteConfig.sidebarCategories.flatMap(cat => cat.items)
  
  // We check if the current URL starts with any of our configured feature hrefs
  const requestedFeature = allFeatures.find(f => currentPath.startsWith(f.href))

  // 3. THE MASTER BOUNCER LOGIC
  if (requestedFeature) {
    
    // A. Requires Auth Check
    if (requestedFeature.requiresAuth && !user) {
      const loginUrl = new URL('/login', request.url)
      // Optional: Save where they were trying to go so you can send them back after login
      loginUrl.searchParams.set('next', currentPath) 
      return NextResponse.redirect(loginUrl)
    }

    // B. Role-Based Access Control (RBAC) Check
    if (user && requestedFeature.allowedRoles) {
      // Extract the role from Supabase's secure token (Default to 'student' if missing)
      const userRole = user.user_metadata?.role || 'student'
      
      // If the user's role is not in the allowed list, boot them back to the dashboard
      if (!requestedFeature.allowedRoles.includes(userRole)) {
        console.warn(`Access Denied: ${userRole} attempted to access ${currentPath}`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // 4. Fallback: Protect the entire dashboard domain just in case a sub-route isn't in config
  if (!user && currentPath.startsWith('/dashboard') && !requestedFeature) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};