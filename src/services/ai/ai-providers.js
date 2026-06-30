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
