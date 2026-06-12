-- ================================================================
-- Migration: Supabase Auth → Clerk
-- Date: 2026-06-06
-- ================================================================
-- Summary of changes:
--   1. Drop the auth.users trigger (Clerk webhook handles user creation)
--   2. Drop all 28 RLS policies (reference auth.uid() which is now unused)
--   3. Drop composite FK constraints on save_collections and save_tags
--   4. Drop auth.users FK constraints on all tables
--   5. Change user identity columns from uuid to text (Clerk IDs are text)
--   6. Recreate composite FK constraints (now referencing text columns)
--   7. Create requesting_user_id() to read Clerk user ID from JWT sub claim
--   8. Recreate all 28 RLS policies using requesting_user_id()
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Drop auth.users trigger and function from previous migration
-- ----------------------------------------------------------------

drop trigger if exists auth_users_create_default_records on auth.users;
drop function if exists public.create_default_user_records();

-- ----------------------------------------------------------------
-- 2. Drop all existing RLS policies
-- ----------------------------------------------------------------

drop policy if exists "Users can select their own profile"       on public.user_profiles;
drop policy if exists "Users can insert their own profile"       on public.user_profiles;
drop policy if exists "Users can update their own profile"       on public.user_profiles;
drop policy if exists "Users can delete their own profile"       on public.user_profiles;

drop policy if exists "Users can select their own settings"      on public.user_settings;
drop policy if exists "Users can insert their own settings"      on public.user_settings;
drop policy if exists "Users can update their own settings"      on public.user_settings;
drop policy if exists "Users can delete their own settings"      on public.user_settings;

drop policy if exists "Users can select their own saves"         on public.saves;
drop policy if exists "Users can insert their own saves"         on public.saves;
drop policy if exists "Users can update their own saves"         on public.saves;
drop policy if exists "Users can delete their own saves"         on public.saves;

drop policy if exists "Users can select their own collections"   on public.collections;
drop policy if exists "Users can insert their own collections"   on public.collections;
drop policy if exists "Users can update their own collections"   on public.collections;
drop policy if exists "Users can delete their own collections"   on public.collections;

drop policy if exists "Users can select their own save collections" on public.save_collections;
drop policy if exists "Users can insert their own save collections" on public.save_collections;
drop policy if exists "Users can update their own save collections" on public.save_collections;
drop policy if exists "Users can delete their own save collections" on public.save_collections;

drop policy if exists "Users can select their own tags"          on public.tags;
drop policy if exists "Users can insert their own tags"          on public.tags;
drop policy if exists "Users can update their own tags"          on public.tags;
drop policy if exists "Users can delete their own tags"          on public.tags;

drop policy if exists "Users can select their own save tags"     on public.save_tags;
drop policy if exists "Users can insert their own save tags"     on public.save_tags;
drop policy if exists "Users can update their own save tags"     on public.save_tags;
drop policy if exists "Users can delete their own save tags"     on public.save_tags;

-- ----------------------------------------------------------------
-- 3. Drop composite FK constraints
--    Must happen before altering the referenced columns.
-- ----------------------------------------------------------------

alter table public.save_collections
  drop constraint if exists save_collections_save_user_fk,
  drop constraint if exists save_collections_collection_user_fk;

alter table public.save_tags
  drop constraint if exists save_tags_save_user_fk,
  drop constraint if exists save_tags_tag_user_fk;

-- ----------------------------------------------------------------
-- 4. Drop auth.users FK constraints
--    PostgreSQL auto-names these as {table}_{column}_fkey.
-- ----------------------------------------------------------------

alter table public.user_profiles   drop constraint if exists user_profiles_id_fkey;
alter table public.user_settings   drop constraint if exists user_settings_user_id_fkey;
alter table public.saves           drop constraint if exists saves_user_id_fkey;
alter table public.collections     drop constraint if exists collections_user_id_fkey;
alter table public.save_collections drop constraint if exists save_collections_user_id_fkey;
alter table public.tags            drop constraint if exists tags_user_id_fkey;
alter table public.save_tags       drop constraint if exists save_tags_user_id_fkey;

-- ----------------------------------------------------------------
-- 5. Change user identity columns from uuid to text
--    Clerk user IDs are strings (e.g. user_2abc123def456).
--    USING cast converts existing uuid values during migration.
--    Composite unique constraints (saves_id_user_id_unique, etc.)
--    automatically update to the new column type.
-- ----------------------------------------------------------------

alter table public.user_profiles
  alter column id type text using id::text;

alter table public.user_settings
  alter column user_id type text using user_id::text;

alter table public.saves
  alter column user_id type text using user_id::text;

alter table public.collections
  alter column user_id type text using user_id::text;

alter table public.save_collections
  alter column user_id type text using user_id::text;

alter table public.tags
  alter column user_id type text using user_id::text;

alter table public.save_tags
  alter column user_id type text using user_id::text;

-- ----------------------------------------------------------------
-- 6. Recreate composite FK constraints (now with text columns)
-- ----------------------------------------------------------------

alter table public.save_collections
  add constraint save_collections_save_user_fk
    foreign key (save_id, user_id)
    references public.saves (id, user_id)
    on delete cascade,
  add constraint save_collections_collection_user_fk
    foreign key (collection_id, user_id)
    references public.collections (id, user_id)
    on delete cascade;

