export const CREATE_TRADE_REQUEST_SQL = `
with target as materialized (
           select l.id, l.user_id as owner_id, l.region_id, l.karma_adjustment
           from listings l
           join profiles requester on requester.user_id = $2
           join profiles owner on owner.user_id = l.user_id
           where l.id = $1
             and l.status = 'active'
             and l.offer_type in ('barter','combined')
             and l.category in ('goods','service')
             and l.user_id <> $2
             and requester.region_id = l.region_id
             and owner.region_id = l.region_id
             and (l.karma_adjustment = 0 or requester.karma_balance >= l.karma_adjustment)
           for update of l
         ),
         created as (
           insert into trade_requests (
             id, listing_id, region_id, requester_id, owner_id,
             offered_description, karma_amount, status
           )
           select $3, target.id, target.region_id, $2, target.owner_id,
             $4, target.karma_adjustment, 'requested'
           from target
           returning id, listing_id
         ),
         held as (
           update listings l set status = 'booked'
           from created c
           where l.id = c.listing_id and l.status = 'active'
           returning l.id
         )
         select c.id from created c join held h on h.id = c.listing_id
`;

export const TRANSITION_TRADE_REQUEST_SQL = `
with target as materialized (
         select tr.id, tr.listing_id, tr.status, tr.requester_id, tr.owner_id
         from trade_requests tr
         where tr.id = $1 and (
           (tr.owner_id = $2 and $3 in ('accept','reject')) or
           (tr.requester_id = $2 and $3 = 'cancel') or
           ((tr.requester_id = $2 or tr.owner_id = $2) and $3 = 'dispute')
         )
         for update
       ),
       changed as (
         update trade_requests tr
         set status = case
               when $3 = 'accept' and target.status = 'requested' then 'accepted'
               when $3 = 'reject' and target.status = 'requested' then 'rejected'
               when $3 = 'cancel' and target.status = 'requested' then 'cancelled'
               when $3 = 'dispute' and target.status = 'accepted' then 'disputed'
               else tr.status
             end,
             updated_at = now(),
             resolved_at = case when $3 in ('reject','cancel') then now() else null end
         from target
         where tr.id = target.id
           and (
             ($3 in ('accept','reject') and target.status = 'requested') or
             ($3 = 'cancel' and target.status = 'requested') or
             ($3 = 'dispute' and target.status = 'accepted')
           )
         returning tr.listing_id, tr.status
       ),
       listing_state as (
         update listings l
         set status = case when c.status in ('rejected','cancelled') then 'active' else 'booked' end
         from changed c where l.id = c.listing_id
         returning l.id
       )
       select c.status from changed c join listing_state l on l.id = c.listing_id
`;

export const CONFIRM_TRADE_REQUEST_SQL = `
with target as materialized (
         select tr.id, tr.listing_id, tr.region_id, tr.requester_id, tr.owner_id,
           tr.karma_amount, l.item_uuid, l.place_label, tr.status,
           tr.requester_confirmed, tr.owner_confirmed
         from trade_requests tr
         join listings l on l.id = tr.listing_id
         where tr.id = $1 and tr.status = 'accepted'
           and l.status = 'booked'
           and (tr.requester_id = $2 or tr.owner_id = $2)
         for update of tr, l
       ),
       wallet_rows as materialized (
         select p.user_id, p.karma_balance
         from profiles p join target t on p.user_id in (t.requester_id, t.owner_id)
         order by p.user_id
         for update of p
       ),
       wallet_check as (
         select t.id,
           count(w.user_id) = 2
             and coalesce(max(w.karma_balance) filter (where w.user_id = t.requester_id), 0) >= t.karma_amount as ok
         from target t left join wallet_rows w on true
         group by t.id
       ),
       confirmed as (
         update trade_requests tr
         set requester_confirmed = t.requester_confirmed or t.requester_id = $2,
             owner_confirmed = t.owner_confirmed or t.owner_id = $2,
             status = case
               when (t.requester_confirmed or t.requester_id = $2)
                 and (t.owner_confirmed or t.owner_id = $2) then 'completed'
               else 'accepted'
             end,
             resolved_at = case
               when (t.requester_confirmed or t.requester_id = $2)
                 and (t.owner_confirmed or t.owner_id = $2) then now()
               else null
             end,
             updated_at = now()
         from target t join wallet_check wc on wc.id = t.id
         where tr.id = t.id and wc.ok
         returning tr.id, tr.listing_id, tr.region_id, tr.requester_id, tr.owner_id,
           tr.karma_amount, tr.requester_confirmed, tr.owner_confirmed,
           tr.status, t.item_uuid, t.place_label
       ),
       ready as materialized (
         select * from confirmed where status = 'completed'
       ),
       wallet_move as (
         update profiles p
         set karma_balance = p.karma_balance + case
               when p.user_id = r.requester_id then -r.karma_amount
               else r.karma_amount
             end,
             last_activity_at = now()
         from ready r
         where r.karma_amount > 0 and p.user_id in (r.requester_id, r.owner_id)
         returning p.user_id
       ),
       ledger as (
         insert into ledger_entries (
           region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message
         )
         select c.region_id, c.requester_id, c.owner_id, c.listing_id,
           c.karma_amount, 'transfer', 'Kreislauf-Tausch mit Karma-Ausgleich'
         from ready c where c.karma_amount > 0
         returning id
       ),
       history as (
         insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind)
         select c.item_uuid, c.listing_id, c.requester_id, c.place_label, 'transferred'
         from ready c
         returning id
       ),
       listing_done as (
         update listings l set status = 'completed', hands_count = hands_count + 1
         from ready c where l.id = c.listing_id
         returning l.id
       )
       select c.id, c.status
       from confirmed c
`;
