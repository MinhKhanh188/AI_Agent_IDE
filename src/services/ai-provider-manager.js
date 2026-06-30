export default class AIProviderManager {
  constructor({ baseUrl, model, apiKey, protocol }) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiKey = apiKey || '';
    this.protocol = protocol;
  }

  async chat(messages, tools, onChunk, signal) {
    switch (this.protocol) {
      case 'ollama':   return this._ollama(messages, tools, onChunk, signal);
      case 'openai':   return this._openai(messages, tools, onChunk, signal);
      case 'anthropic': return this._anthropic(messages, tools, onChunk, signal);
      default: throw new Error(`Unknown protocol: ${this.protocol}`);
    }
  }

  // ── Ollama ────────────────────────────────────────────────────────────────
  async _ollama(messages, tools, onChunk, signal) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, tools, stream: true }),
      signal,
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let thought = '', content = '', toolCalls = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        const t = line.trim();
        if (!t) continue;
        try {
          const p = JSON.parse(t);
          if (!p.message) continue;
          if (p.message.thinking) { thought += p.message.thinking; onChunk?.('thought', thought); }
          if (p.message.content)  { content += p.message.content;  onChunk?.('content', content); }
          if (p.message.tool_calls?.length) toolCalls = p.message.tool_calls;
        } catch {}
      }
    }
    return { content, thought, tool_calls: toolCalls };
  }

  // ── OpenAI ────────────────────────────────────────────────────────────────
  async _openai(messages, tools, onChunk, signal) {
    const formattedTools = tools.map(t => ({ type: t.type, function: t.function }));
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: this.model, messages, tools: formattedTools, stream: true }),
      signal,
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    const toolCallBuffers = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        const t = line.trim();
        if (!t.startsWith('data: ') || t === 'data: [DONE]') continue;
        try {
          const delta = JSON.parse(t.slice(6)).choices?.[0]?.delta;
          if (!delta) continue;
          if (delta.content) { content += delta.content; onChunk?.('content', content); }
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const i = tc.index ?? 0;
              if (!toolCallBuffers[i]) toolCallBuffers[i] = { id: '', type: 'function', function: { name: '', arguments: '' } };
              if (tc.id) toolCallBuffers[i].id = tc.id;
              if (tc.type) toolCallBuffers[i].type = tc.type;
              if (tc.function?.name) toolCallBuffers[i].function.name += tc.function.name;
              if (tc.function?.arguments) toolCallBuffers[i].function.arguments += tc.function.arguments;
            }
          }
        } catch {}
      }
    }
    return { content, thought: '', tool_calls: Object.values(toolCallBuffers) };
  }

  // ── Anthropic ─────────────────────────────────────────────────────────────
  async _anthropic(messages, tools, onChunk, signal) {
    const formattedTools = tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const filtered  = messages.filter(m => m.role !== 'system');

    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemMsg,
        messages: filtered,
        tools: formattedTools,
        max_tokens: 4096,
        stream: true,
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    const toolBuffers = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        const t = line.trim();
        if (!t.startsWith('data: ')) continue;
        try {
          const p = JSON.parse(t.slice(6));
          if (p.type === 'content_block_delta') {
            if (p.delta.type === 'text_delta') { content += p.delta.text; onChunk?.('content', content); }
            if (p.delta.type === 'input_json_delta') {
              const i = p.index ?? 0;
              toolBuffers[i] = (toolBuffers[i] || '') + p.delta.partial_json;
            }
          }
        } catch {}
      }
    }
    return { content, thought: '', tool_calls: Object.values(toolBuffers) };
  }
}
