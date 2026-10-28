'use strict';

// Skins visuales. game.js delega drawBlock/drawGrid en la skin activa.
const SKIN_KEY = 'tetris.skin';

// Rectángulo redondeado con fallback si no existe roundRect
function roundedRect(context, x, y, w, h, r) {
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(x, y, w, h, r);
  } else {
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }
}

const SKINS = {
  retro: {
    name: 'Retro',
    colors: COLORS,
    bg: '#1a1a25',
    grid: '#22222e',
    drawBlock(context, x, y, color, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[color];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },

  neon: {
    name: 'Neón',
    colors: [null, '#00f0ff', '#fff200', '#d400ff', '#39ff14', '#ff2050', '#3d5bff', '#ff8a00'],
    bg: '#000000',
    grid: '#161622',
    drawBlock(context, x, y, color, size, alpha) {
      const c = this.colors[color];
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = c;
      context.shadowBlur = 12;
      context.strokeStyle = c;
      context.lineWidth = 2;
      context.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.shadowBlur = 0;
      context.fillStyle = c;
      context.globalAlpha = (alpha ?? 1) * 0.35;
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.globalAlpha = 1;
      context.shadowColor = 'transparent';
    },
  },

  pastel: {
    name: 'Pastel',
    colors: [null, '#a8e6ef', '#fff3b0', '#d9b8f0', '#b8ecc0', '#f7b6b6', '#b5bdf0', '#ffd6a5'],
    bg: '#2b2b3a',
    grid: '#33334a',
    drawBlock(context, x, y, color, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[color];
      roundedRect(context, x * size + 2, y * size + 2, size - 4, size - 4, 8);
      context.fill();
      context.fillStyle = 'rgba(255,255,255,0.3)';
      roundedRect(context, x * size + 5, y * size + 5, size - 10, 5, 2.5);
      context.fill();
      context.globalAlpha = 1;
    },
  },

  pixel: {
    name: 'Pixel',
    colors: [null, '#29b6f6', '#fdd835', '#ab47bc', '#66bb6a', '#ef5350', '#5c6bc0', '#ffa726'],
    bg: '#101018',
    grid: '#1c1c28',
    drawBlock(context, x, y, color, size, alpha) {
      const px = x * size, py = y * size, u = size / 6;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[color];
      context.fillRect(px + 1, py + 1, size - 2, size - 2);
      // textura: tablero de píxeles claros y oscuros
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i + j) % 2) continue;
          context.fillStyle = (i < 3 && j < 3) ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
          context.fillRect(px + i * u, py + j * u, u, u);
        }
      }
      context.strokeStyle = 'rgba(0,0,0,0.6)';
      context.lineWidth = 1;
      context.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
      context.globalAlpha = 1;
    },
  },
};

let activeSkin = SKINS.retro;

function loadSkinName() {
  try {
    const saved = localStorage.getItem(SKIN_KEY);
    if (saved && Object.prototype.hasOwnProperty.call(SKINS, saved)) return saved;
  } catch (e) { /* sin almacenamiento */ }
  return 'retro';
}

function applySkin(name) {
  if (!Object.prototype.hasOwnProperty.call(SKINS, name)) name = 'retro';
  activeSkin = SKINS[name];
  canvas.style.background = activeSkin.bg;
  nextCanvas.style.background = activeSkin.bg;
  if (current) draw();
  if (next) drawNext();
}

const skinSelect = document.getElementById('skin-select');
for (const key of Object.keys(SKINS)) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = SKINS[key].name;
  skinSelect.appendChild(opt);
}

const initialSkin = loadSkinName();
skinSelect.value = initialSkin;
applySkin(initialSkin);

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  try { localStorage.setItem(SKIN_KEY, skinSelect.value); } catch (e) { /* ignorar */ }
  skinSelect.blur(); // que las flechas sigan controlando el juego
});
