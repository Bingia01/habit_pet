import { AvatarState } from '@/types';

export interface AvatarStats {
  dailyProgress: number; // 0-100 percentage
  weeklyProgress: number; // 0-100 percentage
  currentStreak: number; // consecutive days
  level: number;
  totalCaloriesLogged: number;
  dailyGoal: number;
  weeklyGoal: number;
}

export interface AvatarEvolution {
  state: AvatarState;
  emoji: string;
  message: string;
  animation?: string;
}

export const calculateAvatarState = (stats: AvatarStats): AvatarEvolution => {
  const { dailyProgress, weeklyProgress, currentStreak, level } = stats;

  // Determine base state based on progress
  let state: AvatarState;
  let emoji: string;
  let message: string;
  let animation: string = '';

  if (dailyProgress >= 90 || weeklyProgress >= 90) {
    state = 'excited';
    emoji = '🤩✨';
    message = "I'm absolutely thriving! You're doing amazing!";
    animation = 'bounce';
  } else if (dailyProgress >= 70 || weeklyProgress >= 70 || currentStreak >= 3) {
    state = 'happy';
    emoji = '😊💚';
    message = "I'm feeling great and healthy! Keep it up!";
    animation = 'wiggle';
  } else if (dailyProgress >= 40 || weeklyProgress >= 40) {
    state = 'neutral';
    emoji = '😐🍃';
    message = "I'm doing okay, but I could use more nutrition!";
    animation = '';
  } else {
    state = 'sad';
    emoji = '😢💙';
    message = "I'm feeling a bit weak... please feed me!";
    animation = 'fade';
  }

  // Level-based evolution
  if (level >= 10) {
    emoji = emoji.replace('😊', '🥳').replace('😐', '🙂').replace('😢', '😕').replace('🤩', '🌟');
  } else if (level >= 5) {
    emoji = emoji.replace('😊', '😄').replace('😐', '🙂').replace('😢', '😟').replace('🤩', '🤗');
  }

  return { state, emoji, message, animation };
};

export const calculateLevelUp = (totalCalories: number, currentLevel: number): boolean => {
  const caloriesPerLevel = 5000; // 5000 calories per level
  const requiredCalories = currentLevel * caloriesPerLevel;
  return totalCalories >= requiredCalories;
};

export const calculateStreak = (dailyProgress: number, lastUpdateDate: Date): number => {
  const today = new Date();
  const daysDifference = Math.floor((today.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference <= 1 && dailyProgress >= 60) {
    return 1; // Continue or start streak
  } else if (daysDifference > 1) {
    return 0; // Streak broken
  }

  return 0; // No streak
};

export const getFeedbackMessage = (caloriesLogged: number): string => {
  const messages = [
    `+${caloriesLogged} calories! Nom nom nom! 🍽️`,
    `Yummy! +${caloriesLogged} calories logged! 😋`,
    `Thanks for feeding me! +${caloriesLogged} calories! 💚`,
    `Growing stronger! +${caloriesLogged} calories added! 💪`,
    `Delicious! +${caloriesLogged} calories in my belly! 🎉`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const getProgressEmoji = (percentage: number): string => {
  if (percentage >= 100) return '🎉';
  if (percentage >= 80) return '🔥';
  if (percentage >= 60) return '⭐';
  if (percentage >= 40) return '🌱';
  if (percentage >= 20) return '🌟';
  return '💤';
};

export const getMotivationalMessage = (stats: AvatarStats): string => {
  const { dailyProgress, currentStreak } = stats;

  if (dailyProgress === 0) {
    return "Let's start the day with some healthy food! 🌅";
  }

  if (dailyProgress < 30) {
    return "Great start! Keep the momentum going! 🚀";
  }

  if (dailyProgress < 70) {
    return "You're doing well! Almost there! 💪";
  }

  if (dailyProgress < 100) {
    return "So close to your goal! You've got this! 🎯";
  }

  if (currentStreak >= 7) {
    return "Amazing streak! You're a nutrition champion! 🏆";
  }

  return "Goal achieved! Time to celebrate! 🎉";
};