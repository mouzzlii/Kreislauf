import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  DEFAULT_REGION,
  WELCOME_KARMA,
  type Board,
  type Booking,
  type BookingStatus,
  type Category,
  type OfferType,
  type LedgerEntry,
  type Listing,
  type ListingDetail,
  type ListingStatus,
  type Profile,
  type Region,
  type Review,
  type TradeRequest,
} from "./types";
import { normalizeExchangeListing, normalizeTradeOffer } from "./trade-rules";

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function asImages(value: unknown): string[] {
  const raw = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string").slice(0, 4);
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function regionIdOf(input: unknown): string {
  const regionId =
    input && typeof input === "object" && "regionId" in input
      ? (input as { regionId: unknown }).regionId
      : "";
  if (typeof regionId !== "string" || !/^[a-z0-9-]{2,48}$/.test(regionId)) {
    throw new Error("Unbekannte Region");
  }
  return regionId;
}

function idOf(input: unknown, key: string): string {
  const id =
    input && typeof input === "object" && key in input
      ? (input as Record<string, unknown>)[key]
      : "";
  if (typeof id !== "string" || !/^[a-z0-9-]{2,80}$/.test(id)) {
    throw new Error("Ungültige Kennung");
  }
  return id;
}

function mapRegion(row: Row): Region {
  return {
    id: asString(row.id),
    name: asString(row.name),
    slug: asString(row.slug),
    description: asString(row.description),
    centerLat: asNumber(row.centerLat),
    centerLng: asNumber(row.centerLng),
    radiusKm: asNumber(row.radiusKm),
    demurrageEnabled: row.demurrageEnabled === true || row.demurrageEnabled === "true",
    demurrageBps: asNumber(row.demurrageBps, 50),
  };
}

function mapListing(row: Row): Listing {
  const trust = row.trust == null ? null : asNumber(row.trust);
  return {
    id: asString(row.id),
    userId: asString(row.userId),
    regionId: asString(row.regionId),
    title: asString(row.title),
    description: asString(row.description),
    category: asString(row.category, "goods") as Category,
    offerType: asString(row.offerType, "sell") as OfferType,
    itemUuid: asString(row.itemUuid),
    handsCount: asNumber(row.handsCount),
    what3wordsAddress: row.what3wordsAddress == null ? null : asString(row.what3wordsAddress),
    priceKarma: asNumber(row.priceKarma),
    exchangeTerms: row.exchangeTerms == null ? null : asString(row.exchangeTerms),
    karmaAdjustment: asNumber(row.karmaAdjustment),
    status: asString(row.status, "active") as ListingStatus,
    images: asImages(row.images),
    lat: asNumber(row.lat),
    lng: asNumber(row.lng),
    placeLabel: asString(row.placeLabel),
    assetKind: row.assetKind == null ? null : asString(row.assetKind),
    createdAt: asString(row.createdAt),
    ownerName: asString(row.ownerName),
    trust: trust != null && row.trust != null ? trust : null,
    reviewCount: asNumber(row.reviewCount),
  };
}

function mapLedger(row: Row): LedgerEntry {
  return {
    id: asNumber(row.id),
    amountKarma: asNumber(row.amountKarma),
    entryKind: asString(row.entryKind, "transfer") as LedgerEntry["entryKind"],
    message: asString(row.message),
    createdAt: asString(row.createdAt),
    senderName: row.senderName == null ? null : asString(row.senderName),
    receiverName: row.receiverName == null ? null : asString(row.receiverName),
    listingTitle: row.listingTitle == null ? null : asString(row.listingTitle),
  };
}

const REGION_SQL = `
  select id, name, slug, description,
    center_lat as "centerLat", center_lng as "centerLng",
    radius_km as "radiusKm",
    demurrage_enabled as "demurrageEnabled",
    demurrage_bps as "demurrageBps"
  from regions
  order by name
`;

const LISTING_SQL = `
  select l.id, l.user_id as "userId", l.region_id as "regionId", l.title, l.description,
    l.category, l.offer_type as "offerType", l.item_uuid as "itemUuid", l.hands_count as "handsCount",
    l.price_karma as "priceKarma", l.exchange_terms as "exchangeTerms",
    l.karma_adjustment as "karmaAdjustment", l.status, l.images,
    round(l.lat::numeric, 2)::float8 as lat, round(l.lng::numeric, 2)::float8 as lng,
    l.place_label as "placeLabel", l.asset_kind as "assetKind",
    to_char(l.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
    p.username as "ownerName",
    (select count(*)::int from reviews r where r.subject_id = p.user_id) as "reviewCount",
    (select avg((r.punctuality + r.item_condition + r.reliability) / 3.0)::float8
      from reviews r where r.subject_id = p.user_id) as trust
  from listings l
  join profiles p on p.user_id = l.user_id
`;

const LEDGER_SQL = `
  select e.id::int as id, e.amount_karma as "amountKarma", e.entry_kind as "entryKind",
    e.message,
    to_char(e.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
    sender.username as "senderName",
    recv.username as "receiverName",
    l.title as "listingTitle"
  from ledger_entries e
  left join profiles sender on sender.user_id = e.sender_id
  left join profiles recv on recv.user_id = e.receiver_id
  left join listings l on l.id = e.listing_id
`;

async function loadRegions(): Promise<Region[]> {
  const sql = await getSql();
  const rows = await sql.query<Row>(REGION_SQL);
  return rows.map(mapRegion);
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const sql = await getSql();
  const rows = await sql.query<Row>(
    `select p.user_id as "userId", p.username, p.region_id as "regionId",
      g.name as "regionName", p.karma_balance as "karmaBalance", p.lat, p.lng,
      p.is_verified as "isVerified", p.moderator_rank as "moderatorRank",
      to_char(p.last_activity_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "lastActivityAt",
      (select count(*)::int from reviews r where r.subject_id = p.user_id) as "reviewCount",
      (select avg((r.punctuality + r.item_condition + r.reliability) / 3.0)::float8
        from reviews r where r.subject_id = p.user_id) as trust
     from profiles p
     join regions g on g.id = p.region_id
     where p.user_id = $1`,
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    userId: asString(row.userId),
    username: asString(row.username),
    regionId: asString(row.regionId),
    regionName: asString(row.regionName),
    karmaBalance: asNumber(row.karmaBalance),
    lat: row.lat == null ? null : asNumber(row.lat),
    lng: row.lng == null ? null : asNumber(row.lng),
    trust: row.trust == null ? null : asNumber(row.trust),
    reviewCount: asNumber(row.reviewCount),
    lastActivityAt: asString(row.lastActivityAt),
    isVerified: row.isVerified === true || row.isVerified === "true",
    moderatorRank: asNumber(row.moderatorRank),
  };
}

export const getBoard = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ regionId: regionIdOf(input) }))
  .handler(async ({ data }): Promise<Board> => {
    const regions = await loadRegions();
    const region = regions.find((item) => item.id === data.regionId) ?? regions[0];
    if (!region) throw new Error("Keine Region angelegt");
    const sql = await getSql();
    const [listingRows, statRows, ledgerRows] = await Promise.all([
      sql.query<Row>(`${LISTING_SQL} where l.region_id = $1 order by l.created_at desc`, [region.id]),
      sql.query<Row>(
        `select
           coalesce(sum(karma_balance), 0)::int as "inCirculation",
           coalesce(sum(karma_balance) filter (where last_activity_at < now() - interval '30 days'), 0)::int as "idle",
           (select coalesce(sum(amount_karma), 0)::int from ledger_entries
             where region_id = $1 and entry_kind = 'transfer'
               and created_at > now() - interval '30 days') as moved
         from profiles where region_id = $1`,
        [region.id],
      ),
      sql.query<Row>(`${LEDGER_SQL} where e.region_id = $1 order by e.id desc limit 12`, [region.id]),
    ]);
    const stats = statRows[0] ?? {};
    return {
      region,
      regions,
      listings: listingRows.map(mapListing),
      stats: {
        inCirculation: asNumber(stats.inCirculation),
        idle: asNumber(stats.idle),
        moved: asNumber(stats.moved),
      },
      ledger: ledgerRows.map(mapLedger),
    };
  });

