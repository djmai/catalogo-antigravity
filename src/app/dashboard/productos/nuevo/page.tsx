import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/ProductForm'
import { PackagePlus } from 'lucide-react'

export const metadata = {
  title: 'Nuevo Producto | Catálogo',
}

export default async function NewProductPage() {
  const supabase = createClient()
  
  // Fetch categories to populate the select dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
             <PackagePlus className="h-6 w-6" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-[#2B364A]">Nuevo Producto</h1>
        </div>
        <p className="text-slate-500 font-medium ml-[60px]">Añade la información detallada para publicar un nuevo producto en tu catálogo.</p>
      </div>

      <div className="ml-[60px]">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  )
}
