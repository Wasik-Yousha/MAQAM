CREATE OR REPLACE FUNCTION join_halaka(group_id uuid, joining_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE halaka_groups
  SET member_ids = array_append(member_ids, joining_user_id)
  WHERE id = group_id AND NOT (joining_user_id = ANY(member_ids));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
