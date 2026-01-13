-- RPC Function to safely increment Karma
-- Run this in Supabase SQL Editor

create or replace function increment_karma(user_ids text[], amount int)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set karma_points = coalesce(karma_points, 0) + amount
  where id = any(user_ids);
end;
$$;
