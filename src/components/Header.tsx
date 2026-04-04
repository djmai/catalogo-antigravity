'use client'

import React, { useState, useEffect, useCallback } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, User, LayoutDashboard, LogIn, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export function Header({ user }: { user?: any }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const supabase = createClient()
  const [branding, setBranding] = useState({
    site_name: 'PREMIUMSTORE',
    logo_url: ''
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const fetchBranding = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_branding')
      .single()
    
    if (data?.value) {
      setBranding(data.value)
    }
  }, [supabase])

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (isDashboard) return null

  const navLinks = [
    { href: '/', label: 'Catálogo' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl transition-all duration-500">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {branding.logo_url ? (
            <div className="h-8 sm:h-10 relative w-32 sm:w-48">
              <NextImage 
                src={branding.logo_url} 
                alt={branding.site_name} 
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105" 
                unoptimized
              />
            </div>
          ) : (
            <>
              <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-primary transition-colors duration-500 shadow-lg group-hover:shadow-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors uppercase">
                {branding.site_name}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-black uppercase tracking-widest transition-colors relative group ${
                pathname === link.href ? 'text-primary' : 'text-slate-600 hover:text-primary'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all group-hover:w-full ${pathname === link.href ? 'w-full' : 'w-0'}`} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block h-8 w-[1px] bg-slate-200 mx-2" />

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button className="rounded-2xl h-11 px-6 bg-slate-900 hover:bg-primary transition-all text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 flex gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Mi Panel
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

          {/* Mobile Menu Trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-slate-900" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 animate-in fade-in slide-in-from-top duration-300">
           <nav className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`text-lg font-black uppercase tracking-widest p-4 rounded-2xl transition-all ${
                    pathname === link.href ? 'bg-primary/10 text-primary' : 'text-slate-600 active:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                 {user ? (
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl">
                        Mi Panel de Control
                      </Button>
                    </Link>
                 ) : (
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest">
                        Acceso Administrativo
                      </Button>
                    </Link>
                 )}
              </div>
           </nav>
        </div>
      )}
    </header>
  )
}
