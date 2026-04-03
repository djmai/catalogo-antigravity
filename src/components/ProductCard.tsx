'use client'

import React from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { useDiscountedPrice } from '@/lib/hooks/useDiscountedPrice'
import { formatPrice } from '@/lib/utils/formatPrice'
import { SafeImage } from './dashboard/SafeImage'
import { ArrowUpRight, ArrowRight } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { discountedPrice, hasDiscount, originalPrice } = useDiscountedPrice(product)
   const mainImage = product.product_images?.[product.product_images.length - 1]?.image_url

  return (
    <div className="group relative flex flex-col pt-16">
      {/* Main Pink Container */}
      <div className="relative w-full h-[380px] bg-gradient-to-br from-[#21A3A3] to-[#13C8B5] rounded-3xl rounded-tl-[80px] rounded-br-[4px] rounded-bl-[4px] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-visible flex flex-col justify-end pb-4 pt-10 px-6 font-sans border-b-2 border-r-2 border-black/5">
        
        {/* Background Decorative Swoosh (Simulated via SVG or abstract shape) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl rounded-tl-[80px] pointer-events-none opacity-20">
          <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-full h-full text-black transform -rotate-12 scale-150">
            <path fill="currentColor" d="M10,150 C50,150 100,50 180,50 C200,50 200,80 180,80 C110,80 80,180 10,180 Z" />
          </svg>
        </div>

        {/* Overflowing Image */}
        <div className="absolute -top-16 lg:-top-24 -left-4 -right-12 z-20 pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
           <SafeImage
              src={mainImage}
              alt={product.name}
              className="w-full h-64 object-contain transform group-hover:-translate-y-4 group-hover:scale-105 group-hover:rotate-[-4deg] transition-all duration-700 ease-out will-change-transform"
           />
        </div>

        {/* Floating Circle Button (Brand/Arrow) */}
        <Link href={`/producto/${product.slug}`} className="absolute right-0 top-[40%] translate-x-1/2 z-30 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:scale-110 active:scale-95 transition-all">
          <ArrowRight className="h-5 w-5 text-black" />
        </Link>

        {/* Product Information */}
        <div className="relative z-20 flex flex-col gap-2 mt-auto">
           {hasDiscount && (
             <span className="text-white/80 font-black tracking-widest uppercase text-[10px] bg-black/20 w-max px-2 py-1 rounded-full mb-1">
               {product.discounts?.[0]?.type === 'percentage' ? `${product.discounts[0].value}% OFF` : 'OFERTA'}
             </span>
           )}
           <Link href={`/producto/${product.slug}`}>
             <h3 className="text-3xl font-black text-white leading-none tracking-tight break-words pr-8">
               {product.name}
             </h3>
           </Link>
           <p className="text-white/90 text-[11px] font-medium leading-relaxed max-w-[80%] line-clamp-2 mt-1">
             {product.description_short || "El ajuste perfecto para tus necesidades."}
           </p>
        </div>

        {/* Bottom Right Price Tag */}
        <div className="absolute right-0 bottom-0 z-30 flex items-stretch h-12 shadow-2xl">
           <div className="bg-white/20 backdrop-blur-md px-4 flex items-center justify-center text-white font-black tracking-widest flex-col items-end">
             {hasDiscount ? (
               <>
                 <span className="text-[8px] text-white/60 line-through leading-none">{formatPrice(originalPrice)}</span>
                 <span className="text-sm">{formatPrice(discountedPrice)}</span>
               </>
             ) : (
               <span className="text-sm">{formatPrice(originalPrice)}</span>
             )}
           </div>
           <Link href={`/producto/${product.slug}`} className="bg-[#6CF3D5] w-12 flex items-center justify-center hover:bg-[#13C8B5] transition-colors text-black active:bg-yellow-400">
              <span className="font-light text-2xl leading-none -mt-1">+</span>
           </Link>
        </div>

      </div>
    </div>
  )
}
