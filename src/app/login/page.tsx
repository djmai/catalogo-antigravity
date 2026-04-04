'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('¡Sesión iniciada con éxito!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) throw error

      toast.success('Se ha enviado un enlace de recuperación a tu correo')
      setIsResetMode(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="mx-auto bg-slate-100 h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:rotate-12 duration-300">
            <Lock className="h-8 w-8 text-slate-900" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight uppercase italic underline decoration-teal-500 underline-offset-8">
            {isResetMode ? 'Recuperar Cuenta' : 'Bienvenido'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {isResetMode 
              ? 'Te enviaremos un enlace para restablecer tu contraseña' 
              : 'Ingresa tus credenciales para acceder al panel.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black ml-1 uppercase tracking-widest text-[9px]">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 border-gray-200 focus:ring-teal-600 focus:border-teal-600 transition-all rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="Contraseña" className="text-sm font-black uppercase tracking-widest text-[9px]">Contraseña</Label>
                  <button 
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-[10px] text-teal-600 hover:text-slate-900 transition-colors font-black uppercase tracking-tighter decoration-teal-200 underline underline-offset-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 border-gray-200 focus:ring-teal-600 focus:border-teal-600 transition-all rounded-xl font-bold"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-xs font-black bg-slate-900 hover:bg-teal-600 transition-all text-white shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-[0.2em]" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'INGRESAR'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-black ml-1 uppercase tracking-widest text-[9px]">Ingresa tu Correo Registrado</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 border-gray-200 focus:ring-teal-600 focus:border-teal-600 transition-all rounded-xl font-bold"
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-xs font-black bg-teal-600 hover:bg-slate-900 transition-all text-white shadow-xl shadow-teal-100 active:scale-95 uppercase tracking-widest" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Enlace de Recuperación'}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setIsResetMode(false)}
                  className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Regresar al Inicio de Sesión
                </button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-12 pt-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase px-4">
              <span className="bg-white px-4 text-slate-300 font-bold tracking-widest text-[8px]">Bienvenido</span>
            </div>
          </div>
          <div className="text-center">
             <p className="text-slate-400 font-medium text-[10px] leading-relaxed italic">
               Si tiene problemas con su acceso, contacte con soporte técnico.
             </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
