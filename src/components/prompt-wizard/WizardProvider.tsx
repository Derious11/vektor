"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { RoleOption, WizardState } from "./types";
import { WIZARD_STEPS } from "./steps";
import { logWizardEvent } from "./analytics";

type WizardContextValue = {
  state: WizardState;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (data: Partial<Omit<WizardState, "activeStep">>) => void;
  setRole: (role: RoleOption) => void;
};

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}

const LOCAL_STORAGE_KEYS = { context: "vektor-context-draft" };
const MAX_STEP_INDEX = WIZARD_STEPS.length - 1;

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(() => {
    if (typeof window === "undefined") {
      return { activeStep: 0 };
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.context);
    return {
      activeStep: 0,
      contextText: saved ?? undefined,
    };
  });

  // Autosave context
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.contextText?.trim()) {
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
          activeStep: Math.min(Math.max(index, 0), MAX_STEP_INDEX),
        })),
      nextStep: () =>
        setState((prev) => {
          if (prev.activeStep >= MAX_STEP_INDEX) {
            return prev;
          }

          const completedStep = WIZARD_STEPS[prev.activeStep]?.id;
          if (completedStep) {
            logWizardEvent("wizard_step_completed", { step: completedStep });
          }

          return {
            ...prev,
            activeStep: prev.activeStep + 1,
          };
        }),
      prevStep: () =>
        setState((prev) => ({
          ...prev,
          activeStep: Math.max(prev.activeStep - 1, 0),
        })),
      updateField: (data) =>
        setState((prev) => ({
          ...prev,
          ...data,
        })),
      setRole: (role) =>
        setState((prev) => {
          if (prev.role?.id === role.id) {
            return prev;
          }

          logWizardEvent("wizard_role_selected", {
            roleId: role.id,
            slug: role.slug,
            category: role.category,
          });
          return { ...prev, role };
        }),
    }),
    [state],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}
