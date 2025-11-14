"use client";

import { useRef, useState } from "react";
import { useWizard } from "../WizardProvider";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutosizeTextArea } from "../hooks/useAutosizeTextArea";

const CONTEXT_MAX = 1000;

export function ContextStep() {
  const {
    state: { role, contextText },
    updateField,
  } = useWizard();

  const ref = useRef<HTMLTextAreaElement>(null);
  const [touched, setTouched] = useState(false);

  useAutosizeTextArea(ref, contextText);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField({
      contextText: e.target.value.slice(0, CONTEXT_MAX),
    });
  };

  const disabled = !role;
  const currentLength = contextText?.length ?? 0;
  const showError =
    touched && (!contextText || contextText.trim().length === 0);

  return (
    <div className="space-y-6">
      {!role && (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
          Please select a role first so we can guide the context you provide.
        </div>
      )}

      {/* Header Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Context makes the output actionable.
          </p>
          <p className="text-sm text-muted-foreground">
            Provide specifics like goals, assets, KPIs, and constraints.
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div>
        <label className="text-sm font-semibold text-muted-foreground">
          What should the expert know?
        </label>

        <div className="mt-2 rounded-2xl border border-white/5 bg-[var(--wizard-muted)]/30 p-1">
          <textarea
            ref={ref}
            disabled={disabled}
            value={contextText ?? ""}
            rows={5}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder={
              role?.context_placeholder ??
              "Select a role to load a tailored context checklist."
            }
            className={cn(
              "min-h-[180px] w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-base outline-none transition focus:border-[var(--wizard-accent)]",
              disabled && "cursor-not-allowed opacity-60"
            )}
          />

          <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
            <span>
              {currentLength} / {CONTEXT_MAX} characters
            </span>

            {contextText && contextText.length > 0 && (
              <button
                type="button"
                className="text-[var(--wizard-accent)]"
                onClick={() => updateField({ contextText: "" })}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {showError && (
          <p className="mt-2 text-sm text-destructive">
            Please provide enough detail to proceed.
          </p>
        )}
      </div>
    </div>
  );
}
