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
};

export type FormatOption = {
  id: string;
  slug: string;
  display_name: string;
  instruction: string;
  category?: string;
  is_active: boolean | null;
};

export type WizardState = {
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
