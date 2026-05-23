-- Migration: auto-create user profile row when auth user is created
-- This fires on every new auth.users INSERT (sign-up or OAuth)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id, name, email, phone, country, city,
    is_verified_seller, bidder_score, seller_score,
    badge, total_deals, products_bought, products_sold, is_flagged
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'iBID User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'country', ''),
    '',
    false, 0, 0,
    'bronze', 0, 0, 0, false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
