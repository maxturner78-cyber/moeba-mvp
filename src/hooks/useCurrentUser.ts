import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: "graduate" | "manager" | "peer" | "admin";
  company_id: string;
  company_name?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, company_id, companies(name)")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setUser(null);
      } else {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as CurrentUser["role"],
          company_id: data.company_id,
          company_name: (data.companies as any)?.name,
        });
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        setLoading(true);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}