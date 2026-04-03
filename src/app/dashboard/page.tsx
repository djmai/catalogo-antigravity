import React from 'react'
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
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { SafeImage } from '@/components/dashboard/SafeImage'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Fetch stats and actual data
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  const { data: recentProducts } = await supabase
    .from('products')
    .select('*, product_images(image_url)')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('email')
    .limit(4)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      
      {/* Left / Main Dashboard Area */}
      <div className="flex-1 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#2B364A]">¡Bienvenido de nuevo, {user?.email?.split('@')[0]}!</h1>
            <p className="text-slate-400 font-medium">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', weekday: 'long' })}</p>
          </div>
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all">
            <Bell className="h-5 w-5 text-[#2B364A]" />
          </div>
        </div>

        {/* Hero "Good Job" Banner matching reference */}
        <div className="relative overflow-hidden bg-rose-400 rounded-[40px] p-10 flex items-center justify-between group">
           <div className="relative z-10 space-y-2">
              <h2 className="text-4xl font-black text-white italic tracking-tight">¡Buen trabajo!</h2>
              <p className="text-white/80 font-medium max-w-[280px]">Has tenido más de 20,000 visitantes en los últimos 10 días. ¡Sigue así!</p>
           </div>
           <div className="relative z-10 bg-white/20 backdrop-blur-md p-6 rounded-3xl group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag className="h-16 w-16 text-white" />
           </div>
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Small Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <Card className="border-none shadow-sm rounded-[32px] p-6 hover:shadow-xl transition-all">
              <div className="space-y-1">
                 <h3 className="text-3xl font-black text-[#2B364A]">+8,5k</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Favoritos</p>
              </div>
           </Card>
           <Card className="border-none shadow-sm rounded-[32px] p-6 hover:shadow-xl transition-all">
              <div className="space-y-1">
                 <h3 className="text-3xl font-black text-[#2B364A]">+5,2k</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Añadidos</p>
              </div>
           </Card>
           <Card className="border-none shadow-sm rounded-[32px] p-6 hover:shadow-xl transition-all">
              <div className="space-y-1">
                 <h3 className="text-3xl font-black text-[#2B364A]">+1,2k</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interacciones</p>
              </div>
           </Card>
        </div>

        {/* Recent Sold / Products section matching reference */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#2B364A]">Vistos Recientemente</h3>
              <Link href="/dashboard/productos" className="text-slate-400 text-sm font-bold hover:text-[#13C8B5]">ver todo</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentProducts?.map((product: any) => (
                <div key={product.id} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                   <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 p-2">
                       <SafeImage 
                          src={product.product_images?.[product.product_images.length - 1]?.image_url} 
                          alt={product.name}
                          className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" 
                       />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[#2B364A] truncate">{product.name}</h4>
                      <p className="text-xs font-bold text-[#13C8B5] mt-1">${product.base_price}</p>
                   </div>
                   <div className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-xl group-hover:bg-[#13C8B5] transition-colors">
                      <TrendingUp className="h-4 w-4 text-[#2B364A] group-hover:text-white" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Performance Sidebar Area */}
      <div className="w-full lg:w-[400px] space-y-8">
         <Card className="border-none shadow-2xl rounded-[40px] bg-[#ffc64d] overflow-hidden flex flex-col h-full min-h-[600px]">
            <CardContent className="p-10 space-y-10">
               <div>
                  <h3 className="text-2xl font-black text-[#2B364A]">Performance</h3>
               </div>

               {/* New Clients Section */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-sm font-black text-[#2B364A]">Nuevos Clientes (21)</h4>
                     <button className="text-xs font-bold text-[#2B364A]/60">ver todos</button>
                  </div>
                  <div className="flex items-center gap-3">
                     {profiles?.map((p: any, i: number) => (
                       <div key={i} className="h-12 w-12 rounded-full border-4 border-[#ffc64d] overflow-hidden bg-white shadow-lg flex items-center justify-center font-black text-[#2B364A] text-xs">
                          {p.email[0].toUpperCase()}
                       </div>
                     ))}
                     <div className="h-12 w-12 rounded-full border-4 border-[#ffc64d] bg-[#2B364A] shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                     </div>
                  </div>
               </div>

               {/* Your progress list Section */}
               <div className="space-y-6 pt-4">
                  <h4 className="text-sm font-black text-[#2B364A]">Tu progreso</h4>
                  
                  <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm border border-black/5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <TrendingUp className="h-4 w-4 text-[#2B364A]/40" />
                           <span className="text-xs font-black text-[#2B364A]">Ingresos Totales</span>
                        </div>
                        <span className="text-sm font-black text-[#2B364A]">$ 15,5k</span>
                     </div>
                     <div className="h-1.5 w-full bg-[#ffc64d]/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ffc64d] rounded-full w-[70%]" />
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm border border-black/5 opacity-80">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Tag className="h-4 w-4 text-[#2B364A]/40" />
                           <span className="text-xs font-black text-[#2B364A]">Menos Vendido</span>
                        </div>
                        <span className="text-sm font-black text-[#2B364A]">$ 5,4k</span>
                     </div>
                     <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full w-[30%]" />
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm border border-black/5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Package className="h-4 w-4 text-[#2B364A]/40" />
                           <span className="text-xs font-black text-[#2B364A]">Mejor Vendido</span>
                        </div>
                        <span className="text-sm font-black text-[#2B364A]">$ 10,6k</span>
                     </div>
                     <div className="h-1.5 w-full bg-[#13C8B5]/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#13C8B5] rounded-full w-[85%]" />
                     </div>
                  </div>
               </div>

            </CardContent>
         </Card>
      </div>

    </div>
  )
}
