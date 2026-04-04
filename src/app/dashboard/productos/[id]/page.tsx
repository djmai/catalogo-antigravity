import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/ProductForm'
import { FileEdit, PackageX } from 'lucide-react'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Editar Producto | Catálogo',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const supabase = createClient()
  
  // 1. Obtener el producto
  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(image_url)')
    .eq('id', params.id)
    .single()

  if (!product) {
    return notFound()
  }

  // 2. Obtener categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
             <FileEdit className="h-6 w-6" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-[#2B364A]">Editar Producto</h1>
        </div>
        <p className="text-slate-500 font-medium ml-[60px]">Modifica los detalles del producto y actualiza tu base de datos de inmediato.</p>
      </div>

      <div className="ml-[60px]">
        <ProductForm categories={categories || []} initialData={product} />
      </div>
    </div>
  )
}
