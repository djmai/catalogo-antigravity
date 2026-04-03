import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/ProductForm'

interface ProductEditPageProps {
  params: { id: string }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const supabase = createClient()
  
  // Fetch categories for the form
  const { data: categories } = await supabase.from('categories').select('*')
  
  let initialData = undefined

  if (params.id !== 'nuevo') {
    const { data: product } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('id', params.id)
      .single()

    if (!product) {
      notFound()
    }
    initialData = product
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          {params.id === 'nuevo' ? 'Crear Producto' : 'Editar Producto'}
        </h1>
        <p className="text-muted-foreground font-medium">
          Completa los detalles para {params.id === 'nuevo' ? 'publicar un nuevo producto' : 'actualizar el producto existente'}.
        </p>
      </div>

      <ProductForm 
        initialData={initialData} 
        categories={categories || []} 
      />
    </div>
  )
}
