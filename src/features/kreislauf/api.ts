import { createServerFn } from "@tanstack/react-start";
import { del, put } from "@vercel/blob";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { approximatePublicCoordinates } from "./geo-privacy";
import { assertOwnedListingImageUrl } from "./media";
import { canUseIdAustriaMock } from "./id-austria-mode";
import {
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
} from "./types";

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
    status: asString(row.status, "active") as ListingStatus,
    images: asImages(row.images),
    videoUrls: asImages(row.videoUrls),
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
    l.price_karma as "priceKarma", l.status, l.images, l.video_urls as "videoUrls", round(l.lat::numeric, 2)::float8 as lat, round(l.lng::numeric, 2)::float8 as lng,
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
      sql.query<Row>(`${LISTING_SQL} where l.region_id = $1 and l.status not in ('maintenance', 'paused') order by l.created_at desc`, [region.id]),
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
      sql.query<Row>(
        `select e.id::int as id, e.amount_karma as "amountKarma", e.entry_kind as "entryKind",
          case
            when e.entry_kind = 'mint' then 'Startguthaben der Region'
            when e.entry_kind = 'demurrage' then 'Umlaufsicherung'
            else 'Karma-Bewegung'
          end as message,
          to_char(e.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
          case when e.sender_id is null then null else 'Mitglied' end as "senderName",
          case when e.receiver_id is null then null else 'Mitglied' end as "receiverName",
          null::text as "listingTitle"
         from ledger_entries e
         where e.region_id = $1
         order by e.id desc limit 12`,
        [region.id],
      ),
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
    const listingRows = await sql.query<Row>(
      `${LISTING_SQL} where l.id = $1 and l.status not in ('maintenance', 'paused')`,
      [data.id],
    );
    const listing = listingRows[0] ? mapListing(listingRows[0]) : null;
    if (!listing) return null;
    const [historyRows, escrowRows, reviewRows] = await Promise.all([
      sql.query<Row>(
        `select h.place_label as "placeLabel", h.event_kind as "eventKind",
           to_char(h.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
         from item_history h where h.item_uuid = $1 order by h.created_at desc limit 8`,
        [listing.itemUuid],
      ),
      sql.query<Row>(`select id from escrow_cases where listing_id = $1 and status in ('pending', 'disputed', 'released', 'refunded') limit 1`, [listing.id]),
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
    // Private booking data is loaded separately by the authenticated booking endpoint.
    const booking: Booking | null = null;
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
    return { listing, booking, reviews, history, escrowVisible: escrowRows.length > 0 };
  });

export const getProviderListings = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id"), excludeId: idOf(input, "excludeId") }))
  .handler(async ({ data }): Promise<Listing[]> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `${LISTING_SQL}
       where l.user_id = (select user_id from listings where id = $1)
         and l.id <> $2 and l.status = 'active'
       order by l.created_at desc
       limit 8`,
      [data.id, data.excludeId],
    );
    return rows.map(mapListing);
  });

export const getListingBooking = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<Booking | null> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `select b.id, b.listing_id as "listingId", b.renter_id as "renterId", b.owner_id as "ownerId",
         renter.username as "renterName", owner.username as "ownerName",
         to_char(b.starts_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "startsAt",
         to_char(b.ends_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "endsAt",
         b.status, b.amount_karma as "amountKarma",
         (b.renter_handover_at is not null) as "renterConfirmed",
         (b.owner_handover_at is not null) as "ownerConfirmed",
         (b.renter_return_at is not null) as "renterReturned",
         (b.owner_return_at is not null) as "ownerReturned"
       from bookings b
       join profiles renter on renter.user_id = b.renter_id
       join profiles owner on owner.user_id = b.owner_id
       where b.listing_id = $1 and b.status <> 'cancelled'
         and (b.renter_id = $2 or b.owner_id = $2)
       order by b.created_at desc
       limit 1`,
      [data.id, context.userId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: asString(row.id),
      listingId: asString(row.listingId),
      renterId: asString(row.renterId),
      ownerId: asString(row.ownerId),
      renterName: asString(row.renterName),
      ownerName: asString(row.ownerName),
      startsAt: asString(row.startsAt),
      endsAt: asString(row.endsAt),
      status: asString(row.status) as BookingStatus,
      amountKarma: asNumber(row.amountKarma),
      renterConfirmed: row.renterConfirmed === true,
      ownerConfirmed: row.ownerConfirmed === true,
      renterReturned: row.renterReturned === true,
      ownerReturned: row.ownerReturned === true,
    };
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
    // Profile creation and its initial regional Karma mint must commit together.
    // If either insert fails, the single SQL statement rolls both back; retries
    // cannot leave a profile without its matching ledger entry.
    await sql.query(
      `with created_profile as (
         insert into profiles (user_id, username, region_id, karma_balance, last_active_at)
         select $1, $2, id, $3, now() from regions where id = $4
         on conflict (user_id) do nothing
         returning user_id, region_id
       )
       insert into ledger_entries (region_id, sender_id, receiver_id, amount_karma, entry_kind, message)
       select region_id, null, user_id, $3, 'mint', 'Startguthaben der Region'
       from created_profile`,
      [context.userId, data.username, WELCOME_KARMA, data.regionId],
    );
    await sql.query(`update profiles set last_active_at = now() where user_id = $1`, [context.userId]);
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

export const getMyListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Listing[]> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `${LISTING_SQL}
       where l.user_id = $1 and l.status in ('active', 'paused', 'completed', 'booked')
       order by l.created_at desc
       limit 50`,
      [context.userId],
    );
    return rows.map(mapListing);
  });
export const setRegion = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ regionId: regionIdOf(input) }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<Profile> => {
    const sql = await getSql();
    // Karma and ledger entries belong to a region. Moving a profile without a
    // reviewed balance-transfer workflow would silently move regional supply
    // and could strand active listings/bookings in the old region.
    const current = await sql.query<{ region_id: string }>(
      "select region_id from profiles where user_id = $1 for update",
      [context.userId],
    );
    if (!current.length) throw new Error("Noch kein Profil");
    if (current[0].region_id !== data.regionId) {
      throw new Error("Ein Regionswechsel ist derzeit gesperrt, weil Karma und laufende Tauschvorgänge regional gebunden sind.");
    }
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
    if (lat != null && (!Number.isFinite(lat) || lng == null || !Number.isFinite(lng))) {
      throw new Error("Standort ist ungültig");
    }
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
      placeLabel: asString(row.placeLabel), imageUrl: images[0] ?? null };
  });

