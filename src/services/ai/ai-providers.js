// Wire protocols we know how to speak. The user can still create
// any number of custom providers; each one just needs to declare
// which protocol it speaks.
export const AI_PROTOCOLS = [
  { id: 'ollama', label: 'Ollama' },
  { id: 'openai', label: 'OpenAI-compatible' },
  { id: 'anthropic', label: 'Anthropic' },
];

// Starter providers shown the first time the app runs.
// The user can edit, delete, or add to these freely.
export const DEFAULT_PROVIDERS = [
  {
    id: 'ollama-local',
    label: 'Ollama (Local)',
    protocol: 'ollama',
    baseUrl: 'http://localhost:11434',
    apiKey: '',
    model: 'qwen3.5:9b',
  },
];

/**
 * Determines whether a given protocol and model combination supports native/extended thinking/reasoning.
 *
 * @param {string} protocol - 'anthropic', 'openai', or 'ollama'
 * @param {string} model - The model identifier string
 * @returns {boolean}
 */
export function supportsThinking(protocol, model) {
  if (!model) return false;

  if (protocol === 'anthropic') {
    // Claude 4.x family supports extended thinking loosely matched.
    return model.includes('claude-opus-4') ||
           model.includes('claude-sonnet-4') ||
           model.includes('claude-haiku-4');
  }

  if (protocol === 'openai') {
    // OpenAI: starts with reasoning-capable prefixes ('o1', 'o3', 'o4') or contains 'gpt-5'.
    // (Maintain these prefixes/substrings over time as new reasoning models release)
    return model.startsWith('o1') ||
           model.startsWith('o3') ||
           model.startsWith('o4') ||
           model.includes('gpt-5');
  }

  if (protocol === 'ollama') {
    // Ollama uses implicit thinking via message.thinking (emitted automatically).
    return false;
  }

  return false;
}
