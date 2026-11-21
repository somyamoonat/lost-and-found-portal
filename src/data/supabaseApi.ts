import { supabase } from "@/lib/supabase";
import type { Item } from "./items";
import type { GetItemsFilter, ClaimSubmission, ReportSubmission } from "./api";
import { compressImage } from "@/lib/compression";

/**
 * Maps database row from public_items / items to client Item entity.
 */
export function mapDbItemToClient(row: any): Item {
  const occurredDate = new Date(row.occurred_at);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - occurredDate.getTime()) / (1000 * 60 * 60));

  let timeAgo = "Just now";
  if (diffHours < 1) {
    timeAgo = "Under an hour ago";
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  // Derive building code from location or text
  let buildingCode = "MLC";
  if (row.location.includes("Science")) buildingCode = "SQL";
  else if (row.location.includes("Union") || row.location.includes("Dining")) buildingCode = "SUD";
  else if (row.location.includes("Engineering")) buildingCode = "FEH";
  else if (row.location.includes("Athletics") || row.location.includes("Recreation")) buildingCode = "ARC";
  else if (row.location.includes("Arts")) buildingCode = "FAP";

  // Build public photo URL if path is in storage
  let photoUrl = row.photo_path;
  if (photoUrl && !photoUrl.startsWith("http") && supabase) {
    const { data } = supabase.storage.from("item-photos").getPublicUrl(photoUrl);
    if (data?.publicUrl) photoUrl = data.publicUrl;
  }

  return {
    id: String(row.id),
    refCode: row.ref_code,
    type: row.type,
    title: row.title,
    category: row.category,
    location: row.location,
    buildingCode,
    occurredAt: row.occurred_at,
    status: row.status || "open",
    photo: photoUrl || null,
    description: row.description,
    timeAgo,
    currentlyHeldAt: row.held_at || "Central Library Vault, Room 104",
    finderNotes: row.private_detail || undefined,
    thumbnails: [
      { id: "front", label: "Intake perspective", angle: "Primary angle" },
      { id: "details", label: "Markings & condition", angle: "Condition details" },
      { id: "serial", label: "Serial label & markings", angle: "Identification tag" },
    ],
    history: [
      {
        id: `h-init-${row.id}`,
        stage: "reported",
        title: row.type === "lost" ? "Reported lost" : "Surrendered at desk",
        timestamp: row.occurred_at,
        description: `Logged in campus registry at ${row.location}`,
      },
      ...(row.status === "verified" || row.status === "returned"
        ? [
            {
              id: `h-verif-${row.id}`,
              stage: "claim_received" as const,
              title: "Claim verified",
              timestamp: row.occurred_at,
              description: "Ownership details verified by campus desk attendant",
            },
          ]
        : []),
      ...(row.status === "returned"
        ? [
            {
              id: `h-ret-${row.id}`,
              stage: "returned" as const,
              title: "Returned to owner",
              timestamp: new Date().toISOString(),
              description: "Released to verified claimant with signature",
            },
          ]
        : []),
    ],
  };
}