export const getListing = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .handler(async ({ data }): Promise<ListingDetail | null> => {
    const sql = await getSql();
    const listingRows = await sql.query<Row>(`${LISTING_SQL} where l.id = $1`, [data.id]);
    const listing = listingRows[0] ? mapListing(listingRows[0]) : null;
    if (!listing) return null;
    const [bookingRows, historyRows, escrowRows, reviewRows] = await Promise.all([
      sql.query<Row>(
        `select b.id, b.listing_id as "listingId", b.renter_id as "renterId", b.owner_id as "ownerId",
           renter.username as "renterName", owner.username as "ownerName",
           to_char(b.starts_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "startsAt",
           to_char(b.ends_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "endsAt",
           b.status, b.amount_karma as "amountKarma"
         from bookings b
         join profiles renter on renter.user_id = b.renter_id
         join profiles owner on owner.user_id = b.owner_id
         where b.listing_id = $1 and b.status <> 'cancelled'
         order by b.created_at desc
         limit 1`,
        [listing.id],
      ),
      sql.query<Row>(
        `select h.place_label as "placeLabel", h.event_kind as "eventKind",
           to_char(h.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
         from item_history h where h.item_uuid = $1 order by h.created_at desc limit 8`,
        [listing.itemUuid],
      ),
      sql.query<Row>(`select id from escrow_cases where listing_id = $1 and status = 'pending' limit 1`, [listing.id]),
      sql.query<Row>(
        `select r.id, reviewer.username as "reviewerName",
           r.punctuality, r.item_condition as "itemCondition", r.reliability, r.note,
           to_char(r.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
         from reviews r
         join profiles reviewer on reviewer.user_id = r.reviewer_id
         where r.listing_id = $1
         order by r.created_at desc`,
        [listing.id],
      ),
    ]);
    const bookingRow = bookingRows[0];
    const booking: Booking | null = bookingRow
      ? {
          id: asString(bookingRow.id),
          listingId: asString(bookingRow.listingId),
          renterId: asString(bookingRow.renterId),
          ownerId: asString(bookingRow.ownerId),
          renterName: asString(bookingRow.renterName),
          ownerName: asString(bookingRow.ownerName),
          startsAt: asString(bookingRow.startsAt),
          endsAt: asString(bookingRow.endsAt),
          status: asString(bookingRow.status) as BookingStatus,
          amountKarma: asNumber(bookingRow.amountKarma),
        }
      : null;
    const reviews: Review[] = reviewRows.map((row) => ({
      id: asString(row.id),
      reviewerName: asString(row.reviewerName),
      punctuality: asNumber(row.punctuality),
      itemCondition: asNumber(row.itemCondition),
      reliability: asNumber(row.reliability),
      note: asString(row.note),
      createdAt: asString(row.createdAt),
    }));
    const history = historyRows.map((row) => ({
      placeLabel: asString(row.placeLabel, "In der Region"),
      eventKind: asString(row.eventKind),
      createdAt: asString(row.createdAt),
    }));
    return { listing, booking, reviews, history, escrowPending: escrowRows.length > 0 };
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const regionId = regionIdOf(input);
    const raw =
      input && typeof input === "object" && "username" in input
        ? String((input as { username: unknown }).username ?? "")
        : "";
    const username = raw.replace(/\s+/g, " ").trim().slice(0, 32);
    return { regionId, username: username.length >= 2 ? username : "Mitglied" };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<Profile> => {
    const sql = await getSql();
    const created = await sql.query<{ userId: string }>(
      `insert into profiles (user_id, username, region_id, karma_balance)
       select $1, $2, id, $3 from regions where id = $4
       on conflict (user_id) do nothing
       returning user_id as "userId"`,
      [context.userId, data.username, WELCOME_KARMA, data.regionId],
    );
    await sql.query(`update profiles set last_active_at = now() where user_id = $1`, [context.userId]);
    if (created.length > 0) {
      await sql.query(
        `insert into ledger_entries (region_id, sender_id, receiver_id, amount_karma, entry_kind, message)
         values ($1, null, $2, $3, 'mint', 'Startguthaben der Region')`,
        [data.regionId, context.userId, WELCOME_KARMA],
      );
    }
    const profile = await loadProfile(context.userId);
    if (!profile) throw new Error("Profil konnte nicht angelegt werden");
    return profile;
  });

export const getMine = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ profile: Profile | null; ledger: LedgerEntry[] }> => {
    const sql = await getSql();
    const profile = await loadProfile(context.userId);
    const ledgerRows = await sql.query<Row>(
      `${LEDGER_SQL}
       where e.sender_id = $1 or e.receiver_id = $1
       order by e.id desc
       limit 30`,
      [context.userId],
    );
    return { profile, ledger: ledgerRows.map(mapLedger) };
  });

