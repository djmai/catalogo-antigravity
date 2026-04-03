'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star,
  MessageSquare,
  Package,
  Calendar,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviews = async () => {
    setLoading(true)
    // Simulated data since table might not exist yet, 
    // but structure is ready for when it does.
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
      else {
        // Fallback mock for UI demonstration if table is missing
        setReviews([
          { id: '1', rating: 5, comment: '¡Excelente producto! Muy recomendado.', user_email: 'cliente@ejemplo.com', created_at: new Date().toISOString(), status: 'approved', products: { name: 'Producto Demo' } },
          { id: '2', rating: 4, comment: 'Buena calidad, llegó a tiempo.', user_email: 'user2@test.es', created_at: new Date().toISOString(), status: 'pending', products: { name: 'Producto Demo 2' } }
        ])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-[#2B364A] flex items-center gap-4">
          <MessageSquare className="h-10 w-10 text-[#13C8B5]" />
          Reseñas de Clientes
        </h1>
        <p className="text-muted-foreground font-medium mt-1">Modera y gestiona el feedback de tus compradores.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px]">Producto</TableHead>
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px]">Usuario</TableHead>
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px]">Calificación</TableHead>
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px]">Comentario</TableHead>
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px]">Estado</TableHead>
              <TableHead className="py-6 font-black text-[#2B364A] uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#13C8B5]" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando reseñas...</p>
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <MessageSquare className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay reseñas registradas aún</p>
                </TableCell>
              </TableRow>
            ) : reviews.map((r) => (
              <TableRow key={r.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors group">
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#13C8B5]/10 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-[#13C8B5]" />
                    </div>
                    <span className="font-bold text-[#2B364A] text-sm">{r.products?.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <span className="text-xs font-medium text-slate-500">{r.user_email}</span>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex text-amber-400">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`} />
                     ))}
                   </div>
                </TableCell>
                <TableCell className="py-6">
                  <p className="text-xs text-slate-600 italic font-medium max-w-xs truncate">&quot;{r.comment}&quot;</p>
                </TableCell>
                <TableCell className="py-6">
                   <Badge className={`font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-md border-none ${
                     r.status === 'approved' ? 'bg-[#6CF3D5]/20 text-[#21A3A3]' : 'bg-amber-100 text-amber-600'
                   }`}>
                     {r.status === 'approved' ? 'Aprobada' : 'Pendiente'}
                   </Badge>
                </TableCell>
                <TableCell className="py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[#6CF3D5]/20 text-[#21A3A3]">
                       <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50 text-rose-500">
                       <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
