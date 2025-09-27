# HabitPet 🐾

A mobile-first habit tracking app with an evolving avatar that helps users build healthy eating habits through gamification and instant feedback.

## Features

- **Onboarding Flow**: Personalized setup with dietary preferences and goals
- **Evolving Avatar**: Pet that changes based on user progress and streaks
- **Food Logging**: Camera recognition (mockup) and manual input with emoji selection
- **Progress Tracking**: Daily and weekly calorie goals with visual progress bars
- **History & Analytics**: Food logs grouped by date with totals
- **Settings**: Customizable goals, preferences, and biometrics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database Schema

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase-schema.sql and run in Supabase SQL editor
```

This will create:
- Users table
- User preferences table
- Food logs table
- User progress table
- RLS policies for security
- Automatic progress calculation triggers

### 4. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 **App Features**

The app is fully functional and works without any database setup:

- **Complete Onboarding Flow**: User setup with avatar introduction
- **Live Food Logging**: Add food with real-time avatar feedback and animations
- **Dynamic Avatar System**: Pet evolves based on progress with 4+ emotional states
- **Progress Tracking**: Real calorie calculations with visual progress bars
- **History & Analytics**: Food logs grouped by date with filtering
- **Settings Management**: Update goals, preferences, and user info
- **Persistent State**: LocalStorage saves progress between sessions
- **iOS-Optimized**: Native-like experience on mobile devices

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── onboarding/        # Onboarding flow
│   ├── add-food/          # Food logging interface
│   ├── history/           # Food history and analytics
│   ├── settings/          # User preferences and goals
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home screen with avatar
├── components/
│   ├── ui/                # shadcn/ui components
│   └── AvatarDisplay.tsx  # Avatar component with states
├── lib/
│   ├── constants.ts       # App constants and data
│   ├── avatar-logic.ts    # Avatar state calculation
│   ├── database.ts        # Supabase database service
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## Key Features Implementation

### Avatar System
- 4 states: sad, neutral, happy, excited
- Dynamic based on daily/weekly progress and streaks
- Visual feedback with animations and messages

### Food Logging
- Manual input with emoji grid selection
- Portion size selection with calorie calculation
- Camera input interface (mockup for future AI integration)

### Progress Tracking
- Real-time progress bars
- Streak counting system
- Level progression based on total calories

### Data Flow
1. User logs food → Updates food_logs table
2. Database trigger → Recalculates progress
3. Frontend → Fetches updated progress
4. Avatar → Updates state based on progress

## Next Steps for Production

### Camera Integration
Replace the camera mockup with actual device camera:

```typescript
// Example implementation
const capturePhoto = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Implement photo capture and AI analysis
};
```

### AI Food Recognition
Integrate with food recognition API:

```typescript
const analyzeFoodPhoto = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append('image', imageBlob);

  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    body: formData,
  });

  return response.json(); // { foodType, calories, ingredients }
};
```

### Authentication
Add Supabase Auth for user management:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

### Push Notifications
Add reminders for food logging:

```typescript
// Request permission and schedule notifications
const scheduleReminder = () => {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // Schedule daily reminders
    }
  });
};
```

## v0 Integration

To use this project with [v0.dev](https://v0.dev):

1. **Export Components**: Copy any component from `src/components/`
2. **Import in v0**: Paste the component code into v0's editor
3. **Customize**: Use v0's AI to modify layouts, colors, or functionality
4. **Re-import**: Copy the improved component back to your project

### Example v0 Prompts:
- "Make the avatar display more animated with CSS animations"
- "Add a dark mode theme to the onboarding flow"
- "Create a more colorful food logging interface"
- "Design a better progress visualization with charts"

## Deployment

### Vercel
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

**Status:** ✅ Production deployment active

### Other Platforms
Ensure environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own habit tracking app!
