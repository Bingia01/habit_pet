# 🚀 Vercel Deployment Guide for HabitPet Webapp

## ✅ What's Been Done (Agent Mode)

### 1. Color Scheme Updated ✅
- **All green colors changed to teal** throughout the webapp
- **Gradients updated** to match landing page: `from-teal-50 via-cyan-50 to-blue-100`
- **Buttons updated** from `bg-green-500` to `bg-teal-500`
- **Text colors updated** from `text-green-600` to `text-teal-600`

### 2. Landing Page Button Links Updated ✅
- Updated `HeroSectionV2.tsx` with placeholder URL
- Updated `FinalCTA.tsx` with placeholder URL
- Updated `HeroSection.tsx` with placeholder URL
- All buttons now ready to point to your deployed webapp

---

## 📋 What You Need to Do (Step-by-Step)

### Step 1: Deploy Webapp to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "Add New Project"
   - Select your `habit_pet` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add these (from your `.env.local`):
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   OPENAI_API_KEY=your_openai_key
   CLASSIFIER_API_KEY=your_openai_key
   USDA_API_KEY=your_usda_key
   NEXTJS_API_URL=https://your-vercel-url.vercel.app
   ```
   
   ⚠️ **Important**: For `NEXTJS_API_URL`, you'll need to update this AFTER the first deployment with the actual URL Vercel gives you.

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Copy the deployment URL (e.g., `https://habit-pet-xxxxx.vercel.app`)

#### Option B: Via Vercel CLI

```bash
cd /Users/wutthichaiupatising/habit_pet
npm i -g vercel
vercel login
vercel
# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? habit-pet (or your choice)
# - Directory? ./
# - Override settings? No
# - Add environment variables when prompted
```

---

### Step 2: Update Environment Variables

After first deployment, update `NEXTJS_API_URL`:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXTJS_API_URL`
3. Set it to: `https://YOUR-ACTUAL-VERCEL-URL.vercel.app`
4. Redeploy (or it will auto-redeploy)

---

### Step 3: Update Landing Page Button Links

Update the ForkiPromote landing page to point to your deployed webapp:

1. **Find your webapp URL**
   - From Step 1, you should have: `https://habit-pet-xxxxx.vercel.app`
   - Full URL to dashboard: `https://habit-pet-xxxxx.vercel.app/dashboard`

2. **Update Landing Page Components**

   **File 1**: `website/ForkiPromote/client/src/components/v2/HeroSectionV2.tsx`
   
   Change line 13-16:
   ```tsx
   const handleWebAppClick = () => {
     window.location.href = "https://YOUR-ACTUAL-VERCEL-URL.vercel.app/dashboard";
   };
   ```
   
   **File 2**: `website/ForkiPromote/client/src/components/FinalCTA.tsx`
   
   Change line 7-9:
   ```tsx
   const handleWebAppClick = () => {
     window.location.href = "https://YOUR-ACTUAL-VERCEL-URL.vercel.app/dashboard";
   };
   ```
   
   **File 3**: `website/ForkiPromote/client/src/components/HeroSection.tsx`
   
   Same change as above.

3. **Redeploy Landing Page**
   ```bash
   cd website/ForkiPromote
   # If using Vercel CLI:
   vercel --prod
   # Or push to GitHub and Vercel will auto-deploy
   ```

---

### Step 4: Claim Forki Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your webapp project → Settings → Domains
   - Click "Add Domain"

2. **Enter Domain**
   - Type: `forki.app` or `forki.com` (or your preferred domain)
   - Click "Add"

3. **Configure DNS**
   - Vercel will show you DNS records to add
   - Go to your domain registrar (e.g., Namecheap, GoDaddy)
   - Add the DNS records Vercel provides
   - Wait for DNS propagation (5-30 minutes)

4. **Update Button Links**
   - Once domain is active, update landing page buttons to use: `https://forki.app/dashboard`

---

### Step 5: Test Everything

1. **Test Webapp**
   - Visit your Vercel URL: `https://habit-pet-xxxxx.vercel.app`
   - Should redirect to `/landing` or `/dashboard`
   - Test camera feature
   - Test food logging
   - Verify colors match landing page (teal/cyan/blue gradient)

2. **Test Landing Page**
   - Visit: `https://forki-promote-e5erihdx5-wutthichaiupatising-1706s-projects.vercel.app`
   - Click "Try Free Now" button
   - Should redirect to your webapp dashboard

3. **Test Custom Domain** (if configured)
   - Visit: `https://forki.app`
   - Verify it works

---

## 🎨 Color Scheme Reference

Your webapp now uses:
- **Background gradients**: `from-teal-50 via-cyan-50 to-blue-100`
- **Primary buttons**: `bg-teal-500 hover:bg-teal-600`
- **Text accents**: `text-teal-600`
- **Landing page hero**: `from-teal-400 via-cyan-400 to-blue-500`

This matches your ForkiPromote landing page! 🎉

---

## 📝 Quick Checklist

- [ ] Deploy webapp to Vercel
- [ ] Copy webapp Vercel URL
- [ ] Update `NEXTJS_API_URL` environment variable
- [ ] Update landing page button links (3 files)
- [ ] Redeploy landing page
- [ ] Test webapp functionality
- [ ] Test landing page → webapp redirect
- [ ] (Optional) Set up custom domain
- [ ] (Optional) Update links to use custom domain

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify all dependencies in `package.json`
- Check Vercel build logs for specific errors

### Environment Variables Not Working
- Make sure they're set in Vercel Dashboard (not just `.env.local`)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Landing Page Buttons Don't Work
- Verify URL is correct (include `/dashboard`)
- Check browser console for errors
- Make sure landing page is redeployed after changes

### Colors Don't Match
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Verify Tailwind classes are correct

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor API response times
   - Watch for errors in Vercel logs

2. **Set Up Custom Domain** (if desired)
   - Follow Step 4 above
   - Update all links to use custom domain

3. **Test on Mobile**
   - Test camera feature on mobile devices
   - Verify responsive design works
   - Test on iOS Safari and Android Chrome

4. **Share with Users**
   - Share landing page URL: `https://forki-promote-...vercel.app`
   - Users click "Try Free Now" → redirected to webapp
   - Users can start logging food immediately!

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Make sure both projects (webapp + landing page) are deployed

Good luck with your deployment! 🚀


