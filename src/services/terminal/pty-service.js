import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { spawn } from 'tauri-pty';

/**
 * Creates and wires up an xterm Terminal + tauri-pty pseudo-terminal pair.
 * Encapsulates all direct xterm/tauri-pty API usage so components stay
 * free of terminal-library specifics.
 *
 * @param {HTMLElement} container - DOM node to mount the terminal into
 * @param {object} options
 * @param {number} options.fontSize
 * @param {string} [options.cwd]
 * @returns {{
 *   term: Terminal,
 *   fitAddon: FitAddon,
 *   pty: ReturnType<typeof spawn>,
 *   observer: ResizeObserver,
 *   dispose: () => void,
 *   setFontSize: (size: number) => void
 * }}
 */
export function createPtySession(container, { fontSize, cwd } = {}) {
  const term = new Terminal({
    theme: { background: '#1e1e1e', foreground: '#cccccc' },
    fontSize,
    cursorBlink: true,
    allowTransparency: false,
  });

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  term.open(container);
  fitAddon.fit();
  term.focus();

  const pty = spawn('powershell.exe', [], {
    cols: term.cols,
    rows: term.rows,
    cwd: cwd || undefined,
  });

  pty.onData(data => term.write(data));
  term.onData(data => pty.write(data));

  const observer = new ResizeObserver(() => {
    fitAddon.fit();
    pty.resize(term.cols, term.rows);
  });
  observer.observe(container);

  function setFontSize(size) {
    term.options.fontSize = size;
    fitAddon.fit();
    pty.resize(term.cols, term.rows);
  }

  function dispose() {
    observer.disconnect();
    pty.kill();
    term.dispose();
  }

  return { term, fitAddon, pty, observer, dispose, setFontSize };
}