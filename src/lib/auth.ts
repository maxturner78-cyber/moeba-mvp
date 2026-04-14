import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ── Types ─────────────────────────────────────────────────────── */

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Core helpers ──────────────────────────────────────────────── */

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Returns the current user's row from the public.users table,
 * looked up by auth.uid(). Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  return data as AppUser | null;
}

/* ── React hook ────────────────────────────────────────────────── */

interface UseCurrentUserReturn {
  user: AppUser | null;
  loading: boolean;
  error: Error | null;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser(authUser: SupabaseUser | null) {
      if (!authUser) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
          setError(null);
        }
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (queryError) throw queryError;
        if (!cancelled) {
          setUser(data as AppUser | null);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Subscribe to auth state changes BEFORE fetching initial session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser(session?.user ?? null);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
