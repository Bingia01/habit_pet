'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Settings } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { usePet } from '@/contexts/PetContext';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { PetDashboard } from '@/components/PetDashboard';
import { getFeedbackMessage } from '@/lib/avatar-logic';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useDemo();
  const { pet, updateStreak } = usePet();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Check for food logging feedback
  useEffect(() => {
    if (searchParams.get('logged') === 'true') {
      const latestLog = state.foodLogs[state.foodLogs.length - 1];
      if (latestLog) {
        const message = getFeedbackMessage(latestLog.calories);
        setFeedbackMessage(message);
        setShowFeedback(true);

        // Clear feedback after 3 seconds
        setTimeout(() => {
          setShowFeedback(false);
          // Clear URL parameter
          router.replace('/');
        }, 3000);
      }
    }
  }, [searchParams, state.foodLogs, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!state.isOnboardingComplete) {
      router.push('/onboarding');
    }
  }, [state.isOnboardingComplete, router]);

  if (!state.isOnboardingComplete || !state.preferences || !state.progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p>Loading your HabitPet...</p>
        </div>
      </div>
    );
  }

  const todayCalories = state.foodLogs
    .filter(log => {
      const today = new Date();
      const logDate = new Date(log.logged_at);
      return logDate.toDateString() === today.toDateString();
    })
    .reduce((sum, log) => sum + log.calories, 0);

  const weekCalories = state.foodLogs
    .filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const logDate = new Date(log.logged_at);
      return logDate >= weekAgo;
    })
    .reduce((sum, log) => sum + log.calories, 0);

  const avatarStats = {
    dailyProgress: state.progress.daily_progress,
    weeklyProgress: state.progress.weekly_progress,
    currentStreak: state.progress.current_streak,
    level: state.progress.level,
    totalCaloriesLogged: state.foodLogs.reduce((sum, log) => sum + log.calories, 0),
    dailyGoal: state.preferences.daily_calorie_goal,
    weeklyGoal: state.preferences.weekly_calorie_goal,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-600">HabitPet</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Avatar Section */}
        <AvatarDisplay
          stats={avatarStats}
          showFeedback={showFeedback}
          feedbackMessage={feedbackMessage}
        />

        {/* Add Food Button - Big Button */}
        <div className="w-full">
          <Button
            size="lg"
            className="w-full h-16 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-xl shadow-lg"
            onClick={() => router.push('/add-food')}
          >
            🍎 Add Food
          </Button>
        </div>

        {/* Pet Dashboard */}
        <PetDashboard />

        {/* Progress Bars */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(state.progress.daily_progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {todayCalories} / {state.preferences.daily_calorie_goal} calories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(state.progress.weekly_progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {weekCalories} / {state.preferences.weekly_calorie_goal} calories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">{state.progress.level}</div>
            <div className="text-xs text-gray-500">Level</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600">{state.progress.current_streak}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">{state.foodLogs.length}</div>
            <div className="text-xs text-gray-500">Total Logs</div>
          </Card>
        </div>

        {/* Recent Activity */}
        {state.foodLogs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.foodLogs
                  .slice(-3)
                  .reverse()
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{log.emoji}</span>
                        <span className="text-sm font-medium">{log.food_type}</span>
                      </div>
                      <span className="text-sm text-green-600 font-semibold">{log.calories} cal</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Food Button */}
        <div className="fixed bottom-20 right-4">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
            onClick={() => router.push('/add-food')}
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex">
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span className="text-xs text-green-600 font-medium">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-4 flex flex-col gap-1"
            onClick={() => router.push('/history')}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-4 flex flex-col gap-1"
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p>Loading your HabitPet...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
