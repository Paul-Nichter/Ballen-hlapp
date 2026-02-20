-- Fix invoice_counter id type issue and add price_per_unit column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 2.5;
ALTER TABLE public.order_history ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 2.5;

-- Delete old counter with wrong id
DELETE FROM public.invoice_counter WHERE id = 'default';

-- Recreate with correct id matching API query
ALTER TABLE public.invoice_counter ALTER COLUMN id SET DATA TYPE INTEGER USING id::integer;
ALTER TABLE public.invoice_counter ALTER COLUMN id SET DEFAULT 1;

-- Re-seed
INSERT INTO public.invoice_counter (id, current_number, year) VALUES (1, 2, 2026)
ON CONFLICT (id) DO NOTHING;
