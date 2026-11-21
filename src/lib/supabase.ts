import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Flag to indicate whether the portal should fall back to the in-memory mock API.
 * Active when VITE_USE_MOCK is explicitly true OR when Supabase credentials are missing.
 */
export const isMockMode =
  import.meta.env.VITE_USE_MOCK === "true" ||
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "https://your-project.supabase.co";

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
