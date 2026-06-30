import { readDir } from '../../fs/file-service';

const format = (nodes, indent = '') =>
  nodes.map(n =>
    `${indent}${n.is_dir ? '\uD83D\uDC81' : '\uD83D\uDCD4'} ${n.name}${
      n.children ? '\n' + format(n.children, indent + '  ') : ''
    }`
  ).join('\n');

export const definition = {
  type: 'function',
  function: {
    name: 'list_dir',
    description: 'List files and folders inside a directory by its absolute path.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the directory' }
      },
      required: ['path']
    }
  }
};

export async function handler(args) {
  const entries = await readDir(args.path);
  return format(entries);
}
