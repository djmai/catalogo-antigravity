'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Droplets, 
  AlertCircle,
  FileText,
  StickyNote,
  Clock,
  Printer,
  Edit3,
  Check,
  X,
  Loader2,
  Camera,
  Heart,
  TrendingUp,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Edit form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    blood_type: '',
    allergies: '',
    chronic_diseases: '',
    notes: ''
  })

  const supabase = createClient()

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          date_of_birth: data.date_of_birth || '',
          blood_type: data.blood_type || '',
          allergies: data.allergies || '',
          chronic_diseases: data.chronic_diseases || '',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth || null,
          blood_type: formData.blood_type,
          allergies: formData.allergies,
          chronic_diseases: formData.chronic_diseases,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)
      
      if (error) throw error
      toast.success('Perfil actualizado con éxito')
      setEditing(false)
      fetchProfile()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#13C8B5]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
               <User className="h-6 w-6 text-slate-800" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Perfil del Usuario</h2>
         </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 gap-2 border-2">
            <Printer className="h-4 w-4" />
            IMPRIMIR
          </Button>
          {!editing ? (
            <Button 
              onClick={() => setEditing(true)}
              className="h-11 px-8 rounded-xl bg-[#2B364A] hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/10 gap-2"
            >
              <Edit3 className="h-4 w-4 text-[#ffc64d]" />
              EDITAR PERFIL
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setEditing(false)}
                variant="ghost"
                className="h-11 px-4 rounded-xl text-slate-400 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="h-11 px-8 rounded-xl bg-[#13C8B5] hover:bg-[#0EA898] text-white font-bold shadow-xl gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                GUARDAR CAMBIOS
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (4/12): Essential Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-white flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-3 bg-[#13C8B5]"></div>
              
              <div className="relative mb-8 mt-4">
                <div className="w-48 h-48 rounded-[60px] border-8 border-slate-50 shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 scale-105">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-20 w-20 text-slate-300" />
                  )}
                </div>
                {editing && (
                  <button className="absolute -bottom-2 -right-2 h-14 w-14 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-[#13C8B5] hover:scale-110 transition-transform active:scale-95 border-2 border-slate-50">
                    <Camera className="h-6 w-6" />
                  </button>
                )}
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{formData.full_name || 'Nuevo Miembro'}</h3>
              <p className="text-[#13C8B5] font-black text-xs uppercase tracking-[0.3em] mb-8 bg-[#13C8B5]/5 px-5 py-2 rounded-full">Cliente Premium</p>
              
              <div className="space-y-4 w-full text-left bg-slate-50/80 p-8 rounded-[35px] border border-slate-100/50">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 text-[#13C8B5]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Teléfono Directo</p>
                    <p className="font-bold text-slate-700">{profile?.phone || 'No configurado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 text-indigo-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email de Acceso</p>
                    <p className="font-bold text-slate-700 truncate">{profile?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 w-full flex justify-around">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Órdenes</p>
                    <p className="text-xl font-black text-slate-800">12</p>
                 </div>
                 <div className="h-10 w-px bg-slate-100"></div>
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Favoritos</p>
                    <p className="text-xl font-black text-[#13C8B5]">42</p>
                 </div>
                 <div className="h-10 w-px bg-slate-100"></div>
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Nivel</p>
                    <p className="text-xl font-black text-indigo-600">VIP</p>
                 </div>
              </div>
           </div>

           {/* Notes Card */}
           <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                    <StickyNote className="h-6 w-6" />
                  </div>
                  <h4 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Notas y Referencias</h4>
                </div>
                <button className="h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-300">
                   <Clock className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {editing ? (
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full h-40 p-6 rounded-[30px] bg-slate-50 border-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-600 text-sm leading-relaxed"
                    placeholder="Escribe notas sobre tus preferencias..."
                  />
                ) : (
                  <div className="p-7 rounded-[30px] bg-amber-50/20 border border-amber-100/30">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                      {profile?.notes || 'No has añadido notas privadas a tu perfil todavía.'}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center px-2">
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Última edición: Ayer</span>
                   <Button variant="ghost" size="sm" className="h-8 text-[#13C8B5] font-black text-[10px] uppercase p-0">VER HISTORIAL</Button>
                </div>
              </div>
           </div>
        </div>

        {/* Right Column (8/12): Tabs & Detailed Info */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Information Card */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 relative group overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h4 className="font-black text-slate-800 uppercase tracking-[0.25em] text-[10px] flex items-center gap-3">
                   <span className="h-1.5 w-1.5 bg-[#13C8B5] rounded-full"></span>
                   Información de Usuario
                </h4>
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#13C8B5] group-hover:text-white transition-colors duration-500 cursor-pointer">
                  <User className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <InfoItem label="Nombre Completo" editing={editing}>
                   {editing ? (
                     <Input 
                       value={formData.full_name} 
                       onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                       className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                     />
                   ) : (
                     <span className="text-lg font-black text-slate-800">{profile?.full_name || 'Sin especificar'}</span>
                   )}
                </InfoItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoItem label="Fecha de Nacimiento" editing={editing}>
                    {editing ? (
                      <Input 
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                      />
                    ) : (
                      <span className="text-md font-bold text-slate-700">
                        {profile?.date_of_birth ? format(new Date(profile.date_of_birth), 'dd MMMM yyyy', { locale: es }) : 'No definida'}
                      </span>
                    )}
                  </InfoItem>

                  <InfoItem label="Teléfono Contacto" editing={editing}>
                    {editing ? (
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                      />
                    ) : (
                      <span className="text-md font-bold text-slate-700">{profile?.phone || 'No registrado'}</span>
                    )}
                  </InfoItem>
                </div>

                <InfoItem label="Dirección de Envío Principal" editing={editing}>
                   {editing ? (
                     <Input 
                       value={formData.address}
                       onChange={(e) => setFormData({...formData, address: e.target.value})}
                       className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                     />
                   ) : (
                     <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-rose-400 mt-1 shrink-0" />
                        <span className="text-md font-bold text-slate-600 leading-relaxed italic">
                           {profile?.address || 'Por favor añade tu dirección para envíos.'}
                        </span>
                     </div>
                   )}
                </InfoItem>
              </div>
            </div>

            {/* Health / Preferences Card (Matches Image Layout) */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 relative group overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h4 className="font-black text-slate-800 uppercase tracking-[0.25em] text-[10px] flex items-center gap-3">
                   <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                   Perfil y Preferencias
                </h4>
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500 cursor-pointer">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-8">
                <InfoItem label="Categorías Favoritas / Alergias" editing={editing}>
                  {editing ? (
                    <Input 
                      value={formData.allergies}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                       {profile?.allergies ? profile.allergies.split(',').map((tag: string) => (
                         <Badge key={tag} className="bg-rose-50 text-rose-600 border-none px-3 font-bold">{tag.trim()}</Badge>
                       )) : <span className="text-slate-400 italic">Sin preferencias marcadas</span>}
                    </div>
                  )}
                </InfoItem>

                <InfoItem label="Estilo / Marcas de Interés" editing={editing}>
                  {editing ? (
                    <Input 
                      value={formData.chronic_diseases}
                      onChange={(e) => setFormData({...formData, chronic_diseases: e.target.value})}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                    />
                  ) : (
                    <span className="text-md font-bold text-slate-700">{profile?.chronic_diseases || 'Tendencias, Premium, Relojería'}</span>
                  )}
                </InfoItem>

                <InfoItem label="Perfil de Cliente / Tipo Sangre" editing={editing}>
                   {editing ? (
                     <Input 
                       value={formData.blood_type}
                       onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                       className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700"
                     />
                   ) : (
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                           {profile?.blood_type || 'A+'}
                        </div>
                        <span className="text-md font-black text-indigo-600 uppercase tracking-widest">{profile?.blood_type ? 'Verificado' : 'Perfil Básico'}</span>
                     </div>
                   )}
                </InfoItem>
              </div>
            </div>
          </div>

          {/* Activity Section (Middle large card) */}
          <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
             <div className="flex items-center gap-12 border-b border-slate-100 mb-10">
                <button className="pb-6 text-sm font-black border-b-4 border-[#13C8B5] text-slate-800 uppercase tracking-widest">
                   Actividad Reciente <span className="text-[#13C8B5] ml-2">(2)</span>
                </button>
                <button className="pb-6 text-sm font-black border-b-4 border-transparent text-slate-400 uppercase tracking-widest hover:text-slate-600">
                   Favoritos <span className="opacity-50 ml-2">(15)</span>
                </button>
                <button className="pb-6 text-sm font-black border-b-4 border-transparent text-slate-400 uppercase tracking-widest hover:text-slate-600">
                   Tratamientos / Planes
                </button>
             </div>

             <div className="space-y-4">
                <ActivityItem 
                   time="11:00 - 12:30"
                   date="26 Ago 2024"
                   action="Tratamiento Facial Premium"
                   doctor="Dra. Oksana Ma."
                   status="Agendado"
                   color="bg-emerald-50 text-emerald-600"
                />
                <ActivityItem 
                   time="11:00 - 12:30"
                   date="27 Sep 2024"
                   action="Limpieza Dental Láser"
                   doctor="Dr. Max Oched..."
                   status="Agendado"
                   color="bg-[#13C8B5]/10 text-[#13C8B5]"
                />
             </div>
          </div>

          {/* Files / Attachments Section (Bottom large card) */}
          <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Archivos y Documentos</h4>
                </div>
                <Button variant="outline" className="text-indigo-600 font-bold text-[10px] uppercase px-6 border-2 border-indigo-50 hover:bg-indigo-50 rounded-xl">Descargar Todo</Button>
             </div>

             <div className="grid grid-cols-1 gap-3">
                <FileRow name="Resultado_Chequeo_General.pdf" size="123 KB" />
                <FileRow name="Historial_Clinico_Septiembre.pdf" size="84 KB" />
                <FileRow name="Prescripcion_Medica_Reloj.pdf" size="1.4 MB" isCurrent />
                <FileRow name="Check_Up_Result_V2.pdf" size="123 KB" />
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, children, editing }: any) {
  return (
    <div className="space-y-2">
       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</p>
       <div className="flex items-center gap-2">
         {children}
       </div>
    </div>
  )
}

function ActivityItem({ time, date, action, doctor, status, color }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[30px] border border-slate-50 hover:bg-slate-50/50 transition-all group hover:scale-[1.01]">
       <div className="flex flex-col min-w-[140px] border-l-4 border-indigo-200 pl-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{date}</span>
       </div>
       <div className="flex-1 flex flex-col">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Servicio:</span>
          <span className="text-[13px] font-bold text-slate-600 leading-tight">{action}</span>
       </div>
       <div className="flex-1 flex flex-col">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Especialista:</span>
          <span className="text-[13px] font-bold text-indigo-600/80">{doctor}</span>
       </div>
       <div className="flex flex-col items-start md:items-end min-w-[120px]">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Estado:</span>
          <Badge className={`border-none font-black text-[9px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full ${color}`}>
             {status} <span className="inline-block ml-1 h-1 w-1 bg-current rounded-full animate-pulse"></span>
          </Badge>
       </div>
    </div>
  )
}

function FileRow({ name, size, isCurrent }: any) {
  return (
    <div className={`p-5 rounded-[25px] flex items-center justify-between group transition-all ${isCurrent ? 'bg-indigo-50/40 border border-indigo-100/50' : 'hover:bg-slate-50 border border-transparent'}`}>
       <div className="flex items-center gap-5">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isCurrent ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-white text-slate-400 shadow-slate-100'}`}>
             <FileText className="h-5 w-5" />
          </div>
          <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{name}</p>
       </div>
       <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{size}</span>
          <div className="flex gap-2">
             <button className="h-9 w-9 bg-white shadow-xl shadow-slate-200/50 rounded-xl flex items-center justify-center text-[#13C8B5] hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
             </button>
             <button className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                <X className="h-4 w-4" />
             </button>
          </div>
       </div>
    </div>
  )
}
