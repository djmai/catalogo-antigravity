'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface SingleImageUploaderProps {
  onUploadComplete: (url: string) => void
  currentImage?: string
  label?: string
  folder?: string
}

export function SingleImageUploader({ 
  onUploadComplete, 
  currentImage, 
  label = 'Subir Imagen',
  folder = 'site-assets'
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(10)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // We use product_images bucket as it exists for sure, but in a specific folder
      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
      setProgress(100)
      toast.success('Imagen subida correctamente')
    } catch (error: any) {
      toast.error('Error al subir imagen: ' + error.message)
      console.error(error)
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    }
  }

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden group shadow-lg border border-slate-100 bg-slate-50">
          <Image 
            src={currentImage} 
            alt="Preview" 
            fill 
            className="object-contain p-4" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <div className="relative">
              <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest rounded-xl">
                Cambiar Imagen
              </Button>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
              />
            </div>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onUploadComplete('')}
              className="font-black uppercase text-[10px] tracking-widest rounded-xl"
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group">
           <input 
             type="file" 
             accept="image/*" 
             onChange={handleUpload}
             disabled={uploading}
             className="absolute inset-0 opacity-0 cursor-pointer z-10"
           />
           <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
             {uploading ? (
               <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
             ) : (
               <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
             )}
           </div>
           <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{label}</p>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB)</p>
           </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2 px-1">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-indigo-600">
            <span>Subiendo...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 rounded-full bg-slate-100" />
        </div>
      )}
    </div>
  )
}
