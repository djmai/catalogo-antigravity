'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProductAction(formData: FormData) {
  const supabase = createClient()

  // Mapear campos simples
  const name = formData.get('name') as string
  const description_short = formData.get('description_short') as string
  const description_long = (formData.get('description_long') as string) || null
  const base_price = parseFloat(formData.get('base_price') as string)
  const category_id = (formData.get('category_id') as string) || null
  const is_active = formData.get('is_active') === 'true'
  
  // Generar un slug simple a partir del nombre si no se provee uno válido
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  // Insertar producto
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description_short,
      description_long,
      base_price,
      category_id,
      is_active
    })
    .select()
    .single()

  if (error) {
    console.error('Error insertando producto:', error)
    return { success: false, error: error.message }
  }

  // Subida múltiple de archivos a Supabase Storage
  const imageFiles = formData.getAll('images') as File[]
  const validImages = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))
  
  if (validImages.length > 0 && product) {
    const uploadPromises = validImages.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${product.id}-${Date.now()}-${index}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error subiendo al storage:', uploadError)
        return null
      }

      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName)

      return {
        product_id: product.id,
        image_url: publicUrlData.publicUrl,
        display_order: index
      }
    })

    const newImages = (await Promise.all(uploadPromises)).filter(Boolean)
    
    if (newImages.length > 0) {
      await supabase.from('product_images').insert(newImages)
    }
  } else {
    // Si no mandaron archivos, intentamos el fallback anterior por si venía de un campo legacy
    const imageUrl = formData.get('image_url') as string
    if (imageUrl && product) {
      await supabase.from('product_images').insert({ product_id: product.id, image_url: imageUrl, display_order: 0 })
    }
  }

  revalidatePath('/dashboard/productos')
  return { success: true, data: product }
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  const description_short = formData.get('description_short') as string
  const description_long = (formData.get('description_long') as string) || null
  const base_price = parseFloat(formData.get('base_price') as string)
  const category_id = (formData.get('category_id') as string) || null
  const is_active = formData.get('is_active') === 'true'
  
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const { data: product, error } = await supabase
    .from('products')
    .update({
      name, slug, description_short, description_long, base_price, category_id, is_active
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Si envían nuevos archivos para subir
  const imageFiles = formData.getAll('images') as File[]
  const validImages = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))

  if (validImages.length > 0) {
    // Obtener las imagenes actuales para calcular el display_order siguiente
    const { data: existingImages } = await supabase.from('product_images').select('display_order').eq('product_id', id).order('display_order', { ascending: false }).limit(1)
    let startOrder = existingImages && existingImages.length > 0 ? existingImages[0].display_order + 1 : 0

    const uploadPromises = validImages.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${product.id}-${Date.now()}-${index}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file)

      if (uploadError) return null

      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName)

      return {
        product_id: product.id,
        image_url: publicUrlData.publicUrl,
        display_order: startOrder + index
      }
    })

    const newImages = (await Promise.all(uploadPromises)).filter(Boolean)
    
    if (newImages.length > 0) {
       await supabase.from('product_images').insert(newImages)
    }
  } else {
    // Fallback URL de texto
    const imageUrl = formData.get('image_url') as string
    if (imageUrl) {
      const { data: existingImages } = await supabase.from('product_images').select('id').eq('product_id', id).limit(1)
      if (existingImages && existingImages.length > 0) {
         await supabase.from('product_images').update({ image_url: imageUrl }).eq('id', existingImages[0].id)
      } else {
         await supabase.from('product_images').insert({ product_id: id, image_url: imageUrl, display_order: 0 })
      }
    }
  }

  // Si enviaron imagenes para eliminar
  const removedImagesStr = formData.get('removed_images') as string
  if (removedImagesStr) {
     const removedIds = removedImagesStr.split(',').filter(Boolean)
     if (removedIds.length > 0) {
        await supabase.from('product_images').delete().in('id', removedIds).eq('product_id', id)
     }
  }

  revalidatePath('/dashboard/productos')
  return { success: true, data: product }
}

