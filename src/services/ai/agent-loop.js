import AIProviderManager from './ai-provider-manager';
import { executeTool, toolDefinitions } from './tools/index.js';

/**
 * Runs the agentic tool-use loop: calls the AI provider, executes any
 * tool_calls it returns, feeds results back, and repeats until the model
 * stops calling tools (or the request is aborted).
 *
 * All UI state updates happen via the provided callbacks — this function
 * has no knowledge of React state.
 *
 * @param {object} params
 * @param {Array} params.apiMessages - initial message history (incl. system message if any)
 * @param {object} params.provider - { baseUrl, model, apiKey, protocol }
 * @param {AbortSignal} [params.signal]
 * @param {Array} [params.openedFiles] - current open editor tabs (for dirty-file check)
 * @param {(path: string, content: string) => void} [params.onFileWritten]
 *        - called after a successful AI write/edit so the UI tab can sync
 * @param {(type: 'thought'|'content', text: string) => void} params.onChunk
 *        - streaming callback forwarded to AIProviderManager.chat()
 * @param {(toolCall: {name, args}) => void} [params.onToolCallStart]
 *        - fired before a tool call executes (args already parsed)
 * @param {(toolCall: {name, args, result}) => void} [params.onToolCallResult]
 *        - fired after a tool call resolves (or errors)
 * @returns {Promise<{finalContent: string}>}
 */
export async function runAgentLoop({
  apiMessages,
  provider,
  signal,
  openedFiles,
  onFileWritten,
  onChunk,
  onToolCallStart,
  onToolCallResult,
}) {
  if (!provider) {
    throw new Error('No AI provider configured. Open Settings → AI to add one.');
  }

  const manager = new AIProviderManager({
    baseUrl: provider.baseUrl,
    model: provider.model,
    apiKey: provider.apiKey,
    protocol: provider.protocol,
  });

  let messages = [...apiMessages];
  let finalContent = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await manager.chat(messages, toolDefinitions, onChunk, signal);

    const accumulatedToolCalls = result.tool_calls ?? [];
    const accumulatedContent = result.content ?? '';
    finalContent = accumulatedContent;

    // No tool calls → model is done, exit agentic loop
    if (accumulatedToolCalls.length === 0) break;

    const toolResults = [];
    for (const tc of accumulatedToolCalls) {
      const name = tc.function.name;
      const rawArgs = tc.function.arguments;
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;

      onToolCallStart?.({ name, args });

      let result;
      try {
        result = await executeTool(name, args, { openedFiles, onFileWritten });
      } catch (e) {
        result = `Error: ${e.message}`;
      }

      onToolCallResult?.({ name, args, result });

      toolResults.push({ id: tc.id, name, result });
    }

    // Append assistant tool_calls message + tool results back into history
    messages = [
      ...messages,
      { role: 'assistant', content: accumulatedContent, tool_calls: accumulatedToolCalls },
      ...toolResults.map(tr => ({ role: 'tool', tool_call_id: tr.id, content: tr.result })),
    ];
  }

  return { finalContent };
}