import { useCallback, useEffect, useRef, useState } from "react";
import {
  adaptCommercialData,
  getFallbackCommercialData,
} from "../lib/liveDataAdapter";

export function useCommercialData() {
  const requestId = useRef(0);
  const [state, setState] = useState({
    data: getFallbackCommercialData(),
    mode: "loading",
    isLoading: true,
    error: null,
    updatedAt: null,
  });

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/commercial-data", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          payload?.message || `Live data request failed (${response.status}).`,
        );
      const data = adaptCommercialData(payload);
      if (requestId.current !== currentRequest) return;
      setState({
        data,
        mode: "live",
        isLoading: false,
        error: null,
        updatedAt: payload.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      if (requestId.current !== currentRequest) return;
      setState({
        data: getFallbackCommercialData(),
        mode: "fallback",
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Live data is unavailable.",
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
    sourceLabel:
      state.mode === "live"
        ? "Live · Supabase App #4"
        : state.mode === "fallback"
          ? "Demo fallback"
          : "Loading live data…",
  };
}
