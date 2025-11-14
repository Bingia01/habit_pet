# iOS App Transport Security (ATS) Fix Guide

## Problem

iOS blocks HTTP connections by default due to App Transport Security (ATS). When your iOS app tries to connect to `http://192.168.1.xxx:3000`, it fails with:

```
Error Domain=NSURLErrorDomain Code=-1022
"The resource could not be loaded because the App Transport Security policy requires the use of a secure connection."
```

## Solution: Use Production HTTPS URL (Recommended)

### Step 1: Update Xcode Environment Variable

1. Open your Xcode project
2. Go to **Product → Scheme → Edit Scheme...**
3. Select **Run** in the left sidebar
4. Go to **Arguments** tab
5. Under **Environment Variables**, find `NEXTJS_API_URL`
6. **Change it from:**
   ```
   NEXTJS_API_URL = http://192.168.1.xxx:3000
   ```
   **To:**
   ```
   NEXTJS_API_URL = https://habit-3xiuil804-wutthichaiupatising-1706s-projects.vercel.app
   ```

### Step 2: Verify Configuration

Your environment variables should now be:
```
NEXTJS_API_URL = https://habit-3xiuil804-wutthichaiupatising-1706s-projects.vercel.app
SUPABASE_URL = https://uisjdlxdqfovuwurmdop.supabase.co/functions/v1
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Rebuild and Test

1. Clean build folder: **Product → Clean Build Folder** (Shift+Cmd+K)
2. Rebuild: **Product → Build** (Cmd+B)
3. Run on device: **Product → Run** (Cmd+R)

## Alternative: Allow HTTP for Local Development (Not Recommended)

If you absolutely need to test with localhost, you can disable ATS for specific domains:

### Step 1: Edit Info.plist

1. In Xcode, find `Info.plist` in your project
2. Right-click → **Open As → Source Code**
3. Add this before `</dict>`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>192.168.1.xxx</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**⚠️ Warning:** This is only for development. Never ship an app with ATS exceptions enabled.

## Benefits of Using Production HTTPS URL

1. ✅ **No ATS issues** - HTTPS is always allowed
2. ✅ **Works everywhere** - No need to be on same WiFi
3. ✅ **Production-ready** - Same URL you'll use in production
4. ✅ **Always available** - Vercel handles uptime
5. ✅ **Auto-scaling** - Vercel handles traffic spikes

## Testing

After updating the URL, you should see in logs:
```
🚀 [DualAnalyzer] Next.js API URL: https://habit-3xiuil804-wutthichaiupatising-1706s-projects.vercel.app
🔄 [DualAnalyzer] Trying Next.js API first...
✅ [DualAnalyzer] Next.js API success!
```

Instead of:
```
❌ Error Domain=NSURLErrorDomain Code=-1022
```

## Troubleshooting

### Issue: Still getting ATS error
- **Check:** Make sure URL starts with `https://` not `http://`
- **Check:** Verify the URL is correct (no typos)
- **Check:** Clean build folder and rebuild

### Issue: API returns 404
- **Check:** Make sure Vercel deployment is live
- **Check:** Visit the URL in browser: `https://habit-3xiuil804-wutthichaiupatising-1706s-projects.vercel.app/api/analyze-food`
- **Check:** Verify environment variables are set in Vercel dashboard

### Issue: API returns 500
- **Check:** Supabase Edge Function is deployed (we just fixed the schema)
- **Check:** Environment variables in Vercel (OPENAI_API_KEY, SUPABASE_URL, etc.)

