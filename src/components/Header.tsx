'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, ShoppingBag, User, LayoutDashboard, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export function Header({ user }: { user?: any }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  // If we are in the dashboard, we might want a different header or no header at all 
  // because the dashboard has its own layout. 
  // But for the public site, we want this premium one.
  if (isDashboard) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl transition-all duration-500">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-primary transition-colors duration-500 shadow-lg group-hover:shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors">
            PREMIUM<span className="text-slate-400 font-medium">STORE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link href="/" className="text-sm font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-colors relative group">
            Catálogo
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="/#nosotros" className="text-sm font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-colors relative group">
            Nosotros
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="/#contacto" className="text-sm font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-colors relative group">
            Contacto
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-4">

          
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          {user ? (
            <Link href="/dashboard">
              <Button className="rounded-2xl h-11 px-6 bg-slate-900 hover:bg-primary transition-all text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 flex gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Panel Admin
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="rounded-2xl h-11 px-6 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-black text-xs uppercase tracking-widest active:scale-95 flex gap-2">
                <LogIn className="h-4 w-4" />
                Ingresar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
