import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
import { Plus, Edit, Trash2, Search, Filter, MoreHorizontal, ExternalLink, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils/formatPrice'
import Image from 'next/image'
import { SafeImage } from '@/components/dashboard/SafeImage'

export default async function AdminProductsPage() {
  const supabase = createClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name), product_images(image_url), discounts(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Gestión de Productos</h1>
          <p className="text-muted-foreground font-medium mt-1">Crea, edita y administra el inventario de tu catálogo.</p>
        </div>
        <Link href="/dashboard/productos/nuevo">
          <Button className="h-14 px-8 bg-slate-900 hover:bg-primary transition-all text-white rounded-2xl shadow-xl active:scale-95 text-base font-black">
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o descripción..." 
            className="pl-10 h-12 bg-white border-none focus:ring-primary shadow-none rounded-xl"
          />
        </div>
        <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white border border-gray-50 flex-shrink-0">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-[80px] py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Img</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Nombre</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Categoría</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Precio</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Estado</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => {
                const mainImage = product.product_images?.[0]?.image_url || '/placeholder-product.png'
                const hasActiveDiscount = product.discounts?.some((d: any) => {
                  const now = new Date()
                  return now >= new Date(d.start_date) && now <= new Date(d.end_date)
                })

                return (
                  <TableRow key={product.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                    <TableCell className="py-4">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                        <SafeImage 
                          src={mainImage} 
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{product.name}</span>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">slug: {product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none font-bold text-[10px]">
                        {product.categories?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{formatPrice(product.base_price)}</span>
                        {hasActiveDiscount && (
                          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Con Oferta</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {product.is_active ? (
                        <div className="flex items-center gap-2 text-teal-600">
                          <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                          <span className="text-xs font-black uppercase tracking-widest">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                          <span className="text-xs font-black uppercase tracking-widest">Inactivo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/producto/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 hover:bg-slate-100" title="Ver en catálogo">
                            <ExternalLink className="h-4 w-4 text-slate-600" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/productos/${product.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 hover:bg-slate-100" title="Editar">
                            <Edit className="h-4 w-4 text-slate-600" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 hover:bg-red-50 hover:text-red-700" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                    <Package className="h-12 w-12" />
                    <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No hay productos registrados</p>
                    <Button variant="outline" size="sm">Crear primer producto</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
