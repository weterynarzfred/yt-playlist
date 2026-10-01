import '../scss/style.scss';
import { undoLast } from './history';
import { initPlayer } from './player';
import { addVideo, onEnded, onError, onPlaying, playNext, shuffle, sortByTitle } from './playlist';
import './filter';

initPlayer({
  onReady: () => {
    shuffle();
    playNext();
  },
  onPlaying,
  onEnded,
  onError,
});

document.getElementById('randomize').addEventListener('click', shuffle);
document.getElementById('sort').addEventListener('click', sortByTitle);
document.getElementById('next').addEventListener('click', playNext);

document.querySelector('.add-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = event.target.querySelector('.add-video');
  addVideo(input.value.match(/v=([\w-]+)/)?.[1] ?? input.value);
  input.value = '';
});

// Text fields keep the browser's own undo.
document.addEventListener('keydown', event => {
  if (!event.ctrlKey || event.shiftKey || event.key !== 'z' || event.target.closest('input, textarea')) return;
  event.preventDefault();
  undoLast();
});
