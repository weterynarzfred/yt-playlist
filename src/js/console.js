const consoleElement = document.getElementById('console');
let loadingCount = 0;

export function startLoading() {
  loadingCount++;
  consoleElement.classList.add('loading');
}

export function stopLoading() {
  loadingCount--;
  if (loadingCount === 0) consoleElement.classList.remove('loading');
}

export function displayText(text) {
  const message = document.createElement('div');
  message.className = 'message';
  message.textContent = text;
  message.addEventListener('animationend', () => message.remove());
  consoleElement.append(message);
}
