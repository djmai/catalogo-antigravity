'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { SafeImage } from './dashboard/SafeImage'
import { ArrowRight, Package as PackageIcon } from 'lucide-react'

interface PackageCardProps {
  pkg: any // We'll pass the fetched package with joined products
}

export function PackageCard({ pkg }: PackageCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Extract all images flat. Priority: Package-specific images first, then fallback to product images
  const pkgImages = pkg.package_images?.map((img: any) => img.image_url) || []
  const prodImages = pkg.package_products?.flatMap((pp: any) => 
    pp.product?.product_images?.map((img: any) => img.image_url) || []
  ) || []

  const sourceImages = pkgImages.length > 0 ? pkgImages : prodImages

  const allImages = sourceImages.filter((url: any) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim().toLowerCase();
    return clean !== '' && clean !== 'null' && clean !== 'undefined';
  }) || []

  // Fallback to null only if the rigorous filter leaves us effectively empty
  const currentImage = allImages.length > 0 ? allImages[currentIndex] : null

  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [allImages.length])

  // Calculate original price sum
  const products = pkg.package_products?.map((pp: any) => pp.product).filter(Boolean) || []
  const originalPriceSum = products.reduce((sum: number, p: any) => sum + (p.base_price || 0), 0)
  const isDiscounted = pkg.special_price < originalPriceSum

  // Decisions for Layout
  const hasImages = allImages.length > 0
  const isCarousel = allImages.length > 1

  return (
    <div className="group relative flex flex-col pt-12 md:pt-16">
      <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] md:rounded-[32px] shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 overflow-visible flex flex-col font-sans border-b-2 border-r-2 border-amber-500/20 group mt-8 md:mt-12 h-full pb-14 md:pb-16 flex-1">
        
        {/* Abstract Background SVG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05] rounded-[24px] md:rounded-[32px]">
          <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-full h-full text-white transform -rotate-12 scale-150">
            <path fill="currentColor" d="M10,150 C50,150 100,50 180,50 C200,50 200,80 180,80 C110,80 80,180 10,180 Z" />
          </svg>
        </div>

        {/* Package Tag */}
        <div className="absolute top-4 right-4 z-30">
            <span className="text-slate-900 font-black tracking-widest uppercase text-[9px] md:text-xs bg-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
              <PackageIcon className="h-3 w-3" />
              PAQUETE PREMIUM
            </span>
        </div>

        {/* Top Image Container (Carousel Pop-Out) */}
        <div className="relative w-full px-4 md:px-6 -mt-8 md:-mt-12 h-[180px] md:h-[240px] z-20 shrink-0">
           <SafeImage
              key={currentImage} // forces remount animation on cycle
              src={currentImage}
              alt={pkg.name}
              className="w-full h-full object-contain rounded-[20px] md:rounded-[28px] drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-700 ease-out bg-slate-900/40 backdrop-blur-sm"
           />
           {/* Dots for carousel indicator - ONLY if 2+ valid images */}
           {isCarousel && (
             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-30">
               {allImages.map((_: any, i: number) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30'}`} />
               ))}
             </div>
           )}
        </div>

        {/* Bottom Info Section */}
        <div className="relative z-20 flex flex-col flex-grow px-4 md:px-6 pt-5 md:pt-6">
           <h3 className="text-base sm:text-lg md:text-3xl font-black text-white leading-tight tracking-tight break-words line-clamp-2 md:line-clamp-3 mb-2">
             {pkg.name}
           </h3>

           {/* Tags Display */}
           {pkg.tags && pkg.tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
               {pkg.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-400/20 text-amber-400/90 rounded-md backdrop-blur-sm border border-amber-400/20">
                    {tag}
                  </span>
               ))}
               {pkg.tags.length > 3 && (
                 <span className="text-[8px] md:text-[9px] font-black text-slate-500 px-1">+ {pkg.tags.length - 3}</span>
               )}
             </div>
           )}

           <p className="hidden md:block text-slate-400 text-xs md:text-sm font-medium leading-relaxed line-clamp-2 mt-auto">
             {pkg.description || `Incluye ${products.length} artículos premium.`}
           </p>
        </div>

        {/* Bottom Absolute Overlay Actions */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 flex items-center justify-between px-4 md:px-6 bg-amber-400/10 backdrop-blur-md border-t border-amber-500/20 z-30">
           <div className="flex flex-col justify-center text-white">
             {pkg.special_price && pkg.special_price > 0 ? (
               isDiscounted ? (
                 <>
                   <span className="text-[10px] md:text-xs text-slate-400 line-through leading-none">{formatPrice(originalPriceSum)}</span>
                   <span className="text-lg md:text-xl font-black tracking-widest leading-tight text-amber-400">{formatPrice(pkg.special_price)}</span>
                 </>
               ) : (
                 <span className="text-lg md:text-xl font-black tracking-widest leading-tight text-amber-400">{formatPrice(pkg.special_price)}</span>
               )
             ) : (
               <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-amber-400">Solicitar Cotización</span>
             )}
           </div>
           
           <button className="h-8 w-8 md:h-10 md:w-10 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 hover:bg-amber-300 hover:scale-110 active:scale-95 transition-all shadow-[0_5px_15px_rgba(251,191,36,0.3)] border-none outline-none">
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
           </button>
        </div>
      </div>
    </div>
  )
}
