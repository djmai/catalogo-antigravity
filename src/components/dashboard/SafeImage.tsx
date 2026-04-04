'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SafeImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src?: string | null
  fallbackSrc?: string
  containerClassName?: string
}

const defaultFallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none" /><path d="M150 150 L250 250 M250 150 L150 250" stroke="%23ffffff" stroke-width="6" stroke-linecap="round" opacity="0.5" /><text x="50%" y="280" font-family="sans-serif" font-size="20" font-weight="900" fill="%23ffffff" opacity="0.6" text-anchor="middle" letter-spacing="2">SIN IMAGEN</text></svg>';

/**
 * Premium SafeImage using next/image. 
 * Optimized for performance and visual transitions.
 */
export function SafeImage({ 
  src, 
  fallbackSrc = defaultFallback, 
  alt = 'Image', 
  className,
  containerClassName,
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<any>(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isValid = src && typeof src === 'string' && src.trim() !== '' && src !== 'null' && src !== 'undefined'
    setImgSrc(isValid ? src : fallbackSrc)
  }, [src, fallbackSrc])

  // If width/height are provided, we don't use fill=true by default
  const isFixed = props.width !== undefined && props.height !== undefined
  const useFill = props.fill !== undefined ? props.fill : !isFixed

  return (
    <div className={cn(
      "relative overflow-hidden flex items-center justify-center", 
      useFill && "w-full h-full",
      containerClassName
    )}>
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        fill={useFill}
        className={cn(
          "object-contain transition-all duration-1000 ease-in-out",
          isLoading ? "scale-110 blur-2xl opacity-50" : "scale-100 blur-0 opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc)
          setIsLoading(false)
        }}
        sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/20 backdrop-blur-sm animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-[#13C8B5]/20 border-t-[#13C8B5] rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