export const setRegion = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ regionId: regionIdOf(input) }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<Profile> => {
    const sql = await getSql();
    await sql.query(
      `update profiles set region_id = $1
       where user_id = $2
         and exists (select 1 from regions where id = $1)`,
      [data.regionId, context.userId],
    );
    const profile = await loadProfile(context.userId);
    if (!profile) throw new Error("Noch kein Profil");
    return profile;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Ungültige Eingabe");
    const source = input as Record<string, unknown>;
    let username: string | undefined;
    if (typeof source.username === "string") {
      username = source.username.replace(/\s+/g, " ").trim().slice(0, 32);
      if (username.length < 2) throw new Error("Name zu kurz");
    }
    const lat = typeof source.lat === "number" ? source.lat : undefined;
    const lng = typeof source.lng === "number" ? source.lng : undefined;
    if ((lat == null) !== (lng == null)) throw new Error("Standort unvollständig");
    if (lat != null && (lat < 46 || lat > 50 || lng == null || lng < 8 || lng > 18)) {
      throw new Error("Standort liegt außerhalb");
    }
    return { username, lat, lng };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<Profile> => {
    const sql = await getSql();
    if (data.username) {
      await sql.query(`update profiles set username = $1, last_active_at = now() where user_id = $2`, [
        data.username,
        context.userId,
      ]);
    }
    if (data.lat != null && data.lng != null) {
      await sql.query(
        `update profiles set lat = $1, lng = $2, last_activity_at = now(), last_active_at = now() where user_id = $3`,
        [data.lat, data.lng, context.userId],
      );
    }
    const profile = await loadProfile(context.userId);
    if (!profile) throw new Error("Noch kein Profil");
    return profile;
  });

function cleanTitle(value: unknown): string {
  const title = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (title.length < 3 || title.length > 80) throw new Error("Titel braucht 3 bis 80 Zeichen");
  return title;
}

export const getItemTemplate = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object" || typeof (input as Record<string, unknown>).itemUuid !== "string") throw new Error("Artikelkennung fehlt");
    const itemUuid = String((input as Record<string, unknown>).itemUuid);
    if (!/^item-[a-z0-9-]{8,80}$/.test(itemUuid)) throw new Error("Ungültige Artikelkennung");
    return { itemUuid };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `select l.title,l.description,l.category,l.price_karma as "priceKarma",l.place_label as "placeLabel",l.images
       from listings l where l.item_uuid = $1 and exists (
         select 1 from item_history h where h.item_uuid = l.item_uuid and h.owner_id = $2
           and h.id = (select max(h2.id) from item_history h2 where h2.item_uuid = l.item_uuid)
       ) order by l.created_at desc limit 1`, [data.itemUuid, context.userId]);
    const row = rows[0];
    if (!row) throw new Error("Dieser Artikel ist dir laut Historie nicht zugeordnet.");
    const images = asImages(row.images);
    return { itemUuid: data.itemUuid, title: asString(row.title), description: asString(row.description),
      category: asString(row.category, "goods") as Category, priceKarma: asNumber(row.priceKarma),
      placeLabel: asString(row.placeLabel), imageDataUrl: images[0]?.startsWith("data:image/jpeg;base64,") ? images[0] : null };
  });

