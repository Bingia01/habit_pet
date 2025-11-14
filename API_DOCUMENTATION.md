# API Documentation

Complete API reference for the HabitPet food analysis system.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

---

## POST /api/analyze-food

Analyzes a food image and returns calorie estimates, food identification, and nutritional information.

### Overview

This endpoint uses a multi-analyzer fallback system:
1. **Supabase Analyzer** (primary) - Uses Supabase Edge Function with OpenAI Vision
2. **OpenAI Analyzer** (fallback) - Direct OpenAI Vision API call
3. **Stub Analyzer** (final fallback) - Returns mock data for testing

The system automatically falls back to the next analyzer if one fails.

### Request

#### Content-Type Options

**Option 1: Multipart Form Data** (recommended for file uploads)
```
Content-Type: multipart/form-data
```

**Option 2: JSON** (for base64 or URL)
```
Content-Type: application/json
```

#### Request Body (FormData)

```typescript
FormData {
  image: File,        // Required: Image file (JPEG, PNG, WebP)
  region?: string     // Optional: Region code (e.g., 'US', 'EU')
}
```

#### Request Body (JSON)

```typescript
{
  imageBase64?: string,  // Required (if imageUrl not provided): Base64 encoded image
  imageUrl?: string,     // Required (if imageBase64 not provided): Image URL
  region?: string       // Optional: Region code for food database lookup
}
```

#### Example Requests

**Using FormData (JavaScript/TypeScript):**
```typescript
const formData = new FormData();
formData.append('image', imageBlob, 'food.jpg');
formData.append('region', 'US');

const response = await fetch('/api/analyze-food', {
  method: 'POST',
  body: formData,
});
```

**Using JSON with Base64:**
```typescript
const response = await fetch('/api/analyze-food', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageBase64: base64String,
    region: 'US',
  }),
});
```

**Using JSON with URL:**
```typescript
const response = await fetch('/api/analyze-food', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://example.com/food.jpg',
    region: 'US',
  }),
});
```

### Response

#### Success Response (200 OK)

```typescript
{
  foodType: string;              // Food name (e.g., "Apple")
  confidence: number;            // Confidence score (0-1)
  calories: number;              // Estimated calories
  weight: number;                // Estimated weight in grams
  emoji?: string;                // Food emoji (e.g., "🍎")
  portionSizes?: string[];       // Suggested portion sizes
  evidence?: string[];           // Analysis sources used
  meta: {
    used: ('stub' | 'supabase' | 'openai')[];  // Analyzers used
    latencyMs: number | null;    // Response time in milliseconds
    isFallback: boolean;          // Whether fallback was used
    warnings?: string[];          // Any warnings
    calculationMethod: string;   // How calories were calculated
  }
}
```

#### Example Success Response

```json
{
  "foodType": "Apple",
  "confidence": 0.95,
  "calories": 95,
  "weight": 150,
  "emoji": "🍎",
  "portionSizes": [
    "Small (80 cal)",
    "Medium (95 cal)",
    "Large (116 cal)"
  ],
  "evidence": ["supabase", "openai"],
  "meta": {
    "used": ["supabase"],
    "latencyMs": 2341,
    "isFallback": false,
    "calculationMethod": "weight×kcalPerG",
    "warnings": []
  }
}
```

#### Error Response (400/500)

```typescript
{
  error: string;                 // Human-readable error message
  errorCode: string;             // Error code (see below)
  errorDetails?: string;          // Detailed error (development only)
}
```

#### Example Error Response

```json
{
  "error": "Failed to analyze food image",
  "errorCode": "TIMEOUT",
  "errorDetails": "Analyzer timeout after 30000ms"
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `TIMEOUT` | Analyzer request timed out (>30s) | Check network, retry request |
| `NETWORK_ERROR` | Network connection failed | Check internet connection |
| `CONFIG_ERROR` | Missing API keys or configuration | Set required environment variables |
| `NO_IMAGE` | No image provided in request | Include image in request body |
| `BLOB_ERROR` | Image blob creation failed | Check image format and size |
| `EMPTY_IMAGE` | Image is empty or invalid | Use valid image file |
| `IMAGE_TOO_LARGE` | Image exceeds size limit | Compress or resize image |
| `ANALYSIS_ERROR` | Analysis failed | Check logs, retry request |
| `ABORTED` | Request was cancelled | User navigated away (normal) |
| `VALIDATION_ERROR` | Request validation failed | Check request format |
| `UNKNOWN_ERROR` | Unexpected error | Check logs, contact support |

### Calculation Methods

The `meta.calculationMethod` field indicates how calories were calculated:

- `analyzer-provided` - Direct from analyzer (most accurate)
- `openai-estimate` - OpenAI Vision 2D estimate
- `weight×kcalPerG` - Weight × Calories per gram (from priors)
- `volume×density×kcalPerG` - Volume × Density × Calories/g (from priors)
- `estimation-stub` - Mock data estimation
- `estimation-fallback` - Fallback estimation when priors unavailable

### Rate Limits

- **Default**: No explicit rate limiting
- **Recommended**: Implement client-side rate limiting (max 10 requests/minute)
- **Production**: Consider adding rate limiting middleware

### Timeout

- **Analyzer Timeout**: 30 seconds per analyzer
- **Total Timeout**: Up to 90 seconds (if all analyzers are tried)
- **Recommendation**: Show loading state and allow cancellation

### Best Practices

1. **Image Format**: Use JPEG or PNG, max 5MB
2. **Image Quality**: Higher quality = better analysis
3. **Error Handling**: Always check `response.ok` and handle errors
4. **Loading States**: Show loading indicator during analysis
5. **Retry Logic**: Implement retry for network errors
6. **Caching**: Consider caching results for identical images

### Example Integration

```typescript
async function analyzeFood(imageBlob: Blob): Promise<FoodAnalysis> {
  const formData = new FormData();
  formData.append('image', imageBlob, 'food.jpg');

  try {
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${error.errorCode}: ${error.error}`);
    }

    const data = await response.json();
    
    // Log analysis details
    console.log(`Analyzed: ${data.foodType}`);
    console.log(`Calories: ${data.calories} kcal`);
    console.log(`Method: ${data.meta.calculationMethod}`);
    console.log(`Analyzer: ${data.meta.used.join(', ')}`);
    
    if (data.meta.isFallback) {
      console.warn('Used fallback analyzer');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error codes
      if (error.message.includes('TIMEOUT')) {
        // Show timeout message, offer retry
      } else if (error.message.includes('NETWORK_ERROR')) {
        // Show network error, check connection
      }
    }
    throw error;
  }
}
```

### Testing

**Test with minimal image (base64):**
```bash
curl -X POST http://localhost:3000/api/analyze-food \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Test with file upload:**
```bash
curl -X POST http://localhost:3000/api/analyze-food \
  -F "image=@food.jpg" \
  -F "region=US"
```

---

## Other Endpoints

### GET /api/test-connection

Tests Supabase connection (development only).

**Response:**
```json
{
  "connected": true,
  "supabaseUrl": "https://...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Support

For issues or questions:
1. Check error codes and solutions above
2. Review server logs for detailed errors
3. Verify environment variables are set correctly
4. Check Supabase function deployment status

