"use client";

import { useEffect, useState } from "react";
import type { CommandOption } from "../types";

type State = {
  commands: CommandOption[];
  loading: boolean;
  error: string | null;
};

const cache = new Map<string, CommandOption[]>();

export function useRoleCommands(roleId?: string, fallback: CommandOption[] = []) {
  const [state, setState] = useState<State>({
    commands: fallback,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!roleId) {
      setState({ commands: fallback, loading: false, error: null });
      return;
    }

    // Return cached commands if available
    if (cache.has(roleId)) {
      setState({
        commands: cache.get(roleId)!,
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
        const res = await fetch(`/api/roles/${roleId}/commands`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed (${res.status})`);

        const payload = (await res.json()) as { commands: CommandOption[] };
        if (!active) return;

        const cmds = payload.commands.length > 0 ? payload.commands : fallback;
        cache.set(roleId, cmds);

        setState({ commands: cmds, loading: false, error: null });
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
        console.error("useRoleCommands error:", err);

        setState({
          commands: fallback,
          loading: false,
          error: "Could not load commands. Using global defaults.",
        });
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [roleId, fallback]);

  return state;
}
