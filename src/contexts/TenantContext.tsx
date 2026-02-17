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
  tenants: Tenant[];
  loading: boolean;
  switchTenant: (tenantId: string) => void;
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
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setTenant(null);
      setTenantUser(null);
      setTenants([]);
      setLoading(false);
      return;
    }

    const fetchTenants = async () => {
      setLoading(true);

      const { data: memberships, error: membershipError } = await supabase
        .from("ds_tenant_users")
        .select(
          `
          *,
          tenant:ds_tenants(*)
        `
        )
        .eq("user_id", user.id);

      if (membershipError) {
        console.error("Error fetching tenants:", membershipError);
        setLoading(false);
        return;
      }

      if (memberships && memberships.length > 0) {
        const userTenants = memberships
          .map((m) => m.tenant as unknown as Tenant)
          .filter(Boolean);
        setTenants(userTenants);

        const storedTenantId = localStorage.getItem("currentTenantId");
        const currentMembership =
          memberships.find((m) => m.tenant_id === storedTenantId) ||
          memberships[0];

        setTenant(currentMembership.tenant as unknown as Tenant);
        setTenantUser(currentMembership);
      }

      setLoading(false);
    };

    fetchTenants();
  }, [user, supabase]);

  const switchTenant = useCallback(
    (tenantId: string) => {
      const targetTenant = tenants.find((t) => t.id === tenantId);
      if (targetTenant) {
        setTenant(targetTenant);
        localStorage.setItem("currentTenantId", tenantId);
      }
    },
    [tenants]
  );

  return (
    <TenantContext.Provider
      value={{ tenant, tenantUser, tenants, loading, switchTenant }}
    >
      {children}
    </TenantContext.Provider>
  );
}
