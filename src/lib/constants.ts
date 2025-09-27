import { DietaryPreference, FoodPreference, NutritionGoal } from '@/types';

export const DIETARY_PREFERENCES: { value: DietaryPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'high-protein', label: 'High-Protein' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'balanced', label: 'Balanced' },
];

export const FOOD_PREFERENCES: { emoji: FoodPreference; label: string; calories_per_100g: number }[] = [
  { emoji: '🍎', label: 'Apples', calories_per_100g: 52 },
  { emoji: '🥦', label: 'Broccoli', calories_per_100g: 34 },
  { emoji: '🍗', label: 'Chicken', calories_per_100g: 165 },
  { emoji: '🥩', label: 'Beef', calories_per_100g: 250 },
  { emoji: '🐖', label: 'Pork', calories_per_100g: 242 },
  { emoji: '🐟', label: 'Fish', calories_per_100g: 206 },
  { emoji: '🧀', label: 'Cheese', calories_per_100g: 402 },
  { emoji: '🍰', label: 'Cake', calories_per_100g: 347 },
  { emoji: '🍚', label: 'Rice', calories_per_100g: 130 },
  { emoji: '🥜', label: 'Nuts', calories_per_100g: 607 },
  { emoji: '🥚', label: 'Eggs', calories_per_100g: 155 },
];

export const NUTRITION_GOALS: { value: NutritionGoal; label: string }[] = [
  { value: 'high-protein', label: 'High Protein' },
  { value: 'more-veggies', label: 'More Veggies' },
  { value: 'low-sugar', label: 'Low Sugar' },
  { value: 'balanced-meals', label: 'Balanced Meals' },
];

export const PORTION_SIZES = [
  { value: 'small', label: 'Small', multiplier: 0.7 },
  { value: 'medium', label: 'Medium', multiplier: 1.0 },
  { value: 'large', label: 'Large', multiplier: 1.3 },
  { value: 'extra-large', label: 'Extra Large', multiplier: 1.6 },
];

export const AVATAR_STATES = {
  sad: { emoji: '😢', description: 'Your pet needs nutrition!' },
  neutral: { emoji: '😐', description: 'Your pet is doing okay' },
  happy: { emoji: '😊', description: 'Your pet is happy and healthy!' },
  excited: { emoji: '🤩', description: 'Your pet is thriving!' },
};

export const DEFAULT_DAILY_CALORIES = 2000;
export const DEFAULT_WEEKLY_CALORIES = 14000;