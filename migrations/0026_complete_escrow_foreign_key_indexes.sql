-- 0026_complete_escrow_foreign_key_indexes.sql
-- Complete the foreign-key indexes identified by the live Supabase advisor.
-- Additive and safe to re-run.
create index if not exists escrow_cases_buyer_id_fk_idx
  on public.escrow_cases(buyer_id);
create index if not exists escrow_cases_region_id_fk_idx
  on public.escrow_cases(region_id);
create index if not exists escrow_cases_seller_id_fk_idx
  on public.escrow_cases(seller_id);
create index if not exists escrow_resolution_votes_moderator_id_fk_idx
  on public.escrow_resolution_votes(moderator_id);
