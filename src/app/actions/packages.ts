'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPackageAction(formData: FormData) {
  const supabase = createClient()

  // Basic fields
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const special_price = parseFloat(formData.get('special_price') as string)
  const is_active = formData.get('is_active') === 'true'
  const tagsStr = formData.get('tags') as string
  const tags = tagsStr ? tagsStr.split(',').filter(Boolean) : []
  
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  // Insert package
  const { data: pkg, error } = await supabase
    .from('packages')
    .insert({
      name,
      slug,
      description,
      special_price,
      is_active,
      tags
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Handle products in package
  const productsJson = formData.get('products') as string
  if (productsJson) {
     try {
       const products = JSON.parse(productsJson)
       if (products.length > 0) {
          await supabase.from('package_products').insert(
            products.map((p: any) => ({
              package_id: pkg.id,
              product_id: p.product_id,
              quantity: p.quantity,
            }))
          )
       }
     } catch (e) {
       console.error('Error parsing products JSON:', e)
     }
  }

  // Multiple Image Upload
  const imageFiles = formData.getAll('images') as File[]
  const validImages = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))
  
  if (validImages.length > 0 && pkg) {
    const uploadPromises = validImages.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `package-${pkg.id}-${Date.now()}-${index}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, file)

      if (uploadError) return null

      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName)

      return {
        package_id: pkg.id,
        image_url: publicUrlData.publicUrl,
        display_order: index
      }
    })

    const newImages = (await Promise.all(uploadPromises)).filter(Boolean)
    if (newImages.length > 0) {
      await supabase.from('package_images').insert(newImages)
    }
  }

  revalidatePath('/dashboard/paquetes')
  return { success: true, data: pkg }
}

export async function updatePackageAction(id: string, formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const special_price = parseFloat(formData.get('special_price') as string)
  const is_active = formData.get('is_active') === 'true'
  const tagsStr = formData.get('tags') as string
  const tags = tagsStr ? tagsStr.split(',').filter(Boolean) : []
  
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const { data: pkg, error } = await supabase
    .from('packages')
    .update({ name, slug, description, special_price, is_active, tags })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Handle products (sync)
  const productsJson = formData.get('products') as string
  if (productsJson) {
     try {
       const products = JSON.parse(productsJson)
       await supabase.from('package_products').delete().eq('package_id', id)
       if (products.length > 0) {
          await supabase.from('package_products').insert(
            products.map((p: any) => ({
              package_id: id,
              product_id: p.product_id,
              quantity: p.quantity,
            }))
          )
       }
     } catch (e) {
       console.error('Error parsing products JSON:', e)
     }
  }

  // Handle images
  const imageFiles = formData.getAll('images') as File[]
  const validImages = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))

  if (validImages.length > 0) {
    const { data: existingImages } = await supabase.from('package_images').select('display_order').eq('package_id', id).order('display_order', { ascending: false }).limit(1)
    let startOrder = existingImages && existingImages.length > 0 ? existingImages[0].display_order + 1 : 0

    const uploadPromises = validImages.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `package-${id}-${Date.now()}-${index}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file)
      if (uploadError) return null
      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName)
      return { package_id: id, image_url: publicUrlData.publicUrl, display_order: startOrder + index }
    })

    const newImages = (await Promise.all(uploadPromises)).filter(Boolean)
    if (newImages.length > 0) {
       await supabase.from('package_images').insert(newImages)
    }
  }

  // Handle image removal
  const removedImagesStr = formData.get('removed_images') as string
  if (removedImagesStr) {
     const removedIds = removedImagesStr.split(',').filter(Boolean)
     if (removedIds.length > 0) {
        await supabase.from('package_images').delete().in('id', removedIds).eq('package_id', id)
     }
  }

  revalidatePath('/dashboard/paquetes')
  return { success: true, data: pkg }
}
