'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface WishlistToggleProps {
  productId: string
  className?: string
}

export function WishlistToggle({ productId, className = "" }: WishlistToggleProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  const checkWishlist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()
    
    setIsInWishlist(!!data)
    setLoading(false)
  }, [productId, supabase])

  useEffect(() => {
    checkWishlist()
  }, [checkWishlist])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Debes iniciar sesión para guardar productos')
      return
    }

    setToggling(true)
    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
        
        if (error) throw error
        setIsInWishlist(false)
        toast.success('Eliminado de favoritos')
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId })
        
        if (error) throw error
        setIsInWishlist(true)
        toast.success('Agregado a favoritos')
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setToggling(false)
    }
  }

  if (loading) return <div className={`animate-pulse bg-slate-200 rounded-full h-8 w-8 ${className}`}></div>

  return (
    <button 
      onClick={toggleWishlist}
      disabled={toggling}
      className={`group flex items-center justify-center rounded-full transition-all duration-300 ${toggling ? 'opacity-50' : 'hover:scale-110 active:scale-90'} ${isInWishlist ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white/80 backdrop-blur-sm text-rose-500 hover:bg-rose-50'} ${className}`}
    >
      {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />}
    </button>
  )
}
