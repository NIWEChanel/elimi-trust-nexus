import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "super_admin" | "employee" | null;

export function useCurrentRole() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      if (!active) return;
      if (!u.user) {
        setUserId(null);
        setEmail(null);
        setRole(null);
        setLoading(false);
        return;
      }
      setUserId(u.user.id);
      setEmail(u.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      if (!active) return;
      const isSuper = roles?.some((r) => r.role === "super_admin");
      setRole(isSuper ? "super_admin" : roles && roles.length > 0 ? "employee" : null);
      setLoading(false);
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, email, role, loading };
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
