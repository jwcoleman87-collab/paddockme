/**
 * Tiny localStorage-backed unread tracker for the messages inbox.
 *
 * - Each thread (workspace or transport room) stores the message count the
 *   user has seen at last visit. When current count exceeds it, the inbox
 *   surfaces the diff as an unread badge.
 * - All read/write goes through a single key so we can clear/inspect easily.
 * - Dispatches a `paddockme:inbox-update` window event so the header dot can
 *   refresh in the same tab.
 */
const STORAGE_KEY = "paddockme.inbox.lastSeenCount";
const EVENT_NAME = "paddockme:inbox-update";

type SeenMap = Record<string, number>;

function read(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as SeenMap;
    return {};
  } catch {
    return {};
  }
}

function write(map: SeenMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore - quota / private mode
  }
}

export function getSeenCounts(): SeenMap {
  return read();
}

export function markThreadSeen(threadId: string, currentCount: number) {
  const map = read();
  if (map[threadId] === currentCount) return;
  map[threadId] = currentCount;
  write(map);
}

export function unreadCountFor(
  threadId: string,
  currentCount: number
): number {
  const seen = read()[threadId] ?? 0;
  const diff = currentCount - seen;
  return diff > 0 ? diff : 0;
}

export const INBOX_UPDATE_EVENT = EVENT_NAME;
