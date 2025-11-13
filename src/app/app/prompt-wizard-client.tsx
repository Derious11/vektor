"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ThemeInitializer from "@/components/ui/theme-initializer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildMasterPrompt } from "@/lib/prompt-builder";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Dot,
  Info,
  Search,
  Zap,
} from "lucide-react";

export type RoleOption = {
  id: string;
  slug: string;
  display_name: string;
  category: string;
  meta_prompt: string;
  context_placeholder: string;
};

export type CommandOption = {
  id: string;
  display_text: string;
  template_text: string;
  is_global: boolean | null;
  role_ids: string[];
};

export type FormatOption = {
  id: string;
  slug: string;
  display_name: string;
  instruction: string;
  is_active: boolean | null;
};

type WizardStep = {
  id: "role" | "context" | "command" | "format" | "preview";
  title: string;
  summary: string;
  placeholder: string;
};

const wizardSteps: WizardStep[] = [
  {
    id: "role",
    title: "Step 1 · Define the Role",
    summary: "Choose the expert persona that will drive tone, rigor, and heuristics.",
    placeholder: "Select a role (CMO, CTO, etc.) to set the expert lens for this prompt.",
  },
  {
    id: "context",
    title: "Step 2 · Provide Context",
    summary: "Capture the business background so the LLM can respond with precision.",
    placeholder: "What product, audience, KPIs, constraints, and timing should the LLM know?",
  },
  {
    id: "command",
    title: "Step 3 · Define the Command",
    summary: "Clarify the exact task so the model knows what to deliver.",
    placeholder: "Draft the instruction or pick from curated commands tailored to your role.",
  },
  {
    id: "format",
    title: "Step 4 · Select the Format",
    summary: "Decide how the answer should be structured for instant downstream use.",
    placeholder: "Choose Plain Text, Bullet List, JSON, Table, or other formats defined in Supabase.",
  },
  {
    id: "preview",
    title: "Master Prompt Preview",
    summary: "Review the compiled expert prompt, copy it, or export a .txt file for your LLM.",
    placeholder: "Master prompt will appear once Role, Context, Command, and Format are complete.",
  },
];

const LOCAL_STORAGE_KEYS = {
  context: "vektor-context-draft",
};

const CONTEXT_MAX_CHARS = 1000;
const COMMAND_MAX_CHARS = 800;

type WizardAnalyticsDetail = Record<string, unknown>;

const logWizardEvent = (name: string, detail?: WizardAnalyticsDetail) => {
  const payload = {
    ...detail,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }

  if (typeof console !== "undefined") {
    console.info("[PromptWizard]", name, payload);
  }
};

type WizardState = {
  activeStep: number;
  role?: RoleOption;
  contextText?: string;
  commandText?: string;
  commandLabel?: string;
  commandId?: string;
  formatId?: string;
  formatLabel?: string;
  formatSlug?: string;
  formatInstruction?: string;
};

type WizardContextValue = {
  state: WizardState;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (partial: Partial<Omit<WizardState, "activeStep">>) => void;
  setRole: (role: RoleOption) => void;
};

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

function useAutosizeTextArea(
  ref: React.RefObject<HTMLTextAreaElement>,
  value?: string,
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}

function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>({ activeStep: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedContext = localStorage.getItem(LOCAL_STORAGE_KEYS.context);
    if (savedContext) {
      setState((prev) =>
        prev.contextText ? prev : { ...prev, contextText: savedContext },
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.contextText && state.contextText.trim().length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.context, state.contextText);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.context);
    }
  }, [state.contextText]);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      goToStep: (index) =>
        setState((prev) => ({
          ...prev,
          activeStep: Math.min(Math.max(index, 0), wizardSteps.length - 1),
        })),
      nextStep: () =>
        setState((prev) => {
          if (prev.activeStep >= wizardSteps.length - 1) {
            return prev;
          }
          const completedStep = wizardSteps[prev.activeStep].id;
          logWizardEvent("wizard_step_completed", { step: completedStep });
          return {
            ...prev,
            activeStep: Math.min(prev.activeStep + 1, wizardSteps.length - 1),
          };
        }),
      prevStep: () =>
        setState((prev) => ({
          ...prev,
          activeStep: Math.max(prev.activeStep - 1, 0),
        })),
      updateField: (partial) =>
        setState((prev) => ({
          ...prev,
          ...partial,
        })),
      setRole: (role) => {
        logWizardEvent("wizard_role_selected", {
          roleId: role.id,
          slug: role.slug,
        });
        setState((prev) => ({
          ...prev,
          role,
        }));
      },
    }),
    [state],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used inside WizardProvider");
  }
  return ctx;
}

