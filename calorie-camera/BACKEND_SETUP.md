# Backend Setup Guide for CalorieCameraKit

This guide explains how to set up the Supabase backend that powers CalorieCameraKit's three-path routing system.

---

## 🎯 Overview

CalorieCameraKit requires a backend API for:
- **Label Path:** OCR nutrition label reading via OpenAI Vision
- **Menu Path:** Restaurant menu item lookup via OpenAI knowledge
- **Geometry Path:** VLM-based food density and calorie priors

The backend is a Supabase Edge Function that routes image analysis to OpenAI's API.

---

## 📋 Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **OpenAI API Key**
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create an API key with GPT-4 Vision access
   - Ensure you have sufficient quota (vision API calls cost ~$0.01-0.03 per image)

3. **Supabase CLI**
   ```bash
   npm install -g supabase
   ```

---

## 🚀 Deployment Steps

### Step 1: Link to Your Supabase Project

```bash
cd /path/to/habit_pet
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in your Supabase dashboard URL:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

### Step 2: Set OpenAI API Key Secret

```bash
supabase secrets set OPENAI_API_KEY=sk-...your-key...
```

### Step 3: Deploy the Edge Function

```bash
cd supabase
supabase functions deploy analyze_food
```

You should see:
```
Deployed Functions on project YOUR_PROJECT:
  - analyze_food
```

### Step 4: Test the Deployment

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/analyze_food' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{"label":"test","imageUrl":"https://example.com/food.jpg"}'
```

Find your anon key in: **Supabase Dashboard → Settings → API → anon public**

Expected response:
```json
{
  "items": [{
    "label": "...",
    "calories": 200,
    "sigmaCalories": 10,
    "path": "label",
    ...
  }],
  "meta": {
    "used": ["supabase", "openai"],
    "latencyMs": 5234
  }
}
```

---

## 🔧 Configure Your iOS App

### Method 1: Hardcode Values (Quick Start)

Edit `CalorieCameraView.swift` (around line 500):

```swift
private static func makeAnalyzerClient() -> AnalyzerClient? {
    let baseURL = "https://YOUR_PROJECT.supabase.co/functions/v1"
    let apiKey = "YOUR_SUPABASE_ANON_KEY"

    guard let url = URL(string: baseURL) else { return nil }
    return HTTPAnalyzerClient(configuration: .init(baseURL: url, apiKey: apiKey))
}
```

**Replace:**
- `YOUR_PROJECT` with your Supabase project ref
- `YOUR_SUPABASE_ANON_KEY` with your anon public key

### Method 2: Environment Variables (Production)

1. Add to your Xcode scheme:
   - **Product → Scheme → Edit Scheme...**
   - **Run → Arguments → Environment Variables**
   - Add:
     ```
     ANALYZER_BASE_URL = https://YOUR_PROJECT.supabase.co/functions/v1
     SUPABASE_ANON_KEY = YOUR_ANON_KEY
     ```

2. Update `CalorieCameraView.swift` to read from environment:
   ```swift
   private static func makeAnalyzerClient() -> AnalyzerClient? {
       let env = ProcessInfo.processInfo.environment
       guard let baseURLString = env["ANALYZER_BASE_URL"],
             let apiKey = env["SUPABASE_ANON_KEY"],
             let url = URL(string: baseURLString) else {
           return nil
       }
       return HTTPAnalyzerClient(configuration: .init(baseURL: url, apiKey: apiKey))
   }
   ```

---

## 🏗️ Backend Architecture

### The Edge Function Routes Three Ways:

```
User takes photo → Swift app sends to Supabase
                              ↓
                   /analyze_food function
                              ↓
                      Image type detection
                              ↓
                    ┌─────────┴─────────┐
                    ↓         ↓         ↓
                  Label     Menu    Geometry
                   OCR    Database   Priors
                    ↓         ↓         ↓
              OpenAI    OpenAI    OpenAI
               Vision    Vision     Vision
                    ↓         ↓         ↓
                    └─────────┬─────────┘
                              ↓
                      JSON Response
                              ↓
                        Swift app
```

### API Request Format:

```typescript
{
  "label": "optional hint",
  "imageBase64": "data:image/jpeg;base64,...",
  // OR
  "imageUrl": "https://..."
}
```