export const supabaseApi = {
  /**
   * Retrieves items from Supabase with full server-side filtering, sorting, and pagination.
   */
  async getItems(filter?: GetItemsFilter): Promise<{ items: Item[]; totalCount: number }> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // Query through the public_items view which strictly omits private_detail
    let query = supabase.from("public_items").select("*", { count: "exact" });

    // 1. Type filter
    if (filter?.type && filter.type !== "all") {
      query = query.eq("type", filter.type);
    }

    // 2. Status filter
    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }

    // 3. Categories filter
    if (filter?.categories && filter.categories.length > 0) {
      const activeCats = filter.categories.filter((c) => c !== "all");
      if (activeCats.length > 0) {
        query = query.in("category", activeCats);
      }
    }

    // 4. Building / location filter
    if (filter?.building && filter.building !== "all") {
      query = query.ilike("location", `%${filter.building}%`);
    }

    // 5. Date range filter
    if (filter?.dateRange && filter.dateRange !== "any") {
      const now = new Date();
      let days = 30;
      if (filter.dateRange === "today") days = 1;
      else if (filter.dateRange === "week") days = 7;
      else if (filter.dateRange === "month") days = 30;

      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("occurred_at", cutoff);
    }

    // 6. Search query
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.trim();
      query = query.or(
        `title.ilike.%${q}%,ref_code.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
      );
    }

    // 7. Sort
    query = query.order("occurred_at", {
      ascending: filter?.sort === "oldest",
    });

    // 8. Pagination offset and limit
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 20;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("Supabase getItems error:", error);
      throw error;
    }

    const items = (data || []).map(mapDbItemToClient);
    return { items, totalCount: count || items.length };
  },

  /**
   * Retrieves single item by UUID or reference code.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const isRefCode = idOrRef.toUpperCase().startsWith("LF-");
    let query = supabase.from("public_items").select("*");

    if (isRefCode) {
      query = query.ilike("ref_code", idOrRef);
    } else {
      query = query.eq("id", idOrRef);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("Supabase getItemById error:", error);
      throw error;
    }
    if (!data) return null;

    return mapDbItemToClient(data);
  },

  /**
   * Retrieves similar items in the same category.
   */
  async getSimilarItems(category: string, currentId: string, limit = 4): Promise<Item[]> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data, error } = await supabase
      .from("public_items")
      .select("*")
      .eq("category", category)
      .neq("id", currentId)
      .limit(limit);

    if (error) {
      console.error("Supabase getSimilarItems error:", error);
      throw error;
    }

    return (data || []).map(mapDbItemToClient);
  },

  /**
   * Submits a claim for an item to the claims table.
   */
  async submitClaim(id: string, claimData: ClaimSubmission): Promise<{ success: boolean; refCode: string }> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const item = await this.getItemById(id);
    if (!item) throw new Error("Item not found");

    const { error: claimErr } = await supabase.from("claims").insert({
      item_id: item.id,
      claimant_id: (await supabase.auth.getUser()).data.user?.id || item.id,
      description: claimData.description,
      identifying_detail: claimData.identifyingDetail,
      proof_path: claimData.proofFileName || null,
      status: "awaiting_review",
    });

    if (claimErr) {
      console.error("Supabase submitClaim error:", claimErr);
      throw claimErr;
    }

    return { success: true, refCode: item.refCode };
  },

  /**
   * Retrieves first 4 items handed in today.
   */
  async getHandedInToday(): Promise<Item[]> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data, error } = await supabase
      .from("public_items")
      .select("*")
      .eq("type", "found")
      .order("occurred_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Supabase getHandedInToday error:", error);
      throw error;
    }

    return (data || []).map(mapDbItemToClient);
  },

  /**
   * Retrieves 8 recent found items.
   */
  async getRecentFound(): Promise<Item[]> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data, error } = await supabase
      .from("public_items")
      .select("*")
      .eq("type", "found")
      .order("occurred_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Supabase getRecentFound error:", error);
      throw error;
    }

    return (data || []).map(mapDbItemToClient);
  },

  /**
   * Submits a new lost or found property report with photo upload to item-photos.
   */
  async submitReport(data: ReportSubmission): Promise<{ success: boolean; refCode: string; item: Item }> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    let uploadedPhotoPath: string | null = null;

    // Handle photo upload if a file/data was provided
    if (data.photoUrl && data.photoName) {
      try {
        const response = await fetch(data.photoUrl);
        const blob = await response.blob();
        const rawFile = new File([blob], data.photoName, { type: blob.type || "image/jpeg" });

        // Client-side compression before upload (max 5MB)
        const compressedFile = await compressImage(rawFile);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(filePath, compressedFile, {
            contentType: compressedFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (!uploadError) {
          uploadedPhotoPath = filePath;
        } else {
          console.warn("Photo upload warning:", uploadError);
        }
      } catch (err) {
        console.warn("Photo processing error:", err);
      }
    }

    // Insert into items table
    const { data: inserted, error: insertError } = await supabase
      .from("items")
      .insert({
        type: data.type,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.spot ? `${data.building} (${data.spot})` : data.building,
        occurred_at: data.dateTime ? new Date(data.dateTime).toISOString() : new Date().toISOString(),
        status: "open",
        photo_path: uploadedPhotoPath,
        private_detail: data.verificationDetail || null,
        held_at: data.type === "found" ? "Central Library Vault, Room 104" : "With claimant / unverified",
      })
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Supabase submitReport error:", insertError);
      throw insertError;
    }

    const clientItem = mapDbItemToClient(inserted);
    return {
      success: true,
      refCode: inserted.ref_code,
      item: clientItem,
    };
  },

  /**
   * Approves a claim in the Supabase database.
   */
  async approveClaim(claimId: string, itemId?: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { error: claimErr } = await supabase
      .from("claims")
      .update({ status: "ready_to_collect" })
      .eq("id", claimId);

    if (claimErr) {
      console.error("Supabase approveClaim error:", claimErr);
      throw claimErr;
    }

    if (itemId) {
      const { error: itemErr } = await supabase
        .from("items")
        .update({ status: "verified" })
        .eq("id", itemId);

      if (itemErr) {
        console.warn("Item status update warning on claim approve:", itemErr);
      }
    }

    return { success: true };
  },

  /**
   * Withdraws a reported item by ID or reference code.
   */
  async withdrawReport(itemId: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const isRefCode = itemId.toUpperCase().startsWith("LF-");
    let query = supabase.from("items").delete();

    if (isRefCode) {
      query = query.eq("ref_code", itemId);
    } else {
      query = query.eq("id", itemId);
    }

    const { error } = await query;
    if (error) {
      console.error("Supabase withdrawReport error:", error);
      throw error;
    }

    return { success: true };
  },
};
