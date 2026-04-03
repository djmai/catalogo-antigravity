'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategoryAction(formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .single()

  if (error) {
    console.error('Error insertando categoría:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/categorias')
  return { success: true, data }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando categoría:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/categorias')
  return { success: true, data }
}