alter table public.save_tags
  add constraint save_tags_save_user_fk
    foreign key (save_id, user_id)
    references public.saves (id, user_id)
    on delete cascade,
  add constraint save_tags_tag_user_fk
    foreign key (tag_id, user_id)
    references public.tags (id, user_id)
    on delete cascade;

-- ----------------------------------------------------------------
-- 7. Create requesting_user_id()
--    Reads the Clerk user ID from the JWT sub claim.
--    Used by all RLS policies below in place of auth.uid().
-- ----------------------------------------------------------------

create or replace function public.requesting_user_id()
returns text
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )
$$;

-- ----------------------------------------------------------------
-- 8. Recreate all RLS policies using requesting_user_id()
-- ----------------------------------------------------------------

-- user_profiles ---------------------------------------------------

create policy "Users can select their own profile"
on public.user_profiles for select
to authenticated
using (id = requesting_user_id());

create policy "Users can insert their own profile"
on public.user_profiles for insert
to authenticated
with check (id = requesting_user_id());

create policy "Users can update their own profile"
on public.user_profiles for update
to authenticated
using (id = requesting_user_id())
with check (id = requesting_user_id());

create policy "Users can delete their own profile"
on public.user_profiles for delete
to authenticated
using (id = requesting_user_id());

-- user_settings ---------------------------------------------------

create policy "Users can select their own settings"
on public.user_settings for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own settings"
on public.user_settings for insert
to authenticated
with check (user_id = requesting_user_id());

create policy "Users can update their own settings"
on public.user_settings for update
to authenticated
using (user_id = requesting_user_id())
with check (user_id = requesting_user_id());

create policy "Users can delete their own settings"
on public.user_settings for delete
to authenticated
using (user_id = requesting_user_id());

-- saves -----------------------------------------------------------

create policy "Users can select their own saves"
on public.saves for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own saves"
on public.saves for insert
to authenticated
with check (user_id = requesting_user_id());

create policy "Users can update their own saves"
on public.saves for update
to authenticated
using (user_id = requesting_user_id())
with check (user_id = requesting_user_id());

create policy "Users can delete their own saves"
on public.saves for delete
to authenticated
using (user_id = requesting_user_id());

-- collections -----------------------------------------------------

create policy "Users can select their own collections"
on public.collections for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own collections"
on public.collections for insert
to authenticated
with check (user_id = requesting_user_id());

create policy "Users can update their own collections"
on public.collections for update
to authenticated
using (user_id = requesting_user_id())
with check (user_id = requesting_user_id());

create policy "Users can delete their own collections"
on public.collections for delete
to authenticated
using (user_id = requesting_user_id());

-- save_collections ------------------------------------------------
-- Insert and update policies verify cross-ownership of the save
-- and collection being linked.

create policy "Users can select their own save collections"
on public.save_collections for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own save collections"
on public.save_collections for insert
to authenticated
with check (
  user_id = requesting_user_id()
  and exists (
    select 1 from public.saves
    where saves.id = save_collections.save_id
      and saves.user_id = requesting_user_id()
  )
  and exists (
    select 1 from public.collections
    where collections.id = save_collections.collection_id
      and collections.user_id = requesting_user_id()
  )
);

create policy "Users can update their own save collections"
on public.save_collections for update
to authenticated
using (user_id = requesting_user_id())
with check (
  user_id = requesting_user_id()
  and exists (
    select 1 from public.saves
    where saves.id = save_collections.save_id
      and saves.user_id = requesting_user_id()
  )
  and exists (
    select 1 from public.collections
    where collections.id = save_collections.collection_id
      and collections.user_id = requesting_user_id()
  )
);

create policy "Users can delete their own save collections"
on public.save_collections for delete
to authenticated
using (user_id = requesting_user_id());

-- tags ------------------------------------------------------------

create policy "Users can select their own tags"
on public.tags for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own tags"
on public.tags for insert
to authenticated
with check (user_id = requesting_user_id());

create policy "Users can update their own tags"
on public.tags for update
to authenticated
using (user_id = requesting_user_id())
with check (user_id = requesting_user_id());

create policy "Users can delete their own tags"
on public.tags for delete
to authenticated
using (user_id = requesting_user_id());

-- save_tags -------------------------------------------------------
-- Insert and update policies verify cross-ownership of the save
-- and tag being linked.

create policy "Users can select their own save tags"
on public.save_tags for select
to authenticated
using (user_id = requesting_user_id());

create policy "Users can insert their own save tags"
on public.save_tags for insert
to authenticated
with check (
  user_id = requesting_user_id()
  and exists (
    select 1 from public.saves
    where saves.id = save_tags.save_id
      and saves.user_id = requesting_user_id()
  )
  and exists (
    select 1 from public.tags
    where tags.id = save_tags.tag_id
      and tags.user_id = requesting_user_id()
  )
);

create policy "Users can update their own save tags"
on public.save_tags for update
to authenticated
using (user_id = requesting_user_id())
with check (
  user_id = requesting_user_id()
  and exists (
    select 1 from public.saves
    where saves.id = save_tags.save_id
      and saves.user_id = requesting_user_id()
  )
  and exists (
    select 1 from public.tags
    where tags.id = save_tags.tag_id
      and tags.user_id = requesting_user_id()
  )
);

create policy "Users can delete their own save tags"
on public.save_tags for delete
to authenticated
using (user_id = requesting_user_id());
