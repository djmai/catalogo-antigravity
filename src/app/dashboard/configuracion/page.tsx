'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Settings, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Target, 
  Eye, 
  History,
  FileText,
  Plus,
  X,
  Mail,
  Phone,
  MapPin,
  Share2,
  Globe,
  Trash2,
  ExternalLink,
  MessageSquare,
  Video,
  Play,
  Users,
  Camera,
  Send,
  Bookmark,
  Smile
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SingleImageUploader } from '@/components/dashboard/SingleImageUploader'

// Social platform options
const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Share2 },
  { value: 'instagram', label: 'Instagram', icon: Camera },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'messenger', label: 'Messenger', icon: MessageSquare },
  { value: 'tiktok', label: 'TikTok', icon: Video },
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'youtube', label: 'YouTube', icon: Play },
  { value: 'linkedin', label: 'LinkedIn', icon: Users },
  { value: 'twitter', label: 'Twitter / X', icon: Globe },
  { value: 'pinterest', label: 'Pinterest', icon: Bookmark },
  { value: 'reddit', label: 'Reddit', icon: Globe },
  { value: 'snapchat', label: 'Snapchat', icon: Smile },
  { value: 'skype', label: 'Skype', icon: Phone },
  { value: 'teams', label: 'Teams', icon: Users },
  { value: 'line', label: 'Line', icon: MessageSquare },
  { value: 'other', label: 'Otro / Genérico', icon: Share2 },
]

