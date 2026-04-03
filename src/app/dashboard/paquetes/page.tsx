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
import { Boxes, Plus, Edit, Trash2, Package as PackageIcon, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { PackageForm } from '@/components/dashboard/PackageForm'
import { Product } from '@/types'
import { toast } from 'react-hot-toast'

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(undefined)
  
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: pkgData } = await supabase
        .from('packages')
        .select('*, package_products(product_id, quantity, products(name))')
        .order('created_at', { ascending: false })
      
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      if (pkgData) setPackages(pkgData)
      if (prodData) setAllProducts(prodData)
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
    if (!confirm('¿Estás seguro de eliminar este paquete?')) return
    
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id)
      if (error) throw error
      toast.success('Paquete eliminado')
      fetchData()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setSelectedPackage(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (pkg: any) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            <Boxes className="h-10 w-10 text-primary" />
            Gestión de Paquetes
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Crea bundles de productos con precios especiales.</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="h-12 px-8 bg-slate-900 hover:bg-primary transition-all text-white rounded-2xl shadow-xl active:scale-95 text-sm font-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paquete
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Paquete</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Productos Incluidos</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Precio Especial</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Estado</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando paquetes...</p>
                </TableCell>
              </TableRow>
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <TableRow key={pkg.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{pkg.name}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">slug: {pkg.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                      {pkg.package_products?.map((pp: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          <PackageIcon className="h-3 w-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-900 uppercase">{pp.products?.name}</span>
                          <Badge variant="outline" className="h-4 p-0 px-1 text-[9px] border-primary text-primary font-bold">x{pp.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="font-black text-slate-900 text-lg">
                      {formatPrice(pkg.special_price)}
                    </span>
                  </TableCell>
                  <TableCell className="py-6">
                    {pkg.is_active ? (
                      <Badge className="bg-teal-50 text-teal-700 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">Activo</Badge>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        onClick={() => openEditDialog(pkg)}
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 rounded-xl p-0 hover:bg-slate-100"
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(pkg.id)}
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
                    <Boxes className="h-12 w-12" />
                    <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No hay paquetes creados</p>
                    <Button variant="outline" size="sm" onClick={openCreateDialog}>Crear primer bundle</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl rounded-3xl p-8 border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {selectedPackage ? 'Editar Paquete' : 'Nuevo Paquete'}
            </DialogTitle>
            <DialogDescription className="font-medium text-sm text-muted-foreground">
              {selectedPackage ? 'Actualiza los productos y el precio especial del bundle.' : 'Agrupa productos para ofrecer un precio especial de conjunto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PackageForm 
              allProducts={allProducts} 
              initialData={selectedPackage} 
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
