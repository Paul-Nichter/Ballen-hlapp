-- Add address column to orders and order_history
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address text;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS customer_address text;
