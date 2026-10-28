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

Records (`records.js`, classic script loaded after `game.js`):
- Keeps the top 5 (`{name, score, lines, combo, date}`) in `localStorage` `tetris.records`, plus `tetris.bestCombo` and `tetris.maxLines`; every access is in try/catch.
- `game.js` no longer calls `init()` at load: `records.js` shows `#start-screen` (top 5, bests, Jugar button) and sets `gameOver = true` so keys are ignored until Jugar calls `init()`.
- Hooks in `game.js`: `clearLines()` maintains `combo`/`maxCombo` (consecutive locks that clear lines), `endGame()` calls `showGameOverRecords()` (fills `#overlay-records`, name input if top 5), `init()` calls `recordsReset()`. The keydown listener ignores events from `INPUT` elements.
