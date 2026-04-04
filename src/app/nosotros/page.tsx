import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Target, Eye, Heart, Award, Users } from 'lucide-react'
import Image from 'next/image'

export default async function AboutUsPage() {
  const supabase = createClient()
  
  // Fetch site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'about_us')
    .single()

  // Wait, in my previous step I used 'about_us'. 
  // Let me verify the key in site_settings.

  const content = settings?.value || {
    title: "Redefiniendo la Elegancia",
    content: "Cargando nuestra historia...",
    mission: "Nuestra misión no ha sido definida todavía.",
    vision: "Nuestra visión no ha sido definida todavía.",
    image_url: null,
    values: ["Excelencia", "Compromiso", "Innovación"]
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
         <div className="absolute inset-0 opacity-40">
             {content.image_url ? (
               <Image 
                 src={content.image_url} 
                 alt="Hero" 
                 fill 
                 className="object-cover"
                 priority
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
             )}
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
         
         <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-[#13C8B5] text-white px-6 py-2 rounded-full text-xs font-black tracking-[0.3em] uppercase mb-8 shadow-xl animate-bounce">
               Nuestra Historia
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase max-w-4xl mx-auto leading-tight drop-shadow-2xl">
               {content.title}
            </h1>
         </div>
      </section>

      {/* Main Content */}
      <section className="py-32 container mx-auto px-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
               <div className="h-2 w-24 bg-[#13C8B5] rounded-full"></div>
               <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight tracking-tight">
                  {content.content}
               </p>
               <div className="grid grid-cols-2 gap-8 pt-10">
                  <div className="space-y-4">
                     <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                        <Award className="h-6 w-6" />
                     </div>
                     <h4 className="text-xl font-black uppercase italic tracking-tighter">Calidad Máxima</h4>
                     <p className="text-slate-600 font-medium">Seleccionamos cada producto bajo los estándares más exigentes.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                        <Users className="h-6 w-6" />
                     </div>
                     <h4 className="text-xl font-black uppercase italic tracking-tighter">Comunidad VIP</h4>
                     <p className="text-slate-600 font-medium">Más que clientes, somos una comunidad que valora la exclusividad.</p>
                  </div>
               </div>
            </div>
            
            <div className="relative">
                <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border-[15px] border-slate-50 rotate-3 transition-transform hover:rotate-0 duration-700 relative">
                   <Image 
                     src={content.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c"} 
                     alt="Story" 
                     fill
                     className="object-cover scale-110" 
                   />
                </div>
               <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 hidden md:block">
                  <div className="flex items-center gap-6">
                     <div className="text-5xl font-black text-[#13C8B5]">15+</div>
                     <div className="text-[10px] font-black uppercase tracking-widest leading-loose text-slate-500">Años de <br/>Experiencia</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-slate-50">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="bg-white p-16 rounded-[50px] shadow-xl border border-white hover:scale-[1.02] transition-transform duration-500">
                  <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-10 shadow-xl">
                     <Target className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Nuestra Misión</h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                     {content.mission}
                  </p>
               </div>
               <div className="bg-white p-16 rounded-[50px] shadow-xl border border-white hover:scale-[1.02] transition-transform duration-500">
                  <div className="h-16 w-16 bg-[#13C8B5] rounded-2xl flex items-center justify-center text-white mb-10 shadow-xl">
                     <Eye className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Nuestra Visión</h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                     {content.vision}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Values Section */}
      <section className="py-32 container mx-auto px-6 text-center">
         <div className="inline-flex items-center gap-4 bg-slate-50 px-8 py-3 rounded-full mb-12">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Nuestros Valores Fundamentales</span>
         </div>
         <div className="flex flex-wrap justify-center gap-12 sm:gap-24">
            {content.values?.map((val: string) => (
              <div key={val} className="group">
                 <h4 className="text-5xl md:text-8xl font-black text-slate-300/30 group-hover:text-slate-900 transition-colors duration-700 uppercase italic tracking-tighter">
                   {val}
                 </h4>
              </div>
            ))}
         </div>
      </section>
    </main>
  )
}
