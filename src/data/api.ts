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

function handleSupabaseError(err: any, fallbackFn: () => any) {
  if (
    err?.code === "PGRST205" ||
    (typeof err?.message === "string" && err.message.includes("in the schema cache"))
  ) {
    console.warn(
      "Supabase schema cache warning: tables have not been created yet in your Supabase project. Falling back to mock data. Run supabase/migrations/20261121000000_initial_schema.sql in your Supabase SQL editor."
    );
    return fallbackFn();
  }
  throw err;
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
      try {
        return await supabaseApi.getItems(filter);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.getItems(filter));
      }
    }
    return mockApi.getItems(filter);
  },

  /**
   * Retrieves a single item by ID or reference code.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.getItemById(idOrRef);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.getItemById(idOrRef));
      }
    }
    return mockApi.getItemById(idOrRef);
  },

  /**
   * Retrieves similar items in the same category or building.
   */
  async getSimilarItems(category: string, currentId: string, limit = 4): Promise<Item[]> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.getSimilarItems(category, currentId, limit);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.getSimilarItems(category, currentId, limit));
      }
    }
    return mockApi.getSimilarItems(category, currentId, limit);
  },

  /**
   * Submits a claim for an item.
   */
  async submitClaim(id: string, claimData: ClaimSubmission): Promise<{ success: boolean; refCode: string }> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.submitClaim(id, claimData);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.submitClaim(id, claimData));
      }
    }
    return mockApi.submitClaim(id, claimData);
  },

  /**
   * Retrieves first 4 items handed in today.
   */
  async getHandedInToday(): Promise<Item[]> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.getHandedInToday();
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.getHandedInToday());
      }
    }
    return mockApi.getHandedInToday();
  },

  /**
   * Retrieves 8 recently found items for the home page showcase.
   */
  async getRecentFound(): Promise<Item[]> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.getRecentFound();
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.getRecentFound());
      }
    }
    return mockApi.getRecentFound();
  },

  /**
   * Submits a newly reported lost or found item.
   */
  async submitReport(data: ReportSubmission): Promise<{ success: boolean; refCode: string; item: Item }> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.submitReport(data);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.submitReport(data));
      }
    }
    return mockApi.submitReport(data);
  },

  /**
   * Approves a claim in the system.
   */
  async approveClaim(claimId: string, itemId?: string): Promise<{ success: boolean }> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.approveClaim(claimId, itemId);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.approveClaim(claimId, itemId));
      }
    }
    return mockApi.approveClaim(claimId, itemId);
  },

  /**
   * Withdraws a reported item by ID or reference code.
   */
  async withdrawReport(itemId: string): Promise<{ success: boolean }> {
    if (!isMockMode && supabase) {
      try {
        return await supabaseApi.withdrawReport(itemId);
      } catch (err) {
        return handleSupabaseError(err, () => mockApi.withdrawReport(itemId));
      }
    }
    return mockApi.withdrawReport(itemId);
  },
};