async function storeListingImages(userId: string, imageDataUrls: string[]): Promise<string[]> {
  const uploaded: string[] = [];
  try {
    for (const image of imageDataUrls) {
      const encoded = image.slice("data:image/jpeg;base64,".length);
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length < 4 || bytes.length > 210_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        throw new Error("Ein Foto ist keine gültige JPEG-Datei oder überschreitet die Größenbegrenzung.");
      }
      const blob = await put("listings/" + encodeURIComponent(userId) + "/" + crypto.randomUUID() + ".jpg", bytes, {
        access: "public", contentType: "image/jpeg", addRandomSuffix: true, cacheControlMaxAge: 60 * 60 * 24 * 30,
      });
      uploaded.push(blob.url);
    }
    return uploaded;
  } catch (error) {
    if (uploaded.length > 0) { try { await del(uploaded); } catch { /* preserve original error */ } }
    throw error;
  }
}
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
    if (offerType !== "sell" && offerType !== "search" && offerType !== "gift") throw new Error("Bitte Inseratstyp wählen");
    const rawPrice = typeof source.priceKarma === "number" && Number.isFinite(source.priceKarma) ? source.priceKarma : -1;
    const priceKarma = offerType === "gift" ? 0 : Math.round(rawPrice);
    if (priceKarma < (offerType === "gift" ? 0 : 1) || priceKarma > 500) throw new Error("Karma zwischen 1 und 500");
    const what3wordsAddress = typeof source.what3wordsAddress === "string" ? source.what3wordsAddress.trim().replace(/^\/+/, "").slice(0, 100) : "";
    if (what3wordsAddress && !/^[a-zäöüß]+\.[a-zäöüß]+\.[a-zäöüß]+$/i.test(what3wordsAddress)) throw new Error("what3words-Adresse bitte im Format wort.wort.wort eingeben");
    const placeLabel =
      typeof source.placeLabel === "string" && source.placeLabel.trim()
        ? source.placeLabel.trim().slice(0, 60)
        : "In der Region";
    const rawImages = Array.isArray(source.imageDataUrls)
      ? source.imageDataUrls
      : typeof source.imageDataUrl === "string" && source.imageDataUrl.length > 0
        ? [source.imageDataUrl]
        : [];
    if (rawImages.length > 4) throw new Error("Maximal 4 Fotos pro Inserat");
    const imageDataUrls = rawImages.map((image) => {
      if (typeof image !== "string" || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image) || image.length > 280_000) {
        throw new Error("Ein Foto ist zu groß oder im falschen Format");
      }
      return image;
    });
    if (imageDataUrls.reduce((total, image) => total + image.length, 0) > 1_000_000) {
      throw new Error("Alle Fotos zusammen dürfen maximal 1 MB groß sein. Bitte wähle kleinere Bilder.");
    }
    const rawExistingImageUrls = Array.isArray(source.existingImageUrls) ? source.existingImageUrls : [];
    if (rawExistingImageUrls.length > 4 || imageDataUrls.length + rawExistingImageUrls.length > 4) {
      throw new Error("Maximal 4 Fotos pro Inserat");
    }
    const existingImageUrls = rawExistingImageUrls.map((value) => {
      if (typeof value !== "string") throw new Error("Ungültige Bildadresse");
      let parsed: URL;
      try { parsed = new URL(value); } catch { throw new Error("Ungültige Bildadresse"); }
      if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
        throw new Error("Nur eigene, gespeicherte Inseratbilder können übernommen werden.");
      }
      return value;
    });
    const rawVideoUrls = Array.isArray(source.videoUrls) ? source.videoUrls : [];
    // Upload is deliberately disabled until the server inspects the real media
    // container. Never trust client-supplied durations or accept a guessed public
    // Blob URL: otherwise a caller could bypass the disabled upload endpoint.
    if (rawVideoUrls.length > 0) {
      throw new Error("Video-Uploads sind noch gesperrt. Bitte vorerst Fotos verwenden.");
    }
    const videoPreset = source.videoPreset === "pair" || source.videoPreset === "quad" ? source.videoPreset : "single";
    const videoDurations: number[] = [];
    const videoUrls: string[] = [];
    const lat = typeof source.lat === "number" ? source.lat : null;
    const lng = typeof source.lng === "number" ? source.lng : null;
    const itemUuid = typeof source.itemUuid === "string" && /^item-[a-z0-9-]{8,80}$/.test(source.itemUuid) ? source.itemUuid : null;
    return { regionId, title, description, category, offerType, priceKarma, placeLabel, imageDataUrls, existingImageUrls, videoUrls, videoPreset, videoDurations, lat, lng, what3wordsAddress, itemUuid };
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
    const id = `lst-${crypto.randomUUID()}`;
    const publicPoint = approximatePublicCoordinates(
      { lat: region.centerLat, lng: region.centerLng },
      data.lat != null && data.lng != null ? { lat: data.lat, lng: data.lng } : null,
      id,
    );
    const lat = publicPoint.lat;
    const lng = publicPoint.lng;
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
    if (process.env.VERCEL_ENV === "production" && !process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      throw new Error("Der Medien-Speicher ist noch nicht eingerichtet. Das Inserat wurde nicht gespeichert.");
    }
    for (const imageUrl of data.existingImageUrls) {
      assertOwnedListingImageUrl(imageUrl, context.userId);
    }
    if (data.existingImageUrls.length > 0 && !process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      throw new Error("Gespeicherte Fotos können erst übernommen werden, wenn der Medien-Speicher eingerichtet ist.");
    }
    const newImages = process.env.BLOB_READ_WRITE_TOKEN?.trim()
      ? await storeListingImages(context.userId, data.imageDataUrls)
      : data.imageDataUrls;
    const images = [...data.existingImageUrls, ...newImages];
    for (const videoUrl of data.videoUrls) {
      const pathname = new URL(videoUrl).pathname;
      if (!pathname.includes(`/listings/${encodeURIComponent(context.userId)}/`)) throw new Error("Dieses Video gehört nicht zu deinem Konto.");
    }
    const assetKind = data.category === "sharing" ? "tool" : null;
    // One SQL statement makes the listing and its ownership-history event atomic:
    // either both rows commit, or neither row is persisted.
    try {
      await sql.query(
        `with created_listing as (
           insert into listings (
             id, user_id, region_id, title, description, category, offer_type, price_karma, status,
             images, video_urls, lat, lng, place_label, asset_kind, item_uuid, what3words_address, hands_count
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15,$16,$17)
           returning id
         )
         insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind)
         select $15, id, $2, $13, 'listed' from created_listing
         returning listing_id`,
        [
          id,
          context.userId,
          data.regionId,
          data.title,
          data.description,
          data.category,
          data.offerType,
          data.priceKarma,
          JSON.stringify(images),
          JSON.stringify(data.videoUrls),
          lat,
          lng,
          data.placeLabel,
          assetKind,
          itemUuid,
          data.what3wordsAddress || null,
          handsCount,
        ],
      );
    } catch (error) {
      if (process.env.BLOB_READ_WRITE_TOKEN?.trim() && newImages.length > 0) {
        try { await del(newImages); } catch { /* preserve database error */ }
      }
      throw error;
    }
    return { id, itemUuid };
  });

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: string): ActionResult {
  return { ok: false, error };
}

