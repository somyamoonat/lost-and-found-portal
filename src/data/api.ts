import { placeholderItems, type Item } from "./items";

/**
 * Helper to simulate real network latency (400-700ms).
 */
const simulateLatency = (): Promise<void> => {
  const delay = Math.floor(Math.random() * 300) + 400; // 400ms - 700ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export interface GetItemsFilter {
  query?: string;
  category?: string;
  building?: string;
  type?: "lost" | "found";
  status?: "open" | "verified" | "returned";
  limit?: number;
}

export const api = {
  /**
   * Retrieves items with simulated latency and optional filtering.
   */
  async getItems(filter?: GetItemsFilter): Promise<Item[]> {
    await simulateLatency();

    let results = [...placeholderItems];

    if (filter?.type) {
      results = results.filter((i) => i.type === filter.type);
    }

    if (filter?.status) {
      results = results.filter((i) => i.status === filter.status);
    }

    if (filter?.category && filter.category !== "all") {
      results = results.filter((i) => i.category === filter.category);
    }

    if (filter?.building && filter.building !== "all") {
      const bldg = filter.building;
      results = results.filter(
        (i) => i.buildingCode === bldg || i.location.includes(bldg)
      );
    }

    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.refCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      );
    }

    if (filter?.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results;
  },

  /**
   * Retrieves a single item by ID or refCode.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    await simulateLatency();
    const clean = idOrRef.replace(/^LF-/i, "");
    const found = placeholderItems.find(
      (i) => i.id === clean || i.id === idOrRef || i.refCode.toLowerCase() === idOrRef.toLowerCase()
    );
    return found || null;
  },

  /**
   * Retrieves items handed in today (first 4 items with recent timestamps).
   */
  async getHandedInToday(): Promise<Item[]> {
    await simulateLatency();
    return placeholderItems.slice(0, 4);
  },

  /**
   * Retrieves 8 recently found items for the home page showcase.
   */
  async getRecentFound(): Promise<Item[]> {
    await simulateLatency();
    return placeholderItems.slice(0, 8);
  },
};
