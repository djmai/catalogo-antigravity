'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success('¡Contraseña actualizada con éxito!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md bg-white border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>
        <CardHeader className="space-y-2 text-center pb-8 pt-12">
          <div className="mx-auto bg-slate-100 h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50">
            <KeyRound className="h-10 w-10 text-teal-600" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight uppercase italic underline decoration-teal-500 underline-offset-8">
            Nueva Contraseña
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm pt-4">
            Ingresa tu nueva clave de acceso para asegurar tu cuenta administrativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 border-gray-200 focus:ring-teal-600 focus:border-teal-600 transition-all rounded-2xl font-bold px-6 bg-slate-50/50"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" title="Confirmar Contraseña" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 border-gray-200 focus:ring-teal-600 focus:border-teal-600 transition-all rounded-2xl font-bold px-6 bg-slate-50/50"
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 text-xs font-black bg-slate-900 hover:bg-teal-600 transition-all text-white shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest rounded-2xl gap-3" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Actualizar Contraseña y Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-12 pt-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase px-4 font-black text-slate-300">
               Premium Store Admin
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
