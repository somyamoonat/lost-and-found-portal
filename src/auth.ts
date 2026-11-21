import { useState, useEffect } from "react";
import { collegeConfig } from "./config/college";

export interface User {
  id: string;
  email: string;
  name: string;
  studentId: string;
  department: string;
}

const AUTH_STORAGE_KEY = "sju_authenticated_user";

/**
 * Returns the institutional email domain from college config.
 */
export const getCollegeDomain = (): string => {
  const contactEmail = collegeConfig.contact.email;
  const parts = contactEmail.split("@");
  return parts.length > 1 ? parts[1].toLowerCase() : "stjude.edu";
};

// Global observable listeners for auth state synchronization
const listeners = new Set<(user: User | null) => void>();

export const auth = {
  getUser(): User | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  },

  /**
   * Mock authentication:
   * Only permits emails ending with the configured college domain.
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // 350ms simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    const trimmedEmail = email.trim().toLowerCase();
    const domain = getCollegeDomain();

    if (!trimmedEmail) {
      return { success: false, error: "University email is required." };
    }

    if (!trimmedEmail.endsWith(`@${domain}`)) {
      return {
        success: false,
        error: `Please use your university email ending with @${domain}.`,
      };
    }

    if (!password) {
      return { success: false, error: "University password is required." };
    }

    if (password.length < 4) {
      return { success: false, error: "Password must be at least 4 characters." };
    }

    // Derive realistic user name from email handle
    const handle = trimmedEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = handle
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const user: User = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      email: trimmedEmail,
      name: formattedName || "University Student",
      studentId: "SJU-" + Math.floor(10000 + Math.random() * 90000),
      department: "Campus Safety & Student Services",
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore quota errors in private browsing
    }

    listeners.forEach((listener) => listener(user));
    return { success: true, user };
  },

  signOut(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    listeners.forEach((listener) => listener(null));
  },

  subscribe(listener: (user: User | null) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => auth.getUser());

  useEffect(() => {
    return auth.subscribe((u) => {
      setUser(u);
    });
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    signIn: auth.signIn,
    signOut: auth.signOut,
  };
}
