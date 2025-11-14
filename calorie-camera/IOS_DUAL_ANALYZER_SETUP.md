# iOS Dual Analyzer Setup Guide

This guide explains how to configure the iOS app to use the dual analyzer system (Next.js API with automatic fallback to Supabase Edge Function).

## Overview

The iOS app now supports a dual analyzer system:
1. **Primary**: Next.js API route (`/api/analyze-food`) - provides improved features (USDA integration, no hardcoded calories, better error handling)
2. **Fallback**: Supabase Edge Function (`/analyze_food`) - direct backend access if Next.js API is unavailable

Both paths use the same Supabase Edge Function internally, but routing through Next.js API provides:
- Automatic fallback chain (Supabase → OpenAI → Stub)
- USDA API integration for packaged foods
- No hardcoded calorie values
- Better error handling and logging

**Important**: LiDAR/depth data and volume calculations remain **100% local** on the iOS device. Only the RGB image is sent to the API for food identification.

## Configuration

### Method 1: Environment Variables (Recommended)

1. Open your Xcode project
2. Go to **Product → Scheme → Edit Scheme...**
3. Select **Run** in the left sidebar
4. Go to **Arguments** tab
5. Under **Environment Variables**, add:

```
NEXTJS_API_URL = http://localhost:3000
SUPABASE_URL = https://uisjdlxdqfovuwurmdop.supabase.co/functions/v1
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Production:**
```
NEXTJS_API_URL = https://your-app.vercel.app
SUPABASE_URL = https://uisjdlxdqfovuwurmdop.supabase.co/functions/v1
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 2: Supabase Only (No Next.js API)

If you don't want to use Next.js API, simply don't set `NEXTJS_API_URL`. The app will automatically use Supabase Edge Function directly.

**Environment Variables:**
```
SUPABASE_URL = https://uisjdlxdqfovuwurmdop.supabase.co/functions/v1
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How It Works

### Request Flow

```
iOS App captures photo
  ├─ RGB image (sent to API)
  └─ Depth/LiDAR data (stays on device)

Dual Analyzer Client:
  ├─ Try Next.js API first (if configured)
  │   └─ Next.js API → Supabase → OpenAI → Stub (fallback chain)
  └─ Fallback to Supabase Edge Function (if Next.js fails or not configured)
      └─ Supabase Edge Function → OpenAI

iOS App receives:
  ├─ Food label
  ├─ Priors (density, kcalPerG)
  └─ Confidence scores

iOS App calculates:
  ├─ Volume from LiDAR (local)
  └─ Calories = Volume × Density × kcalPerG
```

### Logging

The app logs which analyzer path is being used:

- `🔄 [DualAnalyzer] Trying Next.js API first...` - Using Next.js API
- `✅ [DualAnalyzer] Next.js API success!` - Next.js API worked
- `⚠️ [DualAnalyzer] Next.js API failed, falling back to Supabase` - Fallback triggered
- `🔄 [DualAnalyzer] Using Supabase Edge Function fallback...` - Using Supabase directly
- `✅ [DualAnalyzer] Supabase API success!` - Supabase worked

## Testing

### Test 1: Next.js API Available

1. Start Next.js dev server: `npm run dev` (in your web app directory)
2. Set `NEXTJS_API_URL=http://localhost:3000` in Xcode
3. Run iOS app on iPhone
4. Take a photo of food
5. Check logs - should see "Trying Next.js API first" and "Next.js API success"

### Test 2: Next.js API Unavailable (Fallback)

1. Don't start Next.js dev server (or set wrong URL)
2. Set `NEXTJS_API_URL=http://localhost:3000` in Xcode
3. Run iOS app on iPhone
4. Take a photo of food
5. Check logs - should see "Next.js API failed" and "Using Supabase Edge Function fallback"

### Test 3: Supabase Only Mode

1. Don't set `NEXTJS_API_URL` in Xcode
2. Run iOS app on iPhone
3. Take a photo of food
4. Check logs - should see "Next.js API URL not configured" and "Using Supabase Edge Function fallback"

## Troubleshooting

### Issue: "Next.js API failed" but Supabase works

**Cause**: Next.js API might be down, wrong URL, or network issue.

**Solution**: 
- Check Next.js server is running: `npm run dev`
- Verify `NEXTJS_API_URL` is correct
- Check network connectivity
- The app will automatically fallback to Supabase, so this is expected behavior

### Issue: Both APIs fail

**Cause**: Network issue or both backends are down.

**Solution**:
- Check internet connection
- Verify Supabase Edge Function is deployed: `supabase functions list`
- Check Supabase secrets are set: `supabase secrets list`
- Verify `SUPABASE_ANON_KEY` is correct

### Issue: LiDAR volume not working

**Cause**: This is unrelated to API routing - LiDAR is 100% local.

**Solution**:
- Ensure you're testing on a device with LiDAR (iPhone Pro models)
- Check camera permissions are granted
- Verify depth data is being captured (check logs for "NO DEPTH DATA" warnings)

## Benefits

1. **Automatic Fallback**: If Next.js API fails, automatically uses Supabase
2. **Better Food ID**: Next.js API has improved prompts and USDA integration
3. **No Hardcoded Values**: All calories come from real data sources
4. **Local Volume**: LiDAR calculations remain on-device for accuracy
5. **Consistent with Web**: Same backend logic as web app

## Architecture Notes

- **Depth Data**: Never leaves the device (only RGB image sent)
- **Volume Calculation**: Happens locally using LiDAR
- **API Response**: Provides food identification and priors only
- **Fusion**: iOS combines local volume + API priors = final calories

## Next Steps

1. Configure environment variables in Xcode
2. Test with Next.js API available
3. Test fallback scenario
4. Deploy Next.js API to production
5. Update `NEXTJS_API_URL` to production URL

