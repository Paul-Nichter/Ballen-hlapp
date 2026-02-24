-- Add JSONB items column to orders and order_history tables
-- This allows multiple products per order while keeping backward compatibility

ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS items jsonb;

-- Migrate existing single-product orders to the new items format
UPDATE orders 
SET items = jsonb_build_array(
  jsonb_build_object(
    'product', product,
    'quantity', quantity,
    'price_per_unit', COALESCE(price_per_unit, 2.5)
  )
)
WHERE items IS NULL AND product IS NOT NULL;

UPDATE order_history 
SET items = jsonb_build_array(
  jsonb_build_object(
    'product', product,
    'quantity', quantity,
    'price_per_unit', COALESCE(price_per_unit, 2.5)
  )
)
WHERE items IS NULL AND product IS NOT NULL;
