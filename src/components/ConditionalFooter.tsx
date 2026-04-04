'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Ocultar si estamos en cualquier parte del dashboard
  if (pathname.startsWith('/dashboard')) return null

  const currentYear = new Date().getFullYear()
  const supabase = createClient()
  const [siteName, setSiteName] = useState('PREMIUMSTORE')

  useEffect(() => {
    async function fetchBranding() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_branding')
        .single()
      
      if (data?.value?.site_name) {
        setSiteName(data.value.site_name)
      }
    }
    fetchBranding()
  }, [])

  return (
    <footer className="mt-auto border-t border-slate-100 bg-white py-12 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">PROPIEDAD INTELECTUAL</p>
            <p className="text-sm text-slate-800 font-bold tracking-tight">
              © {currentYear} <span className="text-slate-900 font-black uppercase">{siteName}</span>. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center md:text-right">DESARROLLO WEB</p>
            <p className="text-sm text-slate-600 font-medium">
              Diseñado por{' '}
              <Link 
                href="https://mmartinezdev.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-900 font-black hover:text-[#13C8B5] transition-colors decoration-2 decoration-[#13C8B5]/30 underline-offset-4 underline"
              >
                Miguel Martinez
              </Link>
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
