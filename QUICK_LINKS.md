# 🔗 HabitPet - Quick Links Reference Card

## 🌐 Live URLs

| Purpose | URL | Status |
|---------|-----|--------|
| **Landing Page** | https://habit-pet.vercel.app/landing | ✅ Live |
| **Web App** | https://habit-pet.vercel.app | ✅ Live |
| **Onboarding** | https://habit-pet.vercel.app/onboarding | ✅ Live |
| **iOS App Store** | https://apps.apple.com/app/habitpet | ❌ Not Published Yet |

---

## 🎯 Key Actions

### **For Users:**
1. **Try the Web App:** https://habit-pet.vercel.app/onboarding
2. **View Landing Page:** https://habit-pet.vercel.app/landing

### **For Developers:**
1. **Local Development:**
   ```bash
   cd ~/habit_pet
   npm run dev
   # Visit: http://localhost:3000/landing
   ```

2. **Deploy Changes:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   # Auto-deploys to Vercel in ~1 minute
   ```

3. **Check Deployment Status:**
   ```bash
   vercel ls
   ```

---

## 📱 Mobile Testing

Scan this QR code (or manually visit the URL):

**URL:** https://habit-pet.vercel.app/landing

*Note: Generate QR code at https://qr.io or similar*

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `src/app/landing/page.tsx` | Landing page component |
| `src/app/landing/metadata.ts` | SEO metadata |
| `.env.local` | Environment variables |
| `vercel.json` | Vercel config (if exists) |

---

## 📊 Analytics & Monitoring

| Service | URL | Purpose |
|---------|-----|---------|
| **Vercel Dashboard** | https://vercel.com/dashboard | View deployments & analytics |
| **GitHub Repo** | https://github.com/Bingia01/habit_pet | Source code |
| **Supabase Dashboard** | https://supabase.com/dashboard | Database & edge functions |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Deployment
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Deploy to Vercel

# Vercel CLI
vercel               # Deploy manually
vercel ls            # List deployments
vercel logs [url]    # View logs
```

---

## 🎨 Brand Assets

- **Primary Color:** `#10b981` (Green)
- **Font:** Geist Sans
- **Logo Emoji:** 🐾
- **Tagline:** "Build healthy eating habits with your virtual pet"

---

## 📝 TODO List

- [ ] Update App Store URL when iOS app is published
- [ ] Add Google Analytics tracking to landing page
- [ ] Create About/Privacy/Terms pages for footer
- [ ] Add email signup form
- [ ] A/B test different CTA copy

---

*Last Updated: October 19, 2025*
