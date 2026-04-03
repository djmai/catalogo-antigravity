# 🌟 PremiumStore - Catálogo Online & Dashboard Admin

Este es un proyecto completo de **Catálogo de Productos** con un **Panel de Administración** avanzado, construido con tecnologías de última generación.

## 🚀 Tecnologías Principales

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **UI Components:** shadcn/ui, Lucide Icons, Framer Motion (micro-animations).
- **Backend/Base de Datos:** Supabase (Auth, PostgreSQL, Storage, RLS).
- **Formularios:** React Hook Form + Zod.

## 📦 Características Principales

### ✨ Público (Catálogo)
- **Grid Responsivo:** Visualización premium de productos.
- **Filtros Avanzados:** Categorías, precio dinámico y etiquetas.
- **Detalle de Producto:** Galería de imágenes y cálculo de descuentos en tiempo real.
- **SEO Optimizado:** Metadatos dinámicos por página.

### 🛠️ Admin (Dashboard)
- **Login Seguro:** Autenticación vía Supabase Auth.
- **Roles:** Soporte para `admin`, `editor` y `client`.
- **CRUD de Productos:** Gestión completa con subida múltiple a Supabase Storage.
- **Gestión de Descuentos:** Ofertas por porcentaje o monto fijo con fechas de validez.
- **Gestión de Paquetes:** Creación de bundles de productos.
- **Gestión de Usuarios:** Panel exclusivo para administradores (roles y perfiles).

## 🛠️ Configuración e Instalación

### 1. Clonar e Instalar
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ve al **SQL Editor** y ejecuta el contenido de `supabase_schema.sql`.
3. (Opcional) Ejecuta `seed.sql` para tener datos de prueba iniciales.
4. En el Dashboard de Supabase:
   - Ve a **Project Settings > API** y obtén tu URL y Anon Key.
   - Ve a **Storage** y asegúrate de que el bucket `product-images` sea público (el SQL ya intenta crearlo, pero confírmalo).

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz con:
```text
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Crear Usuario Admin
Para acceder al dashboard, primero regístrate normalmente o crea un usuario en la pestaña **Authentication** de Supabase. Luego, en la tabla `profiles` de la base de datos, cambia manualmente el `role` de ese usuario de `client` a `admin`.

### 5. Ejecutar en Desarrollo
```bash
npm run dev
```

## 📁 Estructura del Proyecto

- `src/app`: Rutas del App Router (Público y Dashboard).
- `src/components`: UI components reutilizables.
- `src/lib`: Lógica de Supabase, hooks personalizados y utilidades.
- `src/types`: Definiciones de interfaces TypeScript.

---
Proyecto generado con ❤️ por **PremiumStore Dev Team**.
