-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bale_type TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  bale_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_date TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  delivery_preferred BOOLEAN DEFAULT false,
  is_pre_order BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS (this is a single-user app, no auth)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (using anon key)
CREATE POLICY "Allow all access to inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to history" ON history FOR ALL USING (true) WITH CHECK (true);

-- Seed initial inventory data
INSERT INTO inventory (bale_type, quantity)
VALUES 
  ('barley', 0),
  ('wheat', 0),
  ('hay', 0)
ON CONFLICT (bale_type) DO NOTHING;
