-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    height INTEGER NOT NULL CHECK (height > 0), -- in cm
    weight INTEGER NOT NULL CHECK (weight > 0), -- in kg
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dietary_preferences TEXT[] DEFAULT '{}', -- ['vegetarian', 'high-protein', etc.]
    food_preferences TEXT[] DEFAULT '{}', -- ['🍎', '🥦', etc.]
    daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
    weekly_calorie_goal INTEGER NOT NULL DEFAULT 14000,
    nutrition_goals TEXT[] DEFAULT '{}', -- ['high-protein', 'more-veggies', etc.]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Food logs table
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_type VARCHAR(255) NOT NULL,
    ingredients TEXT[] DEFAULT '{}',
    portion_size VARCHAR(100) NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    emoji VARCHAR(10) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    daily_progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (daily_progress >= 0 AND daily_progress <= 100),
    weekly_progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (weekly_progress >= 0 AND weekly_progress <= 100),
    avatar_state VARCHAR(20) NOT NULL DEFAULT 'neutral' CHECK (avatar_state IN ('sad', 'neutral', 'happy', 'excited')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_food_logs_user_id_logged_at ON food_logs(user_id, logged_at DESC);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own food logs" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food logs" ON food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON food_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate and update user progress
CREATE OR REPLACE FUNCTION calculate_user_progress(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    daily_calories INTEGER := 0;
    weekly_calories INTEGER := 0;
    daily_goal INTEGER;
    weekly_goal INTEGER;
    daily_prog DECIMAL(5,2);
    weekly_prog DECIMAL(5,2);
    current_date DATE := CURRENT_DATE;
    week_start DATE := current_date - INTERVAL '6 days';
BEGIN
    -- Get user's calorie goals
    SELECT daily_calorie_goal, weekly_calorie_goal
    INTO daily_goal, weekly_goal
    FROM user_preferences
    WHERE user_id = target_user_id;

    -- Calculate today's calories
    SELECT COALESCE(SUM(calories), 0)
    INTO daily_calories
    FROM food_logs
    WHERE user_id = target_user_id
    AND DATE(logged_at) = current_date;

    -- Calculate this week's calories
    SELECT COALESCE(SUM(calories), 0)
    INTO weekly_calories
    FROM food_logs
    WHERE user_id = target_user_id
    AND DATE(logged_at) >= week_start;

    -- Calculate progress percentages
    daily_prog := LEAST(100.0, (daily_calories::DECIMAL / daily_goal::DECIMAL) * 100);
    weekly_prog := LEAST(100.0, (weekly_calories::DECIMAL / weekly_goal::DECIMAL) * 100);

    -- Update or insert progress
    INSERT INTO user_progress (user_id, daily_progress, weekly_progress, last_updated)
    VALUES (target_user_id, daily_prog, weekly_prog, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        daily_progress = daily_prog,
        weekly_progress = weekly_prog,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update progress when food is logged
CREATE OR REPLACE FUNCTION trigger_update_progress()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_user_progress(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_on_food_log
    AFTER INSERT OR UPDATE OR DELETE ON food_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_update_progress();