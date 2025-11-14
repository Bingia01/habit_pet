-- Add macro columns to food_priors table
ALTER TABLE food_priors 
ADD COLUMN IF NOT EXISTS protein_per_100g DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS carbs_per_100g DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS fat_per_100g DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS fiber_per_100g DECIMAL(6,2);

-- Populate with USDA standard values (per 100g)
-- These are typical values from USDA FoodData Central
UPDATE food_priors SET
  protein_per_100g = 2.0,
  carbs_per_100g = 3.0,
  fat_per_100g = 0.2,
  fiber_per_100g = 1.5
WHERE label = 'salad';

UPDATE food_priors SET
  protein_per_100g = 1.5,
  carbs_per_100g = 2.0,
  fat_per_100g = 0.1,
  fiber_per_100g = 1.0
WHERE label = 'green salad';

UPDATE food_priors SET
  protein_per_100g = 8.0,
  carbs_per_100g = 5.0,
  fat_per_100g = 12.0,
  fiber_per_100g = 2.0
WHERE label = 'caesar salad';

UPDATE food_priors SET
  protein_per_100g = 2.0,
  carbs_per_100g = 5.0,
  fat_per_100g = 0.2,
  fiber_per_100g = 2.5
WHERE label = 'vegetable';

UPDATE food_priors SET
  protein_per_100g = 2.8,
  carbs_per_100g = 7.0,
  fat_per_100g = 0.4,
  fiber_per_100g = 2.6
WHERE label = 'broccoli';

UPDATE food_priors SET
  protein_per_100g = 0.9,
  carbs_per_100g = 10.0,
  fat_per_100g = 0.2,
  fiber_per_100g = 2.8
WHERE label = 'carrot';

UPDATE food_priors SET
  protein_per_100g = 0.5,
  carbs_per_100g = 15.0,
  fat_per_100g = 0.2,
  fiber_per_100g = 2.4
WHERE label = 'fruit';

UPDATE food_priors SET
  protein_per_100g = 0.3,
  carbs_per_100g = 14.0,
  fat_per_100g = 0.2,
  fiber_per_100g = 2.4
WHERE label = 'apple';

UPDATE food_priors SET
  protein_per_100g = 1.1,
  carbs_per_100g = 23.0,
  fat_per_100g = 0.3,
  fiber_per_100g = 2.6
WHERE label = 'banana';

UPDATE food_priors SET
  protein_per_100g = 0.9,
  carbs_per_100g = 12.0,
  fat_per_100g = 0.1,
  fiber_per_100g = 2.4
WHERE label = 'orange';

UPDATE food_priors SET
  protein_per_100g = 0.7,
  carbs_per_100g = 8.0,
  fat_per_100g = 0.3,
  fiber_per_100g = 2.0
WHERE label = 'strawberry';

-- Proteins
UPDATE food_priors SET
  protein_per_100g = 31.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 3.6,
  fiber_per_100g = 0.0
WHERE label = 'chicken';

UPDATE food_priors SET
  protein_per_100g = 31.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 3.6,
  fiber_per_100g = 0.0
WHERE label = 'chicken breast';

UPDATE food_priors SET
  protein_per_100g = 31.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 3.6,
  fiber_per_100g = 0.0
WHERE label = 'grilled chicken';

UPDATE food_priors SET
  protein_per_100g = 26.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 15.0,
  fiber_per_100g = 0.0
WHERE label = 'beef';

UPDATE food_priors SET
  protein_per_100g = 25.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 19.0,
  fiber_per_100g = 0.0
WHERE label = 'steak';

UPDATE food_priors SET
  protein_per_100g = 27.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 14.0,
  fiber_per_100g = 0.0
WHERE label = 'pork';

UPDATE food_priors SET
  protein_per_100g = 25.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 12.0,
  fiber_per_100g = 0.0
WHERE label = 'salmon';

UPDATE food_priors SET
  protein_per_100g = 22.0,
  carbs_per_100g = 0.0,
  fat_per_100g = 10.0,
  fiber_per_100g = 0.0
WHERE label = 'fish';

UPDATE food_priors SET
  protein_per_100g = 13.0,
  carbs_per_100g = 1.1,
  fat_per_100g = 11.0,
  fiber_per_100g = 0.0
WHERE label = 'egg';

-- Grains & Carbs
UPDATE food_priors SET
  protein_per_100g = 2.7,
  carbs_per_100g = 28.0,
  fat_per_100g = 0.3,
  fiber_per_100g = 0.4
WHERE label = 'rice';

UPDATE food_priors SET
  protein_per_100g = 2.7,
  carbs_per_100g = 28.0,
  fat_per_100g = 0.3,
  fiber_per_100g = 0.4
WHERE label = 'white rice';

UPDATE food_priors SET
  protein_per_100g = 2.6,
  carbs_per_100g = 23.0,
  fat_per_100g = 1.8,
  fiber_per_100g = 1.8
