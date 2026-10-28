# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JavaScript Tetris using HTML5 Canvas. No dependencies, no build step, no package.json, no tests, no linter. The README and UI strings are in Spanish.

## Running

Open `index.html` in a browser, or serve the directory (e.g. `python3 -m http.server`) and visit `localhost:8000`.

## Architecture

Three files, loaded directly by `index.html` (`game.js` is a classic script, not a module):

- `index.html` defines the DOM that `game.js` looks up by id at load time (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`). Renaming an id requires updating the lookups at the top of `game.js`.
- `style.css` handles layout and the overlay's `hidden` class.
- `game.js` holds all game logic as top-level functions sharing module-level mutable state (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, ...), all reset in `init()`.

Game flow in `game.js`:
- `init()` resets state and starts the `requestAnimationFrame` `loop`. The same function backs the restart button.
- `loop` accumulates delta time in `dropAccum` and gravity-drops the piece once `dropInterval` is reached, then calls `draw()`.
- Input is a single `keydown` listener that mutates `current` directly. Pause (`P`) cancels and restarts the rAF loop, and the game-over and pause overlays share the same DOM element.
- `lockPiece()` runs `merge()`, then `clearLines()` (which updates score, lines, level and `dropInterval`), then `spawn()`. `spawn()` calls `endGame()` if the new piece collides.
- The board is a `ROWS x COLS` matrix of numbers. 0 is empty, and 1-7 index both `COLORS` and `PIECES`, so a piece's type is also its color.
- Rotation (`rotateCW`) is a matrix transpose with only horizontal wall kicks (`tryRotate`). `collide()` is the single collision check used by movement, rotation, ghost piece and spawn.
- Scoring: `LINE_SCORES[cleared] * level`, plus 1 point per soft-drop cell and 2 per hard-drop cell. Level is `floor(lines / 10) + 1`, and `dropInterval = max(100, 1000 - (level - 1) * 90)`.

Pause menu (`pause-menu.js`, classic script loaded after `game.js`):
- Owns the dedicated `#pause-menu` DOM (separate from `#overlay`, which is game over only). `P`/`Escape` -> `togglePause()` -> `togglePauseMenu()`, which sets `paused`, cancels the rAF loop and, on resume, resets `lastTime` and restarts `loop`.
- Own keydown listener (Up/Down/Enter/Left/Right) only acts while the menu is open; `game.js` ignores game keys while `paused`.
- "Nivel inicial" (1-10) is persisted in `localStorage` `tetris.startLevel` and read by `game.js` into `startLevel`. `init()` copies it to `baseLevel`; `clearLines()` uses `max(baseLevel, floor(lines/10)+1)`, so changing the selector affects only the next game. `init()` calls `hidePauseMenu()`.
