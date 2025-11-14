"use client";

type WizardAnalyticsDetail = Record<string, unknown>;

export function logWizardEvent(
  name: string,
  detail?: WizardAnalyticsDetail,
) {
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
}
