-- Lock down retained legacy tables from the first prototype.
-- The current application uses the newer profiles/listings/ledger schema via
-- server-only PostgreSQL connections; these legacy tables are not an app API.
do $$
declare
  item record;
  pol record;
begin
  for item in
    select * from (values
      ('users'),
      ('transactions'),
      ('marketplace_items'),
      ('legacy_bookings'),
      ('rentals')
    ) as legacy(table_name)
  loop
    if to_regclass(format('public.%I', item.table_name)) is not null then
      for pol in
        select policyname
        from pg_policies
        where schemaname = 'public' and tablename = item.table_name
      loop
        execute format('drop policy %I on public.%I', pol.policyname, item.table_name);
      end loop;

      execute format('alter table public.%I enable row level security', item.table_name);
      execute format('revoke all on table public.%I from public', item.table_name);
      if exists (select 1 from pg_roles where rolname = 'anon') then
        execute format('revoke all on table public.%I from anon', item.table_name);
      end if;
      if exists (select 1 from pg_roles where rolname = 'authenticated') then
        execute format('revoke all on table public.%I from authenticated', item.table_name);
      end if;
    end if;
  end loop;
end
$$;
