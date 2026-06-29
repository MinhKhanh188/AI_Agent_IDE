const AI_PROVIDERS = {
  ollama: {
    id: 'ollama',
    label: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434',
    models: ['qwen3.5:9b', 'qwen3:8b', 'llama3.1:8b', 'mistral:7b', 'phi3:mini'],
    requiresApiKey: false,
    protocol: 'ollama',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    requiresApiKey: true,
    protocol: 'openai',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-5', 'claude-haiku-4-5'],
    requiresApiKey: true,
    protocol: 'anthropic',
  },
};

export default AI_PROVIDERS;
