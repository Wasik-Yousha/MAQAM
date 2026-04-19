-- Allow users to create their own Halaka networks/friend codes
CREATE POLICY "Users can insert groups" ON public.halaka_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow members to update their own groups (useful for streaks later)
CREATE POLICY "Members can update their own groups" ON public.halaka_groups
  FOR UPDATE USING (auth.uid() = ANY(member_ids));
