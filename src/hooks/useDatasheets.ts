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
      .from("ds_datasheets")
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
          table: "ds_datasheets",
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

  const deleteDatasheet = useCallback(
    async (datasheetId: string, sourceFileUrl?: string | null) => {
      // Delete associated file from storage if it exists
      if (sourceFileUrl) {
        try {
          // Extract the storage path from the public URL
          const url = new URL(sourceFileUrl);
          const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/datasheets\/(.+)/);
          if (pathMatch?.[1]) {
            await supabase.storage.from("datasheets").remove([decodeURIComponent(pathMatch[1])]);
          }
        } catch {
          // Storage deletion is best-effort; proceed with DB deletion
        }
      }

      const { error: deleteError } = await supabase
        .from("ds_datasheets")
        .delete()
        .eq("id", datasheetId);

      if (deleteError) {
        return { error: deleteError.message };
      }

      setDatasheets((prev) => prev.filter((ds) => ds.id !== datasheetId));
      return { error: null };
    },
    [supabase]
  );

  return {
    datasheets,
    loading,
    error,
    refetch: fetchDatasheets,
    deleteDatasheet,
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
      .from("ds_datasheets")
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
        .from("ds_datasheets")
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
