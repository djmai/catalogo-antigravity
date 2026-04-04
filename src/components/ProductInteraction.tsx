'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ReviewForm } from './ReviewForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SafeImage } from './dashboard/SafeImage'
import { 
  Check, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Boxes, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Heart,
  Share2,
  Loader2,
  Copy
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { ProductCard } from '@/components/ProductCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogHeader
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ProductInteractionProps {
  product: any
  relatedProducts: any[]
  packageOffer?: any
  reviews?: any[]
}

export function ProductInteraction({ product, relatedProducts, packageOffer, reviews = [] }: ProductInteractionProps) {
  const router = useRouter()
  const supabase = createClient()
  const now = new Date()
  
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(true)

  const activeDiscount = product.discounts?.find((d: any) => {
    const start = new Date(d.start_date)
    const end = new Date(d.end_date)
    return now >= start && now <= end
  })

  // Set initial active image safely
  const images = product.product_images || []
  const [activeImg, setActiveImg] = useState<string | null>(images.length > 0 ? images[0].image_url : null)

  const basePrice = product.base_price
  let discountedPrice = basePrice
  const hasDiscount = !!activeDiscount

  if (activeDiscount) {
    if (activeDiscount.type === 'percentage') {
      discountedPrice = basePrice * (1 - activeDiscount.value / 100)
    } else {
      discountedPrice = Math.max(0, basePrice - activeDiscount.value)
    }
  }

  // Check wishlist on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsCheckingWishlist(false)
          return
        }

        const { data } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single()
        
        setIsInWishlist(!!data)
      } catch (error) {
        console.error("Error checking wishlist:", error)
      } finally {
        setIsCheckingWishlist(false)
      }
    }
    checkStatus()
  }, [product.id, supabase])

  const handleImageChange = (url: string) => {
    setActiveImg(url)
  }

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const el = document.getElementById('thumbnail-container')
    if (el) {
      const scrollAmount = 200
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  const toggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Debes iniciar sesión para usar la lista de deseos')
      return
    }

    setIsTogglingWishlist(true)
    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
        
        if (error) throw error
        setIsInWishlist(false)
        toast.success('Eliminado de tu lista')
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product.id })
        
        if (error) throw error
        setIsInWishlist(true)
        toast.success('¡Agregado a tu lista!')
      }
    } catch (error: any) {
      toast.error('Error al actualizar wishlist')
      console.error(error)
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description_short || '¡Mira este producto increíble!',
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('¡Enlace copiado al portapapeles!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        
        {/* Left Column: Image Section */}
        <div className="space-y-8">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#f8fcfb] border border-slate-100 group shadow-sm transition-all duration-500 hover:shadow-2xl flex items-center justify-center cursor-zoom-in h-[400px] md:h-[500px]">
                <SafeImage
                  src={activeImg}
                  alt={product.name}
                  className="p-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-2xl translate-z-0"
                />
                {hasDiscount && (
                  <div className="absolute top-6 left-6 bg-[#13C8B5] text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg tracking-widest uppercase">
                    OFERTA
                  </div>
                )}
                <div 
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/50 hover:bg-[#13C8B5] hover:text-white cursor-pointer"
                >
                   <Share2 className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center h-[85vh] rounded-[40px]">
               <DialogHeader className="sr-only">
                  <DialogTitle>{product.name}</DialogTitle>
               </DialogHeader>
               <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-12">
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentIndex = images.findIndex((img: any) => img.image_url === activeImg);
                          const prevIndex = (currentIndex - 1 + images.length) % images.length;
                          setActiveImg(images[prevIndex].image_url);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 rounded-full shadow-2xl flex items-center justify-center text-[#2B364A] hover:bg-[#13C8B5] hover:text-white transition-all active:scale-90 border border-slate-100"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentIndex = images.findIndex((img: any) => img.image_url === activeImg);
                          const nextIndex = (currentIndex + 1) % images.length;
                          setActiveImg(images[nextIndex].image_url);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 rounded-full shadow-2xl flex items-center justify-center text-[#2B364A] hover:bg-[#13C8B5] hover:text-white transition-all active:scale-90 border border-slate-100"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  <SafeImage 
                    src={activeImg} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-500"
                  />
                  <div className="absolute bottom-6 bg-slate-900/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-sm md:hidden">
                    Pulsa fuera para cerrar
                  </div>
               </div>
            </DialogContent>
          </Dialog>
          
          <div className="relative group/thumbs">
            {images.length > 4 && (
              <>
                <button 
                  onClick={() => scrollThumbnails('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#13C8B5] transition-all opacity-0 group-hover/thumbs:opacity-100"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => scrollThumbnails('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#13C8B5] transition-all opacity-0 group-hover/thumbs:opacity-100"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div 
              id="thumbnail-container"
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x no-scrollbar"
            >
              {images.map((img: any) => (
                <button 
                  key={img.id} 
                  onClick={() => handleImageChange(img.image_url)}
                  className={`relative flex-shrink-0 w-24 sm:w-28 h-24 sm:h-28 aspect-square overflow-hidden rounded-2xl bg-white border-2 transition-all duration-500 snap-start flex items-center justify-center ${
                    activeImg === img.image_url 
                      ? 'border-[#13C8B5] shadow-md ring-4 ring-[#13C8B5]/10' 
                      : 'border-slate-100 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                >
                  <SafeImage
                    src={img.image_url}
                    alt="thumbnail"
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Info Section */}
        <div className="flex flex-col py-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[#13C8B5] border-[#13C8B5]/30 bg-[#13C8B5]/5 px-3 py-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">
              {product.categories?.name || 'Nuevo Ingreso'}
            </Badge>
            <div className="flex gap-2">
               <button 
                 onClick={() => router.back()}
                 className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
               >
                 <ChevronLeft className="h-5 w-5" />
               </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#2B364A] leading-tight mb-4 tracking-tight uppercase italic underline decoration-[#13C8B5]/20 underline-offset-8">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => {
                const avgRating = reviews.length > 0 
                  ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
                  : 0
                return (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                )
              })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400"> ({reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'})</span>
          </div>

          <div className="mb-8">
            {basePrice > 0 ? (
              hasDiscount ? (
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-300 line-through tracking-wider">{formatPrice(basePrice)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-[#21A3A3] tracking-tighter italic">
                      {formatPrice(discountedPrice)}
                    </span>
                    <div className="bg-[#6CF3D5]/20 text-[#21A3A3] px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest">
                      -{activeDiscount.type === 'percentage' ? `${activeDiscount.value}%` : `${formatPrice(activeDiscount.value)}`} dcto.
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-black text-[#2B364A] tracking-tighter italic italic">
                  {formatPrice(basePrice)}
                </span>
              )
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl inline-block group hover:bg-slate-900 transition-colors duration-500 hover:border-slate-800">
                <span className="text-2xl font-black text-[#21A3A3] tracking-tight uppercase group-hover:text-[#ffc64d] transition-colors">{product.is_kit ? "Cotizar Paquete" : "Solicitar Cotización"}</span>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none group-hover:text-white/40">Exclusividad bajo pedido</p>
              </div>
            )}
          </div>

          <Separator className="bg-slate-100 mb-8" />

          <div className="flex flex-wrap gap-4 items-center mb-8">
            <Link href="/contacto" className="w-full">
              <Button className="w-full h-16 bg-[#2B364A] hover:bg-[#13C8B5] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95 group">
                {basePrice > 0 ? "CONSULTAR DISPONIBILIDAD" : "SOLICITAR INFORMACIÓN EXCLUSIVA"}
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-8 mb-10">
            <button 
              onClick={toggleWishlist}
              disabled={isCheckingWishlist || isTogglingWishlist}
              className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${isInWishlist ? 'text-rose-500' : 'text-slate-400 hover:text-[#21A3A3]'}`}
            >
               {isTogglingWishlist ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
               )}
               {isInWishlist ? 'EN MIS FAVORITOS' : 'AGREGAR A FAVORITOS'}
            </button>
          </div>

          <Separator className="bg-slate-100 mb-6" />

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs">
                <span className="font-black text-slate-900 uppercase tracking-tighter">Colección:</span>
                <span className="text-slate-500 font-bold uppercase">{product.categories?.name || 'General'}</span>
             </div>
             
             {product.tags && product.tags.length > 0 && (
               <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-900">Estilo:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-50 text-[#13C8B5] border border-[#13C8B5]/10 font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-lg">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
               </div>
             )}

             <div className="flex items-center gap-4 pt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Compartir:</span>
                <div className="flex gap-3">
                   <button 
                     onClick={handleShare}
                     className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#13C8B5] hover:text-white transition-all duration-300 shadow-sm"
                   >
                     <Share2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('¡Enlace copiado!');
                     }}
                     className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                   >
                     <Copy className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-center bg-transparent gap-10 border-b border-slate-100 rounded-none h-14 mb-12">
            <TabsTrigger value="description" className="data-[state=active]:text-[#21A3A3] data-[state=active]:border-b-4 data-[state=active]:border-[#21A3A3] rounded-none bg-transparent text-slate-400 font-black uppercase text-xs tracking-[0.2em] px-4 hover:text-slate-900 transition-all">
               Ficha del Producto
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:text-[#21A3A3] data-[state=active]:border-b-4 data-[state=active]:border-[#21A3A3] rounded-none bg-transparent text-slate-400 font-black uppercase text-xs tracking-[0.2em] px-4 hover:text-slate-900 transition-all">
               Experiencias ({reviews.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-0 text-slate-500 leading-relaxed text-[15px] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
             <div className="prose prose-slate max-w-none text-center lg:text-left">
                <p className="whitespace-pre-wrap font-medium italic mb-10 text-slate-400 leading-loose">
                   {product.description_long || product.description_short || "Este artículo de nuestra colección exclusive cuenta con garantía de autenticidad y alta calidad."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-slate-50 p-10 rounded-[40px] border border-white">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="h-5 w-5 text-indigo-500" />
                         <p className="text-xs font-black uppercase text-slate-900">Calidad Grantizada</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <Truck className="h-5 w-5 text-indigo-500" />
                         <p className="text-xs font-black uppercase text-slate-900">Envíos Asegurados</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <Boxes className="h-5 w-5 text-indigo-500" />
                         <p className="text-xs font-black uppercase text-slate-900">Disponibilidad Limitada</p>
                      </div>
                   </div>
                </div>
             </div>
          </TabsContent>
          <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-12">
             <div className="pt-8 border-b border-slate-100 pb-12">
                <h4 className="text-2xl font-black text-[#2B364A] tracking-tight mb-8 flex items-center gap-3 italic uppercase italic">
                  <Star className="h-6 w-6 text-amber-400 fill-current" />
                  Sensaciones Premium
                </h4>
                {reviews.length > 0 ? (
                  <div className="space-y-6 py-6">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-white rounded-[35px] p-8 border border-slate-50 shadow-sm hover:shadow-xl transition-all duration-500 group">
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="h-14 w-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center font-black text-white shadow-2xl transition-transform group-hover:scale-110">
                                  {r.user_email[0].toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-[#2B364A] uppercase tracking-tighter">{r.user_email.split('@')[0]}</p>
                                  <div className="flex text-amber-400 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-slate-100'}`} />
                                    ))}
                                  </div>
                               </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                              {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                         </div>
                         <div className="bg-slate-50/50 p-8 rounded-[25px] border border-white italic text-slate-600 font-medium leading-relaxed">
                            &quot;{r.comment}&quot;
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400 italic bg-slate-50/30 rounded-[40px] border border-dashed border-slate-200">
                    Aún no hay opiniones para este objeto de lujo.
                  </div>
                )}
             </div>
             <div className="max-w-2xl mx-auto pt-8">
                <ReviewForm productId={product.id} onSuccess={() => router.refresh()} />
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <section className="pt-20 border-t border-slate-100">
          <div className="flex flex-col items-center mb-16 text-center">
            <Badge className="bg-[#13C8B5] text-white border-none font-black text-[9px] uppercase tracking-[0.4em] mb-4">Descubre más</Badge>
            <h2 className="text-4xl font-black text-[#2B364A] tracking-tighter uppercase italic">Selección Exclusive Recomendada</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-20 md:gap-y-32 pt-16 md:pt-20 pb-8 mt-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