export default function ConfigurationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [aboutUs, setAboutUs] = useState({
    title: '',
    content: '',
    mission: '',
    vision: '',
    image_url: '',
    values: [] as string[]
  })

  const [contactInfo, setContactInfo] = useState({
    title: '',
    description: '',
    location: '',
    email_primary: '',
    email_secondary: '',
    phone_primary: '',
    phone_secondary: '',
    map_url: '',
    social_links: [] as any[]
  })

  const [siteBranding, setSiteBranding] = useState({
    site_name: 'PREMIUMSTORE',
    logo_url: '',
    favicon_url: '',
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
      
      if (data) {
        const about = data.find(s => s.key === 'about_us')?.value
        const contact = data.find(s => s.key === 'contact_info')?.value
        const branding = data.find(s => s.key === 'site_branding')?.value
        const hero = data.find(s => s.key === 'hero_settings')?.value
        
        if (about) setAboutUs(about)
        if (contact) setContactInfo(contact)
        if (branding) setSiteBranding(branding)
        if (hero) setHeroSettings(hero)
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...aboutUs.values]
    newValues[index] = val
    setAboutUs({ ...aboutUs, values: newValues })
  }

  const addAboutValue = () => {
    setAboutUs({ ...aboutUs, values: [...aboutUs.values, ''] })
  }

  const removeAboutValue = (index: number) => {
    setAboutUs({ ...aboutUs, values: aboutUs.values.filter((_, i) => i !== index) })
  }

  const addSocialLink = () => {
    setContactInfo({
      ...contactInfo,
      social_links: [...contactInfo.social_links, { platform: 'facebook', url: '' }]
    })
  }

  const updateSocialLink = (index: number, field: string, val: string) => {
    const newLinks = [...contactInfo.social_links]
    newLinks[index][field] = val
    setContactInfo({ ...contactInfo, social_links: newLinks })
  }

  const removeSocialLink = (index: number) => {
    setContactInfo({
      ...contactInfo,
      social_links: contactInfo.social_links.filter((_, i) => i !== index)
    })
  }

  const handleSave = async (key: 'about_us' | 'contact_info' | 'site_branding' | 'hero_settings', value: any) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'key' })
      
      if (error) throw error
      toast.success(`Configuración aplicada correctamente`)
      router.refresh()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20 px-6 lg:px-0">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="h-14 w-14 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center">
               <Settings className="h-7 w-7 text-slate-800" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Configuración del Sitio</h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Personalización total en idioma español</p>
            </div>
         </div>
      </div>

      <Tabs defaultValue="site_branding" className="space-y-10">
         <div className="bg-white/40 backdrop-blur-xl p-4 rounded-[35px] border border-white/50 shadow-xl inline-block">
            <TabsList className="bg-transparent border-none gap-2">
              <TabsTrigger value="site_branding" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all h-12 flex gap-3">
                 <Settings className="h-4 w-4" /> IDENTIDAD
              </TabsTrigger>
              <TabsTrigger value="hero_settings" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all h-12 flex gap-3">
                 <Target className="h-4 w-4" /> BANNER HERO
              </TabsTrigger>
              <TabsTrigger value="about_us" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all h-12 flex gap-3">
                 <FileText className="h-4 w-4" /> NOSOTROS
              </TabsTrigger>
              <TabsTrigger value="contact_info" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all h-12 flex gap-3">
                 <Mail className="h-4 w-4" /> CONTACTO Y REDES
              </TabsTrigger>
            </TabsList>
         </div>

         {/* SITE BRANDING TAB */}
         <TabsContent value="site_branding" className="space-y-10 focus-visible:ring-0">
            <div className="bg-white rounded-[50px] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Nombre del Sitio / Tienda</Label>
                        <Input 
                           value={siteBranding.site_name}
                           onChange={(e) => setSiteBranding({...siteBranding, site_name: e.target.value})}
                           className="h-16 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 text-lg focus:ring-2 focus:ring-teal-600 shadow-sm"
                           placeholder="Ej: PREMIUMSTORE"
                        />
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vista Previa sin Logo</p>
                        <span className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">
                           {siteBranding.site_name || 'PREMIUMSTORE'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Logotipo Oficial (PNG/SVG recomendado)</Label>
                     <SingleImageUploader 
                        onUploadComplete={(url) => setSiteBranding({...siteBranding, logo_url: url})}
                        currentImage={siteBranding.logo_url}
                        label="Sube tu Logotipo"
                        folder="branding"
                     />
                  </div>
               </div>

               <div className="pt-12 border-t border-slate-50 flex justify-end">
                  <Button 
                     onClick={() => handleSave('site_branding', siteBranding)}
                     disabled={saving}
                     className="h-16 px-12 rounded-3xl bg-teal-600 hover:bg-slate-900 text-white font-black shadow-xl shadow-teal-100 gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs"
                  >
                     {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                     Guardar Identidad
                  </Button>
               </div>
            </div>
         </TabsContent>

         {/* HERO SETTINGS TAB */}
         <TabsContent value="hero_settings" className="space-y-10 focus-visible:ring-0">
            <div className="bg-white rounded-[50px] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Badge Línea 1</Label>
                           <Input 
                              value={heroSettings.badge_l1}
                              onChange={(e) => setHeroSettings({...heroSettings, badge_l1: e.target.value})}
                              className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-sm"
                              placeholder="Ej: PREMIUM STORE"
                           />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Badge Línea 2</Label>
                           <Input 
                              value={heroSettings.badge_l2}
                              onChange={(e) => setHeroSettings({...heroSettings, badge_l2: e.target.value})}
                              className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-sm"
                              placeholder="Ej: CATÁLOGO OFICIAL"
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Título Línea 1 (Principal)</Label>
                        <Input 
                           value={heroSettings.title_l1}
                           onChange={(e) => setHeroSettings({...heroSettings, title_l1: e.target.value})}
                           className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xl shadow-sm uppercase italic"
                           placeholder="Ej: GRAN VENTA"
                        />
                     </div>

                     <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Título Línea 2 (Sub-título)</Label>
                        <Input 
                           value={heroSettings.title_l2}
                           onChange={(e) => setHeroSettings({...heroSettings, title_l2: e.target.value})}
                           className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-sm"
                           placeholder="Ej: DE ESTA SEMANA"
                        />
                     </div>

                     <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Descripción corta</Label>
                        <Textarea 
                           value={heroSettings.description}
                           onChange={(e) => setHeroSettings({...heroSettings, description: e.target.value})}
                           className="min-h-[120px] rounded-3xl bg-slate-50 border-none font-medium p-6 shadow-sm leading-relaxed"
                           placeholder="Describe la promoción o enfoque de esta semana..."
                        />
                     </div>

                     <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Texto del Botón</Label>
                        <Input 
                           value={heroSettings.button_text}
                           onChange={(e) => setHeroSettings({...heroSettings, button_text: e.target.value})}
                           className="h-14 rounded-2xl bg-slate-50 border-none font-black shadow-sm uppercase italic"
                           placeholder="Ej: OBTÉN HASTA 50% DE DESCUENTO"
                        />
                     </div>

                     <div className="space-y-3">
                         <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Color de Fondo (HEX)</Label>
                         <div className="flex gap-4 items-center">
                            <Input 
                               value={heroSettings.bg_color}
                               onChange={(e) => setHeroSettings({...heroSettings, bg_color: e.target.value})}
                               className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-sm flex-1"
                               placeholder="#13C8B5"
                            />
                            <div 
                               className="h-14 w-14 rounded-2xl border-4 border-white shadow-xl shadow-slate-200"
                               style={{ backgroundColor: heroSettings.bg_color || '#13C8B5' }}
                            />
                         </div>
                      </div>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1 uppercase">Imagen de Portada (PNG / JPG / WEBP)</Label>
                        <SingleImageUploader 
                           onUploadComplete={(url) => setHeroSettings({...heroSettings, image_url: url})}
                           currentImage={heroSettings.image_url}
                           label="Sube la Imagen de Portada"
                           folder="hero"
                        />
                     </div>

                     {/* Live Preview Concept */}
                     <div className="p-8 bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                        <div className="absolute inset-0 bg-[#13C8B5] opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: heroSettings.bg_color }} />
                        <div className="relative z-10 space-y-4">
                           <div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/90">{heroSettings.badge_l1}</p>
                              <p className="text-[7px] font-bold uppercase tracking-widest text-white/50">{heroSettings.badge_l2}</p>
                           </div>
                           <h3 className="text-2xl font-black text-white leading-none uppercase italic border-l-4 border-[#13C8B5] pl-4" style={{ borderColor: heroSettings.bg_color }}>
                              {heroSettings.title_l1} <br />
                              <span className="text-lg font-bold text-white/80 normal-case italic">{heroSettings.title_l2}</span>
                           </h3>
                           <p className="text-xs text-white/60 line-clamp-2">{heroSettings.description}</p>
                           <div className="h-10 w-48 bg-white rounded-xl flex items-center justify-center text-[8px] font-black uppercase" style={{ color: heroSettings.bg_color }}>
                              {heroSettings.button_text}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-slate-50 flex justify-end">
                  <Button 
                     onClick={() => handleSave('hero_settings', heroSettings)}
                     disabled={saving}
                     className="h-16 px-12 rounded-3xl bg-rose-500 hover:bg-slate-900 text-white font-black shadow-xl shadow-rose-100 gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs"
                  >
                     {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                     Guardar Banner
                  </Button>
               </div>
            </div>
         </TabsContent>

         {/* ABOUT US TAB */}
         <TabsContent value="about_us" className="space-y-10 focus-visible:ring-0">
            <div className="bg-white rounded-[50px] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-12">
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Título Inmersivo</Label>
                        <Input 
                           value={aboutUs.title}
                           onChange={(e) => setAboutUs({...aboutUs, title: e.target.value})}
                           className="h-16 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 text-lg focus:ring-2 focus:ring-indigo-600"
                        />
                     </div>
                  <div className="space-y-4">
                     <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Imagen Principal (Hero)</Label>
                     <SingleImageUploader 
                        onUploadComplete={(url) => setAboutUs({...aboutUs, image_url: url})}
                        currentImage={aboutUs.image_url}
                        label="Subir Imagen de Nosotros"
                        folder="about-us"
                     />
                  </div>
                  </div>

                  <div className="space-y-4">
                     <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Historia de la Empresa</Label>
                     <Textarea 
                        value={aboutUs.content}
                        onChange={(e) => setAboutUs({...aboutUs, content: e.target.value})}
                        className="min-h-[220px] rounded-[40px] bg-slate-50 border-none font-medium text-slate-800 p-8 focus:ring-2 focus:ring-indigo-600 leading-relaxed text-lg"
                        placeholder="Nuestra historia comienza..."
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-2">
                           <Target className="h-3 w-3" /> Nuestra Misión
                        </Label>
                        <Textarea 
                           value={aboutUs.mission}
                           onChange={(e) => setAboutUs({...aboutUs, mission: e.target.value})}
                           className="min-h-[140px] rounded-3xl bg-slate-50 border-none font-medium text-slate-800 p-6 focus:ring-2 focus:ring-indigo-600"
                        />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-2">
                           <Eye className="h-3 w-3" /> Nuestra Visión
                        </Label>
                        <Textarea 
                           value={aboutUs.vision}
                           onChange={(e) => setAboutUs({...aboutUs, vision: e.target.value})}
                           className="min-h-[140px] rounded-3xl bg-slate-50 border-none font-medium text-slate-800 p-6 focus:ring-2 focus:ring-indigo-600"
                        />
                     </div>
                  </div>

                  <div className="space-y-8 pt-8">
                     <div className="flex items-center justify-between">
                        <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Valores Corporativos</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addAboutValue} className="rounded-full gap-2 border-slate-200">
                           <Plus className="h-3 w-3" /> Añadir Valor
                        </Button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {aboutUs.values?.map((val, idx) => (
                           <div key={idx} className="relative group">
                              <Input 
                                 value={val}
                                 onChange={(e) => handleValueChange(idx, e.target.value)}
                                 className="h-14 rounded-2xl bg-slate-50 border-none pr-12 font-black text-slate-700 italic uppercase tracking-tighter"
                                 placeholder="Ej: Calidad"
                              />
                              <button 
                                 type="button" 
                                 onClick={() => removeAboutValue(idx)}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <X className="h-4 w-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-slate-50 flex justify-end">
                  <Button 
                     onClick={() => handleSave('about_us', aboutUs)}
                     disabled={saving}
                     className="h-16 px-12 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-900/10 gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs"
                  >
                     {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                     Actualizar Historia
                  </Button>
               </div>
            </div>
         </TabsContent>

         {/* CONTACT INFO TAB */}
         <TabsContent value="contact_info" className="space-y-10 focus-visible:ring-0">
            <div className="bg-white rounded-[50px] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* General Config */}
                  <div className="space-y-10">
                     <div className="flex items-center gap-3">
                        <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Datos de la Empresa</h4>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Título Sección Contacto</Label>
                           <Input 
                              value={contactInfo.title}
                              onChange={(e) => setContactInfo({...contactInfo, title: e.target.value})}
                              className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                           />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Subtítulo Descriptivo</Label>
                           <Input 
                              value={contactInfo.description}
                              onChange={(e) => setContactInfo({...contactInfo, description: e.target.value})}
                              className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                           />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Ubicación Física
                           </Label>
                           <Input 
                              value={contactInfo.location}
                              onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})}
                              className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Email Principal</Label>
                              <Input 
                                 value={contactInfo.email_primary}
                                 onChange={(e) => setContactInfo({...contactInfo, email_primary: e.target.value})}
                                 className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">Teléfono Primario</Label>
                              <Input 
                                 value={contactInfo.phone_primary}
                                 onChange={(e) => setContactInfo({...contactInfo, phone_primary: e.target.value})}
                                 className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-2">
                              <Globe className="h-3 w-3" /> Google Maps Embed URL
                           </Label>
                           <Input 
                              value={contactInfo.map_url}
                              onChange={(e) => setContactInfo({...contactInfo, map_url: e.target.value})}
                              className="h-12 rounded-xl bg-slate-50 border-none font-medium px-4 text-[10px] font-mono text-slate-400"
                              placeholder="https://www.google.com/maps/embed?..."
                           />
                        </div>
                     </div>
                  </div>

                  {/* Redes Sociales Dinámicas */}
                  <div className="space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-1 w-12 bg-rose-500 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Redes Sociales</h4>
                        </div>
                        <Button type="button" size="sm" onClick={addSocialLink} className="rounded-full h-8 bg-slate-900">
                           <Plus className="h-3 w-3 mr-2" /> Añadir
                        </Button>
                     </div>

                     <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {contactInfo.social_links.length === 0 ? (
                           <div className="py-12 bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                              <Share2 className="h-10 w-10 text-slate-200 mb-4" />
                              <p className="text-xs font-black uppercase text-slate-300">No hay redes vinculadas</p>
                           </div>
                        ) : (
                           contactInfo.social_links.map((link, idx) => (
                              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 group relative">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                       <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Plataforma</Label>
                                       <Select 
                                          value={link.platform} 
                                          onValueChange={(val) => updateSocialLink(idx, 'platform', val)}
                                       >
                                          <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm font-bold text-xs">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {PLATFORMS.map(p => (
                                                <SelectItem key={p.value} value={p.value} className="font-bold">
                                                   <div className="flex items-center gap-2">
                                                      <p.icon className="h-3 w-3" /> {p.label}
                                                   </div>
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                       <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">URL / Enlace Directo</Label>
                                       <Input 
                                          value={link.url}
                                          onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                          className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold"
                                          placeholder="https://..."
                                       />
                                    </div>
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={() => removeSocialLink(idx)}
                                    className="absolute -top-2 -right-2 h-8 w-8 bg-white shadow-lg text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </button>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-slate-50 flex justify-end">
                  <Button 
                     onClick={() => handleSave('contact_info', contactInfo)}
                     disabled={saving}
                     className="h-16 px-12 rounded-3xl bg-indigo-600 hover:bg-slate-900 text-white font-black shadow-xl shadow-indigo-100 gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs"
                  >
                     {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                     Actualizar Contacto
                  </Button>
               </div>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  )
}
