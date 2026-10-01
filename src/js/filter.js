import { post } from './api';
import { displayText } from './console';
import { filterVideos, playlistId } from './playlist';

const filterInput = document.getElementById('filter');
const searchesWrap = document.getElementById('searches-wrap');
const searchList = document.getElementById('search-list');
let searches = JSON.parse(searchesWrap.dataset.searches);

function applyFilter() {
  try {
    filterVideos(new RegExp(filterInput.value, 'i'));
  } catch {
    // Incomplete regex while typing, e.g. "(". Keep the previous filter.
  }
}

function renderSearches() {
  searchList.replaceChildren(
    ...searches.map(search => {
      const element = document.createElement('div');
      element.className = 'search';
      element.innerHTML = '<div class="search-delete"></div><div class="search-title"></div>';
      element.querySelector('.search-title').textContent = search;
      return element;
    })
  );
}

async function saveSearches(next) {
  const response = await post('saveSearch', { playlistID: playlistId, data: JSON.stringify(next) });
  if (response !== 'success') return false;
  searches = next;
  renderSearches();
  return true;
}

async function addSearch() {
  if (!filterInput.value) return displayText('cannot save empty search');
  displayText('saving search query');
  const saved = await saveSearches([...searches, filterInput.value]);
  displayText(saved ? 'search query saved' : 'saving search query failed');
}

async function removeSearch(index) {
  displayText('removing search query');
  const saved = await saveSearches(searches.filter((_, i) => i !== index));
  displayText(saved ? 'search query removed' : 'removing search query failed');
}

filterInput.addEventListener('input', applyFilter);
filterInput.addEventListener('focus', () => searchesWrap.classList.add('open'));
filterInput.addEventListener('blur', () => searchesWrap.classList.remove('open'));

// Keeps focus in the filter input so the panel stays open while clicking inside it.
searchesWrap.addEventListener('mousedown', event => event.preventDefault());

searchesWrap.addEventListener('click', event => {
  if (event.target.matches('#search-save')) addSearch();
  if (event.target.matches('.search-title')) {
    filterInput.value = event.target.textContent;
    applyFilter();
  }
  if (event.target.matches('.search-delete')) {
    removeSearch([...searchList.children].indexOf(event.target.closest('.search')));
  }
});

renderSearches();