WHERE label = 'brown rice';

UPDATE food_priors SET
  protein_per_100g = 5.0,
  carbs_per_100g = 25.0,
  fat_per_100g = 1.1,
  fiber_per_100g = 1.8
WHERE label = 'pasta';

UPDATE food_priors SET
  protein_per_100g = 9.0,
  carbs_per_100g = 49.0,
  fat_per_100g = 3.2,
  fiber_per_100g = 2.7
WHERE label = 'bread';

UPDATE food_priors SET
  protein_per_100g = 2.0,
  carbs_per_100g = 17.0,
  fat_per_100g = 0.1,
  fiber_per_100g = 2.2
WHERE label = 'potato';

UPDATE food_priors SET
  protein_per_100g = 1.6,
  carbs_per_100g = 20.0,
  fat_per_100g = 0.1,
  fiber_per_100g = 3.0
WHERE label = 'sweet potato';

UPDATE food_priors SET
  protein_per_100g = 4.4,
  carbs_per_100g = 22.0,
  fat_per_100g = 1.9,
  fiber_per_100g = 2.8
WHERE label = 'quinoa';

-- Mixed Dishes
UPDATE food_priors SET
  protein_per_100g = 12.0,
  carbs_per_100g = 33.0,
  fat_per_100g = 10.0,
  fiber_per_100g = 2.3
WHERE label = 'pizza';

UPDATE food_priors SET
  protein_per_100g = 17.0,
  carbs_per_100g = 25.0,
  fat_per_100g = 14.0,
  fiber_per_100g = 1.5
WHERE label = 'burger';

UPDATE food_priors SET
  protein_per_100g = 15.0,
  carbs_per_100g = 30.0,
  fat_per_100g = 12.0,
  fiber_per_100g = 2.0
WHERE label = 'sandwich';

UPDATE food_priors SET
  protein_per_100g = 13.0,
  carbs_per_100g = 45.0,
  fat_per_100g = 8.0,
  fiber_per_100g = 3.0
WHERE label = 'burrito';

UPDATE food_priors SET
  protein_per_100g = 14.0,
  carbs_per_100g = 20.0,
  fat_per_100g = 10.0,
  fiber_per_100g = 2.5
WHERE label = 'taco';

UPDATE food_priors SET
  protein_per_100g = 2.0,
  carbs_per_100g = 5.0,
  fat_per_100g = 2.0,
  fiber_per_100g = 1.0
WHERE label = 'soup';

UPDATE food_priors SET
  protein_per_100g = 8.0,
  carbs_per_100g = 10.0,
  fat_per_100g = 5.0,
  fiber_per_100g = 2.0
WHERE label = 'stew';

-- Bowls
UPDATE food_priors SET
  protein_per_100g = 6.0,
  carbs_per_100g = 25.0,
  fat_per_100g = 3.0,
  fiber_per_100g = 2.0
WHERE label = 'rice bowl';

UPDATE food_priors SET
  protein_per_100g = 15.0,
  carbs_per_100g = 20.0,
  fat_per_100g = 5.0,
  fiber_per_100g = 2.5
WHERE label = 'poke bowl';

UPDATE food_priors SET
  protein_per_100g = 5.0,
  carbs_per_100g = 20.0,
  fat_per_100g = 2.0,
  fiber_per_100g = 4.0
WHERE label = 'buddha bowl';

UPDATE food_priors SET
  protein_per_100g = 6.0,
  carbs_per_100g = 22.0,
  fat_per_100g = 3.0,
  fiber_per_100g = 3.0
WHERE label = 'grain bowl';

-- Snacks & Desserts
UPDATE food_priors SET
  protein_per_100g = 10.0,
  carbs_per_100g = 4.0,
  fat_per_100g = 0.4,
  fiber_per_100g = 0.0
WHERE label = 'yogurt';

UPDATE food_priors SET
  protein_per_100g = 25.0,
  carbs_per_100g = 1.3,
  fat_per_100g = 33.0,
  fiber_per_100g = 0.0
WHERE label = 'cheese';

UPDATE food_priors SET
  protein_per_100g = 15.0,
  carbs_per_100g = 14.0,
  fat_per_100g = 54.0,
  fiber_per_100g = 6.7
WHERE label = 'nuts';

UPDATE food_priors SET
  protein_per_100g = 6.0,
  carbs_per_100g = 68.0,
  fat_per_100g = 20.0,
  fiber_per_100g = 2.3
WHERE label = 'cookie';

UPDATE food_priors SET
  protein_per_100g = 4.0,
  carbs_per_100g = 55.0,
  fat_per_100g = 16.0,
  fiber_per_100g = 1.2
WHERE label = 'cake';

UPDATE food_priors SET
  protein_per_100g = 3.5,
  carbs_per_100g = 24.0,
  fat_per_100g = 11.0,
  fiber_per_100g = 0.7
WHERE label = 'ice cream';


