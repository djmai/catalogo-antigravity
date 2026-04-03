'use client'

import React from 'react'
import { Category } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategories: string[]
  setSelectedCategories: (ids: string[]) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  availableTags: string[]
  onClearFilters: () => void
}

export function ProductFilters({
  categories,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedTags,
  setSelectedTags,
  availableTags,
  onClearFilters
}: ProductFiltersProps) {
  const handleCategoryChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, id])
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== id))
    }
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag])
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    }
  }

  return (
    <Card className="sticky top-20 bg-white/50 backdrop-blur-md border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Filtros</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Limpiar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categorías */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Categorías</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`cat-${category.id}`} 
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked: boolean) => handleCategoryChange(category.id, checked)}
                />
                <Label 
                  htmlFor={`cat-${category.id}`}
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Rango de Precio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Precio Máximo</h3>
            <span className="text-xs font-bold text-primary">${priceRange[1]}</span>
          </div>
          <Slider
            defaultValue={[priceRange[1]]}
            max={5000}
            step={100}
            onValueChange={(value: number[]) => setPriceRange([priceRange[0], value[0]])}
            className="py-4"
          />
        </div>

        <Separator className="bg-gray-100" />

        {/* Etiquetas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox 
                  id={`tag-${tag}`} 
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked: boolean) => handleTagChange(tag, checked)}
                />
                <Label 
                  htmlFor={`tag-${tag}`}
                  className="text-xs font-medium leading-none cursor-pointer"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
