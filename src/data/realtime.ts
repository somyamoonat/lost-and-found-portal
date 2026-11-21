import { supabase, isMockMode } from "@/lib/supabase";
import type { Item } from "@/data/items";
import { mapDbItemToClient } from "./supabaseApi";

type ItemCallback = (item: Item) => void;

const listeners: Set<ItemCallback> = new Set();
let channelInitialized = false;

/**
 * Subscribes to real-time new item insertions.
 * Connects to Supabase Realtime channel 'public:items' when Supabase is active,
 * and seamlessly listens for local browser events in mock mode.
 */
export function subscribeToNewItems(callback: ItemCallback): () => void {
  listeners.add(callback);

  // Initialize Supabase realtime channel once if in Supabase mode
  if (!isMockMode && supabase && !channelInitialized) {
    channelInitialized = true;
    try {
      supabase
        .channel("public:items")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "items" },
          (payload) => {
            try {
              const newItem = mapDbItemToClient(payload.new);
              listeners.forEach((fn) => fn(newItem));
            } catch (err) {
              console.error("Error mapping realtime item:", err);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Supabase Realtime subscription error:", err);
    }
  }

  // Also listen for local custom events (useful for mock mode & instant in-app events)
  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<Item>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("sju:new-item", handleCustomEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("sju:new-item", handleCustomEvent);
    }
  };
}

/**
 * Dispatches a new item event locally across components.
 */
export function dispatchNewItem(item: Item): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sju:new-item", { detail: item }));
  }
}
