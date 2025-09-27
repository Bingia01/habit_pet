'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, UserPreferences, FoodLog, UserProgress } from '@/types';
import { calculateAvatarState } from '@/lib/avatar-logic';

interface DemoState {
  user: User | null;
  preferences: UserPreferences | null;
  foodLogs: FoodLog[];
  progress: UserProgress | null;
  isOnboardingComplete: boolean;
}

type DemoAction =
  | { type: 'COMPLETE_ONBOARDING'; payload: { user: User; preferences: UserPreferences } }
  | { type: 'ADD_FOOD_LOG'; payload: FoodLog }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'RESET_DEMO' }
  | { type: 'LOAD_FROM_STORAGE'; payload: DemoState };

interface AppContextType {
  state: DemoState;
  dispatch: React.Dispatch<DemoAction>;
  addFoodLog: (foodLog: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, preferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  resetApp: () => void;
}

const initialState: DemoState = {
  user: null,
  preferences: null,
  foodLogs: [],
  progress: null,
  isOnboardingComplete: false,
};

// Generate some sample food logs for demo
const generateSampleLogs = (): FoodLog[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: '1',
      user_id: 'demo-user',
      food_type: 'Apple',
      ingredients: ['apple'],
      portion_size: 'Medium',
      calories: 95,
      emoji: '🍎',
      logged_at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'demo-user',
      food_type: 'Broccoli',
      ingredients: ['broccoli'],
      portion_size: 'Large',
      calories: 55,
      emoji: '🥦',
      logged_at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 15).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'demo-user',
      food_type: 'Chicken',
      ingredients: ['chicken breast'],
      portion_size: 'Medium',
      calories: 165,
      emoji: '🍗',
      logged_at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 45).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_id: 'demo-user',
      food_type: 'Eggs',
      ingredients: ['eggs'],
      portion_size: 'Medium',
      calories: 140,
      emoji: '🥚',
      logged_at: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 7, 30).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
};

const calculateProgress = (foodLogs: FoodLog[], dailyGoal: number, weeklyGoal: number): UserProgress => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  // Calculate today's calories
  const todayCalories = foodLogs
    .filter(log => new Date(log.logged_at) >= todayStart)
    .reduce((sum, log) => sum + log.calories, 0);

  // Calculate this week's calories
  const weekCalories = foodLogs
    .filter(log => new Date(log.logged_at) >= weekStart)
    .reduce((sum, log) => sum + log.calories, 0);

  const dailyProgress = Math.min(100, (todayCalories / dailyGoal) * 100);
  const weeklyProgress = Math.min(100, (weekCalories / weeklyGoal) * 100);

  // Calculate streak (simplified for demo)
  const currentStreak = dailyProgress >= 60 ? Math.floor(Math.random() * 5) + 1 : 0;
  const level = Math.floor(foodLogs.length / 5) + 1;

  // Determine avatar state
  const avatarStats = {
    dailyProgress,
    weeklyProgress,
    currentStreak,
    level,
    totalCaloriesLogged: foodLogs.reduce((sum, log) => sum + log.calories, 0),
    dailyGoal,
    weeklyGoal,
  };

  const avatarState = calculateAvatarState(avatarStats);

  return {
    id: 'demo-progress',
    user_id: 'demo-user',
    current_streak: currentStreak,
    level,
    daily_progress: dailyProgress,
    weekly_progress: weeklyProgress,
    avatar_state: avatarState.state,
    last_updated: new Date().toISOString(),
  };
};

const demoReducer = (state: DemoState, action: DemoAction): DemoState => {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      const newState = {
        ...state,
        user: action.payload.user,
        preferences: action.payload.preferences,
        isOnboardingComplete: true,
        foodLogs: generateSampleLogs(),
      };
      newState.progress = calculateProgress(
        newState.foodLogs,
        action.payload.preferences.daily_calorie_goal,
        action.payload.preferences.weekly_calorie_goal
      );
      return newState;

    case 'ADD_FOOD_LOG':
      const updatedLogs = [...state.foodLogs, action.payload];
      const updatedProgress = state.preferences
        ? calculateProgress(updatedLogs, state.preferences.daily_calorie_goal, state.preferences.weekly_calorie_goal)
        : state.progress;

      return {
        ...state,
        foodLogs: updatedLogs,
        progress: updatedProgress,
      };

    case 'UPDATE_PREFERENCES':
      const updatedPreferences = { ...state.preferences!, ...action.payload };
      const recalculatedProgress = calculateProgress(
        state.foodLogs,
        updatedPreferences.daily_calorie_goal,
        updatedPreferences.weekly_calorie_goal
      );

      return {
        ...state,
        preferences: updatedPreferences,
        progress: recalculatedProgress,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user!, ...action.payload },
      };

    case 'RESET_DEMO':
      return initialState;

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('habitpet-app-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
      } catch (e) {
        console.error('Failed to load app state:', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('habitpet-app-state', JSON.stringify(state));
  }, [state]);

  const addFoodLog = (foodLogData: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>) => {
    const foodLog: FoodLog = {
      ...foodLogData,
      id: Date.now().toString(),
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FOOD_LOG', payload: foodLog });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const completeOnboarding = (
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'>,
    preferencesData: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const user: User = {
      ...userData,
      id: 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const preferences: UserPreferences = {
      ...preferencesData,
      id: 'demo-preferences',
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { user, preferences } });
  };

  const resetApp = () => {
    dispatch({ type: 'RESET_DEMO' });
    localStorage.removeItem('habitpet-app-state');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addFoodLog,
        updatePreferences,
        updateUser,
        completeOnboarding,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Keep old exports for compatibility during transition
export const useDemo = useApp;
export const DemoProvider = AppProvider;