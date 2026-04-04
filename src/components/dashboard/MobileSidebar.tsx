'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { Button } from '@/components/ui/button'

interface MobileSidebarProps {
  isAdmin: boolean
  isEditor: boolean
  profile: any
}

export function MobileSidebar({ isAdmin, isEditor, profile }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const role = profile?.role || 'client'

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden text-[#2B364A] hover:bg-slate-100 h-10 w-10 shrink-0" 
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar rendered outside the DOM hierarchy to fix z-index and clip issues */}
      {mounted && createPortal(
        <div className="md:hidden">
          {/* Backdrop */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Sidebar Content */}
          <div className={`fixed inset-y-0 left-0 w-80 bg-[#2B364A] z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
            
            <Button 
               variant="ghost" 
               size="icon" 
               className="absolute top-4 right-4 text-slate-400 hover:text-white"
               onClick={() => setIsOpen(false)}
            >
               <X className="h-6 w-6" />
            </Button>

            {/* User Card inside Sidebar (Top) */}
            <div className="p-8 pb-4 flex flex-col items-center justify-center relative z-10 space-y-3 pt-12">
               <div className="relative">
                 <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#7375A5] shadow-xl">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
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
            <div onClick={() => setIsOpen(false)} className="flex-1 overflow-hidden flex flex-col">
               <SidebarNav isAdmin={isAdmin} isEditor={isEditor} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
