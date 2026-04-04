'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Send, Loader2, User, Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    user_email: '',
    comment: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFormData(prev => ({ ...prev, user_email: user.email || '' }))
      }
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor selecciona una puntuación')
      return
    }

    if (!formData.user_email || !formData.comment) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      // Intentamos insertar con user_id para mayor integridad
      let payload: any = {
        product_id: productId,
        rating,
        comment: formData.comment,
        user_email: formData.user_email,
        status: 'pending'
      }

      if (user) {
        payload.user_id = user.id
        payload.status = 'approved' // Registered users auto-approve
      }

      const { error } = await supabase
        .from('reviews')
        .insert([payload])

      if (error) {
        // Fallback si la columna user_id no existe todavía en la DB
        if (error.message.includes('user_id')) {
          const { user_id, ...fallbackPayload } = payload
          const { error: retryError } = await supabase
            .from('reviews')
            .insert([fallbackPayload])
          
          if (retryError) throw retryError
        } else {
          throw error
        }
      }

      toast.success(user ? '¡Gracias! Tu reseña ha sido publicada.' : '¡Reseña enviada! Será publicada tras ser revisada.')
      setRating(0)
      setFormData(prev => ({ ...prev, comment: '' }))
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error('Error al enviar la reseña: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100 overflow-hidden relative group">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#13C8B5]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-black text-[#2B364A] tracking-tight mb-2 flex items-center gap-3 justify-center md:justify-start">
            <MessageSquare className="h-8 w-8 text-[#13C8B5]" />
            Deja tu Reseña
          </h3>
          <p className="text-slate-500 font-medium italic">Tu opinión nos ayuda a ofrecerte siempre lo mejor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="flex flex-col items-center md:items-start gap-4 bg-slate-50/50 p-6 rounded-3xl border border-white">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Puntuación del producto</label>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1
                return (
                  <button
                    key={i}
                    type="button"
                    className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        (hover || rating) >= starValue
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      } transition-colors duration-200`}
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] font-bold text-[#13C8B5] uppercase tracking-widest mt-1">
              {rating > 0 ? `${rating} de 5 estrellas` : 'Selecciona una puntuación'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2 group/input">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2B364A] mb-1 ml-4 transition-colors group-focus-within/input:text-[#13C8B5]">
                {user ? <ShieldCheck className="h-3 w-3 text-[#13C8B5]" /> : <Mail className="h-3 w-3" />}
                {user ? 'Cuenta verificada' : 'Tu correo electrónico'}
              </label>
              {user ? (
                <div className="h-14 bg-[#13C8B5]/5 border border-[#13C8B5]/20 rounded-2xl px-6 flex items-center gap-3">
                   <div className="w-8 h-8 bg-[#13C8B5] rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {user.email?.[0].toUpperCase()}
                   </div>
                   <span className="font-bold text-[#2B364A] text-sm">{user.email}</span>
                   <Badge variant="outline" className="ml-auto bg-white/50 border-[#13C8B5]/30 text-[#13C8B5] text-[8px] uppercase tracking-tighter">Sesión Activa</Badge>
                </div>
              ) : (
                <Input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className="h-14 bg-slate-50 border-white rounded-2xl px-6 font-medium focus:ring-4 focus:ring-[#13C8B5]/5 focus:border-[#13C8B5] transition-all bg-white/50 backdrop-blur-sm shadow-inner"
                />
              )}
            </div>
          </div>

          <div className="space-y-2 group/textarea">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2B364A] mb-1 ml-4 transition-colors group-focus-within/textarea:text-[#13C8B5]">
              <MessageSquare className="h-3 w-3" />
              ¿Qué te pareció el producto?
            </label>
            <Textarea
              placeholder="Escribe aquí tus comentarios detallados..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="min-h-[160px] bg-slate-50 border-white rounded-[32px] px-6 py-4 font-medium focus:ring-4 focus:ring-[#13C8B5]/5 focus:border-[#13C8B5] transition-all resize-none bg-white/50 backdrop-blur-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#2B364A] hover:bg-[#13C8B5] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all duration-500 hover:shadow-[#13C8B5]/20 active:scale-[0.98] group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-3">
                Enviar mi Reseña
                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
          </Button>
          
          <p className="text-center text-[10px] font-medium text-slate-400 px-10 leading-relaxed uppercase tracking-widest">
            * Al enviar tu reseña, aceptas que sea moderada por nuestro equipo antes de su publicación definitiva.
          </p>
        </form>
      </div>
    </div>
  )
}
