-- ================================================================
-- Migration: Add content extraction tracking to saves
-- Date: 2026-06-10
-- ================================================================
-- Phase 2.2 (readable content extraction) reuses the existing
-- content_text column on the saves table — already present since the
-- original schema for 'note'-type saves (see saves_note_requires_content)
-- and never previously populated for 'link'-type saves. This migration
-- adds only the tracking columns needed to know the state of extraction
-- for a given save: word count, when it ran, and whether it succeeded.
--
-- This is purely additive. No existing column is altered, dropped, or
-- renamed, and no existing row's data is touched — all new columns
-- default to values that make existing saves behave exactly as before
-- (content_status defaults to 'pending', matching "not yet attempted").
-- ================================================================

alter table public.saves
  add column if not exists content_word_count integer,
  add column if not exists content_extracted_at timestamptz,
  add column if not exists content_status text not null default 'pending';

alter table public.saves
  add constraint saves_content_status_check
    check (content_status in ('pending', 'success', 'failed'));

alter table public.saves
  add constraint saves_content_word_count_nonnegative
    check (content_word_count is null or content_word_count >= 0);

-- Backfill: any save that already has content_text populated (currently
-- only possible for 'note'-type saves, which set it at creation time)
-- is marked success so existing notes aren't shown as "pending" content
-- extraction they were never subject to.
update public.saves
set content_status = 'success'
where content_text is not null
  and content_status = 'pending';
