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
import { Tag, Plus, Edit, Trash2, Calendar, Percent, Banknote, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { DiscountForm } from '@/components/dashboard/DiscountForm'
import { Product, Discount } from '@/types'
import { toast } from 'react-hot-toast'

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | undefined>(undefined)
  
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: discData } = await supabase
        .from('discounts')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
      
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      if (discData) setDiscounts(discData)
      if (prodData) setProducts(prodData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este descuento?')) return
    
    try {
      const { error } = await supabase.from('discounts').delete().eq('id', id)
      if (error) throw error
      toast.success('Descuento eliminado')
      fetchData()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setSelectedDiscount(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (discount: Discount) => {
    setSelectedDiscount(discount)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            <Tag className="h-10 w-10 text-primary" />
            Gestión de Descuentos
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Configura ofertas temporales para tus productos.</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="h-12 px-8 bg-slate-900 hover:bg-primary transition-all text-white rounded-2xl shadow-xl active:scale-95 text-sm font-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Oferta
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Producto</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Tipo</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Valor</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Período</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando ofertas...</p>
                </TableCell>
              </TableRow>
            ) : discounts.length > 0 ? (
              discounts.map((d) => (
                <TableRow key={d.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                  <TableCell className="py-6">
                    <span className="font-bold text-slate-900">{d.products?.name || 'Producto eliminado'}</span>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-widest ${d.type === 'percentage' ? 'border-primary text-primary bg-primary/5' : 'border-slate-400 text-slate-600 bg-slate-50'}`}>
                      {d.type === 'percentage' ? <Percent className="mr-1 h-3 w-3" /> : <Banknote className="mr-1 h-3 w-3" />}
                      {d.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="font-black text-slate-900 text-lg">
                      {d.type === 'percentage' ? `${d.value}%` : formatPrice(d.value)}
                    </span>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <Calendar className="h-3 w-3 text-primary" />
                        Del {format(new Date(d.start_date), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <Calendar className="h-3 w-3 text-rose-600" />
                        Al {format(new Date(d.end_date), 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        onClick={() => openEditDialog(d)}
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 rounded-xl p-0 hover:bg-slate-100"
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(d.id)}
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 rounded-xl p-0 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                    <Tag className="h-12 w-12" />
                    <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No hay ofertas configuradas</p>
                    <Button variant="outline" size="sm" onClick={openCreateDialog}>Crear primera oferta</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-8 border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {selectedDiscount ? 'Editar Oferta' : 'Nueva Oferta'}
            </DialogTitle>
            <DialogDescription className="font-medium text-sm text-muted-foreground">
              {selectedDiscount ? 'Modifica los detalles de la oferta actual.' : 'Define el descuento que se aplicará al producto seleccionado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <DiscountForm 
              products={products} 
              initialData={selectedDiscount} 
              onClose={() => {
                setIsDialogOpen(false)
                fetchData()
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
