'use strict';

const menuArea = document.querySelector('.menu-area');
const menuButton = document.querySelector('.menu-button');
const globalNav = document.querySelector('.global-nav');

if (menuArea && menuButton && globalNav) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    globalNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenu(!isOpen);
  });

  globalNav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) setMenu(false);
  });

  document.addEventListener('click', (event) => {
    if (!menuArea.contains(event.target) && globalNav.classList.contains('is-open')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenu(false);
      menuButton.focus();
    }
  });
}
