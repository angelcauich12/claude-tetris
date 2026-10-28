'use strict';

// Tabla local de records (top 5) y mejores marcas, en localStorage.
const REC_KEY = 'tetris.records';
const REC_COMBO_KEY = 'tetris.bestCombo';
const REC_LINES_KEY = 'tetris.maxLines';
const REC_MAX = 5;

const startScreen = document.getElementById('start-screen');
const startRecords = document.getElementById('start-records');
const startBests = document.getElementById('start-bests');
const startBtn = document.getElementById('start-btn');
const startClearBtn = document.getElementById('start-clear-btn');
const overlayRecords = document.getElementById('overlay-records');

function loadRecords() {
  try {
    const list = JSON.parse(localStorage.getItem(REC_KEY));
    return Array.isArray(list) ? list.slice(0, REC_MAX) : [];
  } catch (e) { return []; }
}

function saveRecords(list) {
  try { localStorage.setItem(REC_KEY, JSON.stringify(list)); } catch (e) { /* sin storage */ }
}

function loadBest(key) {
  try { return Number(localStorage.getItem(key)) || 0; } catch (e) { return 0; }
}

function saveBest(key, value) {
  try { localStorage.setItem(key, String(value)); } catch (e) { /* sin storage */ }
}

// Posicion (0-based) que ocuparia la puntuacion, o -1 si no entra al top.
function recordRank(sc) {
  if (sc <= 0) return -1;
  const list = loadRecords();
  let i = list.findIndex(r => sc > r.score);
  if (i === -1) i = list.length;
  return i < REC_MAX ? i : -1;
}

function addRecord(name, rank) {
  const list = loadRecords();
  list.splice(rank, 0, {
    name: name.trim() || 'Anónimo',
    score, lines, combo: maxCombo,
    date: new Date().toISOString().slice(0, 10),
  });
  saveRecords(list.slice(0, REC_MAX));
}

function buildTable(list, newRank) {
  const table = document.createElement('table');
  table.className = 'records-table';
  const head = table.createTHead().insertRow();
  ['#', 'Nombre', 'Puntos', 'Líneas', 'Combo'].forEach(t => {
    head.appendChild(document.createElement('th')).textContent = t;
  });
  const body = table.createTBody();
  if (!list.length) {
    const td = body.insertRow().insertCell();
    td.colSpan = 5;
    td.className = 'records-empty';
    td.textContent = 'Sin records todavía';
    return table;
  }
  list.forEach((r, i) => {
    const row = body.insertRow();
    if (i === newRank) row.className = 'record-new';
    [i + 1, r.name, Number(r.score).toLocaleString(), r.lines, r.combo]
      .forEach(v => { row.insertCell().textContent = v; });
  });
  return table;
}

function renderStart() {
  startRecords.replaceChildren(buildTable(loadRecords(), -1));
  startBests.textContent =
    `Mejor combo: ${loadBest(REC_COMBO_KEY)} · Líneas máximas: ${loadBest(REC_LINES_KEY)}`;
}

function clearRecords() {
  if (!confirm('¿Borrar todos los records?')) return false;
  try {
    localStorage.removeItem(REC_KEY);
    localStorage.removeItem(REC_COMBO_KEY);
    localStorage.removeItem(REC_LINES_KEY);
  } catch (e) { /* sin storage */ }
  return true;
}

function appendClearBtn() {
  const btn = document.createElement('button');
  btn.className = 'clear-records-btn';
  btn.textContent = 'Borrar records';
  btn.addEventListener('click', () => {
    if (!clearRecords()) return;
    overlayRecords.replaceChildren(buildTable([], -1));
    appendClearBtn();
  });
  overlayRecords.appendChild(btn);
}

// Hook de endGame(): actualiza mejores marcas y pinta la tabla en el overlay.
function showGameOverRecords() {
  if (maxCombo > loadBest(REC_COMBO_KEY)) saveBest(REC_COMBO_KEY, maxCombo);
  if (lines > loadBest(REC_LINES_KEY)) saveBest(REC_LINES_KEY, lines);
  const rank = recordRank(score);
  overlayRecords.replaceChildren();
  if (rank < 0) {
    overlayRecords.appendChild(buildTable(loadRecords(), -1));
    appendClearBtn();
    return;
  }
  // Fila provisional con input de nombre
  const list = loadRecords();
  list.splice(rank, 0, { name: '', score, lines, combo: maxCombo });
  const table = buildTable(list.slice(0, REC_MAX), rank);
  const cell = table.tBodies[0].rows[rank].cells[1];
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 12;
  input.placeholder = 'Tu nombre';
  input.className = 'record-input';
  cell.appendChild(input);
  overlayRecords.appendChild(table);
  appendClearBtn();
  input.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key !== 'Enter') return;
    addRecord(input.value, rank);
    overlayRecords.replaceChildren(buildTable(loadRecords(), rank));
    appendClearBtn();
  });
  input.focus();
}

// Hook de init(): limpia la tabla del overlay (lo comparte con la pausa).
function recordsReset() {
  overlayRecords.replaceChildren();
}

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  init();
});

startClearBtn.addEventListener('click', () => {
  if (clearRecords()) renderStart();
});

// Pantalla de inicio: el juego queda inactivo hasta pulsar Jugar.
gameOver = true;
renderStart();
