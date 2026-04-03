import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)

  // 1. If trying to access dashboard and not logged in, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If logged in but accessing login page, redirect to dashboard or home
  if (request.nextUrl.pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Role-based protection for specific dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!supabase) return response;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    const role = profile?.role || 'client'

    // client role restriction: clients cannot access generic dashboard or admin/editor routes
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/usuarios') || request.nextUrl.pathname.startsWith('/dashboard/ajustes')
    const editorRoutes = ['/dashboard/productos', '/dashboard/categorias', '/dashboard/descuentos', '/dashboard/paquetes']
    const isEditorRoute = editorRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (role === 'client') {
      // Clients can ONLY access /dashboard/perfil or /dashboard/wishlist
      const isClientPath = request.nextUrl.pathname === '/dashboard/perfil' || request.nextUrl.pathname === '/dashboard/wishlist'
      if (!isClientPath) {
        return NextResponse.redirect(new URL('/dashboard/perfil', request.url))
      }
    } else {
      // Admin/Editor logic
      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (isEditorRoute && !['admin', 'editor'].includes(role)) {
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
