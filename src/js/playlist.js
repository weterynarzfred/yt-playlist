import Video from './Video';
import { post } from './api';
import { displayText } from './console';
import { getPlayerTitle, loadVideo } from './player';

const ERROR_TAG = / \[error \d+\]/;

const list = document.getElementById('playlist');
export const playlistId = list.dataset.playlistid;
const videos = [...list.querySelectorAll('.video')].map(element => new Video(element));
let current = null;

const render = () => list.replaceChildren(...videos.filter(video => !video.filtered).map(video => video.element));

function play(video) {
  current?.element.classList.remove('current');
  current = video;
  video.element.classList.add('current');
  loadVideo(video);
  displayText(`${video.title} started playing`);
}

export function playNext() {
  const start = videos.indexOf(current);
  for (let i = 1; i <= videos.length; i++) {
    const video = videos[(start + i) % videos.length];
    if (!video.filtered) return play(video);
  }
}

function queueNext(video) {
  if (video === current) return;
  videos.splice(videos.indexOf(video), 1);
  videos.splice(videos.indexOf(current) + 1, 0, video);
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
  videos.forEach(video => (video.filtered = !regex.test(video.title)));
  sortByTitle();
}

// Fills in missing titles from YouTube and clears error tags once a video plays again.
export function onPlaying() {
  if (!current.title) current.update({ title: getPlayerTitle() });
  else if (ERROR_TAG.test(current.title)) current.update({ title: current.title.replace(ERROR_TAG, '') });
  document.title = current.title;
}

export function onError(code) {
  if (!ERROR_TAG.test(current.title)) current.update({ title: `${current.title} [error ${code}]` });
  playNext();
}

export async function addVideo(videoId) {
  displayText(`video with ID: ${videoId} queued`);
  const response = await post('insert', { videoID: videoId, playlistID: playlistId });
  if (response[0] !== 's') return displayText(`video with ID: ${videoId} failed to be added`);

  const template = document.createElement('template');
  template.innerHTML = response.slice(1).trim();
  const video = new Video(template.content.firstElementChild);
  videos.push(video);
  list.append(video.element);
  displayText(`video with ID: ${videoId} added successfully`);
}

async function deleteVideo(video) {
  displayText(`deletion of ${video.title} queued`);
  const response = await post('delete', { ID: video.id });
  if (response !== 'success') return displayText(`deletion of ${video.title} failed`);

  videos.splice(videos.indexOf(video), 1);
  video.element.remove();
  displayText(`deletion of ${video.title} successful`);
}

list.addEventListener('click', event => {
  const video = videos.find(video => video.element === event.target.closest('.video'));
  if (!video) return;
  if (event.target.matches('.video-title')) play(video);
  if (event.target.matches('.video-play-next')) queueNext(video);
  if (event.target.matches('.video-delete')) deleteVideo(video);
  if (event.target.matches('.video-edit')) video.toggleEditor();
});
