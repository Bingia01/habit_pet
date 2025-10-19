import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HabitPet - Build Healthy Eating Habits with Your Virtual Pet',
  description: 'Track your nutrition, build consistent habits, and watch your virtual pet companion grow. Make healthy eating fun with gamification, progress tracking, and personalized goals.',
  keywords: ['nutrition tracker', 'habit building', 'virtual pet', 'health app', 'calorie tracking', 'wellness', 'gamification', 'healthy eating'],
  authors: [{ name: 'HabitPet Team' }],
  creator: 'HabitPet',
  publisher: 'HabitPet',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://habitpet.vercel.app/landing',
    title: 'HabitPet - Build Healthy Eating Habits',
    description: 'Your virtual pet companion for building better nutrition habits',
    siteName: 'HabitPet',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HabitPet - Build Healthy Eating Habits',
    description: 'Your virtual pet companion for building better nutrition habits',
    creator: '@habitpet',
  },
};