type PromptWizardClientProps = {
  roles: RoleOption[];
  commands: CommandOption[];
  formats: FormatOption[];
};

export default function PromptWizardClient({
  roles,
  commands,
  formats,
}: PromptWizardClientProps) {
  return (
    <>
      <ThemeInitializer />
      <WizardProvider>
        <PromptWizard roles={roles} commands={commands} formats={formats} />
      </WizardProvider>
      <style jsx global>{wizardThemeTokens}</style>
    </>
  );
}

function PromptWizard({
  roles,
  commands,
  formats,
}: {
  roles: RoleOption[];
  commands: CommandOption[];
  formats: FormatOption[];
}) {
  return (
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
            Role Â· Context Â· Command Â· Format
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
        <StepSidebar />
        <StepWorkspace roles={roles} commands={commands} formats={formats} />
      </main>
    </div>
  );
}

function StepSidebar() {
  const {
    state: { activeStep, role },
    goToStep,
  } = useWizard();

  return (
    <aside className="rounded-3xl border border-white/5 bg-[var(--wizard-panel)] shadow-2xl shadow-black/10 md:w-80">
      <div className="p-6">
        <p className="text-sm font-semibold text-muted-foreground">Progress</p>
        <p className="text-2xl font-semibold">
          Step {activeStep + 1} of {wizardSteps.length}
        </p>
        {role && (
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[var(--wizard-accent)]">
            {role.display_name}
          </p>
        )}
      </div>
      <ol className="space-y-1 px-2 pb-3">
        {wizardSteps.map((step, index) => {
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
                  <p className="text-xs text-muted-foreground">
                    {step.summary}
                  </p>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function StepWorkspace({
  roles,
  commands,
  formats,
}: {
  roles: RoleOption[];
  commands: CommandOption[];
  formats: FormatOption[];
}) {
  const {
    state: { activeStep },
  } = useWizard();
  const currentStep = wizardSteps[activeStep];

  let stepContent: React.ReactNode = null;
  switch (currentStep.id) {
    case "role":
      stepContent = <RoleSelection roles={roles} />;
      break;
    case "context":
      stepContent = <ContextStep />;
      break;
    case "command":
      stepContent = <CommandStep commands={commands} />;
      break;
    case "format":
      stepContent = <FormatStep formats={formats} />;
      break;
    case "preview":
      stepContent = <MasterPromptStep />;
      break;
    default:
      stepContent = <PlaceholderStep currentStep={currentStep} />;
  }

  return (
    <section className="flex flex-1 flex-col rounded-3xl border border-white/5 bg-[var(--wizard-panel)] shadow-2xl shadow-black/5">
      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--wizard-accent)]">
          {currentStep.id}
        </p>
        <div>
          <h1 className="text-3xl font-bold">{currentStep.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {currentStep.summary}
          </p>
        </div>
        {stepContent}
      </div>
      <WizardFooter />
    </section>
  );
}

function PlaceholderStep({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--wizard-accent)]/40 bg-[var(--wizard-muted)]/50 p-6 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">Coming in Step {currentStep.id}</p>
      <p className="mt-2 leading-relaxed">
        This workspace will host the interactive forms for the{" "}
        <strong>{currentStep.id}</strong> phase. For now it provides UX rails,
        theming tokens, and layout primitives needed to plug in the real data-fetching
        and validation logic in upcoming steps.
      </p>
      <p className="mt-4 italic text-foreground/80">
        Placeholder hint: {currentStep.placeholder}
      </p>
    </div>
  );
}

function RoleSelection({ roles }: { roles: RoleOption[] }) {
  const {
    state: { role },
    setRole,
  } = useWizard();
  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();

  const filteredRoles = useMemo(() => {
    if (!normalized) return roles;
    return roles.filter((item) => {
      const haystack = `${item.display_name} ${item.category} ${item.meta_prompt}`.toLowerCase();
      return haystack.includes(normalized);
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
            Choose the persona that best mirrors the expert you wish to consult. Each role carries
            a hidden meta prompt and tailored context checklist.
          </p>
        </div>
      </div>

      <div className="relative">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles, e.g. 'CMO', 'CTO', 'Founder'..."
          className="h-12 rounded-2xl border border-muted bg-transparent pl-11 text-base"
        />
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-5">
        {sortedCategories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No roles match â€œ{search}â€. Try a broader search term.
          </p>
        )}
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

      {role && (
        <div className="rounded-2xl border border-[var(--wizard-accent)]/40 bg-[var(--wizard-muted)]/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--wizard-accent)]">
            Selected role
          </p>
          <h3 className="mt-2 text-xl font-semibold">{role.display_name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{role.meta_prompt}</p>
          <div className="mt-4 rounded-xl bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Context checklist
            </p>
            <p className="mt-2 text-sm text-foreground">
              {role.context_placeholder}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CommandStep({ commands }: { commands: CommandOption[] }) {
  const {
    state: { role, commandText, commandLabel },
    updateField,
  } = useWizard();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [touched, setTouched] = useState(false);

  useAutosizeTextArea(textareaRef, commandText);

  const hasRoleSelected = Boolean(role);

  const suggestions = useMemo(() => {
    if (!role) return [];
    const roleMatches = commands.filter((cmd) => cmd.role_ids.includes(role.id));
    if (roleMatches.length > 0) {
      return roleMatches;
    }
    return commands.filter((cmd) => cmd.is_global);
  }, [commands, role]);

  const fallbackList =
    suggestions.length > 0 ? suggestions : commands.slice(0, 4);

  const handleSuggestionClick = (cmd: CommandOption) => {
    updateField({
      commandId: cmd.id,
      commandLabel: cmd.display_text,
      commandText: cmd.template_text,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value.slice(0, COMMAND_MAX_CHARS);
    updateField({
      commandText: nextValue,
      commandId: undefined,
      commandLabel: nextValue.trim().length > 0 ? "Custom command" : undefined,
    });
  };

  const currentLength = commandText?.length ?? 0;
  const showError = touched && (!commandText || commandText.trim().length === 0);

  return (
    <div className="space-y-6">
      {!hasRoleSelected && (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
          Choose a role first to unlock curated commands.
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Pick a command or write your own instruction.
          </p>
          <p className="text-sm text-muted-foreground">
            Quick actions drop in proven templates you can still edit. Prefer your own copy?
            Type it below and weâ€™ll use that instead.
          </p>
        </div>
      </div>

      {hasRoleSelected && fallbackList.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Suggested for {role?.display_name}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fallbackList.map((cmd) => {
              const isActive = commandLabel === cmd.display_text;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleSuggestionClick(cmd)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-[var(--wizard-accent)] bg-[var(--wizard-accent)]/10 text-foreground"
                      : "border-white/10 text-muted-foreground hover:border-[var(--wizard-accent)]/50 hover:text-foreground",
                  )}
                >
                  {cmd.display_text}
                </button>
              );
            })}
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
            disabled={!hasRoleSelected}
            rows={5}
            value={commandText ?? ""}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder={
              hasRoleSelected
                ? "E.g., Draft a 3-month go-to-market plan with KPIs, owners, and risks."
                : "Select a role to unlock tailored commands."
            }
            className={cn(
              "min-h-[160px] w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-base outline-none transition focus:border-[var(--wizard-accent)]",
              !hasRoleSelected && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
            <span>
              {currentLength} / {COMMAND_MAX_CHARS} characters
            </span>
            {commandText && commandText.length > 0 && (
              <button
                type="button"
                className="text-[var(--wizard-accent)]"
                onClick={() =>
                  updateField({
                    commandText: "",
                    commandLabel: undefined,
                    commandId: undefined,
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
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {commandLabel ? `Source Â· ${commandLabel}` : "Custom task"}
        </p>
      </div>
    </div>
  );
}

function FormatStep({ formats }: { formats: FormatOption[] }) {
  const {
    state: { formatId, formatLabel, formatInstruction },
    updateField,
  } = useWizard();

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

  const activeFormat =
    sortedFormats.find((item) => item.id === formatId) ?? sortedFormats[0];

  const handleSelect = (format: FormatOption) => {
    updateField({
      formatId: format.id,
      formatLabel: format.display_name,
      formatSlug: format.slug,
      formatInstruction: format.instruction,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Lock the format so the output is plug-and-play.
          </p>
          <p className="text-sm text-muted-foreground">
            Each option adds instructions to the final prompt. Pick the structure that best fits how
            youâ€™ll consume the answer (docs, spreadsheets, APIs, etc.).
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sortedFormats.map((format) => {
          const isActive = format.id === activeFormat?.id;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => handleSelect(format)}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition",
                isActive
                  ? "border-[var(--wizard-accent)] bg-[var(--wizard-accent)]/10 text-foreground shadow-lg"
                  : "border-white/10 text-muted-foreground hover:border-[var(--wizard-accent)]/40 hover:text-foreground",
              )}
            >
              <p className="text-base font-semibold">{format.display_name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {format.instruction}
              </p>
            </button>
          );
        })}
      </div>

      {activeFormat && (
        <div className="rounded-2xl border border-[var(--wizard-accent)]/40 bg-[var(--wizard-muted)]/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Selected format
          </p>
          <h3 className="mt-2 text-xl font-semibold">{activeFormat.display_name}</h3>
          <p className="mt-2 text-sm text-foreground">
            {activeFormat.instruction}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Slug Â· {activeFormat.slug}
          </p>
        </div>
      )}
    </div>
  );
}

function MasterPromptStep() {
  const {
    state: { role, contextText, commandText, formatInstruction, formatLabel },
  } = useWizard();
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () =>
      buildMasterPrompt({
        roleMetaPrompt: role?.meta_prompt,
        context: contextText,
        command: commandText,
        formatInstruction,
      }),
    [role?.meta_prompt, contextText, commandText, formatInstruction],
  );

  const handleCopy = async () => {
    if (!prompt || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    logWizardEvent("prompt_copied");
  };

  const handleExport = () => {
    if (!prompt || typeof window === "undefined") return;
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vektor-master-prompt.txt";
    link.click();
    URL.revokeObjectURL(url);
    logWizardEvent("prompt_exported");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <p className="text-sm font-semibold text-foreground">
          Master prompt preview
        </p>
        <p className="text-sm text-muted-foreground">
          Adjust any step to refine the content, then copy or export this prompt for your LLM workflow.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[var(--wizard-muted)]/30 p-4">
        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
{prompt || "Complete Role, Context, Command, and Format to generate the master prompt."}
        </pre>
      </div>

      <div className="rounded-2xl border border-[var(--wizard-accent)]/30 bg-background/40 p-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {role ? `Role Â· ${role.display_name}` : "Role Â· Pending"} /{" "}
        {formatLabel ? `Format Â· ${formatLabel}` : "Format Â· Pending"}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} disabled={!prompt} className="gap-2">
          {copied ? "Copied!" : "Copy prompt"}
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          disabled={!prompt}
          className="gap-2"
        >
          Export .txt
        </Button>
      </div>
    </div>
  );
}

function ContextStep() {
  const {
    state: { role, contextText },
    updateField,
  } = useWizard();
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useAutosizeTextArea(textareaRef, contextText);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value.slice(0, CONTEXT_MAX_CHARS);
    updateField({ contextText: nextValue });
  };

  const currentLength = contextText?.length ?? 0;
  const hasRoleSelected = Boolean(role);
  const showError = touched && (!contextText || contextText.trim().length === 0);

  return (
    <div className="space-y-6">
      {!hasRoleSelected && (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
          Please select a role first so we can guide the context you provide.
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-[var(--wizard-accent)]/30 bg-[var(--wizard-accent)]/5 p-4">
        <Info className="mt-1 h-5 w-5 text-[var(--wizard-accent)]" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Context makes the output actionable.
          </p>
          <p className="text-sm text-muted-foreground">
            Provide the specifics the selected persona would ask for. Mention goals,
            guardrails, assets, and deadlinesâ€”up to 1,000 characters.
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-muted-foreground">
          What should the expert know?
        </label>
        <div className="mt-2 rounded-2xl border border-white/5 bg-[var(--wizard-muted)]/30 p-1">
          <textarea
            ref={textareaRef}
            disabled={!hasRoleSelected}
            rows={5}
            value={contextText ?? ""}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder={
              role?.context_placeholder ??
              "Select a role to load a tailored context checklist."
            }
            className={cn(
              "min-h-[180px] w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-base outline-none transition focus:border-[var(--wizard-accent)]",
              !hasRoleSelected && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
            <span>{currentLength} / {CONTEXT_MAX_CHARS} characters</span>
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

      {role && (
        <div className="rounded-2xl border border-[var(--wizard-accent)]/40 bg-[var(--wizard-muted)]/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Role reminder
          </p>
          <p className="mt-2 text-sm text-foreground">{role.meta_prompt}</p>
        </div>
      )}
    </div>
  );
}

function WizardFooter() {
  const {
    state: { activeStep, role, contextText, commandText, formatId },
    nextStep,
    prevStep,
  } = useWizard();

  const isFirst = activeStep === 0;
  const isLast = activeStep === wizardSteps.length - 1;
  const percent = ((activeStep + 1) / wizardSteps.length) * 100;

  const stepReady = (() => {
    if (activeStep === 0) {
      return Boolean(role);
    }
    if (activeStep === 1) {
      return Boolean(contextText && contextText.trim().length > 0);
    }
    if (activeStep === 2) {
      return Boolean(commandText && commandText.trim().length > 0);
    }
    if (activeStep === 3) {
      return Boolean(formatId);
    }
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
              ? "Master Prompt Ready"
              : "Next · Keep Building";

  const handleNext = () => {
    if (!stepReady) return;
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


