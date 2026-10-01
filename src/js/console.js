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

// action: optional { label, onClick } shown as a button; such messages stay longer.
export function displayText(text, action) {
  const message = document.createElement('div');
  message.className = 'message';
  message.textContent = text;
  message.addEventListener('animationend', () => message.remove());

  if (action) {
    const button = document.createElement('button');
    button.textContent = action.label;
    button.addEventListener('click', action.onClick);
    message.classList.add('has-action');
    message.append(button);
  }

  consoleElement.append(message);
  return message;
}
