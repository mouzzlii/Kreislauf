-- KREISLAUF trade dispute quorum: seven independent, active, verified
-- moderators from the same region; at least four votes and a two-thirds majority.
alter table trade_requests
  add column if not exists dispute_reason text,
  add column if not exists moderation_outcome text
    check (moderation_outcome is null or moderation_outcome in ('complete','cancel'));

create table if not exists trade_dispute_moderators (
  trade_request_id text not null references trade_requests(id) on delete cascade,
  moderator_id text not null references profiles(user_id),
  assigned_at timestamptz not null default now(),
  primary key (trade_request_id, moderator_id),
  check (length(moderator_id) between 2 and 128)
);
create index if not exists trade_dispute_moderators_load_idx
  on trade_dispute_moderators(moderator_id, assigned_at desc);

create table if not exists trade_dispute_votes (
  trade_request_id text not null,
  moderator_id text not null,
  decision text not null check (decision in ('complete','cancel')),
  note text not null check (length(btrim(note)) between 10 and 500),
  created_at timestamptz not null default now(),
  primary key (trade_request_id, moderator_id),
  foreign key (trade_request_id, moderator_id)
    references trade_dispute_moderators(trade_request_id, moderator_id) on delete cascade
);
create index if not exists trade_dispute_votes_case_idx
  on trade_dispute_votes(trade_request_id, decision);

alter table trade_dispute_moderators enable row level security;
alter table trade_dispute_votes enable row level security;
revoke all on table trade_dispute_moderators, trade_dispute_votes from public;

do $roles$
declare role_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('revoke all on table trade_dispute_moderators, trade_dispute_votes from %I', role_name);
    end if;
  end loop;
end;
$roles$;

create or replace function kreislauf_assign_trade_dispute_moderators()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $fn$
declare
  v_assigned integer;
begin
  if new.status <> 'disputed' or old.status = 'disputed' then
    return new;
  end if;

  insert into public.trade_dispute_moderators(trade_request_id, moderator_id)
  select new.id, candidate.user_id
  from (
    select p.user_id
    from public.profiles p
    left join public.trade_dispute_moderators a
      on a.moderator_id = p.user_id
    left join public.trade_requests active_case
      on active_case.id = a.trade_request_id and active_case.status = 'disputed'
    where p.region_id = new.region_id
      and p.is_verified = true
      and p.moderator_rank > 0
      and p.last_active_at >= now() - interval '30 days'
      and p.user_id not in (new.requester_id, new.owner_id)
    group by p.user_id, p.moderator_rank, p.last_active_at
    order by count(active_case.id) asc,
      p.moderator_rank desc,
      p.last_active_at desc,
      p.user_id asc
    limit 7
  ) candidate;

  select count(*)::integer into v_assigned
  from public.trade_dispute_moderators
  where trade_request_id = new.id;

  if v_assigned <> 7 then
    raise exception 'Ein Streitfall benötigt sieben aktive, verifizierte Moderationspersonen in derselben Region. Der Fall wurde nicht eröffnet.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$fn$;

drop trigger if exists trade_dispute_assign_moderators on trade_requests;
create trigger trade_dispute_assign_moderators
after update of status on trade_requests
for each row
when (new.status = 'disputed' and old.status is distinct from new.status)
execute function kreislauf_assign_trade_dispute_moderators();

create or replace function kreislauf_vote_trade_dispute(
  p_trade_request_id text,
  p_moderator_id text,
  p_decision text,
  p_note text
) returns table(
  status text,
  votes integer,
  complete_votes integer,
  cancel_votes integer,
  assigned integer,
  required integer
)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $fn$
declare
  v_trade public.trade_requests%rowtype;
  v_listing_id text;
  v_votes integer := 0;
  v_complete integer := 0;
  v_cancel integer := 0;
  v_assigned integer := 0;
  v_quorum integer := 4;
  v_outcome text;
  v_balance integer;
  v_wallet_rows integer;
