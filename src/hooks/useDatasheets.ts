"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Datasheet, DatasheetStatus } from "@/lib/supabase/types";

interface UseDatasheetOptions {
  tenantId?: string;
  status?: DatasheetStatus | DatasheetStatus[];
  limit?: number;
}

export function useDatasheets(options: UseDatasheetOptions = {}) {
  const { tenantId, status, limit = 50 } = options;
  const [datasheets, setDatasheets] = useState<Datasheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDatasheets = useCallback(async () => {
    if (!tenantId) {
      setDatasheets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("ft_datasheets")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      if (Array.isArray(status)) {
        query = query.in("status", status);
      } else {
        query = query.eq("status", status);
      }
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setDatasheets([]);
    } else {
      setDatasheets(data || []);
    }

    setLoading(false);
  }, [tenantId, status, limit, supabase]);

  useEffect(() => {
    fetchDatasheets();
  }, [fetchDatasheets]);

  // Real-time subscription for updates
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("datasheets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ft_datasheets",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          fetchDatasheets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, supabase, fetchDatasheets]);

  return {
    datasheets,
    loading,
    error,
    refetch: fetchDatasheets,
  };
}

export function useDatasheet(id: string | null) {
  const [datasheet, setDatasheet] = useState<Datasheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDatasheet = useCallback(async () => {
    if (!id) {
      setDatasheet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("ft_datasheets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setDatasheet(null);
    } else {
      setDatasheet(data);
    }

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchDatasheet();
  }, [fetchDatasheet]);

  const updateDatasheet = useCallback(
    async (updates: Partial<Datasheet>) => {
      if (!id) return { error: "No datasheet ID" };

      const { error: updateError } = await supabase
        .from("ft_datasheets")
        .update(updates)
        .eq("id", id);

      if (!updateError) {
        setDatasheet((prev) => (prev ? { ...prev, ...updates } : null));
      }

      return { error: updateError?.message || null };
    },
    [id, supabase]
  );

  return {
    datasheet,
    loading,
    error,
    updateDatasheet,
    refetch: fetchDatasheet,
  };
}
