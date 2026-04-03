'use client'

import { usePathname } from 'next/navigation'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Ocultar si estamos en cualquier parte del dashboard
  if (pathname.startsWith('/dashboard')) return null

  return (
    <footer className="mt-auto border-t bg-white py-12 relative z-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground font-medium">© 2024 PremiumStore. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
