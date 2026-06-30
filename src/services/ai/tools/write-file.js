import { writeFile } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'write_file',
    description: 'Write content to a file at the given absolute path. This OVERWRITES the entire file — all existing content will be lost. Use with caution on files that contain important code.',
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

export async function handler(args) {
  await writeFile(args.path, args.content);
  return `File written: ${args.path}`;
}
