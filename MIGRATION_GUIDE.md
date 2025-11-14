# Migration Guide: Adding Macro Columns to food_priors

## ✅ Step 1: Edge Function Deployed
The updated Supabase Edge Function with macro calculation support has been deployed successfully.

## 📋 Step 2: Apply Database Migration

You need to add macro columns to the `food_priors` table. Choose one of the following methods:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/uisjdlxdqfovuwurmdop)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250120_add_macros_to_food_priors.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Option B: Via Supabase CLI (if you have direct database access)

If you have `psql` installed and database connection string:

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Then run:
psql "your-connection-string" -f supabase/migrations/20250120_add_macros_to_food_priors.sql
```

### Option C: Verify Migration Applied

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'food_priors' 
AND column_name IN ('protein_per_100g', 'carbs_per_100g', 'fat_per_100g', 'fiber_per_100g');

-- Check if data was populated
SELECT label, protein_per_100g, carbs_per_100g, fat_per_100g 
FROM food_priors 
WHERE protein_per_100g IS NOT NULL 
LIMIT 5;
```

## 🎯 What the Migration Does

1. **Adds 4 new columns** to `food_priors` table:
   - `protein_per_100g` (DECIMAL)
   - `carbs_per_100g` (DECIMAL)
   - `fat_per_100g` (DECIMAL)
   - `fiber_per_100g` (DECIMAL)

2. **Populates with USDA standard values** for all existing foods:
   - Vegetables, fruits, proteins, grains, mixed dishes, bowls, snacks, desserts
   - Values are per 100g (standardized format)

## ✅ Verification

Once migration is complete, the macro calculation system will work:
- **Tier 1**: USDA API (most authoritative)
- **Tier 2**: OpenAI Vision API
- **Tier 3**: Food priors database (now includes macros!)
- **Tier 4**: Return undefined (no inaccurate estimates)

## 🚀 Next Steps

After migration:
1. Test the API with a food image
2. Check logs to see which tier was used for macro calculation
3. Verify macros are returned in API response


