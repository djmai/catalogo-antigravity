'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  GitCompare,
  Share2
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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ProductInteractionProps {
  product: any
  relatedProducts: any[]
  packageOffer?: any
}

export function ProductInteraction({ product, relatedProducts, packageOffer }: ProductInteractionProps) {
const now = new Date()
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        
        {/* Left Column: Image Section */}
        <div className="space-y-8">
          {/* Main Display Image with Zoom Effect */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#f8fcfb] border border-slate-100 group shadow-sm transition-all duration-500 hover:shadow-2xl flex items-center justify-center cursor-zoom-in">
                <SafeImage
                  src={activeImg}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 group-hover:drop-shadow-2xl translate-z-0"
                />
                {hasDiscount && (
                  <div className="absolute top-6 left-6 bg-[#13C8B5] text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg tracking-widest uppercase">
                    OFERTA
                  </div>
                )}
                <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-white/50">
                   <Share2 className="w-5 h-5 text-[#2B364A] animate-pulse" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center h-[90vh]">
               <DialogHeader>
                  <VisuallyHidden>
                    <DialogTitle>{product.name}</DialogTitle>
                  </VisuallyHidden>
               </DialogHeader>
               <div className="relative w-full h-full flex items-center justify-center p-4">
                  <SafeImage 
                    src={activeImg} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-500"
                  />
               </div>
            </DialogContent>
          </Dialog>
          
          {/* Thumbnail Selector with Arrows */}
          <div className="relative group/thumbs">
            {product.product_images && product.product_images.length > 4 && (
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
              {product.product_images?.map((img: any) => (
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
          {/* Header & Navigation */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[#13C8B5] border-[#13C8B5]/30 bg-[#13C8B5]/5 px-3 py-1 font-bold uppercase text-[10px] tracking-widest">
              {product.categories?.name || 'Nuevo'}
            </Badge>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-[#2B364A] leading-tight mb-4 tracking-tight">
            {product.name}
          </h1>

          {/* Rating Simulation */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-slate-200" />)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400"> (0 reseñas)</span>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            {hasDiscount ? (
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-300 line-through tracking-wider">{formatPrice(basePrice)}</span>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-[#21A3A3] tracking-tighter">
                    {formatPrice(discountedPrice)}
                  </span>
                  <div className="bg-[#6CF3D5]/20 text-[#21A3A3] px-3 py-1 rounded-full font-black text-xs">
                    -{activeDiscount.type === 'percentage' ? `${activeDiscount.value}%` : `${formatPrice(activeDiscount.value)} OFF`}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-4xl font-black text-[#2B364A] tracking-tighter">
                {formatPrice(basePrice)}
              </span>
            )}
          </div>

          <Separator className="bg-slate-100 mb-8" />

          {/* Short Decription */}
          <p className="text-slate-500 leading-relaxed font-medium mb-10 text-[15px]">
            {product.description_short || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."}
          </p>

          {/* Actions: Quantity & Buy */}
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <Link href="/#contacto" className="w-full">
              <Button className="w-full h-14 bg-[#2B364A] hover:bg-[#13C8B5] text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-95 group">
                Consultar Disponibilidad
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-6 mb-10">
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-[#21A3A3] transition-colors">
              <Heart className="w-4 h-4" /> Lista de deseos
            </button>
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-[#21A3A3] transition-colors">
              <GitCompare className="w-4 h-4" /> Comparar
            </button>
          </div>

          <Separator className="bg-slate-100 mb-6" />

          {/* Meta Information */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">Categorías:</span>
                <span className="text-slate-500 font-medium">{product.categories?.name || 'General'}, Laptops & Computadoras</span>
             </div>
             <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">Etiqueta:</span>
                <span className="text-slate-500 font-medium">Calzado</span>
             </div>
             <div className="flex items-center gap-4 pt-4">
                <span className="text-xs font-bold text-slate-900">Compartir producto:</span>
                <div className="flex gap-4">
                   {[Share2].map((Icon, idx) => (
                     <Icon key={idx} className="w-4 h-4 text-slate-400 hover:text-[#13C8B5] cursor-pointer transition-colors" />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-center bg-transparent gap-12 border-b border-slate-100 rounded-none h-12 mb-12">
            <TabsTrigger value="description" className="data-[state=active]:text-[#21A3A3] data-[state=active]:border-b-2 data-[state=active]:border-[#21A3A3] rounded-none bg-transparent text-slate-400 font-black uppercase text-xs tracking-widest px-0 hover:text-slate-900">
               Descripción
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:text-[#21A3A3] data-[state=active]:border-b-2 data-[state=active]:border-[#21A3A3] rounded-none bg-transparent text-slate-400 font-black uppercase text-xs tracking-widest px-0 hover:text-slate-900">
               Reseñas (0)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-0 text-slate-500 leading-relaxed text-[15px] space-y-6 animate-in fade-in duration-700">
             <p>{product.description_long || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}</p>
             <p>Pellentesque aliquet, sem eget laoreet ultrices, ipsum metus feugiat sem, quis fermentum turpis eros eget velit. Donec ac tempus ante. Fusce ultricies massa massa. Fusce aliquam, purus eget sagittis vulputate, sapien libero hendrerit est, sed commodo augue nisi non neque. </p>
          </TabsContent>
          <TabsContent value="reviews">
             <div className="text-center py-20 text-slate-400 italic">No hay reseñas recientes aún.</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-20 border-t border-slate-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-[#2B364A] tracking-tight mb-2">Productos relacionados</h2>
            <div className="w-12 h-1 bg-[#13C8B5] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
