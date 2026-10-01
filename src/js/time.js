// Accepts "minutes:seconds" or plain seconds. Returns '' for anything else.
export function parseTime(text) {
  const [, minutes, seconds] = text.match(/^(\d+):(\d+)$/) ?? [];
  if (minutes) return Number(minutes) * 60 + Number(seconds);
  const time = parseInt(text);
  return isNaN(time) ? '' : time;
}

export function formatTime(time) {
  time = parseInt(time);
  if (isNaN(time)) return '';
  if (time < 60) return String(time);
  return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
}
