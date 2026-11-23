-- Pin the retained legacy helper when it exists in an upgraded project.
-- Fresh KREISLAUF installs do not create this legacy function.
do $$
begin
  if to_regprocedure('public.process_gwp_transaction()') is not null then
    alter function public.process_gwp_transaction()
      set search_path = pg_catalog, public, pg_temp;
  end if;
end
$$;
