'use client'

import React, { useState, KeyboardEvent } from 'react'
import { X, Plus, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  label?: string
  placeholder?: string
}

export function TagInput({ tags = [], setTags, label, placeholder = 'Presiona Enter para añadir...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = inputValue.trim()
      if (val && !tags.includes(val)) {
        setTags([...tags, val])
        setInputValue('')
      }
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-4">
      {label && <label className="text-xs font-black uppercase tracking-widest text-slate-700 ml-1">{label}</label>}
      <div className="relative group">
        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold placeholder:font-normal"
        />
      </div>
      
      {tags.length > 0 && (
         <div className="flex flex-wrap gap-2 p-1">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="pl-3 pr-2 py-1.5 flex items-center gap-2 bg-white border border-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:border-red-200 transition-all group/tag"
              >
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="p-0.5 rounded-md hover:bg-red-50 text-slate-400 group-hover/tag:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
         </div>
      )}
    </div>
  )
}
