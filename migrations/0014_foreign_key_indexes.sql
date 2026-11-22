-- Cover foreign-key lookup and delete/update checks that Supabase's advisor
-- identified as unindexed. These are additive and safe to re-run.
create index if not exists bookings_owner_id_fk_idx on public.bookings(owner_id);
create index if not exists bookings_renter_id_fk_idx on public.bookings(renter_id);
create index if not exists escrow_cases_booking_id_fk_idx on public.escrow_cases(booking_id);
create index if not exists escrow_cases_moderator_id_fk_idx on public.escrow_cases(moderator_id);
create index if not exists escrow_cases_requester_id_fk_idx on public.escrow_cases(requester_id);
create index if not exists escrow_moderators_moderator_id_fk_idx on public.escrow_moderators(moderator_id);
create index if not exists escrow_votes_moderator_id_fk_idx on public.escrow_votes(moderator_id);
create index if not exists item_history_listing_id_fk_idx on public.item_history(listing_id);
create index if not exists item_history_owner_id_fk_idx on public.item_history(owner_id);
create index if not exists ledger_entries_booking_id_fk_idx on public.ledger_entries(booking_id);
create index if not exists ledger_entries_listing_id_fk_idx on public.ledger_entries(listing_id);
do $body$
begin
  if to_regclass('public.legacy_bookings') is not null then
    execute 'create index if not exists legacy_bookings_user_id_fk_idx on public.legacy_bookings(user_id)';
  end if;
end
$body$;
create index if not exists listings_user_id_fk_idx on public.listings(user_id);
create index if not exists marketplace_items_seller_id_fk_idx on public.marketplace_items(seller_id);
create index if not exists rentals_user_id_fk_idx on public.rentals(user_id);
create index if not exists reviews_reviewer_id_fk_idx on public.reviews(reviewer_id);
create index if not exists reviews_subject_id_fk_idx on public.reviews(subject_id);
create index if not exists transactions_receiver_id_fk_idx on public.transactions(receiver_id);
create index if not exists transactions_sender_id_fk_idx on public.transactions(sender_id);
