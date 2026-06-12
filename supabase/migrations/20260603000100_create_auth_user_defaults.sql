create or replace function public.create_default_user_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_settings (user_id, timezone, locale)
  values (new.id, 'UTC', 'en')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists auth_users_create_default_records on auth.users;

create trigger auth_users_create_default_records
after insert on auth.users
for each row execute function public.create_default_user_records();
