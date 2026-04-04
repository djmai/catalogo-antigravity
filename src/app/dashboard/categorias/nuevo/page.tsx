import React from 'react'
import { CategoryForm } from '@/components/dashboard/CategoryForm'
import { Tag } from 'lucide-react'

export const metadata = {
  title: 'Nueva Categoría | Catálogo',
}

export default function NewCategoryPage() {
  return (
    <div className="space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
             <Tag className="h-6 w-6" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-[#2B364A]">Nueva Categoría</h1>
        </div>
        <p className="text-slate-500 font-medium ml-[60px]">Añade una categoría al sistema para organizar tu inventario de productos.</p>
      </div>

      <div className="ml-[60px]">
        <CategoryForm />
      </div>
    </div>
  )
}
