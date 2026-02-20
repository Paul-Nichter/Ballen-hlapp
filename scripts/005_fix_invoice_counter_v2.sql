-- Drop and recreate invoice_counter with integer id
DROP TABLE IF EXISTS invoice_counter;

CREATE TABLE invoice_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_number INTEGER NOT NULL DEFAULT 2,
  year INTEGER NOT NULL DEFAULT 2026
);

INSERT INTO invoice_counter (id, current_number, year) VALUES (1, 2, 2026);

-- Add price_per_unit to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 2.5;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 2.5;