export const createListing = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Ungültige Eingabe");
    const source = input as Record<string, unknown>;
    const regionId = regionIdOf({ regionId: source.regionId });
    const title = cleanTitle(source.title);
    const description = typeof source.description === "string" ? source.description.trim() : "";
    if (description.length < 8 || description.length > 600) {
      throw new Error("Beschreibung braucht 8 bis 600 Zeichen");
    }
    const category = source.category;
    if (category !== "goods" && category !== "service" && category !== "sharing") {
      throw new Error("Kategorie fehlt");
    }
    const offerType = source.offerType;
    if (
      offerType !== "sell" && offerType !== "search" && offerType !== "gift" &&
      offerType !== "barter" && offerType !== "combined"
    ) throw new Error("Bitte Inseratstyp wählen");
    const terms = normalizeExchangeListing(
      offerType,
      source.exchangeTerms,
      source.karmaAdjustment,
    );
    if ((offerType === "barter" || offerType === "combined") && category === "sharing") {
      throw new Error("Direkter und kombinierter Tausch sind derzeit für Güter und Hilfen vorgesehen, nicht für Leihgeräte.");
    }
    const priceKarma = offerType === "gift" || offerType === "barter" || offerType === "combined"
      ? 0
      : typeof source.priceKarma === "number" ? Math.round(source.priceKarma) : -1;
    if (priceKarma < (offerType === "gift" ? 0 : 1) || priceKarma > 500) throw new Error("Karma zwischen 1 und 500");
    const what3wordsAddress = typeof source.what3wordsAddress === "string" ? source.what3wordsAddress.trim().replace(/^\/+/, "").slice(0, 100) : "";
    if (what3wordsAddress && !/^[a-zäöüß]+\.[a-zäöüß]+\.[a-zäöüß]+$/i.test(what3wordsAddress)) throw new Error("what3words-Adresse bitte im Format wort.wort.wort eingeben");
    const placeLabel =
      typeof source.placeLabel === "string" && source.placeLabel.trim()
        ? source.placeLabel.trim().slice(0, 60)
        : "In der Region";
    let imageDataUrl: string | null = null;
    if (typeof source.imageDataUrl === "string" && source.imageDataUrl.length > 0) {
      if (
        !source.imageDataUrl.startsWith("data:image/jpeg;base64,") ||
        source.imageDataUrl.length > 280_000
      ) {
        throw new Error("Foto zu groß oder im falschen Format");
      }
      imageDataUrl = source.imageDataUrl;
    }
    const lat = typeof source.lat === "number" ? source.lat : null;
    const lng = typeof source.lng === "number" ? source.lng : null;
    const itemUuid = typeof source.itemUuid === "string" && /^item-[a-z0-9-]{8,80}$/.test(source.itemUuid) ? source.itemUuid : null;
    return {
      regionId, title, description, category, offerType, priceKarma,
      exchangeTerms: terms.exchangeTerms,
      karmaAdjustment: terms.karmaAdjustment,
      placeLabel, imageDataUrl, lat, lng, what3wordsAddress, itemUuid,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const profile = await loadProfile(context.userId);
    if (!profile) throw new Error("Leg zuerst ein Profil an");
    if (!profile.isVerified) throw new Error("Bitte verifiziere zuerst dein Konto mit ID Austria.");
    if (profile.regionId !== data.regionId) throw new Error("Du inserierst in einer anderen Region");
    const regions = await loadRegions();
    const region = regions.find((item) => item.id === data.regionId);
    if (!region) throw new Error("Unbekannte Region");
    let lat = region.centerLat;
    let lng = region.centerLng;
    if (
      data.lat != null &&
      data.lng != null &&
      Math.abs(data.lat - region.centerLat) < 0.4 &&
      Math.abs(data.lng - region.centerLng) < 0.6
    ) {
      lat = data.lat;
      lng = data.lng;
    } else {
      let hash = 0;
      for (const char of data.title) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
      lat += (((hash % 100) - 50) / 50) * 0.02;
      lng += ((((hash >> 8) % 100) - 50) / 50) * 0.03;
    }
    const id = `lst-${crypto.randomUUID()}`;
    let handsCount = 0;
    const itemUuid = data.itemUuid ?? `item-${crypto.randomUUID()}`;
    if (data.itemUuid) {
      const owned = await sql.query<{ hands_count: number }>(
        `select l.hands_count from listings l where l.item_uuid = $1 and exists (
           select 1 from item_history h where h.item_uuid = l.item_uuid and h.owner_id = $2
             and h.id = (select max(h2.id) from item_history h2 where h2.item_uuid = l.item_uuid)
         ) order by l.created_at desc limit 1`, [data.itemUuid, context.userId]);
      if (!owned.length) throw new Error("Du bist laut Artikelhistorie nicht die aktuelle Station dieses Artikels.");
      handsCount = asNumber(owned[0].hands_count);
    }
    const images = data.imageDataUrl ? [data.imageDataUrl] : [];
    const assetKind = data.category === "sharing" ? "tool" : null;
    await sql.query(
      `insert into listings (
         id, user_id, region_id, title, description, category, offer_type, price_karma,
         exchange_terms, karma_adjustment, status, images, lat, lng, place_label,
         asset_kind, item_uuid, what3words_address, hands_count
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',$11::jsonb,$12,$13,$14,$15,$16,$17,$18)`,
      [
        id,
        context.userId,
        data.regionId,
        data.title,
        data.description,
        data.category,
        data.offerType,
        data.priceKarma,
        data.exchangeTerms,
        data.karmaAdjustment,
        JSON.stringify(images),
        lat,
        lng,
        data.placeLabel,
        assetKind,
        itemUuid,
        data.what3wordsAddress || null,
        handsCount,
      ],
    );
    await sql.query(`insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind) values ($1,$2,$3,$4,'listed')`, [itemUuid, id, context.userId, data.placeLabel]);
    return { id, itemUuid };
  });

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: string): ActionResult {
  return { ok: false, error };
}

