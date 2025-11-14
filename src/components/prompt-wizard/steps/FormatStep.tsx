"use client";

import { useEffect, useMemo } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "../WizardProvider";
import { useCommandFormats } from "../hooks/useCommandFormats";
import type { FormatOption } from "../types";

function exampleForSlug(slug: string): string | null {
  switch (slug) {
    case "json":
      return `{\n  "title": "Example",\n  "items": []\n}`;
    case "table":
      return `| Column | Value |\n|--------|-------|\n| A      | B     |`;
    case "bullets":
      return "- Point one\n- Point two\n- Point three";
    case "email":
      return "Subject: Example subject\n\nHi [Name],\n\nHere is an example email body...";
    default:
      return null;
  }
}

type FormatStepProps = {
  fallbackFormats: FormatOption[];
};

export function FormatStep({ fallbackFormats }: FormatStepProps) {
  const {
    state: { commandId, formatId },
    updateField,
  } = useWizard();

  const { formats, loading, error } = useCommandFormats(
    commandId,
    fallbackFormats,
  );

  const sortedFormats = useMemo(
    () => [...formats].sort((a, b) => a.display_name.localeCompare(b.display_name)),
    [formats],
  );

  useEffect(() => {
    if (formatId || sortedFormats.length === 0) return;
    const fallback =
      sortedFormats.find((item) => item.slug === "plain_text") ?? sortedFormats[0];
    updateField({
      formatId: fallback.id,
      formatLabel: fallback.display_name,
      formatSlug: fallback.slug,
      formatInstruction: fallback.instruction,
    });
  }, [formatId, sortedFormats, updateField]);

  const grouped = useMemo(() => {
    return sortedFormats.reduce<Record<string, FormatOption[]>>((acc, fmt) => {
      const key = fmt.category || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(fmt);
      return acc;
    }, {});
  }, [sortedFormats]);

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const active =
    sortedFormats.find((f) => f.id === formatId) ??
    (sortedFormats.length > 0 ? sortedFormats[0] : undefined);

  const handleSelect = (fmt: FormatOption) => {
    updateField({
      formatId: fmt.id,
      formatLabel: fmt.display_name,
      formatSlug: fmt.slug,
      formatInstruction: fmt.instruction,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Choose how the answer should be structured.
          </p>
          <p className="text-sm text-muted-foreground">
            Formats control the output skeleton so you can paste results straight into
            slides, docs, sheets, or API payloads.
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">Loading formats...</p>
      )}
      {error && <p className="text-xs text-amber-500">{error}</p>}

      {categories.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">
          No formats mapped to this command yet. Add some in Supabase.
        </p>
      ) : (
        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {category}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {grouped[category].map((format) => {
                  const isActive = active?.id === format.id;
                  const example = exampleForSlug(format.slug);
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => handleSelect(format)}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left transition",
                        isActive
                          ? "border-[var(--wizard-accent)] bg-[var(--wizard-accent)]/10 shadow-lg text-foreground"
                          : "border-white/10 text-muted-foreground hover:border-[var(--wizard-accent)]/40 hover:text-foreground",
                      )}
                    >
                      <p className="text-base font-semibold">
                        {format.display_name}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {format.instruction}
                      </p>
                      {example && (
                        <pre className="mt-3 max-h-24 overflow-auto rounded-md bg-background/60 p-2 text-[11px] leading-snug text-muted-foreground">
                          {example}
                        </pre>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="rounded-2xl border border-[var(--wizard-accent)]/40 bg-[var(--wizard-muted)]/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Selected format
          </p>
          <h3 className="mt-2 text-xl font-semibold">{active.display_name}</h3>
          <p className="mt-2 text-sm text-foreground">{active.instruction}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Slug / {active.slug}
          </p>
        </div>
      )}
    </div>
  );
}
