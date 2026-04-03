import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductInteraction } from '@/components/ProductInteraction'

interface ProductPageProps {
  params: { slug: string }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const supabase = createClient()
  
  // Fetch product with joined data
  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), discounts(*), categories(*)')
    .eq('slug', params.slug)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products (same category, different id)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, product_images(*), discounts(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('is_active', true)
    .limit(4)

  // Fetch if it belongs to a package
  const { data: packageRel } = await supabase
    .from('package_products')
    .select('package_id, packages(*)')
    .eq('product_id', product.id)
    .limit(1)
    .single()

  const packageOffer = packageRel?.packages 

  return (
    <div className="container mx-auto px-4 py-12">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all mb-12 group"
      >
        <div className="bg-slate-100 p-2 rounded-lg mr-4 group-hover:bg-primary/10 transition-colors">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </div>
        Volver al catálogo
      </Link>

      <ProductInteraction 
        product={product} 
        relatedProducts={relatedProducts || []} 
        packageOffer={packageOffer}
      />
    </div>
  )
}
