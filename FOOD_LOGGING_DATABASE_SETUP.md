# Food Logging Database Setup

## ✅ Implementation Complete

Food logging is now connected to Supabase database instead of (or in addition to) localStorage.

## 📋 Changes Made

### 1. Database Migration
- **File**: `supabase/migrations/20250120_add_macros_to_food_logs.sql`
- **Adds columns**:
  - `weight_g` (DECIMAL)
  - `protein_g` (DECIMAL)
  - `carbs_g` (DECIMAL)
  - `fat_g` (DECIMAL)
  - `fiber_g` (DECIMAL)
- **Adds index**: `idx_food_logs_user_logged_at` for faster queries

### 2. Type Updates
- **`src/types/index.ts`**: Updated `FoodLog` interface to include macros and weight
- **`src/lib/supabase.ts`**: Updated database type definitions

### 3. Database Service
- **`src/lib/database.ts`**:
  - `createFoodLog()`: Now saves macros and weight to Supabase
  - `getFoodLogs()`: Returns macros and weight from database
  - `getFoodLogsByDateRange()`: Updated to include macros

### 4. Context Updates
- **`src/contexts/DemoContext.tsx`**:
  - `addFoodLog()`: Now async, saves to Supabase first, then updates local state
  - Loads food logs from Supabase on mount (with localStorage fallback)
  - Falls back to localStorage if database fails

### 5. UI Updates
- **`src/app/add-food/page.tsx`**:
  - `handleFoodSubmission()`: Now captures macros from camera analysis
  - `confirmLog()`: Saves macros and weight to database

## 🚀 Next Steps

### 1. Apply Migration
Run the migration in Supabase Dashboard:
1. Go to [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/uisjdlxdqfovuwurmdop/sql)
2. Create a new snippet: "Add Macros to food_logs"
3. Copy contents of `supabase/migrations/20250120_add_macros_to_food_logs.sql`
4. Paste and run

### 2. Verify Migration
After running migration, verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'food_logs' 
AND column_name IN ('weight_g', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g');
```

Should return 5 rows.

### 3. Test Food Logging
1. Start dev server: `npm run dev`
2. Navigate to camera page
3. Take a photo of food
4. Submit the food log
5. Check Supabase Dashboard → Table Editor → `food_logs` to see the entry

## 📊 Data Flow

```
User takes photo
  ↓
Camera analysis (with macros)
  ↓
User confirms
  ↓
addFoodLog() called
  ↓
DatabaseService.createFoodLog()
  ↓
Supabase food_logs table
  ↓
Also updates local state (for immediate UI)
```

## 🔄 Fallback Strategy

1. **Primary**: Supabase database (persistent, shared)
2. **Fallback**: localStorage (if database fails, for offline support)

## 📝 What Gets Saved

When a user logs food, the following is saved to `food_logs` table:
- `food_type`: Food name (e.g., "Grilled Chicken")
- `calories`: Total calories (upper bound)
- `weight_g`: Weight in grams
- `protein_g`: Protein in grams (if available)
- `carbs_g`: Carbs in grams (if available)
- `fat_g`: Fat in grams (if available)
- `fiber_g`: Fiber in grams (if available)
- `emoji`: Food emoji
- `ingredients`: Array of ingredients
- `portion_size`: Portion description
- `logged_at`: Timestamp
- `user_id`: User ID (currently 'demo-user' until auth is implemented)

## ✅ Benefits

1. **Persistent storage**: Data survives browser clear
2. **Shared data**: Your friend can see your logs (if using same user_id)
3. **Macro tracking**: Full nutritional data stored
4. **Queryable**: Can query by date, user, food type, etc.
5. **Scalable**: Ready for multi-user support


