'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { SafeImage } from './dashboard/SafeImage'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function Hero() {
  const supabase = createClient()
  const [branding, setBranding] = useState({
    site_name: 'Premium Store'
  })
  const [heroSettings, setHeroSettings] = useState({
    badge_l1: 'PREMIUM STORE',
    badge_l2: 'CATÁLOGO OFICIAL',
    title_l1: 'GRAN VENTA',
    title_l2: 'DE ESTA SEMANA',
    description: 'Explora nuestra colección curada con los mejores productos tecnológicos y de estilo de vida de la industria. Ofertas imperdibles por tiempo limitado.',
    button_text: 'OBTÉN HASTA 50% DE DESCUENTO',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000',
    bg_color: '#13C8B5'
  })

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['site_branding', 'hero_settings'])
      
      if (data) {
        const brand = data.find(s => s.key === 'site_branding')?.value
        const hero = data.find(s => s.key === 'hero_settings')?.value
        
        if (brand?.site_name) setBranding(brand)
        if (hero) setHeroSettings(hero)
      }
    }
    fetchData()
  }, [])

  const scrollToCatalog = () => {
    const catalog = document.getElementById('catalogo')
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div 
      className="relative w-full overflow-hidden pt-8 sm:pt-12 pb-24 md:pb-48 -mt-8 transition-colors duration-500"
      style={{ backgroundColor: heroSettings.bg_color || '#13C8B5' }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      {/* Diagonal Bottom Cut */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] md:h-[150px]">
          <path d="M1200 120L0 120 0 0 1200 120z" className="fill-[#1e293b]" />
        </svg>
      </div>

      <div className="container relative z-20 mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-12 mt-6 md:mt-16">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
          <div className="flex items-center gap-3 text-white mb-2 animate-in fade-in slide-in-from-left duration-700">
            <Package className="h-8 w-8" />
            <div>
              <p className="font-extrabold text-sm uppercase leading-tight tracking-widest text-white/90">
                {heroSettings.badge_l1 || branding.site_name}
              </p>
              {heroSettings.badge_l2 && (
                <p className="font-medium text-[10px] uppercase leading-tight tracking-[0.3em] text-white/70">
                  {heroSettings.badge_l2}
                </p>
              )}
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tighter text-white leading-[0.95] uppercase drop-shadow-lg animate-in fade-in slide-in-from-left duration-1000 delay-150">
            {heroSettings.title_l1} <br />
            <span className="text-2xl sm:text-4xl md:text-5xl lg:text-[50px] text-white/90 font-bold tracking-tight">
              {heroSettings.title_l2}
            </span>
          </h1>
          
          <p className="text-base text-white/80 font-medium max-w-md mt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300 leading-relaxed">
            {heroSettings.description}
          </p>

          <Button 
            size="lg" 
            onClick={scrollToCatalog}
            className="mt-6 h-auto min-h-[4rem] px-10 py-4 rounded-xl bg-white hover:bg-gray-100 text-[#13C8B5] font-black text-lg md:text-xl uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl active:scale-95 animate-in fade-in slide-in-from-bottom duration-700 delay-500 flex flex-wrap justify-center text-center gap-2"
          >
            {heroSettings.button_text}
          </Button>
        </div>

        {/* Right Content - Hero Image */}
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px] lg:h-[550px] flex items-center justify-center animate-in fade-in zoom-in slide-in-from-right duration-1000 delay-500">
           {/* Decorational glow behind the image */}
           <div className="absolute inset-0 bg-white/20 blur-[100px] rounded-full z-0 pointer-events-none" />
           <div className="relative z-10 w-full h-full transform hover:scale-105 transition-transform duration-700 xl:translate-x-12">
             <SafeImage 
                src={heroSettings.image_url}
                fallbackSrc="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000"
                alt={heroSettings.title_l1}
                className="object-contain drop-shadow-2xl filter contrast-125"
             />
           </div>
        </div>

      </div>
    </div>
  )
}
