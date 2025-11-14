# Environment Setup Guide

Quick guide to set up your `.env.local` file with your API keys.

## Option 1: Interactive Setup Script (Recommended) ✅

I've created a secure interactive script that will guide you through setting up your environment variables.

### Run the Setup Script

```bash
npm run setup:env
```

This script will:
- ✅ Prompt you for each API key securely
- ✅ Validate the format of your keys
- ✅ Auto-fill duplicate values (e.g., SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL)
- ✅ Create `.env.local` file automatically
- ✅ Never expose your keys in terminal history

### What You'll Need

Before running the script, have these ready:

1. **Supabase Credentials**:
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project → **Settings** → **API**
   - Copy **Project URL** and **anon public** key

2. **OpenAI API Key** (optional but recommended):
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create new secret key
   - Copy the key (starts with `sk-`)

### Example Session

```
🔐 Secure Environment Setup
================================================================================
This script will help you set up your .env.local file securely.

📝 Let's set up your environment variables:

Supabase Project URL (get from Supabase Dashboard → Settings → API) (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
✅ NEXT_PUBLIC_SUPABASE_URL = https****.co

Supabase Anon Key (get from Supabase Dashboard → Settings → API → anon public) (REQUIRED)
NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGc...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJh****...

...

✅ .env.local file created successfully!
```

---

## Option 2: Manual Setup

If you prefer to edit the file directly:

### 1. Copy the Template

```bash
cp .env.local.example .env.local
```

### 2. Open in Your Editor

Open `.env.local` in your preferred editor (VS Code, etc.)

### 3. Fill in Your Keys

Replace the placeholder values with your actual keys:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here

# OpenAI (Optional but recommended)
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 4. Save the File

Save `.env.local` (it's already in `.gitignore`, so it won't be committed)

---

## Option 3: I Can Help You Fill It In

If you want me to help you create the file with your keys:

1. **Open `.env.local` in your editor** (create it if it doesn't exist)
2. **Paste your keys directly into the file** (not in chat - keep them secure!)
3. **Tell me when you're done**, and I can:
   - Verify the format is correct
   - Check for any issues
   - Run `npm run verify:env` to validate

---

## Verify Your Setup

After setting up your `.env.local` file:

```bash
# Verify environment variables
npm run verify:env

# Start dev server (will show analyzer config)
npm run dev
```

Look for this in the terminal:
```
[Analyzer Config]
  Selected: supabase
  Available: true
  Supabase: ✓
  OpenAI: ✓
```

---

## Security Notes

✅ **Safe**:
- `.env.local` is in `.gitignore` (won't be committed)
- Keys are stored locally only
- Setup script doesn't log keys to terminal

❌ **Never**:
- Commit `.env.local` to git
- Share keys in chat or public forums
- Hardcode keys in source files

---

## Troubleshooting

### "File already exists"
If `.env.local` already exists, the script will ask if you want to overwrite it.

### "Invalid format" errors
The script validates:
- Supabase URLs must be `https://*.supabase.co`
- OpenAI keys must start with `sk-`
- Keys must be minimum length

### Keys not working
1. Verify keys are correct (no extra spaces)
2. Check Supabase project is active
3. Verify OpenAI API key has credits/quota
4. Run `npm run verify:env` to check configuration

---

## Next Steps

After setting up `.env.local`:

1. ✅ Verify: `npm run verify:env`
2. ✅ Deploy Supabase function (see `INTEGRATION_GUIDE.md`)
3. ✅ Test: `npm run dev`
4. ✅ Check analyzer config in terminal logs

---

**Ready to set up? Run: `npm run setup:env`** 🚀

