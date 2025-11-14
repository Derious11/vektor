import test from "node:test";
import assert from "node:assert/strict";

import { buildMasterPrompt } from "../src/lib/prompt-builder.js";

test("buildMasterPrompt returns empty string when any segment missing", () => {
  assert.equal(
    buildMasterPrompt({
      roleMetaPrompt: "You are a CTO",
      context: "Context",
      command: "Command",
    }),
    "",
  );
});

test("buildMasterPrompt trims whitespace and stitches sections", () => {
  const output = buildMasterPrompt({
    roleMetaPrompt: "  You are a CTO  ",
    context: "  Build a roadmap ",
    command: "\nDeliver milestones ",
    formatInstruction: " Return JSON ",
  });

  assert.equal(
    output,
    "You are a CTO\n\nContext:\nBuild a roadmap\n\nCommand:\nDeliver milestones\n\nFormat:\nReturn JSON",
  );
});
