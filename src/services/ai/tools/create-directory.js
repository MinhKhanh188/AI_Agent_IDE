import { createDir } from '../../fs/file-service';

export const definition = {
  type: 'function',
  function: {
    name: 'create_directory',
    description: 'Create a new directory (and any missing parent directories) at the given absolute path. This is a no-op if the directory already exists.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the directory to create' }
      },
      required: ['path']
    }
  }
};

export async function handler(args, context) {
  try {
    await createDir(args.path);

    if (typeof context?.onFileCreated === 'function') {
      context.onFileCreated();
    }

    return `Directory created: ${args.path}`;
  } catch (err) {
    return `Error: failed to create directory "${args.path}": ${err.message || err}`;
  }
}
