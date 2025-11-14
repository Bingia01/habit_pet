# Supabase Edge Function Deployment Guide

This guide walks you through deploying the `analyze_food` Supabase Edge Function with the updated calorie calculation logic.

## Prerequisites

1. **Supabase CLI** installed and authenticated
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Project linked** to your Supabase project
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Environment variables** configured (see below)

## Environment Variables

The Edge Function requires the following environment variables:

### Required

- `CLASSIFIER_API_KEY` - Your OpenAI API key
- `CLASSIFIER_ENDPOINT` - OpenAI API endpoint (defaults to OpenAI if not set)
- `CLASSIFIER_MODEL` - Model to use (defaults to `gpt-4o-mini`)

### Optional

- `USDA_API_KEY` - For enhanced food validation (recommended)
- `DEFAULT_PORTION_GRAMS` - Default portion size in grams (default: 180)
- `DEFAULT_WEIGHT_RELATIVE_SIGMA` - Default weight uncertainty (default: 0.35)

## Deployment Steps

### 1. Set Environment Variables

Set secrets in Supabase Dashboard or via CLI:

```bash
# Via CLI (recommended)
supabase secrets set CLASSIFIER_API_KEY=your-openai-api-key
supabase secrets set CLASSIFIER_ENDPOINT=https://api.openai.com/v1/chat/completions
supabase secrets set CLASSIFIER_MODEL=gpt-4o-mini

# Optional
supabase secrets set USDA_API_KEY=your-usda-api-key
```

**Or via Supabase Dashboard:**
1. Go to your project dashboard
2. Navigate to **Edge Functions** → **analyze_food**
3. Click **Settings** → **Secrets**
4. Add each secret

### 2. Deploy the Function

```bash
# From project root
cd supabase
supabase functions deploy analyze_food
```

### 3. Verify Deployment

After deployment, verify the function is working:

```bash
# Test the function locally first (optional)
supabase functions serve analyze_food

# Or test the deployed function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze_food \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'
```

## Verification Script

Run the verification script to test the deployment:

```bash
npm run verify:supabase
```

Or manually:

```bash
tsx scripts/verify-supabase-deployment.ts
```

## Monitoring

### View Logs

```bash
# Real-time logs
supabase functions logs analyze_food --follow

# Recent logs
supabase functions logs analyze_food --limit 50
```

### Key Log Indicators

Look for these log messages to verify correct operation:

✅ **Success indicators:**
- `✅ Using validated OpenAI 2D estimate: X kcal`
- `📊 Calculated calories from formula: X kcal (method: weight×kcalPerG)`
- `📊 Analysis Summary:` with valid calories

⚠️ **Warning indicators:**
- `⚠️ OpenAI estimate invalid (X kcal), calculating from formula`
- `📐 Returning priors for LiDAR calculation (calories = 0)`

❌ **Error indicators:**
- `Classifier request failed:`
- `Analyzer error`

## Troubleshooting

### Function Not Deploying

1. **Check Supabase CLI version:**
   ```bash
   supabase --version
   # Update if needed: npm install -g supabase@latest
   ```

2. **Verify project link:**
   ```bash
   supabase projects list
   supabase link --project-ref your-project-ref
   ```

3. **Check function directory structure:**
   ```
   supabase/functions/analyze_food/
   ├── index.ts
   └── priors.ts
   ```

### Function Returns Errors

1. **Check environment variables:**
   ```bash
   supabase secrets list
   ```

2. **Verify API keys are valid:**
   - Test OpenAI API key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

3. **Check function logs:**
   ```bash
   supabase functions logs analyze_food --limit 100
   ```

### Calories Still Showing 0 or Invalid Values

1. **Verify calculation method in logs:**
   - Look for `calculationMethod` in log output
   - Should be one of: `openai-estimate`, `weight×kcalPerG`, `volume×density×kcalPerG`

2. **Check if priors are being retrieved:**
   - Look for `📊 Calculated weight from volume:` or similar messages
   - Verify `priors.ts` is deployed correctly

3. **Test with known food:**
   - Try an apple image
   - Should return ~80-120 kcal, not 0 or 40,000

## Rollback

If deployment causes issues, rollback to previous version:

```bash
# List function versions
supabase functions list analyze_food

# Rollback (if supported)
# Note: Supabase doesn't have built-in rollback, but you can:
# 1. Revert code changes
# 2. Redeploy previous version
# 3. Or fix issues and redeploy
```

## Production Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] Function tested with sample images
- [ ] Logs verified for correct calculation methods
- [ ] Error handling tested
- [ ] Rate limits configured (if needed)
- [ ] Monitoring alerts set up
- [ ] Documentation updated

## Next Steps

After successful deployment:

1. **Test the camera feature** in your app
2. **Monitor logs** for the first 24 hours
3. **Verify calorie calculations** are reasonable
4. **Set up alerts** for error rates
5. **Update frontend** to display calculation method (already done)

## Support

If you encounter issues:

1. Check logs: `supabase functions logs analyze_food`
2. Review this guide
3. Check Supabase status: https://status.supabase.com
4. Review function code in `supabase/functions/analyze_food/index.ts`

