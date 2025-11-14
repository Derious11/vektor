"use client";

import { useState, useRef, useMemo } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "../WizardProvider";
import { useAutosizeTextArea } from "../hooks/useAutosizeTextArea";
import { useRoleCommands } from "../hooks/useRoleCommands";
import type { CommandOption } from "../types";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const COMMAND_MAX_CHARS = 800;

type CommandStepProps = {
  globalCommands: CommandOption[];
};

export function CommandStep({ globalCommands }: CommandStepProps) {
  const {
    state: { role, commandText, commandLabel, commandId },
    updateField,
  } = useWizard();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [touched, setTouched] = useState(false);
  const [query, setQuery] = useState("");

  const { commands: suggestions, loading, error } = useRoleCommands(
    role?.id,
    globalCommands,
  );

  useAutosizeTextArea(textareaRef, commandText);

  const hasRole = Boolean(role);
  const currentLength = commandText?.length ?? 0;
  const showError = touched && (!commandText || !commandText.trim());
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCommands = useMemo(() => {
    const list = suggestions;
    if (!normalizedQuery) return list;
    return list.filter((cmd) =>
      `${cmd.display_text} ${cmd.template_text}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [suggestions, normalizedQuery]);

  const sortedCommands = useMemo(() => {
    return [...filteredCommands].sort((a, b) => {
      if (a.is_global === b.is_global) {
        return a.display_text.localeCompare(b.display_text);
      }
      return a.is_global ? -1 : 1;
    });
  }, [filteredCommands]);

  const handleSuggestionClick = (cmd: CommandOption) => {
    updateField({
      commandId: cmd.id,
      commandLabel: cmd.display_text,
      commandText: cmd.template_text,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value.slice(0, COMMAND_MAX_CHARS);
    updateField({
      commandText: next,
      commandId: undefined,
      commandLabel: next.trim() ? "Custom command" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {!hasRole && (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
          Please select a role first to unlock curated commands.
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Pick a command or write your own.
          </p>
          <p className="text-sm text-muted-foreground">
            Suggestions are mapped to the selected role. Recommended templates are
            battle-tested patterns you can still customize freely.
          </p>
        </div>
      </div>

      {hasRole && (
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Suggested for {role?.display_name}
              </p>
              {loading && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
              {error && <p className="text-xs text-amber-500">{error}</p>}
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search commands"
              className="h-11 rounded-full border border-white/10 bg-transparent px-4 text-sm sm:w-64"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sortedCommands.length > 0 ? (
              sortedCommands.map((cmd) => {
                const isActive = commandId === cmd.id || commandLabel === cmd.display_text;
                const snippetSource = cmd.template_text.replace(/\s+/g, " ").trim();
                const snippet =
                  snippetSource.length > 150
                    ? `${snippetSource.slice(0, 147)}...`
                    : snippetSource;

                return (
                  <div
                    key={cmd.id}
                    className={cn(
                      "rounded-2xl border p-4 shadow-sm transition",
                      isActive
                        ? "border-[var(--wizard-accent)] bg-[var(--wizard-accent)]/10 shadow-lg"
                        : "border-white/10 hover:border-[var(--wizard-accent)]/40 hover:bg-[var(--wizard-muted)]/20",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(cmd)}
                      className="flex w-full flex-col text-left"
                      aria-pressed={isActive}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{cmd.display_text}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {cmd.is_global ? "Universal template" : "Role specific"}
                          </p>
                        </div>
                        {cmd.is_global && (
                          <span className="rounded-full bg-[var(--wizard-accent)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--wizard-accent)]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{snippet || "Preview available in full template."}</p>
                    </button>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{cmd.template_text.split(/\s+/).length} words</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="font-semibold text-[var(--wizard-accent)] hover:underline"
                          >
                            Preview template
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-96 border border-white/10 bg-[var(--wizard-panel)] text-xs shadow-xl"
                        >
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {cmd.display_text}
                          </p>
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {cmd.template_text}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                {normalizedQuery
                  ? "No commands match your search. Try a different phrase."
                  : "No commands are mapped to this role yet. Create a custom one below."}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-muted-foreground">
          Describe the exact task
        </label>
        <div className="mt-2 rounded-2xl border border-white/5 bg-[var(--wizard-muted)]/30 p-1">
          <textarea
            ref={textareaRef}
            disabled={!hasRole}
            rows={5}
            value={commandText ?? ""}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder={
              hasRole
                ? "E.g., Draft a 90-day GTM plan with KPIs, owners, and risks."
                : "Select a role to unlock tailored commands."
            }
            className={cn(
              "min-h-[160px] w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-base outline-none transition focus:border-[var(--wizard-accent)]",
              !hasRole && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
            <span>
              {currentLength} / {COMMAND_MAX_CHARS} characters
            </span>
            {commandText && (
              <button
                type="button"
                className="text-[var(--wizard-accent)]"
                onClick={() =>
                  updateField({
                    commandText: "",
                    commandId: undefined,
                    commandLabel: undefined,
                  })
                }
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {showError && (
          <p className="mt-2 text-sm text-destructive">
            Please enter or select a command to continue.
          </p>
        )}
      </div>
    </div>
  );
}
