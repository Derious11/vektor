"use client";

import { useEffect, useState } from "react";
import type { FormatOption } from "../types";

type State = {
  formats: FormatOption[];
  loading: boolean;
  error: string | null;
};

const cache = new Map<string, FormatOption[]>();

export function useCommandFormats(commandId?: string, fallback: FormatOption[] = []) {
  const [state, setState] = useState<State>({
    formats: fallback,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!commandId) {
      setState({ formats: fallback, loading: false, error: null });
      return;
    }

    if (cache.has(commandId)) {
      setState({
        formats: cache.get(commandId)!,
        loading: false,
        error: null,
      });
      return;
    }

    let active = true;
    const controller = new AbortController();

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const res = await fetch(`/api/commands/${commandId}/formats`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed (${res.status})`);

        const payload = (await res.json()) as { formats: FormatOption[] };
        if (!active) return;

        const fmts = payload.formats.length > 0 ? payload.formats : fallback;
        cache.set(commandId, fmts);

        setState({ formats: fmts, loading: false, error: null });
      } catch (err) {
        if (!active) return;
        const isAbort =
          err instanceof DOMException
            ? err.name === "AbortError"
            : typeof err === "object" &&
              err !== null &&
              "name" in err &&
              (err as { name?: string }).name === "AbortError";
        if (isAbort) return;

        console.error("useCommandFormats error:", err);
        setState({
          formats: fallback,
          loading: false,
          error: "Could not load format templates. Showing defaults.",
        });
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [commandId, fallback]);

  return state;
}
