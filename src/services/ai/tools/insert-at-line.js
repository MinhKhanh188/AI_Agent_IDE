import { readFile, writeFile } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'insert_at_line',
    description: 'Insert new content as a new line at a specific 1-indexed line number in a file. The content is inserted BEFORE the existing line at that position (e.g., line_number 1 inserts at the very top of the file). Use this only for adding new lines, not for replacing existing ones. If you want to replace existing code, use edit_file instead.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' },
        line_number: { type: 'integer', description: 'The 1-indexed line number to insert the content before' },
        content: { type: 'string', description: 'The content to insert as a new line' }
      },
      required: ['path', 'line_number', 'content']
    }
  }
};

export async function handler(args, context) {
  const content = await readFile(args.path);
  const lines = content.split('\n');

  if (args.line_number < 1 || args.line_number > lines.length + 1) {
    return `Error: line_number ${args.line_number} is out of range — file "${args.path}" only has ${lines.length} lines. Choose a line_number between 1 and ${lines.length + 1}.`;
  }

  // Safety block: refuse to overwrite a tab with unsaved user edits
  const openedFiles = context?.openedFiles ?? [];
  const tab = openedFiles.find(f => f.path === args.path);
  if (tab?.dirty) {
    return `Cannot write to ${args.path}: file has unsaved changes open in the editor. Ask the user to save or discard their changes first.`;
  }

  // Splice content into lines
  lines.splice(args.line_number - 1, 0, args.content);
  const newContent = lines.join('\n');

  await writeFile(args.path, newContent);

  if (typeof context?.onFileWritten === 'function') {
    context.onFileWritten(args.path, newContent);
  }

  return `Inserted content at line ${args.line_number} in ${args.path}`;
}