export const setListingAvailability = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const action = input && typeof input === "object" && "action" in input
      ? (input as { action: unknown }).action
      : null;
    if (action !== "pause" && action !== "resume") throw new Error("Ungültige Aktion");
    return { id, action };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const fromStatus = data.action === "pause" ? "active" : "paused";
    const toStatus = data.action === "pause" ? "paused" : "active";
    const changed = await sql.query<{ id: string }>(
      `update listings
       set status = $3
       where id = $1 and user_id = $2 and status = $4
       returning id`,
      [data.id, context.userId, toStatus, fromStatus],
    );
    if (!changed.length) return fail("Das Inserat ist nicht mehr verfügbar oder gehört nicht zu deinem Konto.");
    return { ok: true };
  });

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
         order by random() limit 7`, [highValue[0].region_id, context.userId, highValue[0].user_id]);
      if (moderators.length < 4) return fail("Für die Treuhand müssen mindestens vier aktive, verifizierte Moderationspersonen verfügbar sein.");
      const held = await sql.query(
        `with target as materialized (
           select l.id, l.user_id as seller_id, l.region_id, l.price_karma, l.title
           from listings l
           join profiles buyer on buyer.user_id = $3 and buyer.region_id = l.region_id
           where l.id = $1 and l.status = 'active' and l.category in ('goods','service')
             and l.offer_type = 'sell' and l.price_karma >= 100 and l.user_id <> $3
           for update of l
         ),
         locked_profiles as materialized (
           select p.user_id, p.karma_balance
           from profiles p join target t on p.user_id = $3 or p.user_id = t.seller_id
           order by p.user_id for update of p
         ),
         eligible as materialized (
           select t.* from target t
           where (select count(*) from locked_profiles) = 2
             and (select karma_balance from locked_profiles where user_id = $3) >= t.price_karma
         ),
         escrow as (
           insert into escrow_cases
             (id,listing_id,requester_id,moderator_id,reason,buyer_id,seller_id,region_id,amount_karma,funds_status)
           select $2,e.id,$3,$4,'Hochwertiges Tauschgeschäft',$3,e.seller_id,e.region_id,e.price_karma,'held'
           from eligible e
           returning id,listing_id,buyer_id,region_id,amount_karma
         ),
         debited as (
           update profiles p set karma_balance = p.karma_balance - e.amount_karma, last_activity_at = now()
           from escrow e where p.user_id = e.buyer_id and p.karma_balance >= e.amount_karma
           returning p.user_id
         ),
         hold_log as (
           insert into ledger_entries(region_id,sender_id,listing_id,amount_karma,entry_kind,message)
           select e.region_id,e.buyer_id,e.listing_id,e.amount_karma,'escrow_hold',
             'Karma für hochwertige Treuhand reserviert: ' || (select title from target)
           from escrow e join debited d on d.user_id = e.buyer_id
           returning id
         ),
         reserved as (
           update listings l set status = 'booked'
           from escrow e, hold_log h
           where l.id = e.listing_id and l.status = 'active'
           returning l.id
         )
         select id from reserved`,
        [data.id, `esc-${crypto.randomUUID()}`, context.userId, moderators[0].user_id]);
      return held.length ? { ok: true } : fail("Dieses Inserat wurde inzwischen angefragt.");
    }
    const rows = await sql.query<{ id: number }>(
      `with target as materialized (
         select l.id, l.user_id as seller, l.region_id, l.price_karma, l.title, l.offer_type
         from listings l
         join profiles buyer on buyer.user_id = $2 and buyer.region_id = l.region_id
         where l.id = $1
           and l.status = 'active'
           and l.category in ('goods', 'service')
           and l.offer_type in ('sell','gift')
           and l.user_id <> $2
           and (l.offer_type <> 'gift' or l.price_karma = 0)
         for update of l
       ),
       locked_profiles as materialized (
         select p.user_id, p.karma_balance
         from profiles p
         join target t on p.user_id = $2 or p.user_id = t.seller
         order by p.user_id
         for update of p
       ),
       eligible as materialized (
         select t.*
         from target t
         where (select count(*) from locked_profiles) = 2
           and (t.offer_type = 'gift' or
             (select lp.karma_balance from locked_profiles lp where lp.user_id = $2) >= t.price_karma)
       ),
       moved as (
         update profiles p
         set karma_balance = p.karma_balance + case
               when eligible.offer_type = 'gift' and p.user_id = $2 then 1
               when eligible.offer_type = 'gift' then 0
               when p.user_id = $2 then -eligible.price_karma + 1
               else eligible.price_karma
             end,
             last_activity_at = now()
         from eligible
         where p.user_id = $2 or p.user_id = eligible.seller
         returning p.user_id
       ),
       closed as (
         update listings l
         set status = 'completed',
           hands_count = hands_count + 1
         from eligible
         where l.id = eligible.id
           and l.status = 'active'
           and (select count(*) from moved) = 2
         returning l.id
       ),
       transfer_log as (
         insert into ledger_entries (
           region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message
         )
         select eligible.region_id,
           case when eligible.offer_type = 'gift' then null else $2 end,
           case when eligible.offer_type = 'gift' then $2 else eligible.seller end,
           eligible.id, greatest(eligible.price_karma, 1),
           case when eligible.offer_type = 'gift' then 'activity' else 'transfer' end,
           case when eligible.offer_type = 'gift' then 'Aktivitäts-Karma für erfolgreiche Weitergabe: ' || eligible.title else 'Tausch: ' || eligible.title end
         from eligible
         where exists (select 1 from closed)
         returning id
       ),
       bonus_log as (
         insert into ledger_entries (region_id, receiver_id, listing_id, amount_karma, entry_kind, message)
         select eligible.region_id, $2, eligible.id, 1, 'activity',
           'Aktivitätsbonus für erfolgreiche Weitergabe: ' || eligible.title
         from eligible
         where eligible.offer_type <> 'gift' and exists (select 1 from closed)
         returning id
       ),
       history_log as (
         insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind)
         select l.item_uuid, l.id, $2, l.place_label,
           case when eligible.offer_type = 'gift' then 'gifted' else 'transferred' end
         from listings l
         join eligible on eligible.id = l.id
         where exists (select 1 from closed)
         returning id
       )
       select id::int as id from transfer_log`,
      [data.id, context.userId],
    );
    if (!rows.length) {
      return fail("Tausch nicht möglich. Prüfe Guthaben, Region und ob das Inserat noch frei ist.");
    }
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
    if (start.getTime() < Date.now()) throw new Error("Eine Reservierung muss in der Zukunft beginnen");
    const hours = (end.getTime() - start.getTime()) / 36e5;
    if (hours < 1 || hours > 24 * 14) throw new Error("Buchung zwischen 1 Stunde und 14 Tagen");
    return { id, startsAt: start.toISOString(), endsAt: end.toISOString() };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const verification = await sql.query<{ is_verified: boolean }>(
      "select is_verified from profiles where user_id = $1",
      [context.userId],
    );
    if (!verification[0]?.is_verified) {
      return fail("Bitte verifiziere zuerst dein Konto mit ID Austria.");
    }

    const moderatorCount = await sql.query<{ count: number }>(
      `select count(*)::int as count
       from profiles p
       join listings l on l.region_id = p.region_id
       where l.id = $1 and p.user_id <> $2 and p.user_id <> l.user_id
         and p.is_verified = true and p.moderator_rank > 0
         and p.last_active_at >= now() - interval '30 days'`,
      [data.id, context.userId],
    );
    if ((moderatorCount[0]?.count ?? 0) < 4) {
      return fail("Für eine sichere Treuhand müssen mindestens vier aktive, verifizierte Moderationspersonen verfügbar sein.");
    }

    const bookingId = `bkg-${crypto.randomUUID()}`;
    const escrowId = `esc-${crypto.randomUUID()}`;
    const rows = await sql.query<{ id: string }>(
      `with target as (
         select l.id, l.user_id, l.price_karma, l.region_id
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
         returning id, listing_id
       ),
       reserved as (
         update listings l
         set status = 'booked'
         from ins i
         where l.id = i.listing_id and l.status = 'active'
         returning l.id, l.region_id, l.user_id as owner_id, i.id as booking_id
       ),
       escrow as (
         insert into escrow_cases (id, listing_id, booking_id, requester_id, moderator_id, reason)
         select $6, r.id, r.booking_id, $2, moderator.user_id, 'Treuhand für Sharing-Reservierung'
         from reserved r
         left join lateral (
           select p.user_id
           from profiles p
           where p.region_id = r.region_id
             and p.is_verified = true
             and p.moderator_rank > 0
             and p.last_active_at >= now() - interval '30 days'
             and p.user_id <> $2
             and p.user_id <> r.owner_id
           order by random()
           limit 1
         ) moderator on true
         returning id
       )
       select id from escrow`,
      [data.id, context.userId, bookingId, data.startsAt, data.endsAt, escrowId],
    );

    if (!rows.length || !rows[0]?.id) {
      return fail("Reservierung nicht möglich. Das Inserat ist inzwischen belegt oder du bist in der falschen Region.");
    }
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
        `with escrow_guard as materialized (
           select id, status from escrow_cases
           where booking_id = $1
           for update
         ),
         b as (
           select id, listing_id from bookings
           where id = $1 and status = 'reserved' and (renter_id = $2 or owner_id = $2)
             and renter_handover_at is null and owner_handover_at is null
             and not exists (select 1 from escrow_guard where status = 'disputed')
           for update
         ),
         upd as (
           update bookings set status = 'cancelled'
           where id = (select id from b)
           returning listing_id
         ),
         escrow_cancel as (
           update escrow_cases set status = 'cancelled', resolved_at = now()
           where booking_id = $1 and status = 'pending'
             and exists (select 1 from b)
           returning id
         )
         update listings set status = 'active'
         where id = (select listing_id from upd)
         returning id`,
        [data.id, context.userId],
      );
      return rows.length ? { ok: true } : fail("Storno nur solange noch nichts übergeben wurde.");
    }
    if (data.action === "return") {
      const rows = await sql.query<{
        renterReturned: boolean;
        ownerReturned: boolean;
        completed: boolean;
      }>(
        `with escrow_guard as materialized (
           select id, status from escrow_cases
           where booking_id = $1
           for update
         ),
         b as materialized (
           select * from bookings
           where id = $1 and status = 'handed_over' and (renter_id = $2 or owner_id = $2)
             and not exists (select 1 from escrow_guard where status = 'disputed')
           for update
         ),
         confirmed as (
           update bookings as booking
           set renter_return_at = case
                 when booking.renter_id = $2 then coalesce(booking.renter_return_at, now())
                 else booking.renter_return_at
               end,
               owner_return_at = case
                 when booking.owner_id = $2 then coalesce(booking.owner_return_at, now())
                 else booking.owner_return_at
               end,
               status = case
                 when coalesce(booking.renter_return_at, case when booking.renter_id = $2 then now() end) is not null
                  and coalesce(booking.owner_return_at, case when booking.owner_id = $2 then now() end) is not null
                 then 'returned'
                 else booking.status
               end
           from b
           where booking.id = b.id
           returning booking.*
         ),
         reactivated as (
           update listings set status = 'active'
           where id = (select listing_id from confirmed where status = 'returned')
           returning id
         )
         select
           confirmed.renter_return_at is not null as "renterReturned",
           confirmed.owner_return_at is not null as "ownerReturned",
           confirmed.status = 'returned' and exists (select 1 from reactivated) as completed
         from confirmed`,
        [data.id, context.userId],
      );
      const confirmation = rows[0];
      if (!confirmation) return fail("Rückgabe nicht möglich. Prüfe Buchung, Berechtigung und ob ein Streitfall offen ist.");
      return { ok: true };
    }
    const rows = await sql.query<{
      renterConfirmed: boolean;
      ownerConfirmed: boolean;
      settled: boolean;
      payerAvailable: boolean;
    }>(
      `with target as materialized (
         select * from bookings
         where id = $1 and status = 'reserved' and (renter_id = $2 or owner_id = $2)
           and (
             not exists (select 1 from escrow_cases e where e.booking_id = bookings.id)
             or exists (select 1 from escrow_cases e where e.booking_id = bookings.id and e.status = 'released')
           )
         for update
       ),
       locked_profiles as materialized (
         select p.user_id, p.karma_balance
         from profiles p
         join target on p.user_id = target.renter_id or p.user_id = target.owner_id
         order by p.user_id
         for update of p
       ),
       confirmed as (
         update bookings as booking
         set renter_handover_at = case
               when booking.renter_id = $2 then coalesce(booking.renter_handover_at, now())
               else booking.renter_handover_at
             end,
             owner_handover_at = case
               when booking.owner_id = $2 then coalesce(booking.owner_handover_at, now())
               else booking.owner_handover_at
             end,
             status = case
               when coalesce(booking.renter_handover_at, case when booking.renter_id = $2 then now() end) is not null
                and coalesce(booking.owner_handover_at, case when booking.owner_id = $2 then now() end) is not null
                and exists (
                  select 1 from locked_profiles lp
                  where lp.user_id = booking.renter_id and lp.karma_balance >= booking.amount_karma
                )
               then 'handed_over'
               else booking.status
             end
         from target
         where booking.id = target.id
         returning booking.*
       ),
       moved as (
         update profiles p
         set karma_balance = p.karma_balance + case
               when p.user_id = confirmed.renter_id then -confirmed.amount_karma + 1
               else confirmed.amount_karma
             end,
             last_activity_at = now()
         from confirmed
         where confirmed.status = 'handed_over'
           and (p.user_id = confirmed.renter_id or p.user_id = confirmed.owner_id)
           and (select count(*) from locked_profiles) = 2
         returning p.user_id
       ),
       transfer_log as (
         insert into ledger_entries (
           region_id, sender_id, receiver_id, listing_id, booking_id, amount_karma, entry_kind, message
         )
         select l.region_id,
           case when confirmed.amount_karma = 0 then null else confirmed.renter_id end,
           case when confirmed.amount_karma = 0 then confirmed.renter_id else confirmed.owner_id end,
           confirmed.listing_id, confirmed.id, greatest(confirmed.amount_karma, 1),
           case when confirmed.amount_karma = 0 then 'activity' else 'transfer' end,
           case when confirmed.amount_karma = 0 then 'Aktivitäts-Karma für kostenlose Übernahme: ' || l.title else 'Flotte: ' || l.title end
         from confirmed join listings l on l.id = confirmed.listing_id
         where confirmed.status = 'handed_over'
           and (select count(*) from moved) = 2
         returning id
       ),
       bonus_log as (
         insert into ledger_entries (region_id, receiver_id, listing_id, booking_id, amount_karma, entry_kind, message)
         select l.region_id, confirmed.renter_id, l.id, confirmed.id, 1, 'activity',
           'Aktivitätsbonus für erfolgreiche Übergabe: ' || l.title
         from confirmed join listings l on l.id = confirmed.listing_id
         where confirmed.status = 'handed_over'
           and confirmed.amount_karma > 0
           and exists (select 1 from transfer_log)
         returning id
       ),
       count_log as (
         update listings l set hands_count = l.hands_count + 1
         from confirmed
         where l.id = confirmed.listing_id and exists (select 1 from transfer_log)
         returning l.id
       ),
       history_log as (
         insert into item_history (item_uuid,listing_id,owner_id,place_label,event_kind)
         select l.item_uuid,l.id,confirmed.owner_id,l.place_label,
           case when l.category = 'sharing' then 'loaned' when confirmed.amount_karma = 0 then 'gifted' else 'transferred' end
         from confirmed join listings l on l.id = confirmed.listing_id
         where exists (select 1 from count_log)
         returning id
       )
       select
         confirmed.renter_handover_at is not null as "renterConfirmed",
         confirmed.owner_handover_at is not null as "ownerConfirmed",
         (confirmed.status = 'handed_over' and exists (select 1 from transfer_log)) as settled,
         exists (
           select 1 from locked_profiles lp
           where lp.user_id = confirmed.renter_id and lp.karma_balance >= confirmed.amount_karma
         ) as "payerAvailable"
       from confirmed`,
      [data.id, context.userId],
    );
    const confirmation = rows[0];
    if (!confirmation) return fail("Übergabe nicht möglich. Prüfe Reservierung, Berechtigung, Treuhandfreigabe und Karma.");
    if (!confirmation.renterConfirmed || !confirmation.ownerConfirmed) {
      return { ok: true };
    }
    if (!confirmation.settled) {
      return fail(confirmation.payerAvailable
        ? "Die Übergabe konnte nicht abgeschlossen werden. Bitte erneut versuchen."
        : "Beide Seiten haben bestätigt, aber das Karma-Guthaben reicht nicht aus.");
    }
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

export const runDemurrage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DemurrageCut[]> => {
    const sql = await getSql();
    // This operation changes balances across every region. Fail closed unless
    // the caller is explicitly configured as admin for every enabled region.
    // Seed/demo regions have no admin_user_id, so nobody can trigger a global
    // demurrage run until ownership is configured deliberately.
    const authorization = await sql.query<{ enabledRegions: number; administeredRegions: number }>(
      `select
         count(*)::int as "enabledRegions",
         count(*) filter (where admin_user_id = $1)::int as "administeredRegions"
       from regions
       where demurrage_enabled = true`,
      [context.userId],
    );
    const enabledRegions = Number(authorization[0]?.enabledRegions ?? 0);
    const administeredRegions = Number(authorization[0]?.administeredRegions ?? 0);
    if (enabledRegions === 0 || administeredRegions !== enabledRegions) {
      throw new Error("Umlaufprämie ist gesperrt: Es fehlt die ausdrückliche Admin-Berechtigung für alle betroffenen Regionen.");
    }
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
    // Vercel Preview uses NODE_ENV=production too; allow the explicitly enabled
    // mock there, while keeping all production deployments fail-closed.
    if (!canUseIdAustriaMock({
      mockMode,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })) {
      throw new Error("ID Austria ist im Produktivbetrieb noch nicht angebunden. Eine Demo-Verifikation ist dort gesperrt.");
    }
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
         or exists (select 1 from escrow_cases e where e.listing_id = l.id and e.status = 'released'
           and (e.requester_id = $2 or l.user_id = $2))
       )`, [data.id, context.userId]);
    const address = rows[0]?.what3words_address;
    return { url: address ? `https://what3words.com/${address.replace(/^\/+/, "")}` : null };
  });


