import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
// Strip trailing /rest/v1 or trailing slashes so createClient receives the clean project base URL
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

/**
 * Flag to indicate whether the portal should fall back to the in-memory mock API.
 * Active when VITE_USE_MOCK is explicitly true OR when Supabase credentials are missing.
 */
export const isMockMode =
  import.meta.env.VITE_USE_MOCK === "true" ||
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("your-project.supabase.co");

/**
 * Supabase client instance. Null when in mock mode.
 */
export const supabase = !isMockMode
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
