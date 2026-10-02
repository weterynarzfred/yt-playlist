import Video from './Video';
import { post } from './api';
import { displayText } from './console';
import { record } from './history';
import { openMenu } from './menu';
import { getPlayerTitle, loadVideo } from './player';

const ERROR_TAG = / \[error \d+\]/;

const list = document.getElementById('playlist');
export const playlistId = list.dataset.playlistid;
const videos = [...list.querySelectorAll('.video')].map(element => new Video(element));
let current = null;
let pauseAfter = null;

// Queued videos are kept out of `videos` and drawn indented right after the playing one, so
// sorting, shuffling and filtering leave them alone. Each joins `videos` when it starts playing.
const queue = [];
const queuedFrom = new Map();

// Videos newly flagged with the same error since the last successful play. When YouTube
// breaks the player session, every video fails with the same code until a page reload.
const ERROR_STREAK_LIMIT = 5;
let errorStreak = { code: null, flagged: [] };

function render() {
  const queued = queue.map(video => video.element);
  const rows = videos.includes(current) ? [] : [...queued];
  for (const video of videos) {
    // The playing video keeps its spot even when filtered out, dimmed until it ends.
    if (!video.filtered || video === current) rows.push(video.element);
    if (video === current) rows.push(...queued);
  }
  list.replaceChildren(...rows);
}

function play(video) {
  if (queue.includes(video)) {
    dequeue(video);
    videos.splice(videos.indexOf(current) + 1, 0, video);
  }
  current?.element.classList.remove('current');
  current = video;
  video.element.classList.add('current');
  render();
  loadVideo(video);
  displayText(`${video.label} started playing`);
}

export function playNext() {
  if (queue.length) return play(queue[0]);
  const start = videos.indexOf(current);
  for (let i = 1; i <= videos.length; i++) {
    const video = videos[(start + i) % videos.length];
    if (!video.filtered) return play(video);
  }
}

// Called when a video ends or fails. Stops instead of advancing past the pause-after video.
function advance() {
  if (current !== pauseAfter) return playNext();
  setPauseAfter(null);
  displayText(`paused after ${current.label}`);
}

function setPauseAfter(video) {
  pauseAfter?.element.classList.remove('pause-after');
  pauseAfter = video;
  video?.element.classList.add('pause-after');
}

function addToQueue(video) {
  queuedFrom.set(video, videos.indexOf(video));
  videos.splice(videos.indexOf(video), 1);
  queue.push(video);
  video.element.classList.add('queued');
  render();
}

function dequeue(video) {
  queue.splice(queue.indexOf(video), 1);
  video.element.classList.remove('queued');
}

// Puts the video back roughly where it was before being queued.
function removeFromQueue(video) {
  dequeue(video);
  videos.splice(queuedFrom.get(video), 0, video);
  render();
}

export function shuffle() {
  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]];
  }
  render();
}

export function sortByTitle() {
  videos.sort((a, b) => a.title.localeCompare(b.title));
  render();
}

export function filterVideos(regex) {
  // Queued videos get the flag too, for when they join the list.
  [...videos, ...queue].forEach(video => {
    video.filtered = !regex.test(video.title);
    video.element.classList.toggle('filtered', video.filtered);
  });
  sortByTitle();
}

// Fills in missing titles from YouTube and clears error tags once a video plays again.
export function onPlaying() {
  errorStreak = { code: null, flagged: [] };
  if (!current.title) current.update({ title: getPlayerTitle() });
  else if (ERROR_TAG.test(current.title)) current.update({ title: current.title.replace(ERROR_TAG, '') });
  document.title = current.title;
}

export const onEnded = advance;

