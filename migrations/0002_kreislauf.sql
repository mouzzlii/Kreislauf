-- KREISLAUF — regionales Tausch-, Service- und Sharing-Schema
-- Portable PostgreSQL (Neon in production, PGLite in preview).
-- Same model you would apply in the Supabase SQL editor:
--   regions (tenants), profiles, listings, bookings, reviews,
--   and an append-only karma ledger with a demurrage sink.
-- Authorization is enforced in server functions against the verified session.
-- The app role is trusted (service-role equivalent); RLS is not enabled here
-- because it would lock that role out. A Supabase port sketch is at the bottom.

create table if not exists regions (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  center_lat double precision not null,
  center_lng double precision not null,
  radius_km integer not null default 8,
  admin_user_id text,
  demurrage_enabled boolean not null default true,
  demurrage_bps integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id text primary key,
  username text not null,
  region_id text not null references regions (id),
  lat double precision,
  lng double precision,
  karma_balance integer not null default 0 check (karma_balance >= 0),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists profiles_region_idx on profiles (region_id);

create table if not exists listings (
  id text primary key,
  user_id text not null references profiles (user_id),
  region_id text not null references regions (id),
  title text not null,
  description text not null,
  category text not null check (category in ('goods', 'service', 'sharing')),
  price_karma integer not null check (price_karma >= 0 and price_karma <= 5000),
  status text not null check (status in ('active', 'booked', 'completed', 'maintenance')),
  images jsonb not null default '[]'::jsonb,
  lat double precision not null,
  lng double precision not null,
  place_label text not null default '',
  asset_kind text,
  created_at timestamptz not null default now()
);

create index if not exists listings_region_idx on listings (region_id, status);

create table if not exists bookings (
  id text primary key,
  listing_id text not null references listings (id),
  renter_id text not null references profiles (user_id),
  owner_id text not null references profiles (user_id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null check (status in ('reserved', 'handed_over', 'returned', 'cancelled')),
  amount_karma integer not null check (amount_karma >= 0),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists bookings_listing_idx on bookings (listing_id, status);

create table if not exists reviews (
  id text primary key,
  listing_id text not null references listings (id),
  reviewer_id text not null references profiles (user_id),
  subject_id text not null references profiles (user_id),
  punctuality integer not null check (punctuality between 1 and 5),
  item_condition integer not null check (item_condition between 1 and 5),
  reliability integer not null check (reliability between 1 and 5),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (listing_id, reviewer_id)
);

create table if not exists ledger_entries (
  id bigint generated always as identity primary key,
  region_id text not null references regions (id),
  sender_id text references profiles (user_id),
  receiver_id text references profiles (user_id),
  listing_id text references listings (id),
  booking_id text references bookings (id),
  amount_karma integer not null check (amount_karma > 0),
  entry_kind text not null check (entry_kind in ('mint', 'transfer', 'demurrage')),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists ledger_region_idx on ledger_entries (region_id, id desc);
create index if not exists ledger_sender_idx on ledger_entries (sender_id);
create index if not exists ledger_receiver_idx on ledger_entries (receiver_id);

create or replace function kreislauf_forbid_ledger_change()
returns trigger
language plpgsql
as $fn$
begin
  raise exception 'ledger is immutable';
end;
$fn$;

drop trigger if exists ledger_no_update on ledger_entries;
create trigger ledger_no_update
  before update or delete on ledger_entries
  for each row execute function kreislauf_forbid_ledger_change();

-- Burns 0.5% (demurrage_bps) per full idle month. Idempotent: activity clock resets.
create or replace function apply_demurrage()
returns table (affected_user text, cut_amount integer)
language plpgsql
as $fn$
declare
  rec record;
begin
  for rec in
    select
      p.user_id,
      p.region_id,
      p.karma_balance,
      round(
        p.karma_balance * r.demurrage_bps
        * floor(extract(epoch from (now() - p.last_activity_at)) / 2592000.0)
        / 10000.0
      )::int as cut
    from profiles p
    join regions r on r.id = p.region_id
    where r.demurrage_enabled
      and p.karma_balance > 0
      and p.last_activity_at < now() - interval '30 days'
    for update of p
  loop
    if rec.cut >= 1 and rec.cut <= rec.karma_balance then
      update profiles
      set karma_balance = karma_balance - rec.cut,
          last_activity_at = now()
      where profiles.user_id = rec.user_id;

      insert into ledger_entries (
        region_id, sender_id, receiver_id, amount_karma, entry_kind, message
      ) values (
        rec.region_id,
        rec.user_id,
        null,
        rec.cut,
        'demurrage',
        'Umlaufsicherung: stilles Guthaben verliert 0,5 % je Monat'
      );

      affected_user := rec.user_id;
      cut_amount := rec.cut;
      return next;
    end if;
  end loop;
end;
$fn$;

insert into regions (
  id, name, slug, description, center_lat, center_lng, radius_km, demurrage_enabled, demurrage_bps
) values
  (
    'yspertal-b36',
    'Yspertal · B36',
    'yspertal-b36',
    'Geschlossener Markt für Yspertal und die B36. Güter, Hilfe und die Sharingflotte bleiben in der Region.',
    48.2886,
    15.0634,
    12,
    true,
    50
  ),
  (
    'donautal-sued',
    'Donautal Süd',
    'donautal-sued',
    'Eigener Kreislauf südlich der Donau. Karma aus Yspertal gilt hier nicht.',
    48.2270,
    15.3310,
    14,
    true,
    50
  )
on conflict (id) do nothing;

insert into profiles (user_id, username, region_id, lat, lng, karma_balance, last_activity_at) values
  ('seed-anna', 'Anna H.', 'yspertal-b36', 48.2932, 15.0548, 240, now() - interval '4 days'),
  ('seed-markus', 'Markus F.', 'yspertal-b36', 48.2804, 15.0792, 180, now() - interval '2 days'),
  ('seed-leonie', 'Leonie K.', 'yspertal-b36', 48.3001, 15.0688, 310, now() - interval '9 days'),
  ('seed-jonas', 'Jonas B.', 'yspertal-b36', 48.2735, 15.0476, 640, now() - interval '75 days'),
  ('seed-rita', 'Rita P.', 'donautal-sued', 48.2312, 15.3180, 150, now() - interval '6 days'),
  ('seed-otto', 'Otto M.', 'donautal-sued', 48.2194, 15.3465, 90, now() - interval '12 days')
on conflict (user_id) do nothing;

insert into listings (
  id, user_id, region_id, title, description, category, price_karma, status,
  images, lat, lng, place_label, asset_kind, created_at
) values
  (
    'lst-holz', 'seed-anna', 'yspertal-b36',
    'Brennholz, 1 Raummeter Buche',
    'Ofenfertig, zwei Jahre gelagert. Abholung am Hof, Hilfe beim Laden inklusive.',
    'goods', 40, 'active',
    '["/media/holz.jpg"]'::jsonb, 48.2932, 15.0548, 'Hof am Hang', null,
    now() - interval '2 days'
  ),
  (
    'lst-ebike', 'seed-leonie', 'yspertal-b36',
    'Lasten-E-Bike Talwind',
    'Für Großeinkauf und Wege ins Tal. Akku voll bei Übergabe, Helm liegt dabei. Preis pro angefangenem Tag.',
    'sharing', 18, 'active',
    '["/media/ebike.jpg"]'::jsonb, 48.3001, 15.0688, 'Ortstraße', 'ebike',
    now() - interval '1 day'
  ),
  (
    'lst-anhaenger', 'seed-markus', 'yspertal-b36',
    'Pkw-Anhänger, gebremst',
    'Für Sperrmüll, Holz oder den Markt. Kupplung passt auf gängige Kugelköpfe. Aktuell reserviert.',
    'sharing', 22, 'booked',
    '["/media/anhaenger.jpg"]'::jsonb, 48.2804, 15.0792, 'Werkstatt B36', 'trailer',
    now() - interval '3 days'
  ),
  (
    'lst-konsole', 'seed-markus', 'yspertal-b36',
    'Handheld-Konsole, gereinigt',
    'Älteres Gerät, läuft, zwei Kabel dabei. Tausch gegen Karma, Abholung in der Werkstatt.',
    'goods', 25, 'active',
    '["/media/konsole.jpg"]'::jsonb, 48.2810, 15.0775, 'Werkstatt B36', null,
    now() - interval '5 days'
  ),
  (
    'lst-schere', 'seed-anna', 'yspertal-b36',
    'Heckenschere und Handsäge',
    'Für den Heckenschnitt am Wochenende. Bitte geölt zurückgeben. Preis pro Tag.',
    'sharing', 8, 'active',
    '["/media/werkzeug.jpg"]'::jsonb, 48.2940, 15.0560, 'Hof am Hang', 'tool',
    now() - interval '6 days'
  ),
  (
    'lst-fenster', 'seed-leonie', 'yspertal-b36',
    'Fenster abdichten',
    'Dichtungen tauschen, kleine Ritzen schließen. Material extra, Arbeit in Karma. Ein halber Tag.',
    'service', 30, 'active',
    '["/media/fenster.jpg"]'::jsonb, 48.2994, 15.0702, 'Südhang', null,
    now() - interval '8 days'
  ),
  (
    'lst-wlan', 'seed-jonas', 'yspertal-b36',
    'Router, WLAN, Drucker',
    'Ich richte Router, Empfang und Drucker ein. Kein Fernsupport danach — einmal vor Ort, in Ruhe.',
    'service', 15, 'active',
    '["/media/router.jpg"]'::jsonb, 48.2735, 15.0476, 'Unteres Dorf', null,
    now() - interval '12 days'
  ),
  (
    'lst-most', 'seed-anna', 'yspertal-b36',
    'Most und Apfelkiste',
    'Vom Hof: eine Kiste Mischäpfel und zwei Flaschen Most. Solange der Vorrat reicht.',
    'goods', 8, 'active',
    '["/media/most.jpg"]'::jsonb, 48.2924, 15.0536, 'Hof am Hang', null,
    now() - interval '1 day'
  ),
  (
    'lst-saege', 'seed-markus', 'yspertal-b36',
    'Stichsäge, gerade in Wartung',
    'Sägeblatt wird getauscht. Steht danach wieder in der Flotte. Noch nicht buchbar.',
    'sharing', 10, 'maintenance',
    '[]'::jsonb, 48.2808, 15.0801, 'Werkstatt B36', 'tool',
    now() - interval '4 days'
  ),
  (
    'lst-transport', 'seed-jonas', 'yspertal-b36',
    'Transport bis Melk',
    'Kleintransporter, eine Fuhre bis Melk und zurück. Absprache am Vortag.',
    'service', 35, 'active',
    '[]'::jsonb, 48.2742, 15.0490, 'Unteres Dorf', null,
    now() - interval '7 days'
  ),
  (
    'lst-obst', 'seed-rita', 'donautal-sued',
    'Obstkiste vom Nachbarhof',
    'Äpfel und Birnen, diese Woche geerntet. Abholung am Hoftor.',
    'goods', 6, 'active',
    '["/media/most.jpg"]'::jsonb, 48.2312, 15.3180, 'Hoftor', null,
    now() - interval '2 days'
  ),
  (
    'lst-bohrer', 'seed-otto', 'donautal-sued',
    'Bohrhammer, zwei Tage',
    'Für Dübel in altem Mauerwerk. Bohrer 6–12 mm liegen bei. Preis pro Tag.',
    'sharing', 11, 'active',
    '["/media/werkzeug.jpg"]'::jsonb, 48.2194, 15.3465, 'Steinbruchweg', 'tool',
    now() - interval '3 days'
  ),
  (
    'lst-ernte', 'seed-rita', 'donautal-sued',
    'Erntehilfe, halber Tag',
    'Zwei Hände für Obst oder Holz. Du stellst Handschuhe, ich die Zeit.',
    'service', 20, 'active',
    '[]'::jsonb, 48.2304, 15.3210, 'Hoftor', null,
    now() - interval '5 days'
  )
on conflict (id) do nothing;

insert into bookings (
  id, listing_id, renter_id, owner_id, starts_at, ends_at, status, amount_karma
) values (
  'bkg-anhaenger',
  'lst-anhaenger',
  'seed-leonie',
  'seed-markus',
  now() + interval '1 day',
  now() + interval '3 days',
  'reserved',
  44
)
on conflict (id) do nothing;

insert into reviews (
  id, listing_id, reviewer_id, subject_id, punctuality, item_condition, reliability, note
) values
  ('rev-1', 'lst-holz', 'seed-markus', 'seed-anna', 5, 5, 5, 'Holz trocken, pünktlich am Hof.'),
  ('rev-2', 'lst-konsole', 'seed-leonie', 'seed-markus', 4, 5, 4, 'Gerät wie beschrieben, Kabel dabei.'),
  ('rev-3', 'lst-wlan', 'seed-anna', 'seed-jonas', 5, 4, 5, 'Empfang steht, ruhig erklärt.'),
  ('rev-4', 'lst-fenster', 'seed-jonas', 'seed-leonie', 5, 4, 5, 'Dichtung sitzt, sauber gearbeitet.')
on conflict (id) do nothing;

insert into ledger_entries (
  region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message, created_at
) values
  ('yspertal-b36', null, 'seed-anna', null, 120, 'mint', 'Startguthaben der Region', now() - interval '140 days'),
  ('yspertal-b36', null, 'seed-markus', null, 120, 'mint', 'Startguthaben der Region', now() - interval '130 days'),
  ('yspertal-b36', null, 'seed-leonie', null, 120, 'mint', 'Startguthaben der Region', now() - interval '128 days'),
  ('yspertal-b36', null, 'seed-jonas', null, 120, 'mint', 'Startguthaben der Region', now() - interval '200 days'),
  ('yspertal-b36', 'seed-markus', 'seed-anna', null, 36, 'transfer', 'Tausch: Brennholz vom letzten Winter', now() - interval '20 days'),
  ('yspertal-b36', 'seed-anna', 'seed-leonie', null, 30, 'transfer', 'Hilfe: Fenstertausch im Frühjahr', now() - interval '11 days'),
  ('yspertal-b36', 'seed-leonie', 'seed-markus', null, 18, 'transfer', 'Flotte: E-Bike, ein Tag', now() - interval '6 days'),
  ('donautal-sued', null, 'seed-rita', null, 120, 'mint', 'Startguthaben der Region', now() - interval '90 days'),
  ('donautal-sued', null, 'seed-otto', null, 120, 'mint', 'Startguthaben der Region', now() - interval '88 days'),
  ('donautal-sued', 'seed-otto', 'seed-rita', null, 20, 'transfer', 'Hilfe: Ernte am Südhang', now() - interval '15 days')
on conflict do nothing;

-- Supabase port sketch (documentation only, not executed):
-- alter table profiles enable row level security;
-- create policy profiles_select on profiles for select using (true);
-- create policy profiles_update on profiles for update using (auth.uid()::text = user_id);
-- create policy listings_select on listings for select using (true);
-- create policy listings_write on listings for insert with check (auth.uid()::text = user_id);
-- create policy listings_update on listings for update using (auth.uid()::text = user_id);
-- alter table ledger_entries enable row level security;
-- create policy ledger_select on ledger_entries for select using (true);
-- revoke update, delete on ledger_entries from authenticated, anon;
