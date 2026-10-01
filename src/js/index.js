import '../scss/style.scss';
import { initPlayer } from './player';
import { addVideo, onError, onPlaying, playNext, shuffle, sortByTitle } from './playlist';
import './filter';

initPlayer({
  onReady: () => {
    shuffle();
    playNext();
  },
  onPlaying,
  onEnded: playNext,
  onError,
});

document.getElementById('randomize').addEventListener('click', shuffle);
document.getElementById('sort').addEventListener('click', sortByTitle);
document.getElementById('next').addEventListener('click', playNext);

document.getElementById('delete-toggle').addEventListener('click', () => {
  document.body.classList.toggle('delete-active');
});

document.querySelector('.add-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = event.target.querySelector('.add-video');
  addVideo(input.value.match(/v=([\w-]+)/)?.[1] ?? input.value);
  input.value = '';
});
