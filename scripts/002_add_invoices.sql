-- Add invoice_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add invoice_number column to order_history table
ALTER TABLE public.order_history ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create invoice counter table
CREATE TABLE IF NOT EXISTS public.invoice_counter (
  id TEXT PRIMARY KEY DEFAULT 'default',
  current_number INTEGER NOT NULL DEFAULT 2,
  year INTEGER NOT NULL DEFAULT 2026
);

-- Allow anonymous access
ALTER TABLE public.invoice_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read invoice_counter" ON public.invoice_counter FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert invoice_counter" ON public.invoice_counter FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update invoice_counter" ON public.invoice_counter FOR UPDATE USING (true);

-- Seed the counter starting at 3 (so first invoice will be 03/2026)
INSERT INTO public.invoice_counter (id, current_number, year) VALUES ('default', 3, 2026)
ON CONFLICT (id) DO NOTHING;
