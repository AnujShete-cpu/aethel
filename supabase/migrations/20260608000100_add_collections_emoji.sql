-- ================================================================
-- Migration: Add emoji column to collections
-- Date: 2026-06-08
-- ================================================================
-- The Collections module PRD requires an emoji/cover field alongside
-- the existing color field. This is additive and non-destructive.
-- ================================================================

alter table public.collections
  add column if not exists emoji text;

alter table public.collections
  add constraint collections_emoji_length
    check (emoji is null or char_length(emoji) <= 8);
