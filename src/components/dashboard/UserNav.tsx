'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserCircle, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserNavProps {
  email: string
  role: string
}

export function UserNav({ email, role }: UserNavProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      toast.error('Error al cerrar sesión')
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-2xl bg-slate-50 hover:bg-slate-100">
          <UserCircle className="h-6 w-6 text-slate-900" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-gray-100 shadow-2xl">
        <DropdownMenuLabel className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 truncate">{email}</span>
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-50" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-xl px-4 py-2 text-red-600 focus:text-red-700 focus:bg-red-50 font-bold transition-colors cursor-pointer"
        >
          {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
