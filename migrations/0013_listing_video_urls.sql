-- 0013_listing_video_urls.sql
alter table public.listings
  add column if not exists video_urls jsonb not null default '[]'::jsonb;
alter table public.listings
  drop constraint if exists listings_video_urls_array_check;
alter table public.listings
  add constraint listings_video_urls_array_check
  check (case when jsonb_typeof(video_urls) = 'array' then jsonb_array_length(video_urls) <= 4 else false end);
