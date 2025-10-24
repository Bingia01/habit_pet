-- Fix salad calorie values to reflect typical mixed salads (with toppings)
UPDATE food_priors
SET
  kcal_per_g_mu = 0.5000,  -- 50 cal per 100g = 500 cal/kg (typical mixed salad)
  kcal_per_g_sigma = 0.2000  -- Higher variance for toppings
WHERE label = 'salad';

-- Keep green salad low (plain lettuce)
-- caesar salad already correct (higher cal)
