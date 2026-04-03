-- SEED DATA PARA CATALOGO PREMIUM

-- 1. Insertar Categorías
INSERT INTO public.categories (name, slug) VALUES
('Tecnología', 'tecnologia'),
('Hogar', 'hogar'),
('Moda', 'moda'),
('Gamer', 'gamer')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insertar Productos de Ejemplo
-- Necesitamos IDs reales para las relaciones, pero usaremos subconsultas
INSERT INTO public.products (name, slug, description_short, description_long, base_price, category_id, tags)
SELECT 
  'iPhone 15 Pro Max Titanium', 
  'iphone-15-pro-max', 
  'El iPhone más potente hasta la fecha con acabado en titanio.', 
  'El iPhone 15 Pro Max es el primer iPhone diseñado con titanio de calidad aeroespacial, la misma aleación que se usa en las naves espaciales para las misiones a Marte. El chip A17 Pro es una victoria histórica para los gráficos de Apple y ofrece el mejor rendimiento gráfico con diferencia en un iPhone.',
  28999.00, 
  id, 
  ARRAY['nuevo', 'premium', 'apple', 'smartphone']
FROM public.categories WHERE slug = 'tecnologia'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description_short, description_long, base_price, category_id, tags)
SELECT 
  'Silla Gamer Razer Iskur X', 
  'silla-razer-iskur-x', 
  'Ergonomía superior para largas sesiones de juego.', 
  'Si una ejecución sólida en el juego proviene de un soporte sólido, entonces busca la comodidad con la Razer Iskur X. Es hora de descubrir lo que el soporte y la comodidad esenciales pueden aportar a tu juego, con una silla ergonómica para juegos diseñada para el juego hardcore.',
  8499.00, 
  id, 
  ARRAY['gamer', 'razer', 'ergonomico']
FROM public.categories WHERE slug = 'gamer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description_short, description_long, base_price, category_id, tags)
SELECT 
  'Cafetera Espresso DeLonghi', 
  'cafetera-delonghi-espresso', 
  'El sabor auténtico del café italiano en tu casa.', 
  'Prepara tus bebidas favoritas de cafetería en casa con la cafetera espresso DeLonghi. Disfruta de un espresso rico y suave, o termina tu café con una capa cremosa de leche utilizando el espumador ajustable.',
  4200.00, 
  id, 
  ARRAY['hogar', 'cocina', 'cafe']
FROM public.categories WHERE slug = 'hogar'
ON CONFLICT (slug) DO NOTHING;

-- 3. Insertar Imágenes de Ejemplo (Placeholders)
INSERT INTO public.product_images (product_id, image_url, display_order)
SELECT id, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000', 0 FROM public.products WHERE slug = 'iphone-15-pro-max'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, display_order)
SELECT id, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000', 0 FROM public.products WHERE slug = 'silla-razer-iskur-x'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, display_order)
SELECT id, 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=1000', 0 FROM public.products WHERE slug = 'cafetera-delonghi-espresso'
ON CONFLICT DO NOTHING;

-- 4. Insertar Descuentos
INSERT INTO public.discounts (product_id, type, value, start_date, end_date)
SELECT 
  id, 
  'percentage', 
  15.00, 
  NOW() - INTERVAL '1 day', 
  NOW() + INTERVAL '30 days'
FROM public.products WHERE slug = 'iphone-15-pro-max'
ON CONFLICT DO NOTHING;

INSERT INTO public.discounts (product_id, type, value, start_date, end_date)
SELECT 
  id, 
  'fixed', 
  1000.00, 
  NOW() - INTERVAL '1 day', 
  NOW() + INTERVAL '15 days'
FROM public.products WHERE slug = 'silla-razer-iskur-x'
ON CONFLICT DO NOTHING;
