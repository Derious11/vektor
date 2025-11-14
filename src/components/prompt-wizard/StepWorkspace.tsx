"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "./WizardProvider";
import { WIZARD_STEPS } from "./steps";
import type {
  RoleOption,
  CommandOption,
  FormatOption,
} from "./types";
import { RoleStep } from "./steps/RoleStep";
import { ContextStep } from "./steps/ContextStep";
import { CommandStep } from "./steps/CommandStep";
import { FormatStep } from "./steps/FormatStep";
import { PreviewStep } from "./steps/PreviewStep";

type StepWorkspaceProps = {
  roles: RoleOption[];
  globalCommands: CommandOption[];
  formats: FormatOption[];
};

export function StepWorkspace({
  roles,
  globalCommands,
  formats,
}: StepWorkspaceProps) {
  const {
    state: { activeStep },
  } = useWizard();

  const currentStep = WIZARD_STEPS[activeStep] ?? WIZARD_STEPS[0];

  let content: ReactNode = null;
  switch (currentStep.id) {
    case "role":
      content = <RoleStep roles={roles} />;
      break;
    case "context":
      content = <ContextStep />;
      break;
    case "command":
      content = <CommandStep globalCommands={globalCommands} />;
      break;
    case "format":
      content = <FormatStep fallbackFormats={formats} />;
      break;
    case "preview":
      content = <PreviewStep />;
      break;
    default:
      content = null;
  }

  return (
    <section className="flex flex-1 flex-col rounded-3xl border border-white/5 bg-[var(--wizard-panel)] shadow-2xl shadow-black/5">
      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--wizard-accent)]">
          {currentStep.id.toUpperCase()}
        </p>
        <div>
          <h1 className="text-3xl font-bold">{currentStep.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {currentStep.summary}
          </p>
        </div>
        {content}
      </div>
      <WizardFooter />
    </section>
  );
}

function WizardFooter() {
  const {
    state: { activeStep, role, contextText, commandText, formatId },
    nextStep,
    prevStep,
  } = useWizard();

  const isFirst = activeStep === 0;
  const isLast = activeStep === WIZARD_STEPS.length - 1;
  const percent = ((activeStep + 1) / WIZARD_STEPS.length) * 100;

  const stepReady = (() => {
    if (activeStep === 0) return Boolean(role);
    if (activeStep === 1) return Boolean(contextText?.trim());
    if (activeStep === 2) return Boolean(commandText?.trim());
    if (activeStep === 3) return Boolean(formatId);
    return true;
  })();

  const helper =
    activeStep === 0 && !role
      ? "Select a role to continue"
      : activeStep === 1 && !stepReady
        ? "Add context to continue"
        : activeStep === 2 && !stepReady
          ? "Add a command to continue"
          : activeStep === 3 && !stepReady
            ? "Select a format to continue"
            : isLast
              ? "Master prompt ready"
              : "Next - Keep building";

  const handleNext = () => {
    if (!stepReady || isLast) return;
    nextStep();
  };

  return (
    <footer className="rounded-b-3xl border-t border-white/5 bg-[var(--wizard-footer)] px-6 py-4 backdrop-blur">
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[var(--wizard-accent)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirst}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {helper}
        </p>
        <Button
          onClick={handleNext}
          className="gap-2"
          disabled={!stepReady || isLast}
        >
          {isLast ? "Done" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
}
