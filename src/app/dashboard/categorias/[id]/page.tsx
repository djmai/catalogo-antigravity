import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/dashboard/CategoryForm'
import { Tag, Edit } from 'lucide-react'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Editar Categoría | Catálogo',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!category) {
    return notFound()
  }

  return (
    <div className="space-y-8 pb-20 max-w-2xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
             <Edit className="h-6 w-6" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-[#2B364A]">Editar Categoría</h1>
        </div>
        <p className="text-slate-500 font-medium ml-[60px]">Modifica el nombre y la url de esta categoría.</p>
      </div>

      <div className="ml-[60px]">
        <CategoryForm initialData={category} />
      </div>
    </div>
  )
}
