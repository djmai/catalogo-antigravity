'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Loader2,
  PackageSearch,
  Zap,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product:products (
            id,
            name,
            slug,
            description_short,
            base_price,
            is_active,
            images:product_images (
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
      
      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      toast.error('Error al cargar wishlist: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Producto eliminado')
      setItems(items.filter(item => item.id !== id))
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#13C8B5]" />
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-rose-50 rounded-[22px] flex items-center justify-center shadow-lg shadow-rose-100/50">
               <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mb-1">Mi Lista de Deseos</h2>
               <p className="text-slate-400 font-bold text-sm">Productos exclusivos que has guardado para después.</p>
            </div>
         </div>
         <Badge className="bg-slate-900 text-[#ffc64d] px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl border-none">
            {items.length} ARTÍCULOS
         </Badge>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[50px] p-24 shadow-2xl shadow-slate-200/50 border border-white text-center flex flex-col items-center group">
           <div className="h-32 w-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
              <PackageSearch className="h-16 w-16 text-slate-200" />
           </div>
           <h3 className="text-3xl font-black text-slate-400 mb-4 tracking-tight uppercase italic">Tu lista está vacía</h3>
           <p className="text-slate-400 font-medium max-w-sm mb-10 text-lg">Explora nuestro catálogo exclusivo y guarda los productos que más te gusten.</p>
           <Button asChild className="h-14 px-12 rounded-[20px] bg-[#2B364A] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
              <Link href="/productos">Ir al Catálogo <ArrowRight className="ml-3 h-4 w-4" /></Link>
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {items.map((item) => {
            const product = item.product;
            const imageUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800';
            
            return (
              <div key={item.id} className="group bg-white rounded-[24px] md:rounded-[45px] p-3 md:p-6 shadow-xl border border-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-slate-50 rounded-bl-[60px] md:rounded-bl-[100px] -mr-6 -mt-6 md:-mr-10 md:-mt-10 group-hover:bg-rose-50 transition-colors duration-500"></div>
                
                <div className="relative mb-3 md:mb-6">
                  {/* Image Holder */}
                  <div className="aspect-square rounded-[18px] md:rounded-[35px] overflow-hidden bg-slate-100 shadow-inner group-hover:scale-95 transition-transform duration-700">
                     <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 origin-center"
                     />
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 md:top-4 md:right-4 h-8 w-8 md:h-11 md:w-11 bg-white/90 backdrop-blur-md shadow-xl rounded-lg md:rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 z-10 hover:scale-110"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  
                  {/* Floating Price Tag */}
                  <div className="absolute -bottom-2 md:-bottom-4 left-2 md:left-6 py-1 px-3 md:py-2.5 md:px-6 bg-slate-900 rounded-[12px] md:rounded-[18px] shadow-2xl border border-slate-800 flex items-center gap-2 group-hover:scale-105 transition-transform">
                      <span className="text-[#ffc64d] font-black text-xs md:text-lg">${product.base_price}</span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 pt-3 md:pt-4">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#13C8B5]">
                     <Zap className="h-2 w-2 md:h-3 md:w-3" />
                     <span>Disponible</span>
                  </div>
                  <h3 className="text-xs md:text-xl font-bold text-slate-800 mb-1 md:mb-2 line-clamp-2 leading-tight group-hover:text-slate-900">{product.name}</h3>
                  <p className="hidden md:block text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed mb-6 h-8 opacity-80">
                    {product.description_short || 'Sin descripción disponible para este producto premium.'}
                  </p>
                  
                  <div className="flex gap-2 mt-auto pt-2 md:pt-0">
                    <Button asChild className="flex-1 h-8 md:h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all">
                       <Link href={`/productos/${product.slug}`}>Ver</Link>
                    </Button>
                    <Button variant="outline" className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-0">
                       <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
