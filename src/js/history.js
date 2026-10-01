import { displayText } from './console';

const entries = [];

// Logs the action with an undo button. Ctrl+Z undoes the most recent entry.
export function record(label, undo) {
  const entry = { undo };
  entry.message = displayText(label, { label: 'undo', onClick: () => undoEntry(entry) });
  entries.push(entry);
}

function undoEntry(entry) {
  entries.splice(entries.indexOf(entry), 1);
  entry.message.remove();
  entry.undo();
}

export function undoLast() {
  if (entries.length) undoEntry(entries.at(-1));
}
