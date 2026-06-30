import { invoke } from '@tauri-apps/api/core';

/**
 * Wraps Tauri's native fs/dialog commands so components never call
 * invoke() directly for file operations.
 */

/** Opens the native folder picker dialog. Returns the chosen path, or falsy if cancelled. */
export function openFolder() {
  return invoke('open_folder');
}

/** Reads a directory recursively into the FileEntry tree shape. */
export function readDir(path) {
  return invoke('read_dir', { path });
}

/** Reads a file's full text content. */
export function readFile(path) {
  return invoke('read_file', { path });
}

/** Writes text content to a file, overwriting it. */
export function writeFile(path, content) {
  return invoke('write_file', { path, content });
}