/**
 * Legacy one-person release is intentionally disabled. All releases must use
 * the quorum vote endpoint below so a single moderator cannot release escrow.
 */
export const releaseEscrow = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async (): Promise<ActionResult> =>
    fail("Einzel-Freigaben sind deaktiviert. Bitte die Treuhand-Abstimmung verwenden."),
  );

export type ListingThread = {
  requesterId: string;
  requesterName: string;
  lastMessage: string;
  updatedAt: string;
};

export type ListingMessage = {
  id: number;
  senderId: string | null;
  senderName: string;
  body: string;
  kind: "user" | "system";
  createdAt: string;
  isMine: boolean;
};

export type ListingNotification = {
  listingId: string;
  requesterId: string;
  listingTitle: string;
  otherName: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
};

export const getUnreadListingNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ListingNotification[]> => {
    const sql = await getSql();
    const rows = await sql.query<Row>(
      `select c.listing_id as "listingId", c.requester_id as "requesterId", l.title as "listingTitle",
        coalesce(p.username, 'Mitglied') as "otherName",
        count(m.id)::int as "unreadCount",
        coalesce((select lm.body from listing_messages lm
          where lm.conversation_id = c.id order by lm.id desc limit 1), '') as "lastMessage",
        to_char(max(m.created_at) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "updatedAt"
       from listing_conversations c
       join listings l on l.id = c.listing_id
       join profiles p on p.user_id = case when c.owner_id = $1 then c.requester_id else c.owner_id end
       join listing_messages m on m.conversation_id = c.id
         and m.read_at is null and m.sender_id is distinct from $1
       where c.owner_id = $1 or c.requester_id = $1
       group by c.id, l.title, p.username
       order by max(m.created_at) desc
       limit 8`,
      [context.userId],
    );
    return rows.map((row) => ({
      listingId: asString(row.listingId),
      requesterId: asString(row.requesterId),
      listingTitle: asString(row.listingTitle),
      otherName: asString(row.otherName),
      lastMessage: asString(row.lastMessage),
      unreadCount: asNumber(row.unreadCount),
      updatedAt: asString(row.updatedAt),
    }));
  });

