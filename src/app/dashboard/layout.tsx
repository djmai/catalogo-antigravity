import React, { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bell, LayoutDashboard, Home, Menu } from 'lucide-react'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'client'
  const isAdmin = role === 'admin'
  const isEditor = ['admin', 'editor'].includes(role)
  const isClient = role === 'client'
  
  const { data: brandingData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_branding')
    .single()
    
  const branding = brandingData?.value || { site_name: 'PREMIUM HUB', logo_url: '' }

  return (
    <div className="flex h-screen bg-[#f2f4f8] overflow-hidden font-sans">
      
      {/* Sidebar Layout */}
      <aside className="hidden md:flex flex-col bg-[#2B364A] relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        
        {/* User Card inside Sidebar (Top) */}
        <div className="p-8 pb-4 flex flex-col items-center justify-center relative z-10 space-y-3 pt-12">
          <div className="relative">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#7375A5] shadow-xl">
               {profile?.avatar_url ? (
                 <Image 
                   src={profile.avatar_url} 
                   alt="Profile" 
                   fill
                   className="object-cover" 
                   unoptimized
                 />
               ) : (
                 <span className="text-[#2B364A] text-3xl font-black uppercase">
                   {profile?.email?.[0] || 'U'}
                 </span>
               )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#2B364A]"></div>
          </div>
          
          <div className="text-center">
            <h3 className="text-white font-bold text-lg tracking-tight">
              {profile?.full_name || (profile?.email ? profile.email.split('@')[0] : 'Usuario')}
            </h3>
            <p className="text-slate-400 text-sm capitalize font-medium">
              {role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Cliente Premium'}
            </p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <SidebarNav isAdmin={isAdmin} isEditor={isEditor} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 md:h-24 bg-white/50 backdrop-blur-md flex items-center justify-between px-4 md:px-10 shrink-0 relative z-20 w-full border-b border-slate-200/40">
          <div className="flex items-center gap-2 md:gap-4">
            <MobileSidebar isAdmin={isAdmin} isEditor={isEditor} profile={profile} />
            {branding.logo_url ? (
              <div className="h-10 md:h-12 flex items-center relative w-32 md:w-48">
                 <Image 
                   src={branding.logo_url} 
                   alt={branding.site_name} 
                   fill
                   className="object-contain" 
                   unoptimized
                 />
              </div>
            ) : (
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#2B364A] uppercase italic">
                {branding.site_name}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              <Home className="h-4 w-4 text-[#13C8B5]" />
              Volver al Catálogo
            </Link>

            <div className="relative cursor-pointer hover:bg-white p-2.5 rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all group">
              <Bell className="h-5 w-5 text-[#2B364A] group-hover:rotate-12 transition-transform" />
              <div className="absolute top-2.5 right-3 w-2 h-2 bg-[#13C8B5] rounded-full border-2 border-white"></div>
            </div>
            
            <div className="bg-slate-900 group transition-all p-1.5 rounded-2xl shadow-xl flex items-center justify-center sm:pr-5 px-1 sm:gap-3 cursor-pointer">
               <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#ffc64d] flex items-center justify-center shadow-inner group-hover:scale-95 transition-transform">
                 <span className="text-slate-900 text-xs sm:text-sm font-black uppercase">{profile?.email?.[0] || 'U'}</span>
               </div>
               <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-black text-white leading-none capitalize">{profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0]}</span>
                  <span className="text-[9px] font-bold text-[#ffc64d] uppercase tracking-widest mt-1">
                    {role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Cliente'}
                  </span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content - Independent Scroll */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 md:py-10 custom-scrollbar bg-[#f2f4f8]">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
