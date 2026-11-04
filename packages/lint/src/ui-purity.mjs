export function findPrivateUiClass(line) {
  return line.match(/(?<![-\w])mw-[a-z][\w-]*/)?.[0] ?? null;
}
