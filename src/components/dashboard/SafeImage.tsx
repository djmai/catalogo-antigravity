'use client'

import React, { useState, useEffect } from 'react'

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  fallbackSrc?: string
}

const defaultFallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23f1f5f9" /><path d="M150 150 L250 250 M250 150 L150 250" stroke="%23cbd5e1" stroke-width="4" stroke-linecap="round" /><text x="50%" y="280" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2394a3b8" text-anchor="middle">SIN IMAGEN</text></svg>';

export function SafeImage({ 
  src, 
  fallbackSrc = defaultFallback, 
  alt = 'Image', 
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}
