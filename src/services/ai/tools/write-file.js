import { writeFile } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'write_file',
    description: 'Write content to a file at the given absolute path. This OVERWRITES the entire file — all existing content will be lost. Use with caution on files that contain important code. Note: Parent directories will be created automatically if they do not exist.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' },
        content: { type: 'string', description: 'The full content to write to the file' }
      },
      required: ['path', 'content']
    }
  }
};

function hasPath(nodes, targetPath) {
  if (!nodes || !Array.isArray(nodes)) return false;
  for (const node of nodes) {
    if (node.path === targetPath) return true;
    if (node.children && hasPath(node.children, targetPath)) return true;
  }
  return false;
}

export async function handler(args, context) {
  // Safety block: refuse to overwrite a tab with unsaved user edits
  const openedFiles = context?.openedFiles ?? [];
  const tab = openedFiles.find(f => f.path === args.path);
  if (tab?.dirty) {
    return `Cannot write to ${args.path}: file has unsaved changes open in the editor. Ask the user to save or discard their changes first.`;
  }

  const fileTree = context?.fileTree ?? [];
  const isNewFile = !hasPath(fileTree, args.path);

  await writeFile(args.path, args.content);

  if (isNewFile) {
    if (typeof context?.onFileCreated === 'function') {
      context.onFileCreated();
    }
  } else {
    if (typeof context?.onFileWritten === 'function') {
      context.onFileWritten(args.path, args.content);
    }
  }

  return `File written: ${args.path}`;
}
