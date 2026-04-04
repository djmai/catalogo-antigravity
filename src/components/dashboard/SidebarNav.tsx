'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
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
    router.refresh()
    router.push('/login')
  }

  const adminGroups = [
    {
      title: 'Mi Cuenta',
      items: [
        { label: 'Perfil Profesional', href: '/dashboard/perfil', icon: UserCircle, show: true },
        { label: 'Lista de Deseos', href: '/dashboard/wishlist', icon: Heart, show: true },
      ]
    },
    {
      title: 'Administración',
      items: [
        { label: 'Panel de Control', href: '/dashboard', icon: LayoutDashboard, show: isAdmin || isEditor },
        { label: 'Gestión de Productos', href: '/dashboard/productos', icon: Package, show: isEditor },
        { label: 'Categorías', href: '/dashboard/categorias', icon: Tag, show: isEditor },
        { label: 'Kits y Paquetes', href: '/dashboard/paquetes', icon: Boxes, show: isEditor },
      ]
    },
    {
      title: 'Sistema e Interacción',
      items: [
        { label: 'Reseñas de Clientes', href: '/dashboard/resenas', icon: MessageSquare, show: isEditor || isAdmin },
        { label: 'Usuarios y Accesos', href: '/dashboard/usuarios', icon: Users, show: isAdmin },
        { label: 'Configuración', href: '/dashboard/configuracion', icon: Settings, show: isAdmin },
      ]
    }
  ]

  return (
    <>
      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto z-10 relative custom-scrollbar mt-4 w-64 pb-20">
        {adminGroups.map((group) => (
          <div key={group.title} className="space-y-3">
             <h4 className="px-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 opacity-50">
               {group.title}
             </h4>
             <div className="space-y-2">
                {group.items.filter(item => item.show).map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard')
                  return (
                    <Link 
                      key={item.label} 
                      href={item.href}
                      className={`flex items-center gap-4 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${
                        isActive 
                          ? 'bg-[#ffc64d] text-[#2B364A] shadow-xl shadow-[#ffc64d]/30 scale-[1.02]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-[#2B364A]' : 'text-slate-500 group-hover:text-[#ffc64d]'} transition-colors`} />
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-[#2B364A] rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  )
                })}
             </div>
          </div>
        ))}
      </nav>

      <div className="p-6 z-10 relative w-full pb-6 mt-auto flex-shrink-0 border-t border-white/5 pt-8">
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
              © 2026 PremiumStore<br />
              Todos los derechos reservados.
            </p>
         </div>
      </div>
    </>
  )
}