export const tradeListing = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const verification = await sql.query<{ is_verified: boolean }>(`select is_verified from profiles where user_id = $1`, [context.userId]);
    if (!verification[0]?.is_verified) return fail("Bitte verifiziere zuerst dein Konto mit ID Austria.");
    const highValue = await sql.query<{ id: string; region_id: string; price_karma: number; user_id: string }>(
      `select l.id, l.region_id, l.price_karma, l.user_id from listings l
       join profiles buyer on buyer.user_id = $2 and buyer.region_id = l.region_id and buyer.karma_balance >= l.price_karma
       where l.id = $1 and l.status = 'active' and l.category in ('goods','service')
         and l.offer_type = 'sell' and l.price_karma >= 100 and l.user_id <> $2`,
      [data.id, context.userId]);
    if (highValue[0]) {
      const moderators = await sql.query<{ user_id: string }>(
        `select user_id from profiles where region_id = $1 and user_id <> $2 and user_id <> $3
         and is_verified = true and moderator_rank > 0 and last_active_at >= now() - interval '30 days'
         order by random() limit 1`, [highValue[0].region_id, context.userId, highValue[0].user_id]);
      if (!moderators[0]) return fail("Für dieses hochwertige Tauschgeschäft ist derzeit keine aktive verifizierte Moderation verfügbar.");
      const held = await sql.query(
        `with target as (select id from listings where id = $1 and status = 'active' for update),
         escrow as (insert into escrow_cases (id,listing_id,requester_id,moderator_id,reason)
           select $2,id,$3,$4,'Hochwertiges Tauschgeschäft' from target returning listing_id),
         reserved as (update listings set status = 'booked' where id = (select listing_id from escrow) returning id)
         select id from reserved`, [`esc-${crypto.randomUUID()}`, data.id, context.userId, moderators[0].user_id]);
      return held.length ? { ok: true } : fail("Dieses Inserat wurde inzwischen angefragt.");
    }
    const rows = await sql.query<{ id: number }>(
      `with ok as (
         select l.id, l.user_id as seller, l.region_id, l.price_karma, l.title, l.offer_type
         from listings l
         join profiles buyer on buyer.user_id = $2
         where l.id = $1
           and l.status = 'active'
           and l.category in ('goods', 'service')
           and l.offer_type in ('sell','gift')
           and l.user_id <> $2
           and (l.offer_type <> 'gift' or l.price_karma = 0)
           and buyer.region_id = l.region_id
           and buyer.karma_balance >= l.price_karma
       ),
       moved as (
         update profiles p
         set karma_balance = p.karma_balance + case
               when ok.offer_type = 'gift' and p.user_id = $2 then 1
               when ok.offer_type = 'gift' then 0
               when p.user_id = $2 then -ok.price_karma + 1
               else ok.price_karma
             end,
             last_activity_at = now()
         from ok
         where p.user_id = $2 or p.user_id = ok.seller
         returning p.user_id
       ),
       closed as (
         update listings l
         set status = 'completed'
         from ok
         where l.id = ok.id
           and (select count(*) from moved) = 2
         returning l.id
       )
       insert into ledger_entries (
         region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message
       )
       select ok.region_id,
         case when ok.offer_type = 'gift' then null else $2 end,
         case when ok.offer_type = 'gift' then $2 else ok.seller end,
         ok.id, greatest(ok.price_karma, 1),
         case when ok.offer_type = 'gift' then 'activity' else 'transfer' end,
         case when ok.offer_type = 'gift' then 'Aktivitäts-Karma für erfolgreiche Weitergabe: ' || ok.title else 'Tausch: ' || ok.title end
       from ok
       where exists (select 1 from closed)
       returning id::int as id`,
      [data.id, context.userId],
    );
    if (!rows.length) {
      return fail("Tausch nicht möglich. Prüfe Guthaben, Region und ob das Inserat noch frei ist.");
    }
    await sql.query(`insert into ledger_entries (region_id, receiver_id, listing_id, amount_karma, entry_kind, message)
      select region_id, $2, id, 1, 'activity', 'Aktivitätsbonus für erfolgreiche Weitergabe: ' || title from listings where id = $1 and offer_type <> 'gift'`, [data.id, context.userId]);
    await sql.query(`update listings set hands_count = hands_count + 1 where id = $1`, [data.id]);
    await sql.query(`insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind)
      select item_uuid, id, $2, place_label, case when offer_type = 'gift' then 'gifted' else 'transferred' end
      from listings where id = $1`, [data.id, context.userId]);
    return { ok: true };
  });


function requestTradeDescription(value: unknown): string {
  return normalizeTradeOffer(value);
}

export const createTradeRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    if (!input || typeof input !== "object") throw new Error("Ungültige Eingabe");
    const offeredDescription = requestTradeDescription((input as Record<string, unknown>).offeredDescription);
    return { id, offeredDescription };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const verification = await sql.query<{ is_verified: boolean }>(
      `select is_verified from profiles where user_id = $1`, [context.userId]);
    if (!verification[0]?.is_verified) return fail("Bitte verifiziere zuerst dein Konto mit ID Austria.");

    const tradeId = `trd-${crypto.randomUUID()}`;
    try {
      const rows = await sql.query<{ id: string }>(
        `with target as materialized (
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
         select c.id from created c join held h on h.id = c.listing_id`,
        [data.id, context.userId, tradeId, data.offeredDescription],
      );
      if (!rows.length) {
        return fail("Tauschvorschlag nicht möglich. Prüfe Region, Guthaben und Verfügbarkeit des Inserats.");
      }
      return { ok: true };
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (code === "23505") return fail("Für dieses Inserat liegt bereits ein offener Tauschvorschlag vor.");
      throw err;
    }
  });

export const getTradeRequests = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<TradeRequest[]> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `select tr.id, tr.listing_id as "listingId", tr.requester_id as "requesterId",
         tr.owner_id as "ownerId", requester.username as "requesterName",
         owner.username as "ownerName", tr.offered_description as "offeredDescription",
         tr.karma_amount as "karmaAmount", tr.status,
         tr.requester_confirmed as "requesterConfirmed",
         tr.owner_confirmed as "ownerConfirmed",
         to_char(tr.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
       from trade_requests tr
       join profiles requester on requester.user_id = tr.requester_id
       join profiles owner on owner.user_id = tr.owner_id
       where tr.listing_id = $1 and (tr.requester_id = $2 or tr.owner_id = $2)
       order by tr.created_at desc
       limit 10`,
      [data.id, context.userId],
    );
    return rows.map((row) => ({
      id: asString(row.id),
      listingId: asString(row.listingId),
      requesterId: asString(row.requesterId),
      ownerId: asString(row.ownerId),
      requesterName: asString(row.requesterName),
      ownerName: asString(row.ownerName),
      offeredDescription: asString(row.offeredDescription),
      karmaAmount: asNumber(row.karmaAmount),
      status: asString(row.status) as TradeRequest["status"],
      requesterConfirmed: row.requesterConfirmed === true || row.requesterConfirmed === "true",
      ownerConfirmed: row.ownerConfirmed === true || row.ownerConfirmed === "true",
      createdAt: asString(row.createdAt),
    }));
  });

