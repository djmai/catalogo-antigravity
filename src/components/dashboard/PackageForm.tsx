'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Product, Package } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Boxes, Plus, Trash2, Package as PackageIcon, Camera } from 'lucide-react'
import { createPackageAction, updatePackageAction } from '@/app/actions/packages'
import { SafeImage } from './SafeImage'
import { TagInput } from './TagInput'

const packageSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  slug: z.string().min(3, 'Slug requerido'),
  description: z.string().optional(),
  special_price: z.preprocess((val) => Number(val), z.number().min(0, 'Precio inválido')),
  is_active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  products: z.array(z.object({
    product_id: z.string().min(1, 'Selecciona un producto'),
    quantity: z.preprocess((val) => Number(val), z.number().min(1, 'Mínimo 1')),
  })).min(2, 'Agrega al menos 2 productos'),
})

interface PackageFormProps {
  allProducts: Product[]
  initialData?: any // Complete Package with products and images
  onClose: () => void
}

export function PackageForm({ allProducts, initialData, onClose }: PackageFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [existingImages, setExistingImages] = useState<any[]>(
    initialData?.package_images || []
  )
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      special_price: initialData?.special_price || 0,
      is_active: initialData?.is_active ?? true,
      tags: initialData?.tags || [],
      products: initialData?.package_products?.map((pp: any) => ({
        product_id: pp.product_id,
        quantity: pp.quantity
      })) || [{ product_id: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products"
  })

  const handleRemoveImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setRemovedImageIds(prev => [...prev, id])
  }

  const onSubmit = async (values: z.infer<typeof packageSchema>) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')
      formData.append('special_price', values.special_price.toString())
      formData.append('is_active', values.is_active.toString())
      formData.append('tags', values.tags.join(','))
      formData.append('products', JSON.stringify(values.products))
      
      if (removedImageIds.length > 0) {
        formData.append('removed_images', removedImageIds.join(','))
      }

      // Handle new files
      const fileInput = document.getElementById('package-images') as HTMLInputElement
      if (fileInput?.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('images', fileInput.files[i])
        }
      }

      let res;
      if (initialData?.id) {
        res = await updatePackageAction(initialData.id, formData)
      } else {
        res = await createPackageAction(formData)
      }

      if (res.success) {
        toast.success(initialData ? 'Paquete actualizado con éxito' : 'Paquete creado con éxito')
        router.refresh()
        onClose()
      } else {
        throw new Error(res.error)
      }
    } catch (error: any) {
      toast.error('Ocurrió un error: ' + error.message)
      console.error('Error in PackageForm:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900 mb-2">
          <Boxes className="h-5 w-5 text-primary" />
          <h3 className="font-black uppercase tracking-widest text-sm">Configuración de Bundle</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Nombre del Paquete</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Ej. Kit Gamer Básico" 
                    onChange={(e: any) => {
                      field.onChange(e)
                      if (!initialData) form.setValue('slug', slugify(e.target.value))
                    }}
                    className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Slug (URL)</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-mono text-xs" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest">Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[80px] rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images Section */}
        <div className="space-y-4 border-t border-gray-50 pt-6">
          <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Fotografías del Paquete <span className="text-muted-foreground font-normal">(Opcional - Reemplazan a las fotos de productos)</span>
          </label>
          <div className="relative">
            <Input 
              id="package-images" 
              type="file" 
              multiple 
              accept="image/*"
              className="h-12 pt-3 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold file:mr-4 file:py-0.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white"
            />
          </div>
          
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
               {existingImages.map((img) => (
                 <div key={img.id} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden group">
                   <SafeImage src={img.image_url} alt="Pack" className="w-full h-full object-cover" />
                   <button 
                     type="button" 
                     onClick={() => handleRemoveImage(img.id)}
                     className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <PackageIcon className="h-4 w-4" />
              Productos Incluidos
            </label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ product_id: '', quantity: 1 })}
              className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              <Plus className="mr-1 h-3 w-3" /> Añadir Producto
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end bg-slate-50 p-4 rounded-2xl group border border-transparent hover:border-gray-100 transition-all">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name={`products.${index}.product_id`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 bg-white border-gray-100 rounded-xl shadow-none font-medium text-xs">
                              <SelectValue placeholder="Producto..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-[200px]">
                            {allProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id} className="rounded-lg text-xs">
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name={`products.${index}.quantity`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" {...field} className="h-10 bg-white border-gray-100 rounded-xl shadow-none text-center font-bold" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => remove(index)}
                  className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-xl"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.products && (
            <p className="text-xs font-bold text-red-500">{form.formState.errors.products.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="special_price"
            render={({ field }: { field: any }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-1">
                  <FormLabel className="text-xs font-black uppercase tracking-widest">Precio Especial del Pack ($)</FormLabel>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-md italic">0 = Cotizar</span>
                </div>
                <FormControl>
                  <Input type="number" step="0.01" lang="en-US" {...field} placeholder="Usa 0 para cotizar" className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-black text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl bg-slate-50 p-3 h-12">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 rounded-lg data-[state=checked]:bg-teal-600" />
                </FormControl>
                <FormLabel className="text-xs font-black uppercase tracking-widest cursor-pointer">Paquete Activo</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }: { field: any }) => (
            <FormItem className="border-t border-gray-50 pt-6">
               <TagInput 
                tags={field.value} 
                setTags={(newTags) => form.setValue('tags', newTags)} 
                label="Etiquetas del Paquete" 
                placeholder="Ej. Kit, Regalo, Gamer..."
              />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 px-8 bg-slate-900 hover:bg-primary transition-all text-white rounded-2xl shadow-xl active:scale-95 text-sm font-black"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Paquete
          </Button>
        </div>
      </form>
    </Form>
  )
}