export const getListingThreads = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ListingThread[]> => {
    const sql = await getSql();
    const allowed = await sql.query<{ owner_id: string }>(
      "select user_id as owner_id from listings where id = $1", [data.id],
    );
    if (!allowed.length) return [];
    const rows = await sql.query<Row>(
      `select c.requester_id as "requesterId", p.username as "requesterName",
        coalesce((select m.body from listing_messages m where m.conversation_id = c.id order by m.id desc limit 1), '') as "lastMessage",
        to_char(c.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "updatedAt"
       from listing_conversations c join profiles p on p.user_id = c.requester_id
       where c.listing_id = $1 and (c.owner_id = $2 or c.requester_id = $2)
       order by c.updated_at desc`,
      [data.id, context.userId],
    );
    if (allowed[0].owner_id !== context.userId &&
        !rows.some((row) => asString(row.requesterId) === context.userId)) return [];
    return rows.map((row) => ({
      requesterId: asString(row.requesterId),
      requesterName: asString(row.requesterName),
      lastMessage: asString(row.lastMessage),
      updatedAt: asString(row.updatedAt),
    }));
  });

export const getListingMessages = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const requesterId = input && typeof input === "object" && "requesterId" in input
      ? String((input as Record<string, unknown>).requesterId ?? "") : "";
    if (requesterId && !/^[a-zA-Z0-9_-]{2,128}$/.test(requesterId)) throw new Error("Ungültige Unterhaltung");
    return { id, requesterId };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ListingMessage[]> => {
    const sql = await getSql();
    const listing = await sql.query<{ user_id: string }>("select user_id from listings where id = $1", [data.id]);
    if (!listing.length) return [];
    const requesterId = listing[0].user_id === context.userId ? data.requesterId : context.userId;
    if (!requesterId || listing[0].user_id === requesterId) return [];
    const rows = await sql.query<Row>(
      `select m.id, m.sender_id as "senderId", coalesce(p.username, 'KREISLAUF') as "senderName",
        m.body, m.message_kind as kind,
        to_char(m.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
       from listing_conversations c join listing_messages m on m.conversation_id = c.id
       left join profiles p on p.user_id = m.sender_id
       where c.listing_id = $1 and c.requester_id = $2 and c.owner_id = $3
         and (c.requester_id = $4 or c.owner_id = $4)
       order by m.id asc limit 200`,
      [data.id, requesterId, listing[0].user_id, context.userId],
    );
    await sql.query(
      `update listing_messages set read_at = now()
       where conversation_id in (
         select id from listing_conversations
         where listing_id = $1 and requester_id = $2 and owner_id = $3
           and (requester_id = $4 or owner_id = $4)
       )
         and sender_id is distinct from $4 and read_at is null`,
      [data.id, requesterId, listing[0].user_id, context.userId],
    );
    return rows.map((row) => ({
      id: asNumber(row.id), senderId: row.senderId == null ? null : asString(row.senderId),
      senderName: asString(row.senderName), body: asString(row.body),
      kind: asString(row.kind, "user") as "user" | "system",
      createdAt: asString(row.createdAt), isMine: row.senderId === context.userId,
    }));
  });

