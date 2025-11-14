"use client";

import { useState, useMemo } from "react";
import { Info, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWizard } from "../WizardProvider";
import type { RoleOption } from "../types";

type RoleStepProps = {
  roles: RoleOption[];
};

export function RoleStep({ roles }: RoleStepProps) {
  const {
    state: { role },
    setRole,
  } = useWizard();

  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();

  const filteredRoles = useMemo(() => {
    if (!normalized) return roles;
    return roles.filter((item) => {
      const text = `${item.display_name} ${item.category} ${item.meta_prompt}`.toLowerCase();
      return text.includes(normalized);
    });
  }, [roles, normalized]);

  const grouped = useMemo(() => {
    return filteredRoles.reduce<Record<string, RoleOption[]>>((acc, item) => {
      const key = item.category || "Other";
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
  }, [filteredRoles]);

  const sortedCategories = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Role priming locks tone, heuristics, and domain expertise.
          </p>
          <p className="text-sm text-muted-foreground">
            Choose the persona that best mirrors the expert you wish to consult.
          </p>
        </div>
      </div>

      <div className="relative">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles..."
          className="h-12 rounded-2xl border border-muted bg-transparent pl-11 text-base"
        />
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-5">
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {category}
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {grouped[category].map((item) => {
                const isActive = role?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item)}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition",
                      isActive
                        ? "border-[var(--wizard-accent)] bg-[var(--wizard-accent)]/10 shadow-lg"
                        : "border-white/5 hover:border-[var(--wizard-accent)]/50 hover:bg-[var(--wizard-muted)]/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">
                          {item.display_name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {item.slug}
                        </p>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="h-5 w-5 text-[var(--wizard-accent)]" />
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.meta_prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
