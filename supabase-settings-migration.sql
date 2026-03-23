-- 1. Añadir nuevas columnas a la tabla de perfiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url         TEXT,
ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '$',
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_phone   TEXT,
ADD COLUMN IF NOT EXISTS website_url      TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone   TEXT;

-- 2. Configuración de Storage (Copia esto en el editor SQL para crear el bucket)
-- Nota: Supabase Storage maneja los buckets en la tabla storage.buckets

INSERT INTO storage.buckets (id, name, public) 
VALUES ('business_logos', 'business_logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Storage para el bucket business_logos
-- Permitir ver logos a todo el mundo (público)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'business_logos' );

-- Permitir a los usuarios subir/editar/borrar sus propios logos
CREATE POLICY "Users can upload their own logo" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'business_logos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own logo" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'business_logos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own logo" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'business_logos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
