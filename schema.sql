-- Create Enums
CREATE TYPE reading_goal_enum AS ENUM ('khatam', 'consistent', 'understand');
CREATE TYPE barrier_type_enum AS ENUM ('busy', 'lonely', 'lost_meaning', 'overwhelmed', 'spiritually_distant');
CREATE TYPE badge_enum AS ENUM ('gold', 'silver', 'bronze', 'none');

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  ramadan_baseline_verses integer DEFAULT 0,
  reading_goal reading_goal_enum,
  notification_time time,
  push_token text,
  quran_api_token text,
  created_at timestamptz DEFAULT now()
);

-- Turn on RLS for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read and update their own data" ON public.users 
  FOR ALL USING (auth.uid() = id);

-- 2. Barrier Logs Table (Companion Chat History)
CREATE TABLE public.barrier_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  barrier_type barrier_type_enum,
  chatbot_session jsonb,
  verse_shown text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.barrier_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own barrier logs" ON public.barrier_logs 
  FOR ALL USING (auth.uid() = user_id);

-- 3. Halaka Groups Table
CREATE TABLE public.halaka_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  member_ids uuid[] DEFAULT '{}',
  current_week_surah integer,
  group_streak integer DEFAULT 0,
  collection_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.halaka_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their own groups" ON public.halaka_groups 
  FOR SELECT USING (auth.uid() = ANY(member_ids));

-- 4. Halaka Reflections Table
CREATE TABLE public.halaka_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.halaka_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  week_number integer,
  content text NOT NULL,
  reflection_score numeric DEFAULT 0.0,
  post_api_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.halaka_reflections ENABLE ROW LEVEL SECURITY;
-- Allowed if user's ID is in the member_ids array of the parent group
CREATE POLICY "Group members can view and post reflections" ON public.halaka_reflections 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.halaka_groups hg WHERE hg.id = group_id AND auth.uid() = ANY(hg.member_ids))
  );

-- 5. Barakah Scores Table
CREATE TABLE public.barakah_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.halaka_groups(id) ON DELETE CASCADE,
  week_number integer,
  streak_score numeric DEFAULT 0.0,
  reflection_score numeric DEFAULT 0.0,
  contribution_score numeric DEFAULT 0.0,
  total_score numeric DEFAULT 0.0,
  badge badge_enum DEFAULT 'none',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.barakah_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users and group members can view scores" ON public.barakah_scores 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.halaka_groups hg WHERE hg.id = group_id AND auth.uid() = ANY(hg.member_ids))
  );
