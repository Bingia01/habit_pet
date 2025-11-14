-- Add macro columns and weight to food_logs table
ALTER TABLE food_logs 
ADD COLUMN IF NOT EXISTS weight_g DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS protein_g DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS carbs_g DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fat_g DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fiber_g DECIMAL(8,2);

-- Add index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_food_logs_user_logged_at ON food_logs(user_id, logged_at DESC);


