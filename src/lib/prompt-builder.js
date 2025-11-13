/**
 * @typedef {Object} PromptBuilderInput
 * @property {string} [roleMetaPrompt]
 * @property {string} [context]
 * @property {string} [command]
 * @property {string} [formatInstruction]
 */

/**
 * Builds the final master prompt string when every segment is present.
 * @param {PromptBuilderInput} input
 * @returns {string}
 */
function buildMasterPrompt(input = {}) {
  const { roleMetaPrompt, context, command, formatInstruction } = input;

  if (!roleMetaPrompt || !context || !command || !formatInstruction) {
    return "";
  }

  const segments = [
    roleMetaPrompt.trim(),
    `Context:\n${context.trim()}`,
    `Command:\n${command.trim()}`,
    `Format:\n${formatInstruction.trim()}`,
  ];

  return segments.join("\n\n");
}

module.exports = { buildMasterPrompt };
