-- Inventory table for tracking stock of each product
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  delivery_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ausstehend',
  is_preorder BOOLEAN NOT NULL DEFAULT false,
  preferred BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- History table for completed/cancelled orders
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  delivery_date TEXT,
  status TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disable RLS since this is a shared inventory system (no auth)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for all tables (shared system, no auth needed)
CREATE POLICY "Allow anonymous read inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read history" ON public.order_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert history" ON public.order_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update history" ON public.order_history FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete history" ON public.order_history FOR DELETE USING (true);

-- Seed initial inventory data
INSERT INTO public.inventory (id, name, quantity) VALUES
  ('gerstenstroh', 'Gerstenstroh', 146),
  ('weizenstroh', 'Weizenstroh', 270),
  ('heu', 'Heu', 0)
ON CONFLICT (id) DO NOTHING;

-- Seed initial orders
INSERT INTO public.orders (customer, product, quantity, order_date, delivery_date, status, is_preorder, preferred) VALUES
  ('Claudia Amos', 'Weizenstroh', 5, '24.10.2025', '7.11.2025', 'ausstehend', false, false),
  ('Martina Kiebingen', 'Weizenstroh', 25, '24.10.2025', '25.10.2025', 'ausstehend', false, true),
  ('Stroh Donaueschingen', 'Weizenstroh', 200, '24.10.2025', '25.10.2025', 'ausstehend', false, false),
  ('Strohmeier Raphael', 'Heu', 40, '24.10.2025', '26.9.2026', 'ausstehend', true, false),
  ('Strohmeier Raphael', 'Gerstenstroh', 120, '24.10.2025', '23.8.2026', 'ausstehend', true, false);

-- Seed initial history
INSERT INTO public.order_history (customer, product, quantity, order_date, delivery_date, status) VALUES
  ('Judith', 'Heu', 20, '25.10.2025', '25.10.2025', 'abgeschlossen'),
  ('Strohmeier Raphael', 'Heu', 40, '24.10.2025', '20.9.2026', 'storniert'),
  ('Strohmeier Raphael', 'Gerstenstroh', 40, '24.10.2025', '23.8.2026', 'storniert'),
  ('test', 'Gerstenstroh', 5, '24.10.2025', '25.10.2025', 'storniert');