export const sendListingMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Ungültige Nachricht");
    const source = input as Record<string, unknown>;
    const id = idOf(source, "id");
    const body = typeof source.body === "string" ? source.body.trim() : "";
    if (!body || body.length > 2000) throw new Error("Nachricht muss 1 bis 2000 Zeichen haben");
    const requesterId = typeof source.requesterId === "string" ? source.requesterId : "";
    if (requesterId && !/^[a-zA-Z0-9_-]{2,128}$/.test(requesterId)) throw new Error("Ungültige Unterhaltung");
    return { id, body, requesterId };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    const listing = await sql.query<{ user_id: string; status: string }>(
      "select user_id, status from listings where id = $1", [data.id],
    );
    if (!listing.length) return fail("Inserat nicht gefunden.");
    const ownerId = listing[0].user_id;
    const requesterId = context.userId === ownerId ? data.requesterId : context.userId;
    if (!requesterId || requesterId === ownerId) return fail("Unterhaltung nicht ausgewählt.");
    if (context.userId === ownerId) {
      const existing = await sql.query(
        "select id from listing_conversations where listing_id = $1 and requester_id = $2 and owner_id = $3",
        [data.id, requesterId, ownerId],
      );
      if (!existing.length) return fail("Du kannst erst antworten, wenn das andere Mitglied eine Unterhaltung begonnen hat.");
    }
    const other = await sql.query("select user_id from profiles where user_id = $1", [requesterId]);
    if (!other.length) return fail("Mitglied nicht gefunden.");
    // Create/update the conversation and append its message in one SQL statement.
    // This prevents a failed message insert from leaving a conversation that
    // looks active but contains no first message, and removes the read-after-write race.
    const inserted = await sql.query<{ id: number }>(
      `with conversation as (
         insert into listing_conversations(id, listing_id, requester_id, owner_id)
         select $1, l.id, $3, $4
         from listings l
         where l.id = $2 and l.user_id = $4
           and (
             l.status = 'active'
             or exists (
               select 1 from listing_conversations existing
               where existing.listing_id = l.id
                 and existing.requester_id = $3
                 and existing.owner_id = l.user_id
             )
           )
         for update
         on conflict (listing_id, requester_id)
         do update set updated_at = now()
         returning id
       ),
       message as (
         insert into listing_messages(conversation_id, sender_id, body, message_kind)
         select conversation.id, $5, $6, 'user'
         from conversation
         returning id
       )
       select id from message`,
      [`conv-${crypto.randomUUID()}`, data.id, requesterId, ownerId, context.userId, data.body],
    );
    if (!inserted.length) return fail("Nachricht konnte nicht gespeichert werden.");
    return { ok: true };
  });

