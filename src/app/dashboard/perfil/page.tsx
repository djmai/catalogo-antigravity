'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  Camera, 
  Heart, 
  Package,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Settings,
  ShieldCheck,
  AlertTriangle,
  StickyNote,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { SafeImage } from '@/components/dashboard/SafeImage'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    email: '',
    notes: '',
    interests: '',
    membership_status: ''
  })

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, wishlistRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('wishlist')
          .select('*, product:products(*, product_images(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])
      
      if (profileRes.data) {
        setProfile(profileRes.data)
        setFormData({
          full_name: profileRes.data.full_name || '',
          phone: profileRes.data.phone || '',
          address: profileRes.data.address || '',
          date_of_birth: profileRes.data.date_of_birth || '',
          email: profileRes.data.email || user.email || '',
          notes: profileRes.data.notes || '',
          interests: profileRes.data.allergies || '', // mapping medical 'allergies' to e-commerce 'interests'
          membership_status: profileRes.data.blood_type || 'Miembro' // mapping medical 'blood_type' to 'membership'
        })
      }

      if (wishlistRes.data) {
        setWishlist(wishlistRes.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const emailChanged = formData.email !== user.email
      const isAdmin = profile?.role === 'admin'

      let avatarUrl = profile.avatar_url
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
      const file = fileInput?.files?.[0]
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        
        const { data: publicUrl } = supabase.storage
          .from('product_images')
          .getPublicUrl(fileName)
          
        avatarUrl = publicUrl.publicUrl
      }

      if (emailChanged && isAdmin) {
        const { error: authError } = await supabase.auth.updateUser({ email: formData.email })
        if (authError) throw authError
      } else if (emailChanged && !isAdmin) {
         toast.error("Solo los administradores pueden cambiar el correo electrónico.")
         setSaving(false)
         return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth || null,
          avatar_url: avatarUrl,
          email: formData.email,
          notes: formData.notes,
          allergies: formData.interests,
          blood_type: formData.membership_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error

      if (emailChanged) {
         toast.success('Correo actualizado. Cerrando sesión por seguridad...')
         setTimeout(async () => {
            await supabase.auth.signOut()
            router.push('/login')
         }, 3000)
         return
      }

      toast.success('Perfil actualizado correctamente')
      setEditing(false)
      setAvatarPreview(null)
      fetchData()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase.from('wishlist').delete().eq('id', id)
      if (error) throw error
      setWishlist(prev => prev.filter(item => item.id !== id))
      toast.success('Eliminado de tu lista')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    )
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-center">
               <User className="h-7 w-7 text-slate-800" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Mi Perfil</h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Gestión de cuenta y preferencias exclusivas</p>
            </div>
         </div>
        <div className="flex items-center gap-3">
          {!editing ? (
            <Button 
              onClick={() => setEditing(true)}
              className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl gap-2 transition-all active:scale-95"
            >
              <Edit3 className="h-4 w-4 text-[#ffc64d]" />
              EDITAR PERFIL
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  setEditing(false)
                  setAvatarPreview(null)
                }}
                variant="ghost"
                className="h-12 px-6 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="h-12 px-10 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-xl gap-2 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                GUARDAR CAMBIOS
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[45px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2.5 bg-slate-900"></div>
              {isAdmin && (
                <div className="absolute top-8 left-8 flex items-center gap-2 text-[#ffc64d] bg-slate-900 px-3 py-1 rounded-full shadow-lg h-6">
                   <ShieldCheck className="h-3 w-3" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
                </div>
              )}
              
              <div className="relative mb-10 mt-6">
                <div className="w-56 h-56 rounded-[55px] border-[10px] border-slate-50 shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center rotate-2 group-hover:rotate-0 transition-transform duration-700 scale-105">
                  {(avatarPreview || profile?.avatar_url) ? (
                    <img src={avatarPreview || profile.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                       <User className="h-24 w-24 text-slate-300" />
                    </div>
                  )}
                </div>
                {editing && (
                  <label htmlFor="avatar-upload" className="absolute -bottom-3 -right-3 h-16 w-16 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-slate-900 hover:text-teal-600 hover:scale-110 transition-all cursor-pointer border-4 border-slate-50 active:scale-95">
                    <Camera className="h-7 w-7" />
                    <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{formData.full_name || 'Miembro Store'}</h3>
              <p className="text-teal-600 font-black text-[10px] uppercase tracking-[0.4em] mb-10 bg-teal-50 px-6 py-2.5 rounded-full shadow-sm">Miembro Verificado</p>
              
              <div className="space-y-5 w-full text-left bg-slate-50/60 p-10 rounded-[40px] border border-slate-100/50">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/40 text-slate-400 group-hover:text-teal-600 transition-colors">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Contacto Directo</p>
                    <p className="font-bold text-slate-800 text-lg">{profile?.phone || 'Sin registrar'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/40 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Correo de Cuenta</p>
                    <p className="font-bold text-slate-800 text-lg truncate">{profile?.email || 'Sin correo'}</p>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                    <StickyNote className="h-6 w-6" />
                 </div>
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs italic">Anotaciones Privadas</h4>
              </div>
              {editing ? (
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full min-h-[150px] rounded-2xl bg-slate-50 border-none font-medium text-slate-600 p-6 focus:ring-amber-500"
                  placeholder="Añade recordatorios o preferencias personales..."
                />
              ) : (
                <p className="text-sm text-slate-500 font-medium leading-relaxed italic opacity-80">
                   {profile?.notes || 'No tienes anotaciones personales en tu perfil.'}
                </p>
              )}
           </div>
        </div>

        {/* Right Column: Information & Wishlist */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* General Information Card */}
          <div className="bg-white rounded-[45px] p-12 shadow-xl border border-slate-100 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-xs flex items-center gap-3 italic">
                 <span className="h-2 w-2 bg-slate-900 rounded-full animate-pulse"></span>
                 Información del Titular
              </h4>
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <Settings className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
              <div className="md:col-span-2">
                 <InfoItem label="Nombre Completo o Razón Social" editing={editing}>
                    {editing ? (
                      <Input 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-slate-900"
                        placeholder="Escribe tu nombre"
                      />
                    ) : (
                      <span className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">{profile?.full_name || 'Sin especificar'}</span>
                    )}
                 </InfoItem>
              </div>

              <div className="md:col-span-2">
                <InfoItem label="Correo Electrónico Principal" editing={editing}>
                    {editing && isAdmin ? (
                      <div className="w-full space-y-2">
                        <Input 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 px-6 font-bold focus:ring-amber-500"
                        />
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-tighter">
                           <AlertTriangle className="h-3 w-3" />
                           Aviso: El cambio de correo cerrará su sesión de inmediato.
                        </div>
                      </div>
                    ) : editing && !isAdmin ? (
                      <div className="w-full space-y-2 opacity-60">
                        <Input 
                          value={formData.email} 
                          disabled
                          className="h-14 rounded-2xl bg-slate-100 border-none text-slate-400 px-6 font-bold cursor-not-allowed"
                        />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic ml-1">
                           Para seguridad, contacta a un administrador para cambiar este dato.
                        </p>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-slate-500">{profile?.email || 'No registrado'}</span>
                    )}
                </InfoItem>
              </div>

              <InfoItem label="Fecha de Nacimiento o Fundación" editing={editing}>
                {editing ? (
                  <Input 
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-slate-900"
                  />
                ) : (
                  <span className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-300" />
                    {profile?.date_of_birth ? format(new Date(profile.date_of_birth), 'dd [de] MMMM [de] yyyy', { locale: es }) : 'Por definir'}
                  </span>
                )}
              </InfoItem>

              <InfoItem label="Teléfono Celular" editing={editing}>
                {editing ? (
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-slate-900"
                    placeholder="Número de celular"
                  />
                ) : (
                  <span className="text-lg font-bold text-slate-700">{profile?.phone || 'No registrado'}</span>
                )}
              </InfoItem>

              <div className="md:col-span-2">
                <InfoItem label="Dirección de Envíos y Facturación" editing={editing}>
                  {editing ? (
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 focus:ring-slate-900"
                      placeholder="Calle, Número, Ciudad, Estado..."
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-rose-500 mt-1 shrink-0" />
                        <span className="text-lg font-bold text-slate-600 leading-snug italic">
                          {profile?.address || 'Por favor, registre su dirección para agilizar sus pedidos.'}
                        </span>
                    </div>
                  )}
                </InfoItem>
              </div>
            </div>
          </div>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-xl space-y-6">
                <h5 className="font-black text-slate-900 uppercase tracking-widest text-[10px] italic">Intereses y Categorías</h5>
                {editing ? (
                  <Input 
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder="Joyas, Relojes, Tecnología..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests ? formData.interests.split(',').map((tag: any) => (
                      <Badge key={tag} className="bg-slate-900 text-white font-bold">{tag.trim()}</Badge>
                    )) : <span className="text-xs text-slate-300 italic">Sin etiquetas registradas</span>}
                  </div>
                )}
             </div>

             <div className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-xl space-y-6 flex flex-col justify-center">
                <h5 className="font-black text-slate-900 uppercase tracking-widest text-[10px] italic mb-2">Estatus de Membresía</h5>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-inner">
                      {isAdmin ? <ShieldCheck className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tighter text-slate-800">{isAdmin ? 'Nivel Administrador' : 'Miembro Premium'}</span>
                      <span className="text-[10px] font-bold text-indigo-400">Vinculado desde {profile?.created_at ? format(new Date(profile.created_at), 'yyyy') : '2024'}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Wishlist Section */}
          <div className="bg-slate-900 rounded-[50px] p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Heart className="h-64 w-64 text-white" />
             </div>

             <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-amber-400">
                    <Heart className="h-7 w-7 fill-current" />
                  </div>
                   <div>
                      <h4 className="font-black text-white uppercase tracking-widest text-lg italic">Mi Lista de Deseos</h4>
                      <p className="text-white/40 font-bold text-xs uppercase tracking-widest">tienes {wishlist.length} favoritos guardados</p>
                   </div>
                </div>
                <Link href="/" className="h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                   EXPLORAR CATÁLOGO <ExternalLink className="h-3 w-3" />
                </Link>
             </div>

             {wishlist.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-white/10 rounded-[40px]">
                  <ShoppingBag className="h-20 w-20 text-white mb-6" />
                  <p className="text-white font-black uppercase tracking-widest italic text-sm">Tu lista de deseos está vacía</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {wishlist.map((item) => (
                    <WishlistItem 
                      key={item.id} 
                      item={item} 
                      onRemove={() => removeFromWishlist(item.id)} 
                    />
                  ))}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, children, editing }: any) {
  return (
    <div className="space-y-3">
       <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] ml-1">{label}</p>
       <div className="flex items-center gap-2">
         {children}
       </div>
    </div>
  )
}

function WishlistItem({ item, onRemove }: { item: any, onRemove: () => void }) {
  const product = item.product
  const imageUrl = product?.product_images?.[0]?.image_url

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-[35px] p-6 border border-white/10 hover:bg-white/10 transition-all group flex items-center gap-6">
       <div className="h-24 w-24 rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 shadow-2xl transition-transform group-hover:scale-110">
          {imageUrl ? (
            <SafeImage src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
               <Package className="h-8 w-8" />
            </div>
          )}
       </div>
       <div className="flex-1 min-w-0">
          <h5 className="text-white font-black text-lg leading-tight truncate mb-1">{product?.name || 'Producto'}</h5>
          <p className="text-amber-400 font-black text-sm tracking-widest italic">{product?.base_price ? `$${product.base_price}` : 'Consultar Precio'}</p>
          <div className="flex gap-4 mt-4">
             <Link 
               href={`/producto/${product.slug}`}
               className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest flex items-center gap-1.5"
             >
                VER DETALLES <ExternalLink className="h-3 w-3" />
             </Link>
             <button 
               onClick={onRemove}
               className="text-[10px] font-black text-rose-400/50 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1.5"
             >
                QUITAR <Trash2 className="h-3 w-3" />
             </button>
          </div>
       </div>
    </div>
  )
}
