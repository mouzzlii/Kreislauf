-- Prevent future public-schema objects from inheriting browser-facing grants.
-- Existing Supabase projects can retain permissive default ACLs from older setup.
do $defaults$
declare
  owner_role text;
begin
  for owner_role in
    select rolname from pg_roles where rolname in ('supabase_admin', 'postgres')
  loop
    execute format(
      'alter default privileges for role %I in schema public revoke all on tables from anon, authenticated, service_role',
      owner_role
    );
    execute format(
      'alter default privileges for role %I in schema public revoke all on sequences from anon, authenticated, service_role',
      owner_role
    );
    execute format(
      'alter default privileges for role %I in schema public revoke execute on functions from public, anon, authenticated, service_role',
      owner_role
    );
  end loop;
end
$defaults$;
