-- Seed initial inventory data
INSERT INTO inventory (bale_type, quantity) VALUES
  ('barley', 0),
  ('wheat', 0),
  ('hay', 0)
ON CONFLICT DO NOTHING;
