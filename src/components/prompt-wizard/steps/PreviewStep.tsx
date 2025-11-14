"use client";

import { useMemo, useState } from "react";
import { useWizard } from "../WizardProvider";
import { Button } from "@/components/ui/button";
import { buildMasterPrompt } from "@/lib/prompt-builder";
import { logWizardEvent } from "../analytics";

export function PreviewStep() {
  const {
    state: { role, contextText, commandText, formatInstruction },
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
    [role?.meta_prompt, contextText, commandText, formatInstruction]
  );

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    logWizardEvent("prompt_copied");
  };

  const handleExport = () => {
    if (!prompt) return;
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vektor-master-prompt.txt";
    a.click();

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
          Adjust any step, then copy or export.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[var(--wizard-muted)]/30 p-4">
        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
          {prompt || "Complete Role, Context, Command, and Format to generate the master prompt."}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} disabled={!prompt}>
          {copied ? "Copied!" : "Copy prompt"}
        </Button>

        <Button onClick={handleExport} variant="outline" disabled={!prompt}>
          Export .txt
        </Button>
      </div>
    </div>
  );
}