export type EscrowVoteResult = {
  status: "pending" | "released" | "disputed" | "cancelled";
  votes: number;
  approvals: number;
  rejections: number;
  required: number;
};

export const voteEscrow = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Ungültige Abstimmung");
    const source = input as Record<string, unknown>;
    const id = idOf(source, "id");
    const vote = source.vote === "approve" || source.vote === "reject" ? source.vote : null;
    if (!vote) throw new Error("Stimme muss Freigabe oder Ablehnung sein");
    const note = typeof source.note === "string" ? source.note.trim().slice(0, 500) : "";
    return { id, vote, note };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<EscrowVoteResult | ActionResult> => {
    const sql = await getSql();
    try {
      const rows = await sql.query<Row>(
        "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
        [data.id, context.userId, data.vote, data.note],
      );
      const row = rows[0];
      if (!row) return fail("Die Abstimmung hat kein Ergebnis zurückgegeben.");
      return {
        status: asString(row.status, "pending") as "pending" | "released" | "disputed" | "cancelled",
        votes: asNumber(row.votes),
        approvals: asNumber(row.approvals),
        rejections: asNumber(row.rejections),
        required: asNumber(row.required),
      };
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code === "23505") return fail("Du hast bereits abgestimmt. Eine Stimme kann nicht nachträglich geändert werden.");
      throw error;
    }
  });


export const confirmHighValueEscrow = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    try {
      await sql.query("select * from kreislauf_confirm_high_value_escrow($1, $2)", [data.id, context.userId]);
      return { ok: true };
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Übergabe konnte nicht bestätigt werden.");
    }
  });

export const openHighValueDispute = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const source = input as Record<string, unknown>;
    const reason = typeof source.reason === "string" ? source.reason.trim().slice(0, 1000) : "";
    if (reason.length < 10) throw new Error("Bitte beschreibe den Streitfall mit mindestens 10 Zeichen.");
    return { id, reason };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    try {
      await sql.query("select kreislauf_open_high_value_dispute($1, $2, $3)", [data.id, context.userId, data.reason]);
      return { ok: true };
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Streitfall konnte nicht eröffnet werden.");
    }
  });