export const transitionTradeRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const action = input && typeof input === "object" && "action" in input
      ? (input as { action: unknown }).action : "";
    if (action !== "accept" && action !== "reject" && action !== "cancel" && action !== "dispute") {
      throw new Error("Unbekannter Tauschschritt");
    }
    return { id, action };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const rows = await sql.query<{ status: string }>(
      `with target as materialized (
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
       select c.status from changed c join listing_state l on l.id = c.listing_id`,
      [data.id, context.userId, data.action],
    );
    if (!rows.length) return fail("Dieser Tauschschritt ist nicht mehr möglich oder du bist nicht beteiligt.");
    return { ok: true };
  });

export const confirmTradeRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `with target as materialized (
         select tr.id, tr.listing_id, tr.region_id, tr.requester_id, tr.owner_id,
           tr.karma_amount, l.item_uuid, l.place_label, tr.status
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
         set requester_confirmed = tr.requester_confirmed or tr.requester_id = $2,
             owner_confirmed = tr.owner_confirmed or tr.owner_id = $2,
             updated_at = now()
         from target t join wallet_check wc on wc.id = t.id
         where tr.id = t.id and wc.ok
         returning tr.id, tr.listing_id, tr.region_id, tr.requester_id, tr.owner_id,
           tr.karma_amount, tr.requester_confirmed, tr.owner_confirmed,
           t.item_uuid, t.place_label
       ),
       ready as materialized (
         select * from confirmed where requester_confirmed and owner_confirmed
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
       completed as (
         update trade_requests tr
         set status = 'completed', resolved_at = now(), updated_at = now()
         from ready r
         where tr.id = r.id
           and (r.karma_amount = 0 or (select count(*) from wallet_move) = 2)
         returning tr.id, tr.listing_id, tr.region_id, tr.requester_id, tr.owner_id,
           tr.karma_amount, r.item_uuid, r.place_label
       ),
       ledger as (
         insert into ledger_entries (
           region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message
         )
         select c.region_id, c.requester_id, c.owner_id, c.listing_id,
           c.karma_amount, 'transfer', 'Kreislauf-Tausch mit Karma-Ausgleich'
         from completed c where c.karma_amount > 0
         returning id
       ),
       history as (
         insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind)
         select c.item_uuid, c.listing_id, c.requester_id, c.place_label, 'transferred'
         from completed c
         returning id
       ),
       listing_done as (
         update listings l set status = 'completed', hands_count = hands_count + 1
         from completed c where l.id = c.listing_id
         returning l.id
       )
       select c.id, c.status
       from confirmed c
       left join completed done on done.id = c.id`,
      [data.id, context.userId],
    );
    if (!rows.length) {
      return fail("Bestätigung nicht möglich. Prüfe Beteiligung, Status und verfügbares Karma.");
    }
    if (rows[0].status === "completed") return { ok: true };
    return { ok: true };
  });
export const reserveListing = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const source = input as Record<string, unknown>;
    const startsAt = typeof source.startsAt === "string" ? source.startsAt : "";
    const endsAt = typeof source.endsAt === "string" ? source.endsAt : "";
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Zeitfenster fehlt");
    }
    const hours = (end.getTime() - start.getTime()) / 36e5;
    if (hours < 1 || hours > 24 * 14) throw new Error("Buchung zwischen 1 Stunde und 14 Tagen");
    return { id, startsAt: start.toISOString(), endsAt: end.toISOString() };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const verification = await sql.query<{ is_verified: boolean }>(`select is_verified from profiles where user_id = $1`, [context.userId]);
    if (!verification[0]?.is_verified) return fail("Bitte verifiziere zuerst dein Konto mit ID Austria.");
    const id = `bkg-${crypto.randomUUID()}`;
    const rows = await sql.query<{ id: string }>(
      `with target as (
         select l.id, l.user_id, l.price_karma
         from listings l
         join profiles renter on renter.user_id = $2 and renter.region_id = l.region_id
         where l.id = $1
           and l.status = 'active'
           and l.category = 'sharing'
           and l.offer_type in ('sell','gift')
           and l.user_id <> $2
         for update of l
       ),
       ins as (
         insert into bookings (
           id, listing_id, renter_id, owner_id, starts_at, ends_at, status, amount_karma
         )
         select $3, t.id, $2, t.user_id, $4::timestamptz, $5::timestamptz, 'reserved',
           greatest(1, ceil(extract(epoch from ($5::timestamptz - $4::timestamptz)) / 86400.0)::int) * t.price_karma
         from target t
         returning id
       )
       update listings
       set status = 'booked'
       where id = (select id from target)
         and exists (select 1 from ins)
       returning id`,
      [data.id, context.userId, id, data.startsAt, data.endsAt],
    );
    if (!rows.length || !rows[0]?.id) {
      return fail("Reservierung nicht möglich. Die Flotte ist belegt oder du bist in der falschen Region.");
    }
    const moderators = await sql.query<{ user_id: string }>(
      `select user_id from profiles where region_id = (select region_id from listings where id = $1)
       and is_verified = true and moderator_rank > 0 and last_active_at >= now() - interval '30 days'
       and user_id <> $2 order by random() limit 1`, [data.id, context.userId]);
    await sql.query(`insert into escrow_cases (id, listing_id, booking_id, moderator_id, reason)
      select $1,$2,$3,$4,'Treuhand für Sharing-Reservierung'`, [`esc-${crypto.randomUUID()}`, data.id, id, moderators[0]?.user_id ?? null]);
    return { ok: true };
  });