### API Response Format:

```typescript
{
  "items": [{
    "label": "Ritz Peanut Butter",
    "confidence": 0.9,
    "calories": 200,
    "sigmaCalories": 10,
    "path": "label" | "menu" | "geometry",
    "evidence": ["Analyzer", "OpenAI", "Label"],

    // For label path:
    "nutritionLabel": {
      "servingSize": "1 pack",
      "caloriesPerServing": 200,
      "totalServings": 1
    },

    // For menu path:
    "menuItem": {
      "restaurant": "Chipotle",
      "itemName": "Chicken Burrito Bowl",
      "calories": 650
    },

    // For geometry path:
    "priors": {
      "density": { "mu": 0.85, "sigma": 0.13 },
      "kcalPerG": { "mu": 1.30, "sigma": 0.26 }
    }
  }],
  "meta": {
    "used": ["supabase", "openai"],
    "latencyMs": 8234
  }
}
```

---

## 🔍 Troubleshooting

### Error: "No API key found in request"

**Cause:** Missing Supabase anon key headers

**Fix:** Ensure both headers are sent:
```swift
request.setValue(apiKey, forHTTPHeaderField: "apikey")
request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
```

### Error: "OPENAI_API_KEY not configured"

**Cause:** Secret not set in Supabase

**Fix:**
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy analyze_food
```

### Error: "Unknown parameter: 'input[0].content[1]...'"

**Cause:** Outdated backend code

**Fix:** Ensure you have the latest version from the repo:
```bash
git pull origin main
supabase functions deploy analyze_food
```

### Slow Response Times (>15 seconds)

**Cause:** OpenAI Vision API can be slow for high-resolution images

**Mitigation:**
- Resize images before sending (iOS camera captures are very large)
- Consider adding a timeout in your app
- Monitor OpenAI API status

### High Costs

**Cause:** OpenAI Vision API costs ~$0.01-0.03 per image

**Mitigation:**
- Cache results for identical images
- Implement rate limiting
- Consider fallback to geometry-only mode
- Monitor usage in OpenAI dashboard

---

## 💰 Cost Estimate

Per API call:
- **OpenAI Vision:** $0.01 - $0.03
- **Supabase Edge Function:** Free tier (500K invocations/month)

Example monthly costs for 1000 users taking 10 photos/day:
- 300,000 API calls/month
- ~$3,000 - $9,000/month in OpenAI costs
- $0 in Supabase costs (within free tier)

**Consider:** Implementing smart caching and limiting to reduce costs!

---

## 🔒 Security Considerations

### ✅ DO:
- Use Supabase anon key (public, safe to embed in app)
- Keep OpenAI API key in Supabase secrets (never in Swift code)
- Implement rate limiting in Edge Function
- Add CORS restrictions in production

### ❌ DON'T:
- Expose OpenAI API key in client code
- Allow unlimited API calls per user
- Send extremely high-resolution images
- Store sensitive user data without encryption

---

## 📊 Monitoring

### Supabase Dashboard

Monitor your Edge Function:
- **Dashboard → Edge Functions → analyze_food**
- View: Invocations, errors, latency
- Check logs for debugging

### OpenAI Dashboard

Monitor API usage:
- [platform.openai.com/usage](https://platform.openai.com/usage)
- Track: Tokens, costs, rate limits

---

## 🆘 Getting Help

If you encounter issues:

1. **Check function logs:**
   ```bash
   supabase functions logs analyze_food
   ```

2. **Test with curl:** See Step 4 above

3. **Verify secrets:**
   ```bash
   supabase secrets list
   ```

4. **Check iOS app logs:** Look for console output with `📦` and `🔀` prefixes

---

## 📝 Next Steps

After backend is deployed:
1. Update Swift app with your Supabase URL and anon key
2. Build and run on iPhone (requires Pro model for LiDAR)
3. Test all three paths:
   - Take photo of packaged food (Label path)
   - Take photo of restaurant food (Menu path)
   - Take photo of home-cooked food (Geometry path)
4. Monitor costs and performance

---

## 📄 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [Swift Package Manager Guide](https://swift.org/package-manager/)