begin
  if p_decision not in ('complete','cancel') then
    raise exception 'Entscheidung muss Tauschabschluss oder Abbruch sein.'
      using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_note,''))) < 10 or length(p_note) > 500 then
    raise exception 'Bitte begründe deine Entscheidung mit 10 bis 500 Zeichen.'
      using errcode = '22023';
  end if;

  select tr.* into v_trade
  from public.trade_requests tr
  where tr.id = p_trade_request_id
    and tr.status = 'disputed'
    and tr.moderation_outcome is null
  for update;

  if not found then
    raise exception 'Kein offener, nicht entschiedener Streitfall gefunden.'
      using errcode = 'P0002';
  end if;

  if p_moderator_id in (v_trade.requester_id, v_trade.owner_id) or not exists (
    select 1
    from public.trade_dispute_moderators a
    join public.profiles p on p.user_id = a.moderator_id
    where a.trade_request_id = v_trade.id
      and a.moderator_id = p_moderator_id
      and p.region_id = v_trade.region_id
      and p.is_verified = true
      and p.moderator_rank > 0
      and p.last_active_at >= now() - interval '30 days'
  ) then
    raise exception 'Keine aktive, unabhängige Moderationszuordnung für diesen Fall.'
      using errcode = '42501';
  end if;

  insert into public.trade_dispute_votes(trade_request_id, moderator_id, decision, note)
  values (v_trade.id, p_moderator_id, p_decision, btrim(p_note));

  select count(*)::integer,
    count(*) filter (where decision = 'complete')::integer,
    count(*) filter (where decision = 'cancel')::integer
  into v_votes, v_complete, v_cancel
  from public.trade_dispute_votes
  where trade_request_id = v_trade.id;

  select count(*)::integer into v_assigned
  from public.trade_dispute_moderators
  where trade_request_id = v_trade.id;

  if v_votes >= v_quorum
    and greatest(v_complete, v_cancel) >= ceil(v_votes * 2.0 / 3.0) then
    v_outcome := case when v_complete > v_cancel then 'complete' else 'cancel' end;

    perform 1 from public.listings l
    where l.id = v_trade.listing_id and l.status = 'booked'
    for update;
    if not found then
      raise exception 'Das Inserat ist nicht mehr für diesen Tausch reserviert.'
        using errcode = '23514';
    end if;

    perform 1 from public.profiles p
    where p.user_id in (v_trade.requester_id, v_trade.owner_id)
    order by p.user_id
    for update;

    if v_outcome = 'complete' then
      select p.karma_balance into v_balance
      from public.profiles p
      where p.user_id = v_trade.requester_id
      for update;

      if v_balance is null or v_balance < v_trade.karma_amount then
        raise exception 'Der Tauschabschluss kann nicht freigegeben werden: Das verfügbare Karma der anfragenden Person reicht nicht mehr aus.'
          using errcode = '23514';
      end if;

      if v_trade.karma_amount > 0 then
        update public.profiles p
        set karma_balance = p.karma_balance + case
              when p.user_id = v_trade.requester_id then -v_trade.karma_amount
              else v_trade.karma_amount
            end,
            last_activity_at = now()
        where p.user_id in (v_trade.requester_id, v_trade.owner_id);
        get diagnostics v_wallet_rows = row_count;
        if v_wallet_rows <> 2 then
          raise exception 'Karma-Buchung konnte nicht vollständig ausgeführt werden.'
            using errcode = '23514';
        end if;

        insert into public.ledger_entries(
          region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message
        ) values (
          v_trade.region_id, v_trade.requester_id, v_trade.owner_id,
          v_trade.listing_id, v_trade.karma_amount, 'transfer',
          'Karma-Ausgleich nach unabhängigem Moderationsentscheid'
        );
      end if;

      update public.listings l
      set status = 'completed', hands_count = l.hands_count + 1
      where l.id = v_trade.listing_id and l.status = 'booked'
      returning l.id into v_listing_id;
      if v_listing_id is null then
        raise exception 'Das Inserat konnte nicht abgeschlossen werden.'
          using errcode = '23514';
      end if;

      insert into public.item_history(item_uuid, listing_id, owner_id, place_label, event_kind)
      select l.item_uuid, l.id, v_trade.requester_id, l.place_label, 'transferred'
      from public.listings l where l.id = v_trade.listing_id;

      update public.trade_requests tr
      set status = 'completed', moderation_outcome = 'complete',
          resolved_at = now(), updated_at = now()
      where tr.id = v_trade.id and tr.status = 'disputed';

    else
      update public.listings l set status = 'active'
      where l.id = v_trade.listing_id and l.status = 'booked'
      returning l.id into v_listing_id;
      if v_listing_id is null then
        raise exception 'Das Inserat konnte nicht wieder freigegeben werden.'
          using errcode = '23514';
      end if;

      update public.trade_requests tr
      set status = 'cancelled', moderation_outcome = 'cancel',
          resolved_at = now(), updated_at = now()
      where tr.id = v_trade.id and tr.status = 'disputed';
    end if;

    insert into public.listing_messages(conversation_id, sender_id, body, message_kind)
    select c.id, p_moderator_id,
      case when v_outcome = 'complete'
        then 'Der unabhängige Moderationsentscheid hat den Tausch freigegeben. Der Vorgang ist abgeschlossen.'
        else 'Der unabhängige Moderationsentscheid hat den Tausch abgebrochen. Das Inserat ist wieder verfügbar.'
      end,
      'system'
    from public.listing_conversations c
    where c.listing_id = v_trade.listing_id
      and c.requester_id = v_trade.requester_id
      and c.owner_id = v_trade.owner_id;
  end if;

  select tr.* into v_trade from public.trade_requests tr where tr.id = v_trade.id;
  return query select v_trade.status, v_votes, v_complete, v_cancel, v_assigned, v_quorum;
end;
$fn$;

revoke all on function kreislauf_assign_trade_dispute_moderators() from public;
revoke all on function kreislauf_vote_trade_dispute(text,text,text,text) from public;

do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function kreislauf_assign_trade_dispute_moderators() from anon';
    execute 'revoke all on function kreislauf_vote_trade_dispute(text,text,text,text) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function kreislauf_assign_trade_dispute_moderators() from authenticated';
    execute 'revoke all on function kreislauf_vote_trade_dispute(text,text,text,text) from authenticated';
  end if;
end;
$permissions$;
