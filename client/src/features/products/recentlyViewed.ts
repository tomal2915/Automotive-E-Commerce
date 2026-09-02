const STORAGE_KEY = "recently-viewed-products";
const MAX_ITEMS = 10;

// Reads the list of recently viewed product IDs, most recent first
export const getRecentlyViewedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Adds a product ID to the front of the list, removing any duplicate
// and capping the list length so it doesn't grow unbounded
export const addToRecentlyViewed = (productId: string) => {
  try {
    const current = getRecentlyViewedIds();
    const updated = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage can fail (private browsing, storage full, etc.) —
    // recently-viewed is a nice-to-have, so fail silently
  }
};