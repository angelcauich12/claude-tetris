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

- `skins.js` (loaded after `game.js`) defines `SKINS` (`retro`, `neon`, `pastel`, `pixel`), each with `colors`, `bg`, `grid` and `drawBlock`. `game.js`'s `drawBlock`/`drawGrid` delegate to the global `activeSkin` (guarded with `typeof`, since `game.js` runs `init()` before `skins.js` loads). `applySkin()` sets the canvas CSS background and redraws; the choice persists in `localStorage` key `tetris.skin` and the `#skin-select` is blurred after change so game keys keep working.
