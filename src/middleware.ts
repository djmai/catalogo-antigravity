import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Check if we have a valid session
  const { response, user, supabase } = await updateSession(request)

  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPath = request.nextUrl.pathname.startsWith('/login')

  // 2. Protect dashboard routes
  if (isDashboardPath && !user) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Redirect logged in users away from login page
  if (isLoginPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 4. Role-based protection for dashboard sub-routes
  if (isDashboardPath && user && supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'

    // Admin-only routes
    const adminRoutes = ['/dashboard/usuarios', '/dashboard/ajustes']
    const isAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    
    // Editor/Admin routes
    const editorRoutes = [
      '/dashboard/productos', 
      '/dashboard/categorias', 
      '/dashboard/descuentos', 
      '/dashboard/paquetes',
      '/dashboard/resenas'
    ]
    const isEditorRoute = editorRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (role === 'client') {
      // Clients can ONLY access /dashboard/perfil or /dashboard/wishlist
      const isClientAllowedPath = request.nextUrl.pathname === '/dashboard/perfil' || 
                                 request.nextUrl.pathname === '/dashboard/wishlist'
      
      if (!isClientAllowedPath) {
        return NextResponse.redirect(new URL('/dashboard/perfil', request.url))
      }
    } else if (role === 'editor') {
      // Editors cannot access admin routes
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
