import { useMemo } from 'react'
import { Product, Discount } from '@/types'

export function useDiscountedPrice(product: Product) {
  const activeDiscount = useMemo(() => {
    if (!product.discounts || product.discounts.length === 0) return null
    
    const now = new Date()
    return product.discounts.find(discount => {
      const start = new Date(discount.start_date)
      const end = new Date(discount.end_date)
      return now >= start && now <= end
    })
  }, [product.discounts])

  const discountedPrice = useMemo(() => {
    if (!activeDiscount) return product.base_price
    
    if (activeDiscount.type === 'percentage') {
      return product.base_price * (1 - activeDiscount.value / 100)
    } else {
      return Math.max(0, product.base_price - activeDiscount.value)
    }
  }, [product.base_price, activeDiscount])

  return {
    originalPrice: product.base_price,
    discountedPrice,
    hasDiscount: !!activeDiscount,
    discount: activeDiscount
  }
}
