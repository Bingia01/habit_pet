'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Target, User, Utensils, Calendar, Settings as SettingsIcon, Bell } from 'lucide-react';
import { DIETARY_PREFERENCES, FOOD_PREFERENCES, NUTRITION_GOALS, DEFAULT_DAILY_CALORIES, DEFAULT_WEEKLY_CALORIES } from '@/lib/constants';
import { DietaryPreference, FoodPreference, NutritionGoal } from '@/types';
import { useDemo } from '@/contexts/DemoContext';
import { NotificationSettings } from '@/components/NotificationSettings';

interface UserSettings {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  dailyCalorieGoal: number;
  weeklyCalorieGoal: number;
  nutritionGoals: NutritionGoal[];
  dietaryPreferences: DietaryPreference[];
  foodPreferences: FoodPreference[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { state, updateUser, updatePreferences } = useDemo();

  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    age: 0,
    height: 0,
    weight: 0,
    dailyCalorieGoal: DEFAULT_DAILY_CALORIES,
    weeklyCalorieGoal: DEFAULT_WEEKLY_CALORIES,
    nutritionGoals: [],
    dietaryPreferences: [],
    foodPreferences: [],
  });

  // Load current settings from demo state
  useEffect(() => {
    if (state.user && state.preferences) {
      setSettings({
        name: state.user.name,
        email: state.user.email,
        age: state.user.age,
        height: state.user.height,
        weight: state.user.weight,
        dailyCalorieGoal: state.preferences.daily_calorie_goal,
        weeklyCalorieGoal: state.preferences.weekly_calorie_goal,
        nutritionGoals: state.preferences.nutrition_goals,
        dietaryPreferences: state.preferences.dietary_preferences,
        foodPreferences: state.preferences.food_preferences,
      });
    }
  }, [state.user, state.preferences]);

  const toggleNutritionGoal = (goal: NutritionGoal) => {
    setSettings(prev => ({
      ...prev,
      nutritionGoals: prev.nutritionGoals.includes(goal)
        ? prev.nutritionGoals.filter(g => g !== goal)
        : [...prev.nutritionGoals, goal]
    }));
  };

  const toggleDietaryPreference = (preference: DietaryPreference) => {
    setSettings(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const toggleFoodPreference = (preference: FoodPreference) => {
    setSettings(prev => ({
      ...prev,
      foodPreferences: prev.foodPreferences.includes(preference)
        ? prev.foodPreferences.filter(p => p !== preference)
        : [...prev.foodPreferences, preference]
    }));
  };

  const saveSettings = () => {
    // Update user data
    updateUser({
      name: settings.name,
      email: settings.email,
      age: settings.age,
      height: settings.height,
      weight: settings.weight,
    });

    // Update preferences
    updatePreferences({
      daily_calorie_goal: settings.dailyCalorieGoal,
      weekly_calorie_goal: settings.weeklyCalorieGoal,
      nutrition_goals: settings.nutritionGoals,
      dietary_preferences: settings.dietaryPreferences,
      food_preferences: settings.foodPreferences,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-green-600">Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  value={settings.age}
                  onChange={(e) => setSettings(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <Input
                  type="number"
                  value={settings.height}
                  onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  value={settings.weight}
                  onChange={(e) => setSettings(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Calorie Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Daily Calorie Goal</label>
              <Input
                type="number"
                value={settings.dailyCalorieGoal}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyCalorieGoal: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weekly Calorie Goal</label>
              <Input
                type="number"
                value={settings.weeklyCalorieGoal}
                onChange={(e) => setSettings(prev => ({ ...prev, weeklyCalorieGoal: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Nutrition Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {NUTRITION_GOALS.map((goal) => (
                <Button
                  key={goal.value}
                  variant={settings.nutritionGoals.includes(goal.value) ? "default" : "outline"}
                  onClick={() => toggleNutritionGoal(goal.value)}
                  className="justify-start"
                >
                  {goal.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Dietary Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {DIETARY_PREFERENCES.map((pref) => (
                <Button
                  key={pref.value}
                  variant={settings.dietaryPreferences.includes(pref.value) ? "default" : "outline"}
                  onClick={() => toggleDietaryPreference(pref.value)}
                  className="justify-start"
                >
                  {pref.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Food Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Food Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {FOOD_PREFERENCES.map((food) => (
                <Button
                  key={food.emoji}
                  variant={settings.foodPreferences.includes(food.emoji) ? "default" : "outline"}
                  onClick={() => toggleFoodPreference(food.emoji)}
                  className="aspect-square flex flex-col gap-1 p-2"
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="text-xs">{food.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Save Button */}
        <Button
          onClick={saveSettings}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          size="lg"
        >
          Save Settings 💾
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex">
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1" onClick={() => router.push('/')}>
            <div className="w-6 h-6 rounded"></div>
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1" onClick={() => router.push('/history')}>
            <Calendar className="w-6 h-6" />
            <span className="text-xs">History</span>
          </Button>
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1">
            <SettingsIcon className="w-6 h-6 text-green-500" />
            <span className="text-xs text-green-500">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}