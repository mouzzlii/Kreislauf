-- 0013_listing_video_urls.sql
alter table public.listings
  add column if not exists video_urls jsonb not null default '[]'::jsonb;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_video_urls_array_check') then
    alter table public.listings add constraint listings_video_urls_array_check
      check (jsonb_typeof(video_urls) = 'array' and jsonb_array_length(video_urls) <= 4);
  end if;
end $$;
