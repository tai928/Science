'use strict';

const menuButton = document.querySelector('.menu-button');
const globalNav = document.querySelector('.global-nav');

if (menuButton && globalNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    globalNav.classList.toggle('is-open', !isOpen);
  });

  globalNav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute('aria-expanded', 'false');
      globalNav.classList.remove('is-open');
    }
  });
}
