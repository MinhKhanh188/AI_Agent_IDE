import { readFile, writeFile } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'edit_file',
    description: 'Edit a file by replacing one exact string occurrence with another. IMPORTANT: Include enough surrounding context in old_string to uniquely identify the single location to replace. If old_string matches multiple places or no place, the edit will fail. Use read_file first to confirm the exact content you want to change.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' },
        old_string: { type: 'string', description: 'The exact substring to find and replace. Include surrounding context to make it unique.' },
        new_string: { type: 'string', description: 'The replacement string' }
      },
      required: ['path', 'old_string', 'new_string']
    }
  }
};

export async function handler(args, context) {
  // Safety block: refuse to overwrite a tab with unsaved user edits
  const openedFiles = context?.openedFiles ?? [];
  const tab = openedFiles.find(f => f.path === args.path);
  if (tab?.dirty) {
    return `Cannot write to ${args.path}: file has unsaved changes open in the editor. Ask the user to save or discard their changes first.`;
  }

  const content = await readFile(args.path);
  const occurrences = content.split(args.old_string);
  const count = occurrences.length - 1;

  if (count === 0) {
    return 'old_string not found in file';
  }

  if (count > 1) {
    return `old_string is not unique (found ${count} occurrences) — provide more surrounding context to make it unique`;
  }

  const newContent = content.replace(args.old_string, args.new_string);
  await writeFile(args.path, newContent);

  if (typeof context?.onFileWritten === 'function') {
    context.onFileWritten(args.path, newContent);
  }

  return `File edited: ${args.path} (1 replacement)`;
}
