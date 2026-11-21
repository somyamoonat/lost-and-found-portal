import { isMockMode, supabase } from "@/lib/supabase";
import { mockApi } from "./mockApi";
import { supabaseApi } from "./supabaseApi";
import type { Item } from "./items";

export interface GetItemsFilter {
  query?: string;
  type?: "all" | "lost" | "found";
  status?: "all" | "open" | "verified" | "returned";
  categories?: string[];
  building?: string;
  dateRange?: "today" | "week" | "month" | "any";
  sort?: "newest" | "oldest";
  limit?: number;
  offset?: number;
}

export interface ClaimSubmission {
  description: string;
  identifyingDetail: string;
  lostDate: string;
  lostLocation: string;
  proofFileName?: string;
  claimantName?: string;
  claimantEmail?: string;
}

export interface ReportSubmission {
  type: "lost" | "found";
  category: string;
  title: string;
  description: string;
  color?: string;
  brand?: string;
  building: string;
  spot: string;
  dateTime: string;
  photoUrl?: string | null;
  photoName?: string | null;
  verificationDetail?: string;
  handoverMethod?: "desk" | "finder_holding" | "email" | "phone" | "desk_pickup";
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

/**
 * Unified API gateway that delegates seamlessly to Supabase in production
 * or the in-memory mock implementation when VITE_USE_MOCK=true or credentials are missing.
 */
export const api = {
  /**
   * Retrieves items with filtering, searching, and pagination.
   */
  async getItems(filter?: GetItemsFilter): Promise<{ items: Item[]; totalCount: number }> {
    if (!isMockMode && supabase) {
      return supabaseApi.getItems(filter);
    }
    return mockApi.getItems(filter);
  },

  /**
   * Retrieves a single item by ID or reference code.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    if (!isMockMode && supabase) {
      return supabaseApi.getItemById(idOrRef);
    }
    return mockApi.getItemById(idOrRef);
  },

  /**
   * Retrieves similar items in the same category or building.
   */
  async getSimilarItems(category: string, currentId: string, limit = 4): Promise<Item[]> {
    if (!isMockMode && supabase) {
      return supabaseApi.getSimilarItems(category, currentId, limit);
    }
    return mockApi.getSimilarItems(category, currentId, limit);
  },

  /**
   * Submits a claim for an item.
   */
  async submitClaim(id: string, claimData: ClaimSubmission): Promise<{ success: boolean; refCode: string }> {
    if (!isMockMode && supabase) {
      return supabaseApi.submitClaim(id, claimData);
    }
    return mockApi.submitClaim(id, claimData);
  },

  /**
   * Retrieves first 4 items handed in today.
   */
  async getHandedInToday(): Promise<Item[]> {
    if (!isMockMode && supabase) {
      return supabaseApi.getHandedInToday();
    }
    return mockApi.getHandedInToday();
  },

  /**
   * Retrieves 8 recently found items for the home page showcase.
   */
  async getRecentFound(): Promise<Item[]> {
    if (!isMockMode && supabase) {
      return supabaseApi.getRecentFound();
    }
    return mockApi.getRecentFound();
  },

  /**
   * Submits a newly reported lost or found item.
   */
  async submitReport(data: ReportSubmission): Promise<{ success: boolean; refCode: string; item: Item }> {
    if (!isMockMode && supabase) {
      return supabaseApi.submitReport(data);
    }
    return mockApi.submitReport(data);
  },

  /**
   * Approves a claim in the system.
   */
  async approveClaim(claimId: string, itemId?: string): Promise<{ success: boolean }> {
    if (!isMockMode && supabase) {
      return supabaseApi.approveClaim(claimId, itemId);
    }
    return mockApi.approveClaim(claimId, itemId);
  },

  /**
   * Withdraws a reported item by ID or reference code.
   */
  async withdrawReport(itemId: string): Promise<{ success: boolean }> {
    if (!isMockMode && supabase) {
      return supabaseApi.withdrawReport(itemId);
    }
    return mockApi.withdrawReport(itemId);
  },
};