export function onError(code) {
  if (ERROR_TAG.test(current.title)) return advance();

  if (code !== errorStreak.code) errorStreak = { code, flagged: [] };
  const video = current;
  const title = video.title;
  const saving = video.update({ title: `${title} [error ${code}]` });
  errorStreak.flagged.push({ video, title, saving });
  if (errorStreak.flagged.length < ERROR_STREAK_LIMIT) return advance();

  // Likely a broken session rather than broken videos: stop and remove the tags just added.
  displayText(`${ERROR_STREAK_LIMIT} videos in a row failed with error ${code}, YouTube is probably refusing playback`, {
    label: 'reload',
    onClick: () => location.reload(),
  });
  errorStreak.flagged.forEach(async ({ video, title, saving }) => {
    await saving;
    video.update({ title });
  });
  errorStreak = { code: null, flagged: [] };
}

// The insert action replies with "s" followed by the new row's HTML.
async function insert(videoId, data) {
  const response = await post('insert', { videoID: videoId, playlistID: playlistId, ...(data && { data: JSON.stringify(data) }) });
  if (response[0] !== 's') return null;
  const template = document.createElement('template');
  template.innerHTML = response.slice(1).trim();
  return template.content.firstElementChild;
}

export async function addVideo(videoId) {
  const element = await insert(videoId);
  if (!element) return displayText(`adding ${videoId} failed`);
  const video = new Video(element);
  videos.push(video);
  list.append(element);
  record(`added ${videoId}`, () => deleteVideo(video, false));
}

async function editVideo(video, changes) {
  const previous = video.data;
  if (await video.update(changes)) {
    record(`edited ${video.label}`, async () => {
      if (await video.update(previous)) displayText(`reverted ${video.label}`);
    });
  }
}

async function deleteVideo(video, undoable = true) {
  const response = await post('delete', { ID: video.id });
  if (response !== 'success') return displayText(`deleting ${video.label} failed`);

  const from = queue.includes(video) ? queue : videos;
  const index = from.indexOf(video);
  from.splice(index, 1);
  video.element.remove();
  if (video === pauseAfter) setPauseAfter(null);
  if (undoable) record(`deleted ${video.label}`, () => restoreVideo(video, from, index));
  else displayText(`removed ${video.label}`);
}

// Re-inserts a deleted video at its old position in the list or queue. The row gets a new database ID.
async function restoreVideo(video, from, index) {
  const element = await insert(video.videoId, video.data);
  if (!element) return displayText(`restoring ${video.label} failed`);
  video.id = element.dataset.id;
  from.splice(index, 0, video);
  render();
  displayText(`restored ${video.label}`);
}

function openVideoMenu(video, x, y) {
  openMenu(x, y, [
    { label: 'edit', action: () => video.openEditor(changes => editVideo(video, changes)) },
    ...(video === current ? [] : [queue.includes(video)
      ? { label: 'remove from queue', hint: 'ctrl+click', action: () => removeFromQueue(video) }
      : { label: 'add to queue', hint: 'ctrl+click', action: () => addToQueue(video) }]),
    { label: 'pause after', checked: video === pauseAfter, action: () => setPauseAfter(video === pauseAfter ? null : video) },
    { label: 'delete', danger: true, action: () => deleteVideo(video) },
  ]);
}

const findVideo = target => [...videos, ...queue].find(video => video.element === target.closest('.video'));

list.addEventListener('click', event => {
  const video = findVideo(event.target);
  // Ctrl+click toggles the video in the queue instead of playing it.
  if (event.target.matches('.video-title')) {
    if (!event.ctrlKey) play(video);
    else if (queue.includes(video)) removeFromQueue(video);
    else if (video !== current) addToQueue(video);
  }
  if (event.target.matches('.video-menu-button')) {
    const { left, bottom } = event.target.getBoundingClientRect();
    openVideoMenu(video, left, bottom);
  }
});

list.addEventListener('contextmenu', event => {
  const video = findVideo(event.target);
  if (!video || event.target.closest('.title-edit')) return;
  event.preventDefault();
  openVideoMenu(video, event.clientX, event.clientY);
});
