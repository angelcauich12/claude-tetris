'use strict';

// Menú de pausa: se abre con P / Esc, se navega con ↑/↓ + Enter o con el ratón.
const pauseMenu = document.getElementById('pause-menu');
const pmItems = Array.from(pauseMenu.querySelectorAll('.pm-item'));
const pmControls = document.getElementById('pm-controls');
const pmLevelValue = document.getElementById('pm-level-value');
const pmControlsBtn = pauseMenu.querySelector('[data-action="controls"]');
let pmIndex = 0;

function pmSelect(i) {
  pmIndex = (i + pmItems.length) % pmItems.length;
  pmItems.forEach((el, n) => el.classList.toggle('selected', n === pmIndex));
}

function pmSetStartLevel(n) {
  startLevel = Math.min(10, Math.max(1, n));
  pmLevelValue.textContent = startLevel;
  try { localStorage.setItem('tetris.startLevel', String(startLevel)); } catch (e) {}
}

function pmToggleControls() {
  const open = pmControls.classList.toggle('hidden') === false;
  pmControlsBtn.setAttribute('aria-expanded', String(open));
}

function pmActivate(action) {
  if (action === 'resume') togglePauseMenu();
  else if (action === 'restart') init();
  else if (action === 'controls') pmToggleControls();
}

function showPauseMenu() {
  paused = true;
  cancelAnimationFrame(animId);
  pmLevelValue.textContent = startLevel;
  pauseMenu.classList.remove('hidden');
  pmSelect(0);
}

function hidePauseMenu() {
  pauseMenu.classList.add('hidden');
  pmControls.classList.add('hidden');
  pmControlsBtn.setAttribute('aria-expanded', 'false');
}

function togglePauseMenu() {
  if (gameOver) return;
  if (!pauseMenu.classList.contains('hidden')) {
    hidePauseMenu();
    paused = false;
    lastTime = performance.now(); // sin salto de caída al reanudar
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  } else {
    showPauseMenu();
  }
}

document.addEventListener('keydown', e => {
  if (pauseMenu.classList.contains('hidden')) return;
  if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); return; }
  const action = pmItems[pmIndex].dataset.action;
  switch (e.code) {
    case 'ArrowUp': pmSelect(pmIndex - 1); break;
    case 'ArrowDown': pmSelect(pmIndex + 1); break;
    case 'ArrowLeft': if (action === 'level') pmSetStartLevel(startLevel - 1); break;
    case 'ArrowRight': if (action === 'level') pmSetStartLevel(startLevel + 1); break;
    case 'Enter':
    case 'Space':
      if (action === 'level') pmSetStartLevel(startLevel % 10 + 1);
      else pmActivate(action);
      break;
    default: return;
  }
  e.preventDefault();
});

pmItems.forEach((el, i) => {
  el.addEventListener('mouseenter', () => pmSelect(i));
  if (el.dataset.action !== 'level') el.addEventListener('click', () => pmActivate(el.dataset.action));
});
pauseMenu.querySelectorAll('.pm-step').forEach(b =>
  b.addEventListener('click', () => pmSetStartLevel(startLevel + Number(b.dataset.step))));
pauseMenu.querySelectorAll('button').forEach(b => { b.tabIndex = -1; });
// los botones no conservan el foco (Enter/Espacio los dispararían dos veces)
pauseMenu.addEventListener('mousedown', e => e.preventDefault());
