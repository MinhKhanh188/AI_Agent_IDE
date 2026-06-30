import { readFile } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'read_file',
    description: 'Read the full content of a file by its absolute path. Use this when you need to inspect source code or any file in the project.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' }
      },
      required: ['path']
    }
  }
};

export async function handler(args) {
  return await readFile(args.path);
}
