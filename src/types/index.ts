export type UserRole = 'admin' | 'editor' | 'client'

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description_short: string
  description_long: string | null
  base_price: number
  category_id: string | null
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  product_images?: ProductImage[]
  discounts?: Discount[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface Discount {
  id: string
  product_id: string
  type: 'percentage' | 'fixed'
  value: number
  start_date: string
  end_date: string
  created_at: string
}

export interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  special_price: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields
  package_products?: PackageProduct[]
}

export interface PackageProduct {
  id: string
  package_id: string
  product_id: string
  quantity: number
  // Joined fields
  product?: Product
}
