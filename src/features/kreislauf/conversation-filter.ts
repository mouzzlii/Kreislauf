export type ConversationFilter = "all" | "unread";

export type ConversationSearchItem = {
  otherName: string;
  listingTitle: string;
  lastMessage: string;
  unreadCount: number;
};

/** Filter the existing inbox snapshot locally; never widens server-side access. */
export function filterListingConversations<T extends ConversationSearchItem>(
  conversations: T[],
  query: string,
  filter: ConversationFilter,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("de-AT");
  return conversations.filter((conversation) => {
    if (filter === "unread" && conversation.unreadCount <= 0) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      conversation.otherName,
      conversation.listingTitle,
      conversation.lastMessage,
    ].join(" ").toLocaleLowerCase("de-AT");
    return searchable.includes(normalizedQuery);
  });
}
