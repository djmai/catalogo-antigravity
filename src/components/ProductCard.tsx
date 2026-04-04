'use client'

import React from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { useDiscountedPrice } from '@/lib/hooks/useDiscountedPrice'
import { formatPrice } from '@/lib/utils/formatPrice'
import { SafeImage } from './dashboard/SafeImage'
import { ArrowUpRight, ArrowRight, Heart } from 'lucide-react'
import { WishlistToggle } from './WishlistToggle'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { discountedPrice, hasDiscount, originalPrice } = useDiscountedPrice(product)
   const rawImage = product.product_images?.[product.product_images.length - 1]?.image_url
   const mainImage = rawImage && typeof rawImage === 'string' && rawImage.trim() !== '' && rawImage !== 'null' && rawImage !== 'undefined' ? rawImage : null

  return (
    <div className="group relative flex flex-col pt-12 md:pt-16">
      {/* Main Container */}
      <div className="relative w-full bg-gradient-to-br from-[#21A3A3] to-[#13C8B5] rounded-[24px] md:rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-visible flex flex-col font-sans border-b-2 border-r-2 border-slate-900/10 group mt-8 md:mt-12 h-full pb-14 md:pb-16 flex-1">
        
        {/* Abstract Background SVG (moved here for whole card subtle texture) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15] rounded-[24px] md:rounded-[32px]">
          <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-full h-full text-black transform -rotate-12 scale-150">
            <path fill="currentColor" d="M10,150 C50,150 100,50 180,50 C200,50 200,80 180,80 C110,80 80,180 10,180 Z" />
          </svg>
        </div>

        {/* Wishlist Toggle Button */}
        <div className="absolute top-4 right-4 z-30">
          <WishlistToggle productId={product.id} className="h-8 w-8 md:h-10 md:w-10 shadow-xl" />
        </div>

        {/* Top Image Container (Slight Pop-Out) */}
        <div className="relative w-full px-4 md:px-6 -mt-8 md:-mt-12 h-[180px] md:h-[240px] z-20 shrink-0">
           <SafeImage
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-contain rounded-[20px] md:rounded-[28px] drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-700 ease-out bg-transparent"
           />

           {hasDiscount && (
             <div className="absolute bottom-0 left-6 z-20">
               <span className="text-slate-900 font-black tracking-widest uppercase text-[10px] md:text-xs bg-white px-3 py-1 rounded-full shadow-lg">
                 {product.discounts?.[0]?.type === 'percentage' ? `${product.discounts[0].value}% DESC` : 'OFERTA'}
               </span>
             </div>
           )}
        </div>

        {/* Bottom Info Section */}
        <div className="relative z-20 flex flex-col flex-grow px-4 md:px-6 pt-5 md:pt-6">
           <Link href={`/producto/${product.slug}`} className="mb-2">
             <h3 className="text-base sm:text-lg md:text-2xl font-black text-white leading-tight tracking-tight break-words line-clamp-2 md:line-clamp-3 mb-2">
               {product.name}
             </h3>
           </Link>

           {/* Tags Display */}
           {product.tags && product.tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
               {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/20 text-white/90 rounded-md backdrop-blur-sm border border-white/10">
                    {tag}
                  </span>
               ))}
               {product.tags.length > 3 && (
                 <span className="text-[8px] md:text-[9px] font-black text-white/40 px-1">+ {product.tags.length - 3}</span>
               )}
             </div>
           )}

           <p className="hidden md:block text-white/80 text-xs md:text-sm font-medium leading-relaxed line-clamp-2 mt-auto">
             {product.description_short || "El ajuste perfecto para tus necesidades."}
           </p>
        </div>

        {/* Bottom Absolute Overlay Actions */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 flex items-center justify-between px-4 md:px-6 bg-slate-900/10 backdrop-blur-md border-t border-white/10 z-30">
           <div className="flex flex-col justify-center text-white">
             {originalPrice && originalPrice > 0 ? (
               hasDiscount ? (
                 <>
                   <span className="text-[10px] md:text-xs text-white/60 line-through leading-none">{formatPrice(originalPrice)}</span>
                   <span className="text-lg md:text-xl font-black tracking-widest leading-tight">{formatPrice(discountedPrice)}</span>
                 </>
               ) : (
                 <span className="text-lg md:text-xl font-black tracking-widest leading-tight">{formatPrice(originalPrice)}</span>
               )
             ) : (
               <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-[#6CF3D5]">Solicitar Cotización</span>
             )}
           </div>
           
           <Link href={`/producto/${product.slug}`} className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-[#6CF3D5] hover:scale-110 active:scale-95 transition-all shadow-lg">
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
           </Link>
        </div>

      </div>
    </div>
  )
}
