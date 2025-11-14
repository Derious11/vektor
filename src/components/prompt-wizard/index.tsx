"use client";

import { Zap } from "lucide-react";
import ThemeInitializer from "@/components/ui/theme-initializer";
import { WizardProvider } from "./WizardProvider";
import { StepSidebar } from "./StepSidebar";
import { StepWorkspace } from "./StepWorkspace";
import { WIZARD_STEPS } from "./steps";
import type {
  RoleOption,
  CommandOption,
  FormatOption,
} from "./types";

export type PromptWizardProps = {
  roles: RoleOption[];
  globalCommands: CommandOption[];
  formats: FormatOption[];
};

export default function PromptWizard({
  roles,
  globalCommands,
  formats,
}: PromptWizardProps) {
  const headerSteps = WIZARD_STEPS.filter((step) => step.id !== "preview")
    .map((step) => step.id.charAt(0).toUpperCase() + step.id.slice(1))
    .join(" > ");

  return (
    <>
      <ThemeInitializer />
      <WizardProvider>
        <div
          className="min-h-screen bg-[var(--wizard-surface)] text-foreground"
          data-testid="prompt-wizard-shell"
        >
          <header className="border-b border-white/5 bg-[var(--wizard-panel)]/90 backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--wizard-accent)]/10 text-[var(--wizard-accent)]">
                  <Zap className="h-4 w-4" strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Vektor
                  </p>
                  <p className="text-lg font-semibold leading-none">Wizard</p>
                </div>
              </div>
              <p className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground md:block">
                {headerSteps}
              </p>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
            <StepSidebar />
            <StepWorkspace
              roles={roles}
              globalCommands={globalCommands}
              formats={formats}
            />
          </main>
        </div>
      </WizardProvider>
      <style jsx global>{wizardThemeTokens}</style>
    </>
  );
}

export type {
  RoleOption,
  CommandOption,
  FormatOption,
} from "./types";

const wizardThemeTokens = `
:root {
  --wizard-surface: hsl(216deg 33% 97%);
  --wizard-panel: hsl(0deg 0% 100%);
  --wizard-accent: hsl(227deg 74% 55%);
  --wizard-muted: hsl(210deg 22% 92%);
  --wizard-footer: hsla(0deg 0% 100% / 0.85);
}
.dark {
  --wizard-surface: hsl(222deg 47% 7%);
  --wizard-panel: hsl(222deg 47% 12%);
  --wizard-accent: hsl(182deg 56% 65%);
  --wizard-muted: hsla(0deg 0% 100% / 0.08);
  --wizard-footer: hsla(222deg 47% 8% / 0.9);
}
`;
