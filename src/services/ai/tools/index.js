import { definition, handler } from './read-file';
import { definition as listDef, handler as listHandler } from './list-dir';
import { definition as writeDef, handler as writeFileHandler } from './write-file';
import { definition as editDef, handler as editHandler } from './edit-file';
import { definition as insertDef, handler as insertHandler } from './insert-at-line';

export const toolDefinitions = [definition, listDef, writeDef, editDef, insertDef];

export const toolHandlers = {
  read_file: handler,
  list_dir: listHandler,
  write_file: writeFileHandler,
  edit_file: editHandler,
  insert_at_line: insertHandler,
};

export function executeTool(name, args, context) {
  const h = toolHandlers[name];
  if (!h) return `Unknown tool: ${name}`;
  return h(args, context);
}
