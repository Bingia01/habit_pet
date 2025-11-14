# Upper Bound Display Fix

## Summary

Updated the iOS app to ensure users **only see the upper bound** (mean + 2×sigma) of calorie estimates, not the mean or a range.

## Changes Made

### 1. iOS App - CalorieCameraView.swift

#### Change 1: Store Upper Bound in Result
- **Location**: Lines 450-464 (with geometry) and 395-414 (analyzer-only)
- **What**: Calculate upper bound and store it in `result.total.mu` instead of mean
- **Why**: Ensures the stored value is what users see and log

#### Change 2: Display Upper Bound Directly
- **Location**: Line 110
- **What**: Display `result.total.mu` directly (no calculation)
- **Why**: `mu` already contains upper bound, no need to recalculate

#### Change 3: Handle Both APIs Correctly
- **Location**: Lines 395-414 (analyzer-only case)
- **What**: Detect if API returns upper bound (Next.js) or mean (Supabase)
- **Heuristic**: If `sigma ≈ 10% of calories`, assume Next.js API (already upper bound)
- **Why**: Next.js API returns upper bound, Supabase returns mean

## Technical Details

### API Differences

1. **Next.js API** (`/api/analyze-food`):
   - Returns: `calories` = upper bound (mean + 2×sigma)
   - DualAnalyzerClient estimates: `sigma = calories * 0.1`
   - Detection: `sigma / calories ≈ 0.10`

2. **Supabase API** (`/analyze_food`):
   - Returns: `calories` = mean
   - Returns: `sigmaCalories` = actual uncertainty
   - Detection: `sigma / calories` typically > 0.15

### Calculation Logic

```swift
// For analyzer-only (no geometry):
let relativeSigma = sigma / calories
if relativeSigma < 0.12 && relativeSigma > 0.08 {
    // Next.js API: calories is already upper bound
    upperBound = calories
} else {
    // Supabase API: calories is mean, calculate upper bound
    upperBound = calories + 2 * sigma
}

// For geometry + analyzer fusion:
let upperBound = finalCalories + 2 * finalSigma  // Always calculate (geometry is mean)
```

### Display

```swift
// Before:
let upperBound = Int(result.total.mu + 2 * result.total.sigma)
Text("Total: \(upperBound) kcal")

// After:
let calories = Int(result.total.mu)  // mu already contains upper bound
Text("Total: \(calories) kcal")
```

## Testing

### Test Cases

1. **Next.js API (Upper Bound)**:
   - Input: `calories = 500`, `sigma = 50` (10% relative)
   - Expected: Display `500` (use directly)
   - Log: "Using Next.js API response (already upper bound): 500 kcal"

2. **Supabase API (Mean)**:
   - Input: `calories = 400`, `sigma = 80` (20% relative)
   - Expected: Display `560` (400 + 2×80)
   - Log: "Using Supabase API response (mean), calculating upper bound: 400 + 2×80 = 560 kcal"

3. **Geometry + Analyzer Fusion**:
   - Input: `finalCalories = 300`, `finalSigma = 50`
   - Expected: Display `400` (300 + 2×50)
   - Log: "Mean calories: 300, Upper bound: 400"

## Files Modified

- `calorie-camera/Sources/CalorieCameraKit/UXKit/CalorieCameraView.swift`
  - Lines 108-114: Display logic
  - Lines 395-414: Analyzer-only upper bound calculation
  - Lines 450-464: Fusion upper bound calculation
  - Lines 415-421, 467-483: Debug logging

## Web App Status

✅ **No changes needed** - Web app already displays upper bound because:
- Next.js API returns upper bound as `calories`
- Web app displays `foodAnalysis.calories` directly
- No calculation needed

## Verification

After these changes:
- ✅ Users see only a single calorie number (upper bound)
- ✅ No "±" or range displayed
- ✅ Logged value matches displayed value
- ✅ Works with both Next.js and Supabase APIs
- ✅ Works with geometry-only, analyzer-only, and fusion cases


