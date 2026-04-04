'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { PackageCard } from '@/components/PackageCard'
import { ProductFilters } from '@/components/ProductFilters'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { Hero } from '@/components/Hero'

export default function CatalogPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [
          { data: catData },
          { data: prodData },
          { data: pkgData }
        ] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase
            .from('products')
            .select('*, product_images(*), discounts(*)')
            .eq('is_active', true),
          supabase
            .from('packages')
            .select('*, package_images(id, image_url), package_products(product:products(*, product_images(*)))')
            .eq('is_active', true)
        ])

        if (catData) setCategories(catData)
        if (pkgData) setPackages(pkgData)
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

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const availableTags = useMemo(() => {
    const caps = new Set<string>()
    products.forEach((p: Product) => p.tags?.forEach((t: string) => caps.add(t)))
    packages.forEach((p: any) => p.tags?.forEach((t: string) => caps.add(t)))
    return Array.from(caps)
  }, [products, packages])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description_short.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || 
                             (product.category_id && selectedCategories.includes(product.category_id))
      const matchesPrice = product.base_price <= priceRange[1]
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => product.tags?.includes(tag))
      return matchesSearch && matchesCategory && matchesPrice && matchesTags
    })
  }, [products, searchTerm, selectedCategories, priceRange, selectedTags])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

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
    <>
      <Hero />
      <div className="container mx-auto px-4 overflow-hidden space-y-12">
      <div className="flex flex-col xl:flex-row gap-8 pt-6" id="catalogo">
        {/* Sidebar Filtros (Desktop) */}
        <aside className="hidden xl:block w-72 flex-shrink-0">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          ) : (
            <div className="sticky top-24">
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
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-grow">
          {/* Mobile Category Scroller */}
          {!loading && categories.length > 0 && (
            <div className="flex xl:hidden overflow-x-auto no-scrollbar gap-3 pb-6 mb-2 -mx-4 px-4 scroll-smooth">
               <Button
                  variant={selectedCategories.length === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className={`rounded-full h-10 px-6 font-black uppercase text-[10px] tracking-widest shrink-0 transition-all ${
                     selectedCategories.length === 0 ? 'bg-slate-900 border-slate-900' : 'border-slate-200'
                  }`}
               >
                  Todo
               </Button>
               {categories.map((cat) => (
                  <Button
                     key={cat.id}
                     variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                     size="sm"
                     onClick={() => {
                        if (selectedCategories.includes(cat.id)) {
                           setSelectedCategories(selectedCategories.filter(id => id !== cat.id))
                        } else {
                           setSelectedCategories([...selectedCategories, cat.id])
                        }
                     }}
                     className={`rounded-full h-10 px-6 font-black uppercase text-[10px] tracking-widest shrink-0 transition-all ${
                        selectedCategories.includes(cat.id) ? 'bg-primary border-primary' : 'border-slate-200'
                     }`}
                  >
                     {cat.name}
                  </Button>
               ))}
            </div>
          )}

          {/* Mobile Search & Filter Bar */}
          <div className="flex xl:hidden flex-col gap-4 mb-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar productos..." 
                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-2 border-slate-900 group hover:bg-slate-900 hover:text-white transition-all flex items-center justify-between px-6 font-black uppercase text-xs tracking-widest active:scale-95"
                >
                  <span>MÁS FILTROS</span>
                  <SlidersHorizontal className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md rounded-[40px] p-0 overflow-hidden border-none bg-white shadow-2xl">
                <DialogHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tight text-slate-900">Personalizar Catálogo</DialogTitle>
                </DialogHeader>
                <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                  <ProductFilters 
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    availableTags={availableTags}
                    onClearFilters={() => {
                      clearFilters();
                    }}
                  />
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                   <Button 
                     className="w-full h-16 rounded-[20px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl active:scale-95"
                     onClick={() => setIsFilterDialogOpen(false)}
                   >
                     VER RESULTADOS
                   </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative mb-12 hidden xl:block">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
            <Input 
              placeholder="¿Qué pieza exclusiva buscas hoy?" 
              className="pl-16 h-20 bg-white border-slate-100 text-xl font-medium rounded-3xl shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 px-6 text-center bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/50 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              <div className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 rounded-[32px] mb-8 shadow-2xl inline-block transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                  <Search className="h-10 w-10 sm:h-16 sm:w-16 text-primary animate-bounce-slow" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase italic">La vitrina está lista</h3>
                <p className="text-muted-foreground font-medium text-base sm:text-lg leading-relaxed mb-10">
                  Estamos curando nuestra próxima colección exclusiva. <br />
                  <span className="text-primary font-bold">Vuelve pronto para descubrir lo nuevo.</span>
                </p>
                <Link href="/dashboard/productos/nuevo" className="inline-flex items-center justify-center h-12 sm:h-14 px-8 sm:px-10 bg-slate-900 hover:bg-primary text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 text-sm sm:text-base italic uppercase tracking-widest">
                  Publicar Primer Producto
                </Link>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-16 md:gap-y-24 pt-8 pb-12 transition-all">
                {/* Display Packages at the top of page 1 */}
                {currentPage === 1 && packages.length > 0 && (
                   <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-16 md:gap-y-24 mb-8">
                     {packages.map((pkg) => (
                        <PackageCard key={`pkg-${pkg.id}`} pkg={pkg} />
                     ))}
                   </div>
                )}
                
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center flex-wrap items-center gap-2 mt-20 mb-20">
                   <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setCurrentPage(prev => Math.max(1, prev - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-xl"
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1 font-bold text-sm tracking-tighter">
                         <span className="text-slate-900">{currentPage}</span>
                         <span className="text-slate-300 mx-1">/</span>
                         <span className="text-slate-400">{totalPages}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className="font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-xl"
                      >
                        Siguiente
                      </Button>
                   </div>
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">SIN COINCIDENCIAS</h3>
                <p className="text-muted-foreground font-medium mb-10">Ningún producto cumple con tus filtros actuales.</p>
                <Button 
                  variant="outline" 
                  className="h-16 px-10 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95" 
                  onClick={clearFilters}
                >
                  Resetear Selección
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  )
}
