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
    if (!menuArea.contains(event.target) && globalNav.classList.contains('is-open')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenu(false);
      menuButton.focus();
    }
  });
}

const existingSimulationPage = document.querySelector('main.simulation-page');
if (existingSimulationPage && !document.querySelector('.textbook-placeholder')) {
  if (!document.querySelector('link[href="curriculum.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'curriculum.css';
    document.head.appendChild(stylesheet);
  }

  const explanation = document.createElement('section');
  explanation.className = 'textbook-placeholder';
  explanation.innerHTML = '<h2>教科書による解説</h2><p>使用する教科書に合わせた説明を追加するための欄です。</p><div class="textbook-editor-space"></div>';
  existingSimulationPage.appendChild(explanation);
}
