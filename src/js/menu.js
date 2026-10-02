const menu = document.createElement('div');
menu.id = 'menu';
menu.hidden = true;
document.body.append(menu);

// items: [{ label, action, checked, hint, danger }]
export function openMenu(x, y, items) {
  menu.replaceChildren(
    ...items.map(({ label, action, checked, hint, danger }) => {
      const item = document.createElement('button');
      item.textContent = label;
      item.classList.toggle('checked', Boolean(checked));
      item.classList.toggle('danger', Boolean(danger));
      if (hint) {
        const hintElement = document.createElement('span');
        hintElement.className = 'hint';
        hintElement.textContent = hint;
        item.append(hintElement);
      }
      item.addEventListener('click', () => {
        closeMenu();
        action();
      });
      return item;
    })
  );
  menu.hidden = false;

  // Keep the menu inside the viewport when opened near the right or bottom edge.
  const { width, height } = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(0, Math.min(x, innerWidth - width))}px`;
  menu.style.top = `${Math.max(0, Math.min(y, innerHeight - height))}px`;
}

const closeMenu = () => (menu.hidden = true);

document.addEventListener('pointerdown', event => {
  if (!menu.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
addEventListener('scroll', closeMenu, true);
