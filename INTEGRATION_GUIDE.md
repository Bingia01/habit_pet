# Integration Guide

Complete step-by-step guide for integrating the HabitPet food analysis system into your application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Supabase Setup](#supabase-setup)
4. [Frontend Integration](#frontend-integration)
5. [Backend Integration](#backend-integration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd habit_pet
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual values
# See Environment Setup section below
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## Environment Setup

### Required Variables

**Minimum setup (uses stub analyzer - mock data):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Full setup (with real analyzers):**
```env
# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
```

### Getting API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys**
4. Create new key → `OPENAI_API_KEY`

### Environment Variable Reference

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client | Supabase project URL (frontend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client | Supabase anon key (frontend) |
| `SUPABASE_URL` | For Supabase analyzer | Server | Supabase project URL (backend) |
| `SUPABASE_ANON_KEY` | For Supabase analyzer | Server | Supabase anon key (backend) |
| `OPENAI_API_KEY` | For OpenAI analyzer | Server | OpenAI API key |
| `OPENAI_ANALYZER_MODEL` | No | Server | Model name (default: `gpt-4o-mini`) |
| `ANALYZER_CHOICE` | No | Server | Force specific analyzer |
| `USDA_API_KEY` | No | Server | Enhanced food validation |
| `CLASSIFIER_API_KEY` | For Supabase function | Supabase | Set via `supabase secrets` |

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser. Only use public keys.

---

## Supabase Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 2. Link Your Project

```bash
# Get your project ref from Supabase dashboard URL:
# https://supabase.com/dashboard/project/YOUR_PROJECT_REF

supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set Supabase Secrets

```bash
# Required for Supabase Edge Function
supabase secrets set CLASSIFIER_API_KEY=sk-your-openai-key

# Optional: Enhanced food validation
supabase secrets set USDA_API_KEY=your-usda-key
```

### 4. Deploy Edge Function

```bash
cd supabase
supabase functions deploy analyze_food
```

### 5. Verify Deployment

```bash
# Run verification script
npm run verify:supabase

# Or manually test
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze_food \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

---

## Frontend Integration

### Using the Camera Component

The `FinalCameraCapture` component handles camera access, photo capture, and food analysis.

```typescript
import { FinalCameraCapture } from '@/components/FinalCameraCapture';

function MyFoodLogger() {
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = async (foodData: FoodAnalysis) => {
    console.log('Food:', foodData.foodType);
    console.log('Calories:', foodData.calories);
    // Save to database, update UI, etc.
    setShowCamera(false);
  };

  return (
    <>
      <button onClick={() => setShowCamera(true)}>
        Take Photo
      </button>
      
      {showCamera && (
        <FinalCameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
```

### Direct API Integration

If you want to call the API directly:

```typescript
async function analyzeFood(imageBlob: Blob) {
  const formData = new FormData();
  formData.append('image', imageBlob, 'food.jpg');

  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```

### Error Handling

```typescript
import { CameraErrorDisplay } from '@/components/CameraErrorDisplay';

function MyComponent() {
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const handleError = (error: Error, code?: string) => {
    setError({ message: error.message, code });
  };

  return (
    <>
      {/* Your camera component */}
      
      {error && (
        <CameraErrorDisplay
          error={error.message}
          errorCode={error.code}
          onRetry={() => {
            setError(null);
            // Retry logic
          }}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
}
```

---

## Backend Integration

### API Route Structure

The main API route is at `src/app/api/analyze-food/route.ts`. It:
1. Validates input (image, format)
2. Tries analyzers in fallback chain
3. Validates and calculates calories
4. Returns structured response

### Adding Custom Analyzers

1. Create analyzer class implementing `Analyzer` interface:

```typescript
// src/lib/analyzers/custom.ts
import type { Analyzer, AnalyzeInput, AnalyzeOutput } from '@/lib/types/analyzer';

export class CustomAnalyzer implements Analyzer {
  async analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
    // Your analysis logic
    return {
      items: [{
        label: 'Food Name',
        confidence: 0.9,
        calories: 100,
        weightGrams: 150,
        // ... other fields
      }],
      meta: {
        used: ['custom'],
      },
    };
  }
}
```

2. Add to fallback chain in `analyzer-config.ts`:

```typescript
export function getFallbackChain(): AnalyzerType[] {
  // Add 'custom' to chain
  if (availability.custom) {
    chain.push('custom');
  }
  // ... rest of chain
}
```

3. Register in API route:

```typescript
function resolveAnalyzer(choice: string): Analyzer {
  switch (choice) {
    case 'custom':
      return customAnalyzer;
    // ... other cases
  }
}
```

---

## Testing

### Run All Tests

```bash
# Unit + Integration tests
npm run test

# E2E tests (requires dev server)
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

### Test Camera Feature

1. Start dev server: `npm run dev`
2. Navigate to camera page
3. Test scenarios:
   - ✅ Camera permission granted
   - ✅ Camera permission denied
   - ✅ Photo capture
   - ✅ Food analysis
   - ✅ Error handling
   - ✅ Retry mechanism

### Test API Directly

```bash
# Test with minimal image
curl -X POST http://localhost:3000/api/analyze-food \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

### Test Analyzer Configuration

```bash
# Check configuration logs
npm run dev
# Look for [Analyzer Config] in terminal

# Test with specific analyzer
ANALYZER_CHOICE=stub npm run dev
ANALYZER_CHOICE=supabase npm run dev
ANALYZER_CHOICE=openai npm run dev
```

---

## Troubleshooting

### Common Issues

#### 1. "Configuration Error" / "CONFIG_ERROR"

**Problem**: Missing or invalid API keys

**Solution**:
1. Check `.env.local` exists and has all required variables
2. Verify variable names are correct (case-sensitive)
3. Restart dev server after changing `.env.local`
4. Check server logs for specific missing variables

#### 2. "Network Error" / "NETWORK_ERROR"

**Problem**: Cannot connect to Supabase or OpenAI

**Solution**:
1. Check internet connection
2. Verify Supabase URL is correct
3. Check if Supabase function is deployed
4. Verify API keys are valid

#### 3. "Timeout" / "TIMEOUT"

**Problem**: Analysis takes too long (>30s)

**Solution**:
1. Check network speed
2. Try smaller image
3. Check Supabase function logs
4. Verify OpenAI API quota

#### 4. "Supabase function not found" / 404

**Problem**: Edge function not deployed

**Solution**:
```bash
# Deploy function
cd supabase
supabase functions deploy analyze_food

# Verify deployment
supabase functions list
```

#### 5. Analyzer Always Uses Stub

**Problem**: Fallback chain defaults to stub

**Solution**:
1. Check environment variables are set
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
3. Check server logs for configuration status
4. Ensure `.env.local` is in project root (not in `src/`)

#### 6. "Invalid SUPABASE_URL format"

**Problem**: URL format is incorrect

**Solution**:
- Should be: `https://your-project.supabase.co`
- Should NOT have trailing slash
- Should NOT include `/functions/v1`

### Debugging Steps

1. **Check Environment Variables**:
   ```bash
   # In Node.js (server-side only)
   console.log(process.env.SUPABASE_URL);
   ```

2. **Check Analyzer Configuration**:
   ```bash
   npm run dev
   # Look for [Analyzer Config] logs
   ```

3. **Check Supabase Function Logs**:
   ```bash
   supabase functions logs analyze_food --follow
   ```

4. **Test API Directly**:
   ```bash
   curl -X POST http://localhost:3000/api/analyze-food \
     -H "Content-Type: application/json" \
     -d '{"imageBase64": "..."}'
   ```

5. **Check Browser Console**:
   - Open DevTools → Console
   - Look for error messages
   - Check Network tab for failed requests

### Getting Help

1. Check error codes in `API_DOCUMENTATION.md`
2. Review server logs
3. Verify environment setup
4. Test with stub analyzer first (no API keys needed)
5. Check Supabase status: https://status.supabase.com

---

## Next Steps

After successful integration:

1. **Monitor Performance**:
   - Track analyzer usage
   - Monitor latency
   - Check error rates

2. **Optimize**:
   - Add response caching
   - Implement rate limiting
   - Optimize image processing

3. **Enhance**:
   - Add more analyzers
   - Improve calorie calculation
   - Add food database integration

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Setup Checklist](./SETUP_CHECKLIST.md) - Step-by-step checklist
- [Supabase Deployment Guide](./SUPABASE_DEPLOYMENT.md) - Edge function setup
- [Testing Guide](./tests/README.md) - Test documentation

