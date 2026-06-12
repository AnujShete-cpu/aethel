create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 120
  ),
  constraint user_profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) <= 2048
  )
);

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_timezone_length check (char_length(timezone) between 1 and 80),
  constraint user_settings_locale_length check (char_length(locale) between 2 and 35),
  constraint user_settings_preferences_object check (jsonb_typeof(preferences) = 'object')
);

create table public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text,
  description text,
  source_url text,
  content_text text,
  file_path text,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saves_type_check check (type in ('link', 'pdf', 'image', 'note')),
  constraint saves_title_length check (title is null or char_length(title) between 1 and 500),
  constraint saves_description_length check (
    description is null or char_length(description) <= 2000
  ),
  constraint saves_source_url_length check (source_url is null or char_length(source_url) <= 4096),
  constraint saves_file_path_length check (file_path is null or char_length(file_path) <= 2048),
  constraint saves_mime_type_length check (mime_type is null or char_length(mime_type) <= 255),
  constraint saves_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint saves_link_requires_url check (type <> 'link' or source_url is not null),
  constraint saves_note_requires_content check (type <> 'note' or content_text is not null),
  constraint saves_file_backed_types_require_path check (
    type not in ('pdf', 'image') or file_path is not null
  ),
  constraint saves_id_user_id_unique unique (id, user_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_name_length check (char_length(name) between 1 and 160),
  constraint collections_description_length check (
    description is null or char_length(description) <= 1000
  ),
  constraint collections_color_format check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint collections_user_name_unique unique (user_id, name),
  constraint collections_id_user_id_unique unique (id, user_id)
);

create table public.save_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  save_id uuid not null references public.saves (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint save_collections_save_user_fk foreign key (save_id, user_id)
    references public.saves (id, user_id) on delete cascade,
  constraint save_collections_collection_user_fk foreign key (collection_id, user_id)
    references public.collections (id, user_id) on delete cascade,
  constraint save_collections_unique unique (save_id, collection_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_length check (char_length(name) between 1 and 80),
  constraint tags_slug_length check (char_length(slug) between 1 and 100),
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tags_user_slug_unique unique (user_id, slug),
  constraint tags_id_user_id_unique unique (id, user_id)
);

create table public.save_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  save_id uuid not null references public.saves (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint save_tags_save_user_fk foreign key (save_id, user_id)
    references public.saves (id, user_id) on delete cascade,
  constraint save_tags_tag_user_fk foreign key (tag_id, user_id)
    references public.tags (id, user_id) on delete cascade,
  constraint save_tags_unique unique (save_id, tag_id)
);

create index user_settings_user_id_idx on public.user_settings (user_id);
create index saves_user_id_created_at_idx on public.saves (user_id, created_at desc);
create index saves_user_id_type_idx on public.saves (user_id, type);
create index saves_metadata_gin_idx on public.saves using gin (metadata);
create index collections_user_id_created_at_idx on public.collections (user_id, created_at desc);
create index save_collections_user_id_idx on public.save_collections (user_id);
create index save_collections_save_id_idx on public.save_collections (save_id);
create index save_collections_collection_id_idx on public.save_collections (collection_id);
create index tags_user_id_name_idx on public.tags (user_id, name);
create index save_tags_user_id_idx on public.save_tags (user_id);
create index save_tags_save_id_idx on public.save_tags (save_id);
create index save_tags_tag_id_idx on public.save_tags (tag_id);

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create trigger saves_set_updated_at
before update on public.saves
for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create trigger save_collections_set_updated_at
before update on public.save_collections
for each row execute function public.set_updated_at();

create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

create trigger save_tags_set_updated_at
before update on public.save_tags
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.saves enable row level security;
alter table public.collections enable row level security;
alter table public.save_collections enable row level security;
alter table public.tags enable row level security;
alter table public.save_tags enable row level security;

create policy "Users can select their own profile"
on public.user_profiles for select
to authenticated
using (id = auth.uid());

create policy "Users can insert their own profile"
on public.user_profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.user_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can delete their own profile"
on public.user_profiles for delete
to authenticated
using (id = auth.uid());

create policy "Users can select their own settings"
on public.user_settings for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own settings"
on public.user_settings for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own settings"
on public.user_settings for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own settings"
on public.user_settings for delete
to authenticated
using (user_id = auth.uid());

create policy "Users can select their own saves"
on public.saves for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own saves"
on public.saves for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own saves"
on public.saves for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own saves"
on public.saves for delete
to authenticated
using (user_id = auth.uid());

create policy "Users can select their own collections"
on public.collections for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own collections"
on public.collections for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own collections"
on public.collections for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own collections"
on public.collections for delete
to authenticated
using (user_id = auth.uid());

create policy "Users can select their own save collections"
on public.save_collections for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own save collections"
on public.save_collections for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.saves
    where saves.id = save_collections.save_id
      and saves.user_id = auth.uid()
  )
  and exists (
    select 1 from public.collections
    where collections.id = save_collections.collection_id
      and collections.user_id = auth.uid()
  )
);

create policy "Users can update their own save collections"
on public.save_collections for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.saves
    where saves.id = save_collections.save_id
      and saves.user_id = auth.uid()
  )
  and exists (
    select 1 from public.collections
    where collections.id = save_collections.collection_id
      and collections.user_id = auth.uid()
  )
);

create policy "Users can delete their own save collections"
on public.save_collections for delete
to authenticated
using (user_id = auth.uid());

create policy "Users can select their own tags"
on public.tags for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own tags"
on public.tags for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own tags"
on public.tags for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own tags"
on public.tags for delete
to authenticated
using (user_id = auth.uid());

create policy "Users can select their own save tags"
on public.save_tags for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own save tags"
on public.save_tags for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.saves
    where saves.id = save_tags.save_id
      and saves.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = save_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

create policy "Users can update their own save tags"
on public.save_tags for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.saves
    where saves.id = save_tags.save_id
      and saves.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = save_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

create policy "Users can delete their own save tags"
on public.save_tags for delete
to authenticated
using (user_id = auth.uid());
