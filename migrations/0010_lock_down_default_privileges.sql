-- 0010_lock_down_default_privileges.sql
-- Keep future public-schema objects private by default. Supabase has browser
-- roles; the embedded PGLite demo does not. Revoke conditionally so the same
-- migration is safe in both database environments.
alter default privileges for role postgres in schema public
  revoke all on tables from public;
alter default privileges for role postgres in schema public
  revoke all on sequences from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

do $roles$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format(
        'alter default privileges for role postgres in schema public revoke all on tables from %I',
        role_name
      );
      execute format(
        'alter default privileges for role postgres in schema public revoke all on sequences from %I',
        role_name
      );
      execute format(
        'alter default privileges for role postgres in schema public revoke execute on functions from %I',
        role_name
      );
    end if;
  end loop;
end;
$roles$;
