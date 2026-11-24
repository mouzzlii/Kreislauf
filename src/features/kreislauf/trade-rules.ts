export type ExchangeListingType = "barter" | "combined";

export type NormalizedExchangeListing = {
  exchangeTerms: string | null;
  karmaAdjustment: number;
};

/**
 * The listing owner describes what they expect in return.
 * A positive Karma amount is always paid by the requesting member to the owner.
 * Direct barter cannot carry a Karma transfer.
 */
export function normalizeExchangeListing(
  offerType: string,
  rawTerms: unknown,
  rawKarma: unknown,
): NormalizedExchangeListing {
  if (offerType !== "barter" && offerType !== "combined") {
    return { exchangeTerms: null, karmaAdjustment: 0 };
  }

  const exchangeTerms = typeof rawTerms === "string"
    ? rawTerms.replace(/\s+/g, " ").trim()
    : "";
  if (exchangeTerms.length < 8 || exchangeTerms.length > 400) {
    throw new Error("Bitte beschreibe die gewünschte Gegenleistung mit 8 bis 400 Zeichen.");
  }

  const karmaAdjustment = typeof rawKarma === "number" && Number.isInteger(rawKarma)
    ? rawKarma
    : 0;
  if (karmaAdjustment < 0 || karmaAdjustment > 500) {
    throw new Error("Der Karma-Ausgleich muss zwischen 0 und 500 liegen.");
  }
  if (offerType === "barter" && karmaAdjustment !== 0) {
    throw new Error("Ein direkter Tausch darf keinen Karma-Ausgleich enthalten.");
  }

  return { exchangeTerms, karmaAdjustment };
}

export function normalizeTradeOffer(value: unknown): string {
  const offeredDescription = typeof value === "string"
    ? value.replace(/\s+/g, " ").trim()
    : "";
  if (offeredDescription.length < 8 || offeredDescription.length > 400) {
    throw new Error("Bitte beschreibe deine Gegenleistung mit 8 bis 400 Zeichen.");
  }
  return offeredDescription;
}

export function canRequestTrade(input: {
  offerType: string;
  status: string;
  ownerId: string;
  requesterId: string;
  requesterRegionId: string;
  listingRegionId: string;
  karmaBalance: number;
  karmaAdjustment: number;
}): boolean {
  return (
    (input.offerType === "barter" || input.offerType === "combined") &&
    input.status === "active" &&
    Boolean(input.ownerId) &&
    input.ownerId !== input.requesterId &&
    input.requesterRegionId === input.listingRegionId &&
    Number.isInteger(input.karmaAdjustment) &&
    input.karmaAdjustment >= 0 &&
    input.karmaAdjustment <= 500 &&
    input.karmaBalance >= input.karmaAdjustment
  );
}
