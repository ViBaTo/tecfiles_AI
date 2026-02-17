"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tenant, TenantUser } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

interface TenantContextValue {
  tenant: Tenant | null;
  tenantUser: TenantUser | null;
  loading: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside <TenantProvider>");
  return ctx;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTenant = useCallback(async () => {
    if (!user) {
      setTenant(null);
      setTenantUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: membership, error: membershipError } = await supabase
      .from("ds_tenant_users")
      .select(
        `
        *,
        tenant:ds_tenants(*)
      `
      )
      .eq("user_id", user.id)
      .single();

    if (membershipError) {
      console.error("Error fetching tenant:", membershipError);
      setTenant(null);
      setTenantUser(null);
      setLoading(false);
      return;
    }

    setTenant(membership.tenant as unknown as Tenant);
    setTenantUser(membership);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const refreshTenant = useCallback(async () => {
    await fetchTenant();
  }, [fetchTenant]);

  return (
    <TenantContext.Provider
      value={{ tenant, tenantUser, loading, refreshTenant }}
    >
      {children}
    </TenantContext.Provider>
  );
}
