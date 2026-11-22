-- Pin the remaining legacy transaction helper as well. It is retained for
-- compatibility with the original empty schema but is not used by the new app.
alter function public.process_gwp_transaction() set search_path = pg_catalog, public, pg_temp;
