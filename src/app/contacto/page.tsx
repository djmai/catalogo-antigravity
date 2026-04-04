'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Loader2,
  Globe,
  Share2,
  MessageSquare,
  Camera,
  Video,
  Play,
  Users,
  Bookmark,
  Smile
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

// Map platform keys to icons
const PLATFORM_ICONS: any = {
  facebook: Share2,
  instagram: Camera,
  whatsapp: MessageSquare,
  messenger: MessageSquare,
  tiktok: Video,
  youtube: Play,
  linkedin: Users,
  twitter: Globe,
  telegram: Send,
  pinterest: Bookmark,
  reddit: Globe,
  snapchat: Smile,
  skype: Phone,
  teams: Users,
  line: MessageSquare,
  x: Globe,
  default: Share2
}

export default function ContactPage() {
  const supabase = createClient()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contactInfo, setContactInfo] = useState<any>(null)

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact_info')
      .single()
    
    if (data) {
      setContactInfo(data.value)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSending(false)
    setSent(true)
    toast.success('Mensaje enviado correctamente')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const info = contactInfo || {
    title: "Contacto",
    description: "Estamos aquí para escucharte y asesorarte.",
    location: "Dirección no configurada",
    email_primary: "contacto@empresa.com",
    email_secondary: "",
    phone_primary: "No definido",
    phone_secondary: "",
    map_url: "",
    social_links: []
  }

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <Image 
              src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d" 
              alt="Background" 
              fill
              className="object-cover" 
              priority
              unoptimized
            />
         </div>
         
         <div className="relative z-10 container mx-auto px-6">
            <div className="max-w-2xl">
               <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase mb-4">
                  {info.title || "Contáctanos"}
               </h1>
               <p className="text-xl text-white/60 font-medium">
                  {info.description || "Nos encantaría escucharte."}
               </p>
            </div>
         </div>
      </section>

      {/* Main Content Split Area */}
      <section className="py-24 container mx-auto px-6 -mt-32 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact Info Column */}
            <div className="lg:col-span-5 space-y-12 bg-white/40 backdrop-blur-xl p-12 rounded-[50px] border border-white/60 shadow-2xl shadow-slate-200/50">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 italic uppercase mb-4 tracking-tighter">Ponte en contacto</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Nuestro equipo está listo para ofrecerte atención personalizada y exclusiva.
                  </p>
               </div>

               <div className="space-y-8">
                  <ContactDetailItem 
                    icon={MapPin} 
                    label="Ubicación Principal" 
                    value={info.location} 
                    bgColor="bg-indigo-600"
                  />
                  <ContactDetailItem 
                    icon={Mail} 
                    label="Escríbenos" 
                    value={`${info.email_primary}${info.email_secondary ? '\n' + info.email_secondary : ''}`} 
                    bgColor="bg-teal-600"
                  />
                  <ContactDetailItem 
                    icon={Phone} 
                    label="Llámanos" 
                    value={`${info.phone_primary}${info.phone_secondary ? '\n' + info.phone_secondary : ''}`} 
                    bgColor="bg-rose-500"
                  />
               </div>

               <div className="pt-8 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Nuestras Redes Sociales</h4>
                  <div className="flex flex-wrap gap-4">
                     {info.social_links?.map((link: any, idx: number) => {
                       const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || PLATFORM_ICONS.default
                       return (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                        >
                           <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </a>
                       )
                     })}
                  </div>
               </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7 bg-white p-12 md:p-16 rounded-[50px] shadow-2xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Send className="h-64 w-64 text-slate-900" />
               </div>

               <div className="relative z-10 space-y-10">
                  <div>
                     <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter mb-4 text-slate-900">Enviar mensaje</h3>
                     <p className="text-slate-400 font-medium text-sm max-w-lg leading-relaxed">
                        Completa el formulario y te responderemos en el menor tiempo posible para brindarte la mejor asesoría.
                     </p>
                  </div>

                  {sent ? (
                    <div className="py-20 flex flex-col items-center text-center space-y-6">
                       <div className="h-20 w-20 bg-teal-50 rounded-[30px] flex items-center justify-center text-teal-600 shadow-inner">
                          <CheckCircle2 className="h-10 w-10" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">¡Mensaje Enviado con Éxito!</h4>
                          <p className="text-slate-500 font-medium mt-2">Gracias por contactarnos. Estaremos respondiendo pronto.</p>
                       </div>
                       <Button variant="outline" onClick={() => setSent(false)} className="rounded-2xl px-10 h-12 font-black text-xs uppercase tracking-widest border-slate-200">Enviar otro mensaje</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                             <Input required className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-indigo-500" placeholder="Juan Pérez" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Empresa (Opcional)</label>
                             <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-indigo-500" placeholder="Ej: PremiumCorp" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                             <Input required className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-indigo-500" placeholder="+52 ..." />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                             <Input required type="email" className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-indigo-500" placeholder="juan@ejemplo.com" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asunto</label>
                          <Input required className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-indigo-500" placeholder="¿En qué podemos ayudarte?" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mensaje</label>
                          <Textarea required className="min-h-[160px] rounded-[30px] bg-slate-50 border-none font-medium text-slate-600 p-8 focus:ring-indigo-500" placeholder="Escribe tu mensaje aquí..." />
                       </div>
                       <div className="pt-6">
                          <Button 
                            type="submit" 
                            disabled={sending}
                            className="h-16 px-12 rounded-3xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 flex gap-3"
                          >
                             {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                             ENVIAR MI MENSAJE
                          </Button>
                       </div>
                    </form>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* Map Section */}
      {info.map_url && (
        <section className="py-24 bg-white">
           <div className="container mx-auto px-6">
              <div className="rounded-[60px] overflow-hidden shadow-2xl border-[20px] border-slate-50 h-[600px] relative group">
                 <iframe 
                    src={info.map_url} 
                    className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                 />
                 <div className="absolute top-10 left-10 bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border border-white/10 max-w-xs group-hover:translate-x-4 transition-transform duration-500">
                    <h4 className="text-xl font-black italic uppercase italic tracking-tighter mb-4 text-[#ffc64d]">Visítanos</h4>
                    <p className="text-sm text-white/60 font-medium leading-relaxed">
                       Atención exclusiva en nuestra sucursal. Conoce nuestra colección personalmente.
                    </p>
                    <div className="mt-8">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Horarios</p>
                       <p className="text-xs font-bold">Lun - Vie: 9:00 AM - 6:00 PM</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="pb-32 bg-white flex justify-center">
         <div className="container max-w-4xl px-6">
            <div className="bg-slate-50 p-12 md:p-16 rounded-[50px] text-center space-y-12 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-4xl font-black text-slate-900 italic uppercase mb-2 tracking-tighter leading-none">Boletín de Noticias</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose">Suscríbete para recibir lanzamientos exclusivos, noticias y promociones especiales.</p>
                  
                  <div className="mt-12 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                     <Input className="h-14 rounded-2xl bg-white border-none shadow-inner px-8 font-bold" placeholder="Tu correo electrónico" />
                     <Button className="h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black px-12 tracking-widest flex gap-2">
                        <Mail className="h-5 w-5" /> SUSCRIBIRME
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </main>
  )
}

function ContactDetailItem({ icon: Icon, label, value, bgColor }: any) {
  return (
    <div className="flex items-start gap-6 group">
      <div className={`h-16 w-16 ${bgColor} rounded-[25px] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 mt-2">{label}</p>
        <p className="font-bold text-slate-900 text-lg leading-relaxed whitespace-pre-line tracking-tight italic">
          {value}
        </p>
      </div>
    </div>
  )
}
