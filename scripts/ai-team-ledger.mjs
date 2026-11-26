export function isTrustedRelayComment(comment) {
  return comment?.user?.login === "github-actions[bot]" &&
    comment.user.type === "Bot";
}

export function hasTrustedRelayMarker(comments, marker) {
  if (!Array.isArray(comments) || typeof marker !== "string" || !marker) return false;
  return comments.some((comment) =>
    isTrustedRelayComment(comment) &&
    typeof comment.body === "string" &&
    comment.body.includes(marker)
  );
}

export function inspectDailyBudgetPage(comments, {
  reservationPrefix,
  triggerCommentId,
  dayStart,
  idempotencyMarker = "",
}) {
  let count = 0;
  let alreadyReserved = false;
  let reachedPreviousDay = false;
  if (!Array.isArray(comments)) {
    throw new TypeError("Daily budget ledger page must be an array.");
  }

  for (const comment of comments) {
    const createdAt = Date.parse(comment?.created_at || "");
    if (Number.isFinite(createdAt) && createdAt < dayStart) {
      reachedPreviousDay = true;
      break;
    }
    if (!isTrustedRelayComment(comment) || typeof comment.body !== "string") continue;
    if (comment.body.includes(`${reservationPrefix}${triggerCommentId} -->`) ||
        (idempotencyMarker && comment.body.includes(idempotencyMarker))) {
      alreadyReserved = true;
    }
    if (comment.body.includes(reservationPrefix)) count += 1;
  }

  return { count, alreadyReserved, reachedPreviousDay };
}
