export type WizardStepId = "role" | "context" | "command" | "format" | "preview";

export type WizardStep = {
  id: WizardStepId;
  title: string;
  summary: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "role",
    title: "Step 1 - Define the Role",
    summary:
      "Choose the expert persona that will drive tone, rigor, and heuristics.",
  },
  {
    id: "context",
    title: "Step 2 - Provide Context",
    summary:
      "Capture the business background so the LLM can respond with precision.",
  },
  {
    id: "command",
    title: "Step 3 - Define the Command",
    summary: "Clarify the exact task so the model knows what to deliver.",
  },
  {
    id: "format",
    title: "Step 4 - Select the Format",
    summary:
      "Decide how the answer should be structured for instant downstream use.",
  },
  {
    id: "preview",
    title: "Master Prompt Preview",
    summary:
      "Review the compiled expert prompt, copy it, or export a text file for your LLM.",
  },
];
