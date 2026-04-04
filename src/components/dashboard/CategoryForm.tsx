'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCategoryAction, updateCategoryAction } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Ban, Save, Loader2 } from 'lucide-react'

export function CategoryForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateCategoryAction(initialData.id, formData)
      } else {
        res = await createCategoryAction(formData)
      }
      
      if (res.success) {
        router.push('/dashboard/categorias')
      } else {
        setErrorMsg(res.error || 'Hubo un error al guardar la categoría.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative w-full h-full">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100/50 flex items-center gap-2">
           <Ban className="h-5 w-5" />
           {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Nombre de la Categoría <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name}
              required 
              placeholder="Ej: Accesorios Deportivos" 
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium text-base"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="slug" className="text-slate-700 font-bold ml-1">Slug (URL amigable)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">/</span>
            <Input 
              id="slug" 
              name="slug" 
              defaultValue={initialData?.slug}
              placeholder="Dejar vacío para auto-generar" 
              className="h-14 pl-10 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium text-base"
            />
          </div>
          <p className="text-xs font-medium text-slate-500 ml-1">Para enlaces limpios como /categorias/accesorios-deportivos</p>
        </div>
      </div>

      <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-50">
        <Button 
           type="button" 
           variant="ghost" 
           onClick={() => router.back()}
           className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Cancelar
        </Button>
        <Button 
           type="submit" 
           disabled={isPending}
           className="h-14 px-10 rounded-xl bg-[#2B364A] hover:bg-[#7375A5] text-white font-black shadow-lg shadow-[#2B364A]/20 transition-all active:scale-95 text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5 text-amber-400" />
              {initialData ? 'Actualizar Categoría' : 'Crear Categoría'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
