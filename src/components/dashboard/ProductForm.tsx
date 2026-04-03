'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction, updateProductAction } from '@/app/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Package, Tag, Ban, Save, Loader2, Link as LinkIcon } from 'lucide-react'

export function ProductForm({ categories, initialData }: { categories: any[], initialData?: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  
  // Local state para controlar is_active y category select 
  const [isActive, setIsActive] = useState<boolean | 'indeterminate'>(
    initialData ? initialData.is_active : true
  )
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.category_id || ''
  )
  const [existingImages, setExistingImages] = useState<any[]>(
    initialData?.product_images || []
  )
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])

  const handleRemoveImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setRemovedImageIds(prev => [...prev, id])
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('is_active', isActive.toString())
    if (categoryId && categoryId !== 'none') {
       formData.append('category_id', categoryId)
    }

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateProductAction(initialData.id, formData)
      } else {
        res = await createProductAction(formData)
      }
      
      if (res.success) {
        router.push('/dashboard/productos')
      } else {
        setErrorMsg(res.error || 'Hubo un error al guardar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative max-w-4xl max-h-full">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100/50 flex items-center gap-2">
           <Ban className="h-5 w-5" />
           {errorMsg}
        </div>
      )}

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Nombre del Producto <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name}
              required 
              placeholder="Ej: Reloj Premium 2026" 
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium text-base"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="slug" className="text-slate-700 font-bold ml-1">Slug (URL amigable)</Label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              id="slug" 
              name="slug" 
              defaultValue={initialData?.slug}
              placeholder="Dejar vacío para auto-generar" 
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium text-base"
            />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="base_price" className="text-slate-700 font-bold ml-1">Precio Base (MXN) <span className="text-red-500">*</span></Label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
            <Input 
              id="base_price" 
              name="base_price" 
              defaultValue={initialData?.base_price}
              type="number"
              step="0.01" 
              min="0"
              required 
              placeholder="0.00" 
              className="h-14 pl-10 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-black text-lg text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-3 flex flex-col justify-center pt-8">
          <div className="flex items-center justify-between border border-gray-100 p-4 rounded-2xl bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <Label className="text-base text-slate-900 font-bold cursor-pointer" htmlFor="is_active">Visibilidad del Producto</Label>
              <p className="text-xs font-medium text-slate-500">¿Mostrar este producto en el catálogo?</p>
            </div>
            <Checkbox 
               id="is_active"
               checked={isActive} 
               onCheckedChange={setIsActive} 
               className="h-6 w-6 rounded-md data-[state=checked]:bg-[#2B364A] data-[state=checked]:text-white border-slate-300 ml-4"
            />
          </div>
        </div>
      </div>

      {/* Row 3 - Categoría e Imagen Url */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 pt-8 mt-2">
        <div className="space-y-3">
           <Label htmlFor="category_id" className="text-slate-700 font-bold ml-1">Categoría</Label>
           <Select value={categoryId} onValueChange={setCategoryId}>
             <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-slate-300 shadow-none font-medium text-slate-700 text-base">
               <SelectValue placeholder="Selecciona una categoría..." />
             </SelectTrigger>
             <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="none" className="font-bold text-slate-400 focus:bg-slate-50">-- Ninguna Categoría --</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="font-medium cursor-pointer focus:bg-slate-50 py-2.5">
                    {cat.name}
                  </SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="images" className="text-slate-700 font-bold ml-1">Subir Imágenes <span className="text-muted-foreground text-xs font-normal">(Varias permitidas)</span></Label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              id="images" 
              name="images" 
              type="file"
              multiple
              accept="image/*"
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-slate-900 cursor-pointer pt-3"
            />
          </div>
          {existingImages.length > 0 && (
            <div className="mt-4">
               <p className="text-xs text-slate-500 font-medium ml-1 mb-2">Imágenes actuales (Haz clic en la X para eliminar)</p>
               <div className="flex flex-wrap gap-3">
                 {existingImages.map(img => (
                    <div key={img.id} className="relative w-16 h-16 rounded-xl border border-slate-100 overflow-hidden group">
                       <img src={img.image_url} alt="Prod" className="w-full h-full object-cover" />
                       <button 
                         type="button" 
                         onClick={() => handleRemoveImage(img.id)}
                         className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                 ))}
               </div>
            </div>
          )}
          {removedImageIds.length > 0 && (
             <input type="hidden" name="removed_images" value={removedImageIds.join(',')} />
          )}
        </div>
      </div>

      {/* Descripciones */}
      <div className="space-y-6 pt-4 border-t border-gray-50 mt-2">
         <div className="space-y-3">
            <Label htmlFor="description_short" className="text-slate-700 font-bold ml-1">Descripción Corta <span className="text-red-500">*</span></Label>
            <Textarea 
              id="description_short" 
              name="description_short" 
              defaultValue={initialData?.description_short}
              required
              rows={2}
              placeholder="Un resumen atractivo para la tarjeta del producto..." 
              className="rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium resize-none p-4 text-base"
            />
         </div>

         <div className="space-y-3">
            <Label htmlFor="description_long" className="text-slate-700 font-bold ml-1">Descripción Completa (Opcional)</Label>
            <Textarea 
              id="description_long" 
              name="description_long" 
              defaultValue={initialData?.description_long}
              rows={5}
              placeholder="Detalles exhaustivos del producto..." 
              className="rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 shadow-none font-medium resize-y p-4 text-base"
            />
         </div>
      </div>

      {/* Botonera */}
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
              Publicar Producto
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
