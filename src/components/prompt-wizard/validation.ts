"use client";

import { z } from "zod";
import type { WizardState } from "./types";

export const wizardStateSchema = z.object({
  roleId: z.string().uuid(),
  contextText: z.string().min(1).max(1000),
  commandText: z.string().min(1).max(800),
  formatId: z.string().uuid(),
});

export function validateWizardState(state: WizardState) {
  return wizardStateSchema.safeParse({
    roleId: state.role?.id,
    contextText: state.contextText ?? "",
    commandText: state.commandText ?? "",
    formatId: state.formatId,
  });
}
