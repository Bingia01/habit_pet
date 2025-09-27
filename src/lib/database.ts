import { supabase } from './supabase';
import { User, UserPreferences, FoodLog, UserProgress, DietaryPreference, FoodPreference, NutritionGoal } from '@/types';

export class DatabaseService {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User preferences operations
  static async createUserPreferences(
    userId: string,
    preferences: {
      dietary_preferences: DietaryPreference[];
      food_preferences: FoodPreference[];
      daily_calorie_goal?: number;
      weekly_calorie_goal?: number;
      nutrition_goals?: NutritionGoal[];
    }
  ) {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([{
        user_id: userId,
        ...preferences
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Food log operations
  static async createFoodLog(foodLog: Omit<FoodLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('food_logs')
      .insert([foodLog])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getFoodLogs(userId: string, limit?: number, offset?: number) {
    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getFoodLogsByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate)
      .order('logged_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateFoodLog(logId: string, updates: Partial<FoodLog>) {
    const { data, error } = await supabase
      .from('food_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteFoodLog(logId: string) {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
  }

  // User progress operations
  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserProgress(userId: string, updates: Partial<UserProgress>) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        ...updates
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics and aggregations
  static async getDailyCalories(userId: string, date: string) {
    const { data, error } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00Z`)
      .lt('logged_at', `${date}T23:59:59Z`);

    if (error) throw error;

    return data.reduce((total, log) => total + log.calories, 0);
  }

  static async getWeeklyCalories(userId: string, startDate: string) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', userId)
      .gte('logged_at', `${startDate}T00:00:00Z`)
      .lte('logged_at', `${endDate.toISOString().split('T')[0]}T23:59:59Z`);

    if (error) throw error;

    return data.reduce((total, log) => total + log.calories, 0);
  }

  // Utility function to recalculate user progress
  static async recalculateProgress(userId: string) {
    const { error } = await supabase.rpc('calculate_user_progress', {
      target_user_id: userId
    });

    if (error) throw error;
  }
}