export const transitionBooking = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const action =
      input && typeof input === "object" && "action" in input
        ? (input as { action: unknown }).action
        : "";
    if (action !== "handover" && action !== "return" && action !== "cancel") {
      throw new Error("Unbekannter Schritt");
    }
    return { id, action };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    if (data.action === "cancel") {
      const rows = await sql.query(
        `with b as (
           select id, listing_id from bookings
           where id = $1 and status = 'reserved' and (renter_id = $2 or owner_id = $2)
           for update
         ),
         upd as (
           update bookings set status = 'cancelled'
           where id = (select id from b)
           returning listing_id
         )
         update listings set status = 'active'
         where id = (select listing_id from upd)
         returning id`,
        [data.id, context.userId],
      );
      return rows.length ? { ok: true } : fail("Storno nur solange noch nichts übergeben wurde.");
    }
    if (data.action === "return") {
      const rows = await sql.query(
        `with b as (
           select id, listing_id from bookings
           where id = $1 and status = 'handed_over' and (renter_id = $2 or owner_id = $2)
           for update
         ),
         upd as (
           update bookings set status = 'returned'
           where id = (select id from b)
           returning listing_id
         )
         update listings set status = 'active'
         where id = (select listing_id from upd)
         returning id`,
        [data.id, context.userId],
      );
      return rows.length ? { ok: true } : fail("Rückgabe erst nach der Übergabe.");
    }
    const rows = await sql.query(
      `with b as (
         select * from bookings
         where id = $1 and status = 'reserved' and (renter_id = $2 or owner_id = $2)
         for update
       ),
       payer as (
         select p.user_id
         from profiles p
         join b on b.renter_id = p.user_id
         where p.karma_balance >= b.amount_karma
         for update of p
       ),
       moved as (
         update profiles p
         set karma_balance = p.karma_balance + case
               when p.user_id = b.renter_id then -b.amount_karma + 1
               else b.amount_karma
             end,
             last_activity_at = now()
         from b
         where exists (select 1 from payer)
           and (p.user_id = b.renter_id or p.user_id = b.owner_id)
         returning p.user_id
       ),
       upd as (
         update bookings set status = 'handed_over'
         where id = (select id from b)
           and (select count(*) from moved) = 2
         returning id, listing_id, amount_karma, renter_id, owner_id
       )
       insert into ledger_entries (
         region_id, sender_id, receiver_id, listing_id, booking_id, amount_karma, entry_kind, message
       )
       select l.region_id,
         case when upd.amount_karma = 0 then null else upd.renter_id end,
         case when upd.amount_karma = 0 then upd.renter_id else upd.owner_id end,
         upd.listing_id, upd.id, greatest(upd.amount_karma, 1),
         case when upd.amount_karma = 0 then 'activity' else 'transfer' end,
         case when upd.amount_karma = 0 then 'Aktivitäts-Karma für kostenlose Übernahme: ' || l.title else 'Flotte: ' || l.title end
       from upd
       join listings l on l.id = upd.listing_id
       returning ledger_entries.id`,
      [data.id, context.userId],
    );
    if (!rows.length) return fail("Übergabe nicht möglich. Reservierung, Berechtigung oder Karma passen nicht.");
    await sql.query(`insert into ledger_entries (region_id, receiver_id, listing_id, booking_id, amount_karma, entry_kind, message)
      select l.region_id,b.renter_id,l.id,b.id,1,'activity','Aktivitätsbonus für erfolgreiche Übergabe: ' || l.title
      from bookings b join listings l on l.id = b.listing_id where b.id = $1 and b.amount_karma > 0`, [data.id]);
    await sql.query(`update listings set hands_count = hands_count + 1 where id = (select listing_id from bookings where id = $1)`, [data.id]);
    await sql.query(`insert into item_history (item_uuid,listing_id,owner_id,place_label,event_kind)
      select l.item_uuid,l.id,b.owner_id,l.place_label,case when l.category = 'sharing' then 'loaned' when b.amount_karma = 0 then 'gifted' else 'transferred' end
      from bookings b join listings l on l.id = b.listing_id where b.id = $1`, [data.id]);
    return { ok: true };
  });

