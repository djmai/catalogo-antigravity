'use client'

import React, { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void
  existingImages?: string[]
}

export function ImageUploader({ onUploadComplete, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(10)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      const updatedImages = [...images, ...newUrls]
      setImages(updatedImages)
      onUploadComplete(updatedImages)
      toast.success(`${newUrls.length} imágenes subidas correctamente`)
    } catch (error: any) {
      toast.error('Error al subir imágenes: ' + error.message)
      console.error(error)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const removeImage = (urlToRemove: string) => {
    const updatedImages = images.filter(url => url !== urlToRemove)
    setImages(updatedImages)
    onUploadComplete(updatedImages)
  }

  return (
    <div className="space-y-6">
      <div 
        className="border-2 border-dashed border-gray-200 rounded-3xl p-10 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer relative"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Haz clic o arrastra para subir</p>
          <p className="text-xs text-muted-foreground font-medium">PNG, JPG, WEBP hasta 5MB por archivo</p>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary">
            <span>Subiendo imágenes...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 rounded-full bg-slate-100" />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg border border-white">
              <Image 
                src={url} 
                alt="Product preview" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              {i === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
