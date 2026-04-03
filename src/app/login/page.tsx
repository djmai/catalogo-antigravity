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

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="mx-auto bg-slate-100 h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:rotate-12 duration-300">
            <Lock className="h-8 w-8 text-slate-900" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">Bienvenido</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Ingresa tus credenciales para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-200 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" title="Contraseña" className="text-sm font-bold">Contraseña</Label>
                <a href="#" className="text-xs text-primary hover:underline font-semibold">¿Olvidaste tu contraseña?</a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-gray-200 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-black bg-slate-900 hover:bg-primary transition-all text-white shadow-lg active:scale-95" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-10 pt-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">O acceso rápido demo</span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-11 border-dashed border-gray-300 text-slate-600 hover:border-primary hover:text-primary transition-all rounded-xl text-xs font-bold uppercase tracking-wider group bg-slate-50/50"
              disabled={loading}
              onClick={async () => {
                const adminEmail = 'admin@premiumstore.com'
                const adminPass = 'admin123456'
                setEmail(adminEmail)
                setPassword(adminPass)
                
                setLoading(true)
                try {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: adminPass,
                  })
                  if (error) throw error
                  toast.success('Acceso administrativo concedido')
                  router.push('/dashboard')
                  router.refresh()
                } catch (err: any) {
                  toast.error(err.message || 'Error en acceso rápido')
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">Ingresar como Administrador</span>
              )}
            </Button>
            <p className="text-xs text-muted-foreground italic">
              * Acceso total para gestión del catálogo.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
