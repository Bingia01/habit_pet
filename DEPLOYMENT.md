# 🚀 HabitPet Deployment Guide

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free tier available)
- [ ] Supabase project set up
- [ ] Environment variables ready

## 🔧 Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: HabitPet app ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/habit-pet.git
git push -u origin main
```

### 1.2 Environment Variables
Create a `.env.example` file with:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clarifai API Key
CLARIFAI_API_KEY=your_clarifai_api_key_here

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 2.2 Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLARIFAI_API_KEY`
   - `NEXT_PUBLIC_GA_ID` (optional)

### 2.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Get your live URL!

## 📊 Step 3: Set Up Analytics

### 3.1 Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property
3. Get your Measurement ID (GA4)
4. Add to environment variables

### 3.2 Vercel Analytics
1. In Vercel dashboard → Project Settings
2. Enable Vercel Analytics (free)
3. Get detailed performance metrics

## 🔍 Step 4: Monitoring & Error Tracking

### 4.1 Sentry (Optional)
1. Sign up at [sentry.io](https://sentry.io)
2. Create new project
3. Add Sentry DSN to environment variables

### 4.2 Performance Monitoring
- Vercel provides built-in performance monitoring
- Google Analytics for user behavior
- Supabase dashboard for database metrics

## 🌐 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Vercel dashboard → Domains
2. Add your domain
3. Configure DNS settings
4. SSL certificate auto-generated

## ✅ Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Camera functionality works
- [ ] Database connections work
- [ ] Analytics tracking active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] SSL certificate active
- [ ] Mobile responsiveness tested

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**: Check environment variables
2. **API Errors**: Verify Supabase configuration
3. **Camera Issues**: Test on HTTPS (required for camera)
4. **Analytics Not Working**: Check GA ID configuration

### Support:
- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Deployment: https://supabase.com/docs/guides/platform
