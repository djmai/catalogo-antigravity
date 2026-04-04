import React from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Package, 
  Tag, 
  Users, 
  TrendingUp,
  MoreHorizontal,
  Bell,
  Heart,
  ShoppingBag,
  Plus,
  UserCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SafeImage } from '@/components/dashboard/SafeImage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'client'
  const isAdmin = role === 'admin'
  const isEditor = role === 'editor'

  // Fetching data for everyone
  const { data: recentProducts } = await supabase
    .from('products')
    .select('*, product_images(image_url)')
    .order('created_at', { ascending: false })
    .limit(3)
  
  const { data: brandingData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_branding')
    .single()
    
  const branding = brandingData?.value || { site_name: 'PREMIUM HUB' }

  // STATS for Admins/Editors
  if (isAdmin || isEditor) {
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email')
      .limit(4)

    return (
      <div className="flex flex-col lg:flex-row gap-8 min-h-screen animate-in fade-in duration-700 pb-20">
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#2B364A] tracking-tighter uppercase italic">{branding.site_name}</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', weekday: 'long' })}</p>
            </div>
            <div className="flex items-center gap-3">
               <Badge className="bg-[#13C8B5] text-white px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase border-none shadow-lg shadow-[#13C8B5]/20">Sincronizado</Badge>
            </div>
          </div>

          <div className="hidden lg:flex relative overflow-hidden bg-rose-400 rounded-[50px] p-12 items-center justify-between group shadow-2xl shadow-rose-100">
             <div className="relative z-10 space-y-4">
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">¡Buen trabajo!</h2>
                <p className="text-white/90 font-bold text-lg max-w-xs leading-tight">Has alcanzado record de interacciones en el catálogo esta semana.</p>
                <div className="pt-4 flex gap-4">
                   <Button className="h-11 px-8 rounded-2xl bg-white text-rose-500 hover:bg-rose-50 font-black text-xs uppercase tracking-widest">Estadísticas</Button>
                </div>
             </div>
             <div className="relative z-10 bg-white/20 backdrop-blur-md p-10 rounded-[40px] group-hover:scale-110 transition-transform duration-700 border border-white/30 rotate-12">
                <TrendingUp className="h-20 w-20 text-white" />
             </div>
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
             <div className="col-span-1"><StatCard title="Productos" value={productCount || 0} icon={Package} color="text-[#2B364A]" /></div>
             <div className="col-span-1"><StatCard title="Categorías" value={categoryCount || 0} icon={Tag} color="text-[#13C8B5]" /></div>
             <div className="col-span-2 sm:col-span-1"><StatCard title="Usuarios" value={userCount || 0} icon={Users} color="text-indigo-600" /></div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#2B364A] tracking-tight uppercase italic">Reciente en Catálogo</h3>
                <Link href="/dashboard/productos" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#13C8B5] transition-colors border-b-2 border-transparent hover:border-[#13C8B5]">ver todo</Link>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                {recentProducts?.map((product: any) => (
                  <div key={product.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:scale-[1.01] transition-all text-center md:text-left">
                     <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border-4 border-slate-50 shadow-inner p-3 relative">
                         <SafeImage 
                            src={product.product_images?.[product.product_images.length - 1]?.image_url} 
                            alt={product.name}
                            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                     <div className="flex-1 w-full flex flex-col items-center md:items-start">
                        <h4 className="text-lg md:text-xl font-black text-[#2B364A] group-hover:text-black transition-colors">{product.name}</h4>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
                           <span className="text-[10px] md:text-xs font-black text-[#13C8B5] tracking-widest bg-[#13C8B5]/5 px-3 py-1 rounded-full uppercase">${product.base_price}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDistanceToNow(new Date(product.created_at), { addSuffix: true, locale: es })}</span>
                        </div>
                     </div>
                     <Link href={`/dashboard/productos/${product.slug}`} className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center bg-slate-900 rounded-[20px] text-white hover:bg-[#13C8B5] md:hover:scale-110 transition-all shadow-xl active:scale-95 shrink-0">
                        <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                     </Link>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] space-y-10">
           <Card className="border-none shadow-2xl rounded-[50px] bg-[#2B364A] overflow-hidden flex flex-col h-full min-h-[700px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
              <CardContent className="p-12 space-y-12 relative z-10">
                 <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Performance</h3>
                    <div className="h-1.5 w-16 bg-[#13C8B5] rounded-full"></div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Nuevos Clientes</h4>
                       <span className="h-6 w-6 bg-white/10 rounded-full flex items-center justify-center text-white font-black text-[9px]">{profiles?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       {profiles?.map((p: any, i: number) => (
                         <div key={i} className="h-14 w-14 rounded-2xl border-4 border-[#2B364A] overflow-hidden bg-white shadow-2xl flex items-center justify-center font-black text-slate-900 text-xs hover:scale-110 transition-transform cursor-pointer">
                            {p.email[0].toUpperCase()}
                         </div>
                       ))}
                       <div className="h-14 w-14 rounded-2xl border-4 border-[#2B364A] bg-[#13C8B5] shadow-xl flex items-center justify-center text-white cursor-pointer hover:rotate-90 transition-all hover:bg-white hover:text-[#13C8B5]">
                          <Plus className="h-6 w-6" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6 pt-6">
                    <ProgressItem label="Visibilidad Total" value="84%" percentage={84} color="bg-[#13C8B5]" />
                    <ProgressItem label="Interacción Media" value="62%" percentage={62} color="bg-rose-400" />
                    <ProgressItem label="Retención" value="95%" percentage={95} color="bg-indigo-400" />
                 </div>

                 <div className="mt-auto pt-10">
                    <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center">
                       <ShieldCheck className="h-12 w-12 text-[#13C8B5] mb-4" />
                       <p className="text-white/80 font-bold text-sm tracking-tight mb-6 leading-snug">Tu sistema está optimizado y seguro para el tráfico actual.</p>
                       <Button variant="ghost" className="text-white font-black uppercase text-[10px] tracking-widest w-full border-t border-white/10 rounded-none pt-4">Ver Reporte</Button>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    )
  }

  // DATA for Clients
  const { data: wishlistData } = await supabase
    .from('wishlist')
    .select('*, product:products!inner(*, product_images(*))')
    .eq('user_id', user.id)
    .limit(3)
  
  const isProfileComplete = profile?.full_name && profile?.phone && profile?.address;

  return (
    <div className="flex flex-col lg:flex-row gap-10 min-h-screen animate-in fade-in duration-700 pb-20">
      <div className="flex-1 space-y-10">
        
        {/* Client Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-slate-800" />
                 </div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Área de Miembro Premium</span>
              </div>
              <h1 className="text-5xl font-black text-[#2B364A] tracking-tighter uppercase italic leading-none">
                 HOLA, {profile?.full_name ? profile.full_name.split(' ')[0] : user?.email?.split('@')[0]}
              </h1>
              <p className="text-slate-400 text-lg font-bold uppercase tracking-wide">¡Qué placer verte de nuevo en {branding.site_name}!</p>
           </div>
           
           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-5 min-w-[280px]">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isProfileComplete ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                 {isProfileComplete ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isProfileComplete ? 'Pérfil Optimizado' : 'Perfil Incompleto'}</p>
                 <p className="text-sm font-black text-slate-800 leading-tight">{isProfileComplete ? 'Datos al día' : 'Actualiza tus datos'}</p>
                 {!isProfileComplete && <Link href="/dashboard/perfil" className="text-[10px] font-black text-rose-500 uppercase underline mt-1 block">Completar ahora</Link>}
              </div>
           </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           
           {/* Wishlist Preview (Larger card) */}
           <div className="md:col-span-8 bg-white rounded-[50px] p-10 border border-slate-50 shadow-2xl shadow-slate-200/50 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Heart className="h-32 w-32 text-rose-300" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
                       <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                       Mi Lista de Deseos
                    </h3>
                    <Link href="/dashboard/wishlist" className="bg-slate-50 hover:bg-slate-100 h-10 px-6 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#2B364A] transition-all border border-slate-100">Ver todos</Link>
                 </div>

                 {wishlistData && wishlistData.length > 0 ? (
                    <div className="space-y-4">
                       {wishlistData.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-6 p-5 bg-slate-50/50 rounded-[30px] border border-transparent hover:border-slate-100 hover:bg-white transition-all group/item shadow-sm">
                             <div className="h-20 w-20 bg-white rounded-2xl overflow-hidden border border-slate-100 p-2">
                                <SafeImage src={item.product?.product_images?.[0]?.image_url} alt={item.product?.name} className="w-full h-full object-contain group-hover/item:scale-110 transition-all duration-500" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-800 truncate">{item.product?.name}</h4>
                                <span className="text-xs font-bold text-[#13C8B5] tracking-widest mt-1 block uppercase italic">${item.product?.base_price}</span>
                             </div>
                             <Link href={`/dashboard/productos/${item.product?.slug}`} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-[#13C8B5] shadow-sm transform group-hover/item:translate-x-2 transition-all">
                                <ArrowRight className="h-5 w-5" />
                             </Link>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-10 text-center">
                       <p className="text-slate-400 font-bold italic">Tu lista de deseos está esperando nuevos productos.</p>
                       <Link href="/" className="inline-block mt-4 text-xs font-black text-[#13C8B5] uppercase underline">Explorar catálogo</Link>
                    </div>
                 )}
              </div>
           </div>

           {/* Profile Quick Stats */}
           <div className="md:col-span-4 bg-[#2B364A] rounded-[50px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#13C8B5]/10 to-transparent"></div>
              <div className="relative z-10 space-y-10 h-full flex flex-col pt-4">
                 <div className="flex flex-col items-center text-center">
                    <div className="h-28 w-28 rounded-[40px] bg-white/10 p-1 mb-6 border border-white/20 relative rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-2xl overflow-hidden">
                       {profile?.avatar_url ? (
                         <Image 
                           src={profile.avatar_url} 
                           alt="Avatar de Usuario" 
                           fill 
                           className="object-cover" 
                           unoptimized
                         />
                       ) : (
                         <UserCircle className="h-full w-full text-white/50 p-6" />
                       )}
                    </div>
                    <div className="px-4 w-full">
                       <h4 className="text-2xl font-black text-white italic truncate tracking-tight uppercase">{profile?.full_name?.split(' ')[0] || 'Mi Perfil'}</h4>
                       <p className="text-[10px] font-black text-[#13C8B5] uppercase tracking-[0.3em] mt-2 opacity-80 leading-none">Miembro Exclusivo</p>
                    </div>
                 </div>

                 <div className="space-y-4 w-full mt-auto">
                    <Link href="/dashboard/perfil" className="w-full h-14 bg-white/5 hover:bg-white text-white hover:text-[#2B364A] rounded-[24px] flex items-center justify-center font-black text-[10px] uppercase tracking-widest transition-all gap-2 border border-white/10 group/btn">
                       <UserCircle className="h-4 w-4 text-[#13C8B5]" />
                       Gestionar Perfil
                    </Link>
                    <div className="pt-6 space-y-4 border-t border-white/5 px-2">
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                           <span className="text-white/40">Registro:</span>
                           <span className="text-white">{format(new Date(profile?.created_at), 'yyyy')}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                           <span className="text-white/40">Status:</span>
                           <span className="text-[#13C8B5] flex items-center gap-1">
                              Activo <div className="h-1 w-1 bg-[#13C8B5] rounded-full animate-pulse"></div>
                           </span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Recently Viewed - Matching UI of "Recent Sold" */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-[#2B364A] tracking-tighter uppercase italic flex items-center gap-3">
                 <Clock className="h-8 w-8 text-indigo-500" />
                 Vistos Recientemente
              </h3>
              <button className="text-slate-300 text-xs font-black uppercase tracking-widest hover:text-indigo-500 transition-colors">Limpiar historial</button>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8 pb-10">
              {recentProducts?.map((product: any) => (
                <div key={product.id} className="bg-white p-5 md:p-10 rounded-[30px] md:rounded-[50px] border border-slate-50 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-700 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-slate-100 group-hover:bg-indigo-100 transition-all"></div>
                   <div className="h-24 w-24 md:h-40 md:w-40 rounded-[24px] md:rounded-[50px] overflow-hidden bg-slate-50 p-4 md:p-6 mb-4 md:mb-8 shadow-inner group-hover:rotate-6 transition-transform">
                       <SafeImage 
                          src={product.product_images?.[product.product_images.length - 1]?.image_url} 
                          alt={product.name}
                          className="h-full w-full object-contain" 
                       />
                   </div>
                   <h4 className="text-sm md:text-xl font-black text-slate-800 line-clamp-1 w-full mb-1 md:mb-2 tracking-tight">{product.name}</h4>
                   <p className="text-[10px] md:text-xs font-black text-[#13C8B5] tracking-widest uppercase">${product.base_price}</p>
                   <Link href={`/dashboard/productos/${product.slug}`} className="mt-4 md:mt-8 h-9 md:h-12 w-full px-2 md:px-8 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl md:rounded-2xl text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center">Ver <span className="hidden md:inline ml-1">Detalles</span></Link>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Right Sidebar - Specific for Clients (Profile data checklist) */}
      <div className="w-full lg:w-[450px] space-y-10">
         <Card className="border-none shadow-2xl rounded-[60px] bg-gradient-to-b from-[#13C8B5] to-[#11b4a3] overflow-hidden flex flex-col h-full min-h-[700px] text-white">
            <CardContent className="p-14 space-y-14">
               <div className="space-y-4">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">COMPLETAR<br/>TU PERFIL</h3>
                  <p className="text-white/80 font-bold text-sm tracking-tight leading-snug">Disfruta de envíos prioridad y atención personalizada 1-a-1.</p>
                  <div className="h-1.5 w-20 bg-white/30 rounded-full"></div>
               </div>

               <div className="space-y-8 bg-black/10 p-10 rounded-[45px] border border-white/10">
                  <DataCheck step="Nombre de Referencia" complete={!!profile?.full_name} />
                  <DataCheck step="Teléfono de Contacto" complete={!!profile?.phone} />
                  <DataCheck step="Dirección de Envío" complete={!!profile?.address} />
                  <DataCheck step="Otras Preferencias" complete={!!profile?.notes} />
               </div>

               <div className="bg-white rounded-[45px] p-10 shadow-2xl">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-[#2B364A]">Nuestras Ventajas</h4>
                  <ul className="space-y-5">
                     <li className="flex items-start gap-4">
                        <Badge className="bg-[#13C8B5] h-6 w-6 rounded-lg p-0 flex items-center justify-center shrink-0 border-none"><CheckCircle2 className="h-4 w-4 text-white" /></Badge>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tight leading-tight">Acceso anticipado a lanzamientos.</span>
                     </li>
                     <li className="flex items-start gap-4">
                        <Badge className="bg-indigo-500 h-6 w-6 rounded-lg p-0 flex items-center justify-center shrink-0 border-none"><CheckCircle2 className="h-4 w-4 text-white" /></Badge>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tight leading-tight">Historial de navegación segmentado.</span>
                     </li>
                  </ul>
                  <div className="pt-10">
                     <Link href="/dashboard/perfil" className="w-full h-16 bg-[#2B364A] text-white rounded-[24px] flex items-center justify-center font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3 overflow-hidden group">
                        IR A EDITAR <ArrowRight className="h-5 w-5 text-[#13C8B5] group-hover:translate-x-2 transition-transform" />
                     </Link>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-lg shadow-slate-100/50 rounded-[28px] lg:rounded-[50px] p-5 lg:p-10 hover:shadow-2xl transition-all group overflow-hidden relative border border-white h-full">
      <div className={`absolute top-0 right-0 p-3 lg:p-8 opacity-5 group-hover:scale-125 transition-transform ${color}`}>
        <Icon className="h-20 w-20 lg:h-32 lg:w-32" />
      </div>
      <div className="space-y-1 lg:space-y-2 relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
         <div className={`h-10 w-10 lg:h-12 lg:w-12 ${color.replace('text-', 'bg-')}/10 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-6 shadow-inner`}>
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
         </div>
         <h3 className="text-3xl lg:text-5xl font-black text-[#2B364A] tracking-tighter hover:scale-110 transition-transform origin-left">{value}</h3>
         <p className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      </div>
    </Card>
  )
}

function ProgressItem({ label, value, percentage, color }: any) {
  return (
    <div className="bg-white/5 p-8 rounded-[45px] space-y-6 border border-white/5 hover:bg-white/10 transition-all group">
       <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white/70 uppercase tracking-widest">{label}</span>
          <span className="text-md font-black text-white">{value}</span>
       </div>
       <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.3)]`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  )
}

function DataCheck({ step, complete }: { step: string, complete: boolean }) {
  return (
    <div className="flex items-center justify-between group">
       <span className={`text-xs font-black uppercase tracking-tight transition-all duration-500 ${complete ? 'text-white' : 'text-white/30'}`}>{step}</span>
       <div className={`h-8 w-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${complete ? 'bg-white border-white text-[#13C8B5] rotate-[360deg] shadow-lg shadow-white/20' : 'border-white/10 text-white/5'}`}>
          <CheckCircle2 className="h-5 w-5" />
       </div>
    </div>
  )
}
