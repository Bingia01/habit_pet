# Setup Checklist

Step-by-step checklist for setting up HabitPet food analysis system.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Git installed
- [ ] Supabase account (free tier available)
- [ ] OpenAI account (for API key)

---

## Phase 1: Initial Setup (5 minutes)

### 1.1 Clone and Install

- [ ] Clone repository: `git clone <repo-url>`
- [ ] Navigate to project: `cd habit_pet`
- [ ] Install dependencies: `npm install`
- [ ] Verify installation: `npm run dev` (should start without errors)

### 1.2 Environment Variables

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Open `.env.local` in editor

---

## Phase 2: Supabase Setup (10 minutes)

### 2.1 Create Supabase Project

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or log in
- [ ] Create new project (or use existing)
- [ ] Wait for project to be ready (~2 minutes)

### 2.2 Get Supabase Credentials

- [ ] Go to **Settings** → **API**
- [ ] Copy **Project URL** → Paste to `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_URL`
- [ ] Copy **anon public** key → Paste to `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_ANON_KEY`

### 2.3 Verify Supabase Connection

- [ ] Save `.env.local`
- [ ] Restart dev server: `npm run dev`
- [ ] Check terminal for `[Analyzer Config]` logs
- [ ] Verify Supabase shows as `✓` (not `✗`)

---

## Phase 3: OpenAI Setup (5 minutes)

### 3.1 Get OpenAI API Key

- [ ] Go to [platform.openai.com](https://platform.openai.com)
- [ ] Sign up or log in
- [ ] Go to **API Keys**
- [ ] Click **Create new secret key**
- [ ] Copy the key (starts with `sk-`)

### 3.2 Add OpenAI Key

- [ ] Paste key to `.env.local`:
  - `OPENAI_API_KEY=sk-...`
- [ ] Save `.env.local`
- [ ] Restart dev server

### 3.3 Verify OpenAI Configuration

- [ ] Check terminal for `[Analyzer Config]` logs
- [ ] Verify OpenAI shows as `✓` (not `✗`)

---

## Phase 4: Supabase Edge Function (15 minutes)

### 4.1 Install Supabase CLI

- [ ] Install CLI: `npm install -g supabase`
- [ ] Verify installation: `supabase --version`
- [ ] Login: `supabase login` (opens browser)

### 4.2 Link Project

- [ ] Get project ref from Supabase dashboard URL:
  - `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- [ ] Link project: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Verify link: `supabase projects list`

### 4.3 Set Supabase Secrets

- [ ] Set OpenAI key: `supabase secrets set CLASSIFIER_API_KEY=sk-your-key`
- [ ] (Optional) Set USDA key: `supabase secrets set USDA_API_KEY=your-key`
- [ ] Verify secrets: `supabase secrets list`

### 4.4 Deploy Function

- [ ] Navigate to supabase directory: `cd supabase`
- [ ] Deploy function: `supabase functions deploy analyze_food`
- [ ] Wait for deployment to complete
- [ ] Verify deployment: `supabase functions list`

### 4.5 Verify Deployment

- [ ] Run verification: `npm run verify:supabase`
- [ ] Check all tests pass (✅)
- [ ] If tests fail, check error messages and fix issues

---

## Phase 5: Testing (10 minutes)

### 5.1 Test Local Development

- [ ] Start dev server: `npm run dev`
- [ ] Open browser: `http://localhost:3000`
- [ ] Navigate to camera page
- [ ] Test camera permission
- [ ] Take a test photo
- [ ] Verify analysis works

### 5.2 Test API Directly

- [ ] Open terminal
- [ ] Run test command:
  ```bash
  curl -X POST http://localhost:3000/api/analyze-food \
    -H "Content-Type: application/json" \
    -d '{"imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
  ```
- [ ] Verify response contains `foodType` and `calories`

### 5.3 Run Automated Tests

- [ ] Run unit tests: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e` (requires dev server)
- [ ] Check all tests pass
- [ ] Review any failing tests

---

## Phase 6: Production Deployment (Optional)

### 6.1 Prepare for Deployment

- [ ] Review `.env.local.example` for all variables
- [ ] Document which variables are needed for production
- [ ] Set up production environment variables in hosting platform

### 6.2 Deploy to Vercel (or other platform)

- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Verify production deployment works

### 6.3 Post-Deployment Verification

- [ ] Test production API endpoint
- [ ] Test camera feature in production
- [ ] Monitor logs for errors
- [ ] Check analyzer usage statistics

---

## Verification Checklist

After completing setup, verify:

- [ ] Dev server starts without errors
- [ ] Analyzer configuration shows Supabase: ✓
- [ ] Analyzer configuration shows OpenAI: ✓
- [ ] Supabase function is deployed
- [ ] Verification script passes all tests
- [ ] Camera feature works in browser
- [ ] API returns valid responses
- [ ] Error handling works (test with network off)
- [ ] Fallback chain works (test by disabling Supabase)

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Configuration Error" | Check `.env.local` has all required variables |
| "Network Error" | Verify Supabase URL and keys are correct |
| "Timeout" | Check network, try smaller image |
| "Function not found" | Deploy Supabase function |
| Always uses stub | Check environment variables are set |

---

## Next Steps

After setup is complete:

1. ✅ Read [API Documentation](./API_DOCUMENTATION.md)
2. ✅ Review [Integration Guide](./INTEGRATION_GUIDE.md)
3. ✅ Explore the codebase structure
4. ✅ Customize for your needs
5. ✅ Deploy to production

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run test                   # Run tests
npm run test:e2e               # Run E2E tests

# Supabase
supabase login                 # Login to Supabase
supabase link --project-ref X  # Link project
supabase secrets set KEY=VAL   # Set secret
supabase functions deploy X    # Deploy function
supabase functions logs X      # View logs

# Verification
npm run verify:supabase        # Verify deployment
npm run test:calories          # Test calorie calculation
```

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

Mark items as you complete them!

