import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/server'

import { ConditionalFooter } from '@/components/ConditionalFooter'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data: brandingData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_branding')
    .single()
    
  const siteName = brandingData?.value?.site_name || 'PREMIUM STORE'
  
  return {
    title: `${siteName} | Catálogo Online`,
    description: `Descubre nuestra colección exclusiva de productos con los mejores precios y descuentos en ${siteName}.`,
    keywords: [siteName, 'catálogo', 'tienda online', 'ofertas', 'descuentos', 'productos premium']
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50/50 flex flex-col`}>
        <Providers>
          <div className="sticky top-0 z-[100] w-full">
            <Header user={user} />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  )
}
