export type PromptBuilderInput = {
  roleMetaPrompt?: string
  context?: string
  command?: string
  formatInstruction?: string
}

export function buildMasterPrompt(input: PromptBuilderInput): string
