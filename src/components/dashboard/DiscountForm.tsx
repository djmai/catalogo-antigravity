'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Product, Discount } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

const discountSchema = z.object({
  product_id: z.string().min(1, 'Debes seleccionar un producto'),
  type: z.enum(['percentage', 'fixed']),
  value: z.preprocess((val) => Number(val), z.number().min(0.01, 'El valor debe ser positivo')),
  start_date: z.string().min(1, 'Fecha inicio requerida'),
  end_date: z.string().min(1, 'Fecha fin requerida'),
})

interface DiscountFormProps {
  products: Product[]
  initialData?: Discount
  onClose: () => void
}

export function DiscountForm({ products, initialData, onClose }: DiscountFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof discountSchema>>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      product_id: initialData?.product_id || '',
      type: initialData?.type || 'percentage',
      value: initialData?.value || 0,
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
      end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
    },
  })

  const onSubmit = async (values: z.infer<typeof discountSchema>) => {
    setLoading(true)
    if (new Date(values.end_date) <= new Date(values.start_date)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio')
      setLoading(false)
      return
    }

    try {
      // Check for overlaps
      const { data: overlaps, error: overlapError } = await supabase
        .from('discounts')
        .select('id')
        .eq('product_id', values.product_id)
        .neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000') // Exclude current if editing
        .lte('start_date', new Date(values.end_date).toISOString())
        .gte('end_date', new Date(values.start_date).toISOString())

      if (overlapError) throw overlapError
      
      if (overlaps && overlaps.length > 0) {
        toast.error('Ya existe un descuento para este producto en el rango de fechas seleccionado')
        setLoading(false)
        return
      }

      if (initialData) {
        // Update
        const { error } = await supabase
          .from('discounts')
          .update({
            ...values,
            start_date: new Date(values.start_date).toISOString(),
            end_date: new Date(values.end_date).toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('discounts')
          .insert({
            ...values,
            start_date: new Date(values.start_date).toISOString(),
            end_date: new Date(values.end_date).toISOString(),
          })

        if (error) throw error
      }

      toast.success(initialData ? 'Descuento actualizado' : 'Descuento creado')
      router.refresh()
      onClose()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900 mb-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-black uppercase tracking-widest text-sm">Información de Oferta</h3>
        </div>

        <FormField
          control={form.control}
          name="product_id"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest">Producto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-[200px]">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="rounded-xl px-4 py-3 font-medium">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    <SelectItem value="percentage" className="rounded-xl font-medium">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed" className="rounded-xl font-medium">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Valor</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    step="0.01"
                    lang="en-US"
                    className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-black text-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Fecha Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest">Fecha Fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold" />
                </FormControl>
                <FormMessage />
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
            Guardar Descuento
          </Button>
        </div>
      </form>
    </Form>
  )
}