export const voteEscrowResolution = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = idOf(input, "id");
    const source = input as Record<string, unknown>;
    const decision = source.decision === "release" || source.decision === "refund" ? source.decision : null;
    if (!decision) throw new Error("Entscheidung muss Freigabe oder Erstattung sein.");
    const note = typeof source.note === "string" ? source.note.trim().slice(0, 500) : "";
    return { id, decision, note };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const sql = await getSql();
    try {
      await sql.query("select * from kreislauf_vote_escrow_resolution($1, $2, $3, $4)",
        [data.id, context.userId, data.decision, data.note]);
      return { ok: true };
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Streitfallentscheidung konnte nicht gespeichert werden.");
    }
  });

export type EscrowSummary = {
  status: "pending" | "released" | "disputed" | "cancelled" | "refunded" | null;
  votes: number;
  approvals: number;
  rejections: number;
  assigned: number;
  canVote: boolean;
  hasVoted: boolean;
  buyerId: string | null;
  sellerId: string | null;
  amountKarma: number;
  fundsStatus: "not_applicable" | "held" | "released" | "refunded";
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  canConfirm: boolean;
  canOpenDispute: boolean;
  disputeReason: string;
  reason: string;
  resolutionVotes: number;
  resolutionReleases: number;
  resolutionRefunds: number;
  canResolve: boolean;
  hasResolutionVote: boolean;
};
export const getEscrowSummary = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ id: idOf(input, "id") }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<EscrowSummary> => {
    const sql = await getSql();
    const cases = await sql.query<Row>(
      `select e.id, e.status, e.buyer_id as "buyerId", e.seller_id as "sellerId",
         e.amount_karma as "amountKarma", e.funds_status as "fundsStatus",
         e.buyer_confirmed_at as "buyerConfirmedAt", e.seller_confirmed_at as "sellerConfirmedAt",
         e.dispute_reason as "disputeReason", e.reason
       from escrow_cases e
       where e.listing_id = $1
         and (
           exists (select 1 from listings l where l.id = e.listing_id and (l.user_id = $2 or e.requester_id = $2))
           or exists (select 1 from escrow_moderators a where a.escrow_id = e.id and a.moderator_id = $2)
         )
       order by e.created_at desc limit 1`,
      [data.id, context.userId],
    );
    if (!cases.length) return {
      status: null, votes: 0, approvals: 0, rejections: 0, assigned: 0,
      canVote: false, hasVoted: false, buyerId: null, sellerId: null, amountKarma: 0,
      fundsStatus: "not_applicable", buyerConfirmed: false, sellerConfirmed: false,
      isBuyer: false, isSeller: false, canConfirm: false, canOpenDispute: false,
      disputeReason: "", reason: "", resolutionVotes: 0, resolutionReleases: 0, resolutionRefunds: 0,
      canResolve: false, hasResolutionVote: false,
    };
    const current = cases[0];
    const escrowId = asString(current.id);
    const [counts, assignment, ownVote, resolutionCounts, ownResolutionVote] = await Promise.all([
      sql.query<Row>(
        `select count(v.id)::int as votes,
          count(*) filter (where v.vote = 'approve')::int as approvals,
          count(*) filter (where v.vote = 'reject')::int as rejections,
          (select count(*)::int from escrow_moderators a where a.escrow_id = $1) as assigned
         from escrow_votes v where v.escrow_id = $1`, [escrowId]),
      sql.query(
        `select 1 from escrow_moderators a join profiles p on p.user_id = a.moderator_id
         where a.escrow_id = $1 and a.moderator_id = $2 and p.is_verified = true
           and p.moderator_rank > 0 and p.last_active_at >= now() - interval '30 days'`,
        [escrowId, context.userId]),
      sql.query("select 1 from escrow_votes where escrow_id = $1 and moderator_id = $2", [escrowId, context.userId]),
      sql.query<Row>(
        `select count(*)::int as votes,
          count(*) filter (where decision = 'release')::int as releases,
          count(*) filter (where decision = 'refund')::int as refunds
         from escrow_resolution_votes where escrow_id = $1`, [escrowId]),
      sql.query("select 1 from escrow_resolution_votes where escrow_id = $1 and moderator_id = $2", [escrowId, context.userId]),
    ]);
    const row = counts[0] ?? {};
    const resolution = resolutionCounts[0] ?? {};
    const votes = asNumber(row.votes);
    const approvals = asNumber(row.approvals);
    const rejections = asNumber(row.rejections);
    const assigned = asNumber(row.assigned);
    const isBuyer = current.buyerId === context.userId;
    const isSeller = current.sellerId === context.userId;
    const approved = votes >= 4 && approvals >= Math.ceil(votes * 2 / 3);
    return {
      status: asString(current.status, "pending") as EscrowSummary["status"],
      votes, approvals, rejections, assigned,
      canVote: assignment.length > 0 && ownVote.length === 0 && current.status === "pending"
        && !(votes >= 4 && (approvals >= Math.ceil(votes * 2 / 3) || rejections >= Math.ceil(votes * 2 / 3))),
      hasVoted: ownVote.length > 0,
      buyerId: current.buyerId == null ? null : asString(current.buyerId),
      sellerId: current.sellerId == null ? null : asString(current.sellerId),
      amountKarma: asNumber(current.amountKarma),
      fundsStatus: asString(current.fundsStatus, "not_applicable") as EscrowSummary["fundsStatus"],
      buyerConfirmed: current.buyerConfirmedAt != null,
      sellerConfirmed: current.sellerConfirmedAt != null,
      isBuyer, isSeller,
      canConfirm: (isBuyer || isSeller) && current.status === "pending" && current.fundsStatus === "held"
        && approved && !(isBuyer ? current.buyerConfirmedAt != null : current.sellerConfirmedAt != null),
      canOpenDispute: (isBuyer || isSeller) && current.status === "pending" && current.fundsStatus === "held",
      disputeReason: asString(current.disputeReason),
      reason: asString(current.reason),
      resolutionVotes: asNumber(resolution.votes),
      resolutionReleases: asNumber(resolution.releases),
      resolutionRefunds: asNumber(resolution.refunds),
      canResolve: assignment.length > 0 && ownResolutionVote.length === 0 && current.status === "disputed"
        && current.fundsStatus === "held",
      hasResolutionVote: ownResolutionVote.length > 0,
    };
  });
