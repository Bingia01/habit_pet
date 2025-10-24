-- Create food_priors table for nutrition data
CREATE TABLE IF NOT EXISTS food_priors (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  kcal_per_g_mu DECIMAL(6,4) NOT NULL,
  kcal_per_g_sigma DECIMAL(6,4) NOT NULL,
  density_mu DECIMAL(6,4) NOT NULL,
  density_sigma DECIMAL(6,4) NOT NULL,
  source TEXT DEFAULT 'usda',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_food_priors_label ON food_priors(label);

-- Insert common foods with realistic USDA values
-- Format: label, kcal/g (mean), kcal/g (std), density g/ml (mean), density (std), source
INSERT INTO food_priors (label, kcal_per_g_mu, kcal_per_g_sigma, density_mu, density_sigma, source) VALUES
-- Salads & Vegetables
('salad', 0.0500, 0.0200, 0.6000, 0.1000, 'usda'),
('green salad', 0.0300, 0.0150, 0.5500, 0.1000, 'usda'),
('caesar salad', 0.1500, 0.0400, 0.7000, 0.1200, 'usda'),
('vegetable', 0.0400, 0.0200, 0.9000, 0.1500, 'usda'),
('broccoli', 0.0340, 0.0050, 0.9200, 0.0800, 'usda'),
('carrot', 0.0410, 0.0070, 0.9800, 0.0600, 'usda'),
-- Fruits
('fruit', 0.0600, 0.0250, 0.8500, 0.1500, 'usda'),
('apple', 0.0520, 0.0080, 0.8300, 0.0500, 'usda'),
('banana', 0.0890, 0.0100, 0.9400, 0.0400, 'usda'),
('orange', 0.0470, 0.0070, 0.8700, 0.0500, 'usda'),
('strawberry', 0.0320, 0.0060, 0.9000, 0.0500, 'usda'),
-- Proteins
('chicken', 1.6500, 0.3000, 1.0500, 0.0800, 'usda'),
('chicken breast', 1.6500, 0.2500, 1.0700, 0.0600, 'usda'),
('grilled chicken', 1.6500, 0.2500, 1.0500, 0.0700, 'usda'),
('beef', 2.5000, 0.5000, 1.0500, 0.0800, 'usda'),
('steak', 2.7100, 0.4000, 1.0600, 0.0700, 'usda'),
('pork', 2.4200, 0.4500, 1.0400, 0.0800, 'usda'),
('salmon', 2.0800, 0.3000, 1.0500, 0.0500, 'usda'),
('fish', 1.8000, 0.4000, 1.0400, 0.0800, 'usda'),
('egg', 1.5500, 0.1500, 1.0300, 0.0300, 'usda'),
-- Grains & Carbs
('rice', 1.3000, 0.1500, 0.8500, 0.1000, 'usda'),
('white rice', 1.3000, 0.1200, 0.8500, 0.0800, 'usda'),
('brown rice', 1.1200, 0.1000, 0.8300, 0.0800, 'usda'),
('pasta', 1.5800, 0.2000, 0.7500, 0.1000, 'usda'),
('bread', 2.6500, 0.3000, 0.3500, 0.0800, 'usda'),
('potato', 0.7700, 0.1000, 1.0800, 0.0500, 'usda'),
('sweet potato', 0.8600, 0.0800, 1.0500, 0.0500, 'usda'),
('quinoa', 1.2000, 0.1500, 0.8000, 0.0800, 'usda'),
-- Mixed Dishes
('pizza', 2.6600, 0.4000, 0.6500, 0.1200, 'usda'),
('burger', 2.5400, 0.5000, 0.8500, 0.1500, 'usda'),
('sandwich', 2.4000, 0.4000, 0.7000, 0.1500, 'usda'),
('burrito', 1.9500, 0.3500, 0.9500, 0.1200, 'usda'),
('taco', 2.1700, 0.3500, 0.8000, 0.1500, 'usda'),
('soup', 0.4000, 0.2000, 1.0000, 0.0800, 'usda'),
('stew', 0.9000, 0.2500, 1.0200, 0.0800, 'usda'),
-- Bowls
('rice bowl', 1.2000, 0.2500, 0.9000, 0.1200, 'usda'),
('poke bowl', 1.3000, 0.2500, 0.9500, 0.1000, 'usda'),
('buddha bowl', 1.0000, 0.2500, 0.8500, 0.1200, 'usda'),
('grain bowl', 1.1500, 0.2500, 0.8500, 0.1200, 'usda'),
-- Snacks & Desserts
('yogurt', 0.5900, 0.2000, 1.0300, 0.0500, 'usda'),
('cheese', 3.5600, 0.5000, 1.0800, 0.0800, 'usda'),
('nuts', 6.0700, 0.8000, 0.6500, 0.1000, 'usda'),
('cookie', 4.8800, 0.5000, 0.5000, 0.1000, 'usda'),
('cake', 3.7000, 0.5000, 0.5500, 0.1200, 'usda'),
('ice cream', 2.0700, 0.3000, 0.5500, 0.0800, 'usda');

-- Enable RLS (Row Level Security)
ALTER TABLE food_priors ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON food_priors
  FOR SELECT USING (true);
