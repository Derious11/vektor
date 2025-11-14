"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "./WizardProvider";
import { CheckCircle2, Dot, Circle } from "lucide-react";
import { WIZARD_STEPS } from "./steps";

export function StepSidebar() {
  const {
    state: { activeStep, role },
    goToStep,
  } = useWizard();

  return (
    <aside className="rounded-3xl border border-white/5 bg-[var(--wizard-panel)] shadow-2xl shadow-black/10 md:w-80">
      <div className="p-6">
        <p className="text-sm font-semibold text-muted-foreground">Progress</p>
        <p className="text-2xl font-semibold">
          Step {activeStep + 1} of {WIZARD_STEPS.length}
        </p>
        {role && (
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[var(--wizard-accent)]">
            {role.display_name}
          </p>
        )}
      </div>

      <ol className="space-y-1 px-2 pb-3">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition",
                  isActive
                    ? "bg-[var(--wizard-accent)]/10 text-foreground"
                    : "hover:bg-muted/30",
                )}
              >
                <span className="mt-1">
                  {isComplete ? (
                    <CheckCircle2
                      className="h-5 w-5 text-[var(--wizard-accent)]"
                      aria-hidden
                    />
                  ) : isActive ? (
                    <Dot
                      className="h-5 w-5 text-[var(--wizard-accent)]"
                      aria-hidden
                    />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
                <span>
                  <p className="text-sm font-semibold">{step.title}</p>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
