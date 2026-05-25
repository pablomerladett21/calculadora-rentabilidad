-- Agrega columna is_founder para el modelo Freemium y la oferta Lifetime
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;