export const addReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    if (!input || typeof input !== "object") throw new Error("Ungültige Eingabe");
    const source = input as Record<string, unknown>;
    const score = (key: string) => {
      const value = source[key];
      if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
        throw new Error("Bewertung von 1 bis 5");
      }
      return value;
    };
    const note = typeof source.note === "string" ? source.note.trim().slice(0, 240) : "";
    return {
      id,
      punctuality: score("punctuality"),
      itemCondition: score("itemCondition"),
      reliability: score("reliability"),
      note,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const parties = await sql.query<{ seller: string; buyer: string }>(
      `select receiver_id as seller, sender_id as buyer
       from ledger_entries
       where listing_id = $1 and entry_kind = 'transfer' and sender_id is not null and receiver_id is not null
       order by id desc
       limit 1`,
      [data.id],
    );
    const bookingParties = await sql.query<{ ownerId: string; renterId: string }>(
      `select owner_id as "ownerId", renter_id as "renterId"
       from bookings
       where listing_id = $1 and status = 'returned'
         and (owner_id = $2 or renter_id = $2)
       order by created_at desc
       limit 1`,
      [data.id, context.userId],
    );
    let subjectId: string | null = null;
    const deal = parties[0];
    if (deal && (deal.buyer === context.userId || deal.seller === context.userId)) {
      subjectId = deal.buyer === context.userId ? deal.seller : deal.buyer;
    }
    const booking = bookingParties[0];
    if (!subjectId && booking) {
      subjectId = booking.ownerId === context.userId ? booking.renterId : booking.ownerId;
    }
    if (!subjectId) return fail("Bewerten geht nach abgeschlossenem Tausch oder Rückgabe.");
    try {
      await sql.query(
        `insert into reviews (
           id, listing_id, reviewer_id, subject_id, punctuality, item_condition, reliability, note
         ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          `rev-${crypto.randomUUID()}`,
          data.id,
          context.userId,
          subjectId,
          data.punctuality,
          data.itemCondition,
          data.reliability,
          data.note,
        ],
      );
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (code === "23505") return fail("Du hast dieses Inserat schon bewertet.");
      console.error(err);
      return fail("Bewertung hat nicht geklappt.");
    }
    return { ok: true };
  });

export type DemurrageCut = { userId: string; username: string; cut: number };

export const runDemurrage = createServerFn({ method: "POST" }).handler(async (): Promise<DemurrageCut[]> => {
  const sql = await getSql();
  const rows = await sql.query<Row>(
    `with applied as (
       select affected_user, cut_amount from apply_demurrage()
     )
     select a.affected_user as "userId", a.cut_amount::int as cut, p.username
     from applied a
     join profiles p on p.user_id = a.affected_user`,
  );
  return rows.map((row) => ({
    userId: asString(row.userId),
    username: asString(row.username),
    cut: asNumber(row.cut),
  }));
});


/** ID Austria mock callback. Live OIDC must be completed server-side by the configured A-Trust client. */
export const verifyWithIdAustria = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ verified: boolean; mode: "mock" | "live" }> => {
    const mockMode = process.env.ID_AUSTRIA_MOCK_MODE === "true";
    if (!mockMode) throw new Error("ID Austria Live-Verifikation ist noch nicht konfiguriert. Der OIDC-Client benötigt die offiziellen A-Trust-Zugangsdaten und Callback-Freigabe.");
    const sql = await getSql();
    await sql.query(`update profiles set is_verified = true, last_active_at = now(), last_activity_at = now() where user_id = $1`, [context.userId]);
    return { verified: true, mode: "mock" };
  });


export const getMeetingPoint = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<{ url: string | null }> => {
    const sql = await getSql();
    const rows = await sql.query<{ what3words_address: string | null }>(
      `select l.what3words_address from listings l
       where l.id = $1 and (
         exists (select 1 from bookings b where b.listing_id = l.id
           and b.status in ('reserved','handed_over') and (b.renter_id = $2 or b.owner_id = $2))
         or exists (select 1 from escrow_cases e where e.listing_id = l.id and e.status in ('pending','released')
           and (e.requester_id = $2 or l.user_id = $2))
       )`, [data.id, context.userId]);
    const address = rows[0]?.what3words_address;
    return { url: address ? `https://what3words.com/${address.replace(/^\/+/, "")}` : null };
  });


export const releaseEscrow = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const highValue = await sql.query<{ id: string }>(
      `select id from escrow_cases where listing_id = $1 and moderator_id = $2
       and status = 'pending' and reason = 'Hochwertiges Tauschgeschäft'`, [data.id, context.userId]);
    if (highValue.length) {
      const completed = await sql.query(
        `with c as materialized (
           select ec.id as escrow_id, ec.listing_id, ec.requester_id, l.user_id as seller,
             l.region_id, l.price_karma, l.title, l.item_uuid, l.place_label
           from escrow_cases ec join listings l on l.id = ec.listing_id
           join profiles mod on mod.user_id = ec.moderator_id
           where ec.listing_id = $1 and ec.moderator_id = $2 and ec.status = 'pending'
             and ec.reason = 'Hochwertiges Tauschgeschäft' and l.status = 'booked'
             and mod.is_verified = true and mod.moderator_rank > 0
             and mod.last_active_at >= now() - interval '30 days'
           for update of ec, l
         ),
         moved as (
           update profiles p set karma_balance = p.karma_balance +
             case when p.user_id = c.requester_id then -c.price_karma + 1 else c.price_karma end,
             last_activity_at = now()
           from c where (p.user_id = c.requester_id or p.user_id = c.seller)
             and exists (select 1 from profiles buyer where buyer.user_id = c.requester_id and buyer.karma_balance >= c.price_karma)
           returning p.user_id
         ),
         closed as (
           update listings l set status = 'completed', hands_count = hands_count + 1
           from c where l.id = c.listing_id and (select count(*) from moved) = 2 returning l.id
         ),
         transfer_log as (
           insert into ledger_entries (region_id,sender_id,receiver_id,listing_id,amount_karma,entry_kind,message)
           select c.region_id,c.requester_id,c.seller,c.listing_id,c.price_karma,'transfer','Treuhand-Tausch: ' || c.title
           from c where exists (select 1 from closed) returning id
         ),
         bonus_log as (
           insert into ledger_entries (region_id,receiver_id,listing_id,amount_karma,entry_kind,message)
           select c.region_id,c.requester_id,c.listing_id,1,'activity','Aktivitätsbonus für erfolgreiche Weitergabe: ' || c.title
           from c where exists (select 1 from closed) returning id
         ),
         history_log as (
           insert into item_history (item_uuid,listing_id,owner_id,place_label,event_kind)
           select c.item_uuid,c.listing_id,c.requester_id,c.place_label,'transferred'
           from c where exists (select 1 from closed) returning id
         ),
         resolved as (
           update escrow_cases set status = 'released', resolved_at = now()
           where id in (select escrow_id from c) and exists (select 1 from closed) returning id
         ) select id from resolved`, [data.id, context.userId]);
      return completed.length ? { ok: true } : fail("Treuhand-Freigabe nicht möglich. Guthaben oder Status prüfen.");
    }
    const rows = await sql.query(
      `update escrow_cases set status = 'released', resolved_at = now()
       where listing_id = $1 and moderator_id = $2 and status = 'pending'
         and exists (select 1 from profiles p where p.user_id = $2 and p.is_verified = true and p.moderator_rank > 0 and p.last_active_at >= now() - interval '30 days')
       returning id`, [data.id, context.userId]);
    return rows.length ? { ok: true } : fail("Keine offene Treuhand für dich zugeordnet.");
  });
