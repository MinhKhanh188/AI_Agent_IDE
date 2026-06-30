import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { runAgentLoop } from '../services/ai/agent-loop';

// ── Style definitions ─────────────────────────────────────────────────────────
const styles = {
  container: {
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #333',
    background: '#1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
    position: 'relative',
  },
  header: {
    padding: '8px 12px',
    borderBottom: '1px solid #333',
    color: '#ccc',
    fontSize: 'var(--app-font-size)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#4ec94e',
    boxShadow: '0 0 6px #4ec94e88',
    flexShrink: 0,
  },
  // Pills strip between header and messages
  pillStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    padding: '5px 10px',
    borderBottom: '1px solid #2a2a2a',
    background: '#1a1a1a',
    flexShrink: 0,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#2a3a4a',
    border: '1px solid #3a5070',
    borderRadius: 10,
    color: '#7eb8f7',
    fontSize: 'calc(var(--app-font-size) - 1px)',
    padding: '2px 8px 2px 7px',
  },
  pillRemove: {
    background: 'none',
    border: 'none',
    color: '#5585aa',
    cursor: 'pointer',
    padding: '0 0 0 2px',
    lineHeight: 1,
    fontSize: 12,
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#333 #1e1e1e',
  },
  bubble: (role) => ({
    maxWidth: '88%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? '#264f78' : '#252526',
    border: `1px solid ${role === 'user' ? '#3a6ea5' : '#333'}`,
    borderRadius: role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
    padding: '8px 11px',
    color: '#ccc',
    fontSize: 'var(--app-font-size)',
    lineHeight: 1.55,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  }),
  roleLabel: (role) => ({
    fontSize: 'calc(var(--app-font-size) - 1px)',
    color: role === 'user' ? '#7eb8f7' : '#9cdcfe',
    marginBottom: 2,
    fontWeight: 600,
    letterSpacing: '0.03em',
  }),
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontSize: 'var(--app-font-size)',
    flexDirection: 'column',
    gap: 8,
  },
  inputRow: {
    display: 'flex',
    gap: '6px',
    padding: '8px 10px',
    borderTop: '1px solid #333',
    background: '#1e1e1e',
    flexShrink: 0,
    alignItems: 'flex-end',
    position: 'relative',
  },
  textarea: {
    flex: 1,
    background: '#252526',
    border: '1px solid #3c3c3c',
    borderRadius: 6,
    color: '#ccc',
    fontSize: 'var(--app-font-size)',
    padding: '7px 9px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minHeight: 36,
    maxHeight: 120,
    overflowY: 'auto',
    transition: 'border-color 0.15s',
  },
  contextBtn: (active) => ({
    background: active ? '#1e3a5a' : '#252526',
    border: `1px solid ${active ? '#3a6ea5' : '#3c3c3c'}`,
    borderRadius: 6,
    color: active ? '#7eb8f7' : '#888',
    cursor: 'pointer',
    padding: '0 9px',
    fontSize: 'var(--app-font-size)',
    fontFamily: 'inherit',
    height: 36,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }),
  sendBtn: (disabled) => ({
    background: disabled ? '#2a3a4a' : '#264f78',
    border: `1px solid ${disabled ? '#333' : '#3a6ea5'}`,
    borderRadius: 6,
    color: disabled ? '#555' : '#7eb8f7',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '7px 13px',
    fontSize: 'var(--app-font-size)',
    fontFamily: 'inherit',
    height: 36,
    flexShrink: 0,
    transition: 'background 0.15s, color 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  }),
  // Dropdown positioned above the @ button
  dropdown: {
    position: 'absolute',
    bottom: 'calc(100% + 4px)',
    left: 10,
    background: '#252526',
    border: '1px solid #3c3c3c',
    borderRadius: 7,
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    minWidth: 190,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: (checked) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '8px 12px',
    cursor: 'pointer',
    color: checked ? '#7eb8f7' : '#aaa',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: 'var(--app-font-size)',
    fontFamily: 'inherit',
    transition: 'background 0.1s',
  }),
  cursor: {
    display: 'inline-block',
    width: 2,
    height: '1em',
    background: '#9cdcfe',
    marginLeft: 1,
    verticalAlign: 'text-bottom',
    animation: 'blink 1s step-end infinite',
  },
  thoughtBlock: (open) => ({
    background: '#1a1f2e',
    border: '1px solid #2d3a52',
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
    maxWidth: '88%',
    alignSelf: 'flex-start',
  }),
  thoughtHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    cursor: 'pointer',
    userSelect: 'none',
    color: '#6a85b0',
    fontSize: 'calc(var(--app-font-size) - 1px)',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  thoughtSpinner: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '1.5px solid #3a5580',
    borderTopColor: '#7eb8f7',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  thoughtChevron: (open) => ({
    marginLeft: 'auto',
    fontSize: 10,
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    color: '#4a6080',
  }),
  thoughtBody: {
    padding: '0 10px 8px 10px',
    color: '#5a7a9a',
    fontSize: 'calc(var(--app-font-size) - 1px)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    borderTop: '1px solid #1e2a3e',
    maxHeight: 200,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#2a3a52 transparent',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Flatten a file-tree array recursively to a list of file paths (files only). */
function flattenTree(nodes, prefix = '') {
  const lines = [];
  for (const node of nodes || []) {
    const fullPath = prefix ? `${prefix}/${node.name}` : node.name;
    // Skip noisy / large directories
    if (['node_modules', '.git', 'target'].includes(node.name)) continue;
    if (node.children) {
      lines.push(...flattenTree(node.children, fullPath));
    } else {
      lines.push(fullPath);
    }
  }
  return lines;
}

function TypingCursor() {
  return <span style={styles.cursor} />;
}

function ThoughtBlock({ thought, isStreaming }) {
  const [open, setOpen] = useState(false);

  if (!thought) return null;

  return (
    <div style={styles.thoughtBlock(open)}>
      <div style={styles.thoughtHeader} onClick={() => setOpen(o => !o)}>
        {isStreaming
          ? <span style={styles.thoughtSpinner} />
          : <span style={{ fontSize: 11 }}>💭</span>
        }
        {isStreaming ? 'Thinking…' : 'Thought process'}
        <span style={styles.thoughtChevron(open)}>▶</span>
      </div>
      {open && (
        <div style={styles.thoughtBody}>
          {thought}
          {isStreaming && <TypingCursor />}
        </div>
      )}
    </div>
  );
}

/** Shows tool calls made by the model with their results */
function ToolCallBlock({ calls }) {
  if (!calls?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '88%', alignSelf: 'flex-start' }}>
      {calls.map((tc, i) => (
        <div key={i} style={{
          background: '#1a2a1a', border: '1px solid #2d4a2d', borderRadius: 8,
          padding: '5px 10px', fontSize: 'calc(var(--app-font-size) - 1px)',
        }}>
          <div style={{ color: '#6ab06a', fontWeight: 600, marginBottom: 2 }}>
            {tc.name}({typeof tc.args === 'object' ? Object.values(tc.args)[0] : tc.args})
          </div>
          {tc.result && tc.result !== '…' && (
            <div style={{ color: '#4a7a4a', fontSize: 'calc(var(--app-font-size) - 2px)', maxHeight: 80, overflowY: 'auto' }}>
              {tc.result.length > 200 ? tc.result.slice(0, 200) + '…' : tc.result}
            </div>
          )}
          {tc.result === '…' && <div style={{ color: '#3a5a3a' }}>Running…</div>}
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AIPanel() {
  // Context
  const { rootPath, activeFilePath, openedFiles, fileTree, aiProviders, activeProviderId, updateContent, markSaved, refreshTree, rootFolderPath } = useAppContext();
  const activeProvider = aiProviders.find(p => p.id === activeProviderId) ?? aiProviders[0] ?? null;

  // Chat state
  const [messages, setMessages] = useState([]);
  const [thoughts, setThoughts] = useState({}); // index → thought string
  const [toolCalls, setToolCalls] = useState({}); // index → [{name, args, result}]
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Context-injection state
  const [attachedContext, setAttachedContext] = useState({ currentFile: false, fileTree: false });
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  // Refs
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const dropdownRef = useRef(null);
  const contextBtnRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!contextMenuOpen) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        contextBtnRef.current && !contextBtnRef.current.contains(e.target)
      ) {
        setContextMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenuOpen]);

  // ── Build system message from attached context ──────────────────────────────
  const buildSystemContent = useCallback(() => {
    const parts = [];

    // Always include project root path so AI can construct correct absolute paths for tools
    if (rootPath) {
      const projectName = rootPath.replace(/\\/g, '/').split('/').pop();
      parts.push(`You are an AI assistant inside a code editor.\nProject: ${projectName}\nProject root (use this to construct absolute file paths for tools): ${rootPath}`);
    }

    // File tree if attached
    if (fileTree?.length) {
      const flatList = flattenTree(fileTree).join('\n');
      parts.push(`File tree (use these exact paths with read_file tool):\n${flatList}`);
    }

    // Current file if attached
    if (attachedContext.currentFile && activeFilePath) {
      const activeFile = openedFiles.find(f => f.path === activeFilePath);
      if (activeFile) {
        parts.push(`Current open file: ${activeFilePath}\n\`\`\`\n${activeFile.content}\n\`\`\``);
      }
    }

    return parts.length ? parts.join('\n\n') : null;
  }, [attachedContext, fileTree, rootPath, activeFilePath, openedFiles]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const nextHistory = [...messages, userMsg];

    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    // Placeholder for assistant streaming reply
    const assistantIdx = nextHistory.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      // Prepend system message if context is attached
      const systemContent = buildSystemContent();

      if (!activeProvider) {
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { role: 'assistant', content: '⚠️ No AI provider configured. Open Settings → AI to add one.' };
          return updated;
        });
        setIsLoading(false);
        setIsThinking(false);
        return;
      }

      const apiMessages = systemContent
        ? [{ role: 'system', content: systemContent }, ...nextHistory]
        : [...nextHistory];

      await runAgentLoop({
        apiMessages,
        provider: activeProvider,
        signal: abortRef.current?.signal,
        openedFiles,
        fileTree,
        onFileCreated: () => {
          if (rootFolderPath) {
            refreshTree(rootFolderPath);
          }
        },
        onFileWritten: (path, newContent) => {
          updateContent(path, newContent);
          markSaved(path);
        },
        onChunk: (type, text) => {
          if (type === 'thought') {
            setThoughts(prev => ({ ...prev, [assistantIdx]: text }));
          }
          if (type === 'content') {
            setIsThinking(false);
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantIdx] = { role: 'assistant', content: text };
              return updated;
            });
          }
        },
        onToolCallStart: ({ name, args }) => {
          setIsThinking(false);
          setToolCalls(prev => ({
            ...prev,
            [assistantIdx]: [...(prev[assistantIdx] || []), { name, args, result: '…' }]
          }));
        },
        onToolCallResult: ({ name, args, result }) => {
          setToolCalls(prev => {
            const calls = [...(prev[assistantIdx] || [])];
            calls[calls.length - 1] = { name, args, result };
            return { ...prev, [assistantIdx]: calls };
          });
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: 'assistant',
          content: `Error: ${err.message}`,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const toggleContextKey = (key) => {
    setAttachedContext(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const removeContext = (key) => {
    setAttachedContext(prev => ({ ...prev, [key]: false }));
  };

  const anyContextActive = attachedContext.currentFile || attachedContext.fileTree;
  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <>
      {/* Inline keyframes */}
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai-dropdown-item:hover { background: #2a3a4a !important; }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.dot} />
          AI Assistant
          <span style={{ marginLeft: 'auto', color: '#555', fontWeight: 400, fontSize: 'calc(var(--app-font-size) - 1px)' }}>
            {activeProvider ? `${activeProvider.label || activeProvider.id} · ${activeProvider.model}` : 'No provider'}
          </span>
        </div>

        {/* Context pills */}
        {anyContextActive && (
          <div style={styles.pillStrip}>
            {attachedContext.currentFile && (
              <span style={styles.pill}>
                📄 current file
                <button style={styles.pillRemove} onClick={() => removeContext('currentFile')} title="Remove">✕</button>
              </span>
            )}
            {attachedContext.fileTree && (
              <span style={styles.pill}>
                🗂 file tree
                <button style={styles.pillRemove} onClick={() => removeContext('fileTree')} title="Remove">✕</button>
              </span>
            )}
          </div>
        )}

        {/* Message list */}
        <div style={styles.messageList}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <span>Ask me anything…</span>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {/* Thought block — only for assistant messages */}
                {msg.role === 'assistant' && (thoughts[i] || (isThinking && i === messages.length - 1)) && (
                  <ThoughtBlock
                    thought={thoughts[i] || ''}
                    isStreaming={isLoading && i === messages.length - 1}
                  />
                )}
                {/* Tool call blocks */}
                {msg.role === 'assistant' && toolCalls[i]?.length > 0 && (
                  <ToolCallBlock calls={toolCalls[i]} />
                )}
                <div style={styles.roleLabel(msg.role)}>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div style={styles.bubble(msg.role)}>
                  {msg.content
                    ? <>{msg.content}{isLoading && msg.role === 'assistant' && i === messages.length - 1 && <TypingCursor />}</>
                    : isLoading && msg.role === 'assistant' && i === messages.length - 1
                      ? <span style={{ color: '#666' }}>Waiting for AI model…</span>
                      : <span style={{ color: '#555' }}>…</span>
                  }
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div style={styles.inputRow}>
          {/* Context dropdown (rendered above the row) */}
          {contextMenuOpen && (
            <div ref={dropdownRef} style={styles.dropdown}>
              <button
                className="ai-dropdown-item"
                style={styles.dropdownItem(attachedContext.currentFile)}
                onClick={() => toggleContextKey('currentFile')}
              >
                <span style={{ fontSize: 15 }}>{attachedContext.currentFile ? '☑' : '☐'}</span>
                Current File
              </button>
              <button
                className="ai-dropdown-item"
                style={styles.dropdownItem(attachedContext.fileTree)}
                onClick={() => toggleContextKey('fileTree')}
              >
                <span style={{ fontSize: 15 }}>{attachedContext.fileTree ? '☑' : '☐'}</span>
                File Tree
              </button>
            </div>
          )}

          {/* @ Context button */}
          <button
            ref={contextBtnRef}
            style={styles.contextBtn(anyContextActive)}
            onClick={() => setContextMenuOpen(o => !o)}
            title="Attach context"
          >
            @ Context
          </button>

          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message… (Enter to send, Shift+Enter for newline)"
            disabled={isLoading}
            rows={1}
          />

          {isLoading ? (
            <button style={styles.sendBtn(false)} onClick={handleStop} title="Stop generation">
              ⏹
            </button>
          ) : (
            <button style={styles.sendBtn(!canSend)} onClick={sendMessage} disabled={!canSend} title="Send">
              ➤
            </button>
          )}
        </div>
      </div>
    </>
  );
}