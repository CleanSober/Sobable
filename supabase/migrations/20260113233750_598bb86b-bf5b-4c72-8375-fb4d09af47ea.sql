-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  sobriety_start_date DATE,
  substances TEXT[],
  daily_spending NUMERIC DEFAULT 0,
  sponsor_phone TEXT,
  emergency_contact TEXT,
  personal_reminder TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood entries table
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  craving_level INTEGER NOT NULL CHECK (craving_level >= 1 AND craving_level <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create trigger entries table
CREATE TABLE public.trigger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  trigger TEXT NOT NULL,
  situation TEXT NOT NULL,
  emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  coping_used TEXT,
  outcome TEXT CHECK (outcome IN ('resisted', 'struggled', 'relapsed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('win', 'struggle', 'support')),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sleep entries table
CREATE TABLE public.sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 10),
  hours_slept NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create prevention plan table
CREATE TABLE public.prevention_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_signals TEXT[] DEFAULT '{}',
  coping_strategies TEXT[] DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  safe_activities TEXT[] DEFAULT '{}',
  personal_reasons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges progress table
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completed_tasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prevention_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Mood entries policies
CREATE POLICY "Users can view own mood entries" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- Trigger entries policies
CREATE POLICY "Users can view own trigger entries" ON public.trigger_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trigger entries" ON public.trigger_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trigger entries" ON public.trigger_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trigger entries" ON public.trigger_entries FOR DELETE USING (auth.uid() = user_id);

-- Community posts policies (public read, own write)
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Sleep entries policies
CREATE POLICY "Users can view own sleep entries" ON public.sleep_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep entries" ON public.sleep_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep entries" ON public.sleep_entries FOR UPDATE USING (auth.uid() = user_id);

-- Prevention plans policies
CREATE POLICY "Users can view own prevention plan" ON public.prevention_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prevention plan" ON public.prevention_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prevention plan" ON public.prevention_plans FOR UPDATE USING (auth.uid() = user_id);

-- Challenge progress policies
CREATE POLICY "Users can view own challenge progress" ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge progress" ON public.challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON public.challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prevention_plans_updated_at BEFORE UPDATE ON public.prevention_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenge_progress_updated_at BEFORE UPDATE ON public.challenge_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for community posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;