'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronRight,
  MessageSquare,
  LayoutDashboard,
  Package,
  Tag,
  Boxes,
  Users,
  LogOut,
  Settings,
  Heart,
  UserCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SidebarNav({ isAdmin, isEditor }: { isAdmin: boolean, isEditor: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Mi Perfil', href: '/dashboard/perfil', icon: UserCircle, show: true },
    { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, show: true },
    { label: 'Resumen', href: '/dashboard', icon: LayoutDashboard, show: isAdmin || isEditor },
    { label: 'Productos', href: '/dashboard/productos', icon: Package, show: isEditor },
    { label: 'Categorías', href: '/dashboard/categorias', icon: Tag, show: isEditor },
    { label: 'Paquetes', href: '/dashboard/paquetes', icon: Boxes, show: isEditor },
    { label: 'Reseñas', href: '/dashboard/resenas', icon: MessageSquare, show: isEditor || isAdmin },
    { label: 'Usuarios', href: '/dashboard/usuarios', icon: Users, show: isAdmin },
    { label: 'Ajustes', href: '#', icon: Settings, show: isAdmin },
  ]

  return (
    <>
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto z-10 relative custom-scrollbar mt-4 w-64">
        {navItems.filter(item => item.show).map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard')
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#ffc64d] text-[#2B364A] shadow-xl shadow-[#ffc64d]/30 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-[#2B364A]' : 'text-slate-500 group-hover:text-[#ffc64d]'} transition-colors`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#2B364A] rounded-full animate-pulse"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 z-10 relative w-full pb-6 mt-auto shrink-0 border-t border-white/5 pt-8">
         <button 
           onClick={handleLogout}
           className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-6"
         >
           <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
           Cerrar Sesión
         </button>

         {/* Footer movido dentro del menú lateral */}
         <div className="px-5 opacity-30">
            <p className="text-[10px] text-white font-black uppercase tracking-[0.2em] leading-relaxed">
              © 2024 PremiumStore<br />
              Todos los derechos reservados.
            </p>
         </div>
      </div>
    </>
  )
}
