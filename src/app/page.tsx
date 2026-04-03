'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { Hero } from '@/components/Hero'

export default function CatalogPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch categories
        const { data: catData } = await supabase.from('categories').select('*')
        if (catData) setCategories(catData)

        // Fetch products with images and discounts
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_images(*), discounts(*)')
          .eq('is_active', true)
        
        if (prodData) {
           setProducts(prodData)
           const maxPrice = prodData.reduce((max, p) => Math.max(max, p.base_price), 0)
           if (maxPrice > 0) setPriceRange([0, maxPrice])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const availableTags = useMemo(() => {
    const caps = new Set<string>()
    products.forEach(p => p.tags?.forEach(t => caps.add(t)))
    return Array.from(caps)
  }, [products])

  const filteredProducts = useMemo(() => {
    const result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description_short.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || 
                             (product.category_id && selectedCategories.includes(product.category_id))
      const matchesPrice = product.base_price <= priceRange[1]
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => product.tags?.includes(tag))
      return matchesSearch && matchesCategory && matchesPrice && matchesTags
    })
    return result
  }, [products, searchTerm, selectedCategories, priceRange, selectedTags])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategories, priceRange, selectedTags])

  const clearFilters = () => {
    setSelectedCategories([])
    const maxPrice = products.reduce((max, p) => Math.max(max, p.base_price), 0)
    setPriceRange([0, maxPrice || 100000])
    setSelectedTags([])
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 overflow-hidden space-y-12">
      <div className="flex flex-col md:flex-row gap-8 pt-6" id="catalogo">
        {/* Sidebar Filtros */}
        <aside className="w-full md:w-64 flex-shrink-0">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <ProductFilters 
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
              onClearFilters={clearFilters}
            />
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-grow">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar productos..." 
              className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-sm animate-pulse">
                  <Skeleton className="aspect-square w-full rounded-2xl mb-4 bg-slate-200/50" />
                  <div className="space-y-3 px-2">
                    <Skeleton className="h-4 w-3/4 rounded-full bg-slate-200/50" />
                    <Skeleton className="h-3 w-full rounded-full bg-slate-200/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/50 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              <div className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[32px] mb-8 shadow-2xl inline-block transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                  <Search className="h-16 w-16 text-primary animate-bounce-slow" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase italic">La vitrina está lista</h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-10">
                  Estamos curando nuestra próxima colección exclusiva. <br />
                  <span className="text-primary font-bold">Vuelve pronto para descubrir lo nuevo.</span>
                </p>
                <Link href="/dashboard/productos/nuevo" className="inline-flex items-center justify-center h-14 px-10 bg-slate-900 hover:bg-primary text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 text-base italic uppercase tracking-widest">
                  Publicar Primer Producto
                </Link>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 py-8">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center flex-wrap items-center gap-2 mt-12 bg-white px-6 py-4 rounded-full border border-gray-100 shadow-sm inline-flex mx-auto">
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                     disabled={currentPage === 1}
                     className="font-bold text-slate-600 hover:text-slate-900 rounded-full"
                   >
                     Anterior
                   </Button>
                   <div className="flex items-center gap-1 font-medium mx-4 text-sm">
                      Página <span className="font-black text-slate-900 mx-1">{currentPage}</span> de <span className="font-bold text-slate-500 ml-1">{totalPages}</span>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                     disabled={currentPage === totalPages}
                     className="font-bold text-slate-600 hover:text-slate-900 rounded-full"
                   >
                     Siguiente
                   </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/40 backdrop-blur-md rounded-[32px] border border-gray-100 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="bg-slate-100 p-8 rounded-full mb-8 inline-block shadow-inner">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">SIN COINCIDENCIAS</h3>
                <p className="text-muted-foreground font-medium mb-10">Ningún producto cumple con tus filtros actuales.</p>
                <Button 
                  variant="outline" 
                  className="h-12 px-8 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all rounded-xl font-black uppercase text-xs tracking-widest active:scale-95" 
                  onClick={clearFilters}
                >
                  Reiniciar Selección
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
