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
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

export const metadata = {
  title: 'Categorías | Admin',
}

export default async function AdminCategoriesPage() {
  const supabase = createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Gestión de Categorías</h1>
          <p className="text-muted-foreground font-medium mt-1">Organiza tu catálogo agrupando los productos.</p>
        </div>
        <Link href="/dashboard/categorias/nuevo">
          <Button className="h-14 px-8 bg-slate-900 hover:bg-primary transition-all text-white rounded-2xl shadow-xl active:scale-95 text-base font-black">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre o slug..." 
            className="w-full pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium text-slate-700 focus-visible:ring-1 focus-visible:ring-slate-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] pl-8">Nombre de Categoría</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Slug</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Fecha de Creación</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right pr-8">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-900">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-xs font-black text-muted-foreground tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full">
                      {category.slug}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-medium text-slate-500">
                      {category.created_at ? format(new Date(category.created_at), 'dd/MM/yyyy') : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/categorias/${category.id}`}>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                    <Tag className="h-12 w-12" />
                    <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No hay categorías registradas</p>
                    <Link href="/dashboard/categorias/nuevo">
                      <Button variant="outline" size="sm" className="mt-2">Crear primera categoría</Button>
                    </Link>
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
