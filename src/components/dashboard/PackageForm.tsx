'use client'

import React, { useState } from 'react'
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
import { Loader2, Save, Boxes, Plus, Trash2, Package as PackageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const packageSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  slug: z.string().min(3, 'Slug requerido'),
  description: z.string().optional(),
  special_price: z.preprocess((val) => Number(val), z.number().min(0, 'Precio inválido')),
  is_active: z.boolean().default(true),
  products: z.array(z.object({
    product_id: z.string().min(1, 'Selecciona un producto'),
    quantity: z.preprocess((val) => Number(val), z.number().min(1, 'Mínimo 1')),
  })).min(2, 'Agrega al menos 2 productos'),
})

interface PackageFormProps {
  allProducts: Product[]
  initialData?: any // Complete Package with products
  onClose: () => void
}

export function PackageForm({ allProducts, initialData, onClose }: PackageFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      special_price: initialData?.special_price || 0,
      is_active: initialData?.is_active ?? true,
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

  const onSubmit = async (values: z.infer<typeof packageSchema>) => {
    setLoading(true)
    try {
      const packageData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        special_price: values.special_price,
        is_active: values.is_active,
      }

      let packageId = initialData?.id

      if (initialData) {
        const { error } = await supabase.from('packages').update(packageData).eq('id', initialData.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('packages').insert(packageData).select().single()
        if (error) throw error
        packageId = data.id
      }

      // Sync products: Delete current and insert new
      await supabase.from('package_products').delete().eq('package_id', packageId)
      
      const { error: productsError } = await supabase.from('package_products').insert(
        values.products.map(p => ({
          package_id: packageId,
          product_id: p.product_id,
          quantity: p.quantity,
        }))
      )

      if (productsError) throw productsError

      toast.success(initialData ? 'Paquete actualizado con éxito' : 'Paquete creado con éxito')
      router.refresh()
      onClose()
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
                <FormLabel className="text-xs font-black uppercase tracking-widest">Precio Especial del Pack ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-black text-lg" />
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
