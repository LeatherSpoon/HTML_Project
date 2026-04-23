# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Processing Power** — a browser-based 3D idle RPG. Orthographic camera, toon-shaded Three.js renderer, ES6 modules (no build step). The game runs entirely client-side; the Node.js server is optional and only used for save-state sync and progression definitions.

## Commands

```bash
# Serve the game (required — index.html blocks file:// protocol)
start-node.bat          # Windows: serves on http://localhost:8080
node server/start.js    # Start the optional API on port 3000

# Tests
npm test                # Runs tests/runAll.test.js (Node, ES modules)

# Database (optional server)
npm run db:migrate
npm run db:seed

# Syntax check a file without running it
node --check js/path/to/file.js
```

There is no linter or formatter configured. Run `node --check <file>` after edits to catch syntax errors before browser testing.

## Architecture

### Entry points

- **`index.html`** — SPA shell. Defines all panel HTML. Guards against `file://` with a visible error. Imports Three.js via importmap from `js/vendor/`.
- **`js/main.js`** — Bootstrap, game loop, input handling, collision resolution, and interaction logic. All systems are instantiated here and wired together via callbacks. The animation loop runs via `renderer.setAnimationLoop(gameLoop)`.
- **`js/config.js`** — Single source of truth for all tunable constants (energy costs, speed multipliers, stat costs, zone PP unlock thresholds, etc.).

### System wiring pattern

Systems are decoupled via optional callbacks set after instantiation:

```js
craftingSystem.onCraftComplete = (recipe) => { /* handle in main.js */ };
combatSystem.onCombatEnd = (won, fled) => { /* chain existing + add */ };
techTree.onPurchase = (id) => { /* apply effects in main.js */ };
```

Never import `main.js` from a system — all cross-system effects flow through these callbacks wired in `main.js`.

### Collision system

All collision uses **circles on the XZ plane**: `{ x, z, r }`. The player has `PLAYER_R = 0.35`. Every frame, `main.js` iterates `env.getCollisionCircles()` and pushes the player radially outward when `dist < circle.r + PLAYER_R`.

For **axis-aligned rectangular blocks** (mine/depths grid), the correct collision radius is:
`r_min = (half_block_width × √2) − PLAYER_R`
This keeps the player center outside the block at all approach angles without the large face gap of the full circumscribed radius.

### Zone system

`Environment.js` owns all 3D scene construction. `switchZone(name)` in `main.js` calls `env.switchZone(name)` which clears and rebuilds the scene. Each zone needs entries in:

1. `Environment.js` — `switchZone()` case, `getZoneLabel()`, `getResourceNodeSpawns()`, `getEnemySpawns()`, and a `_build<Zone>()` method
2. `main.js` — `ZONE_TERRAIN`, `ZONE_SPAWN_POS`
3. `js/config.js` — `ENV_UNLOCK` PP threshold
4. `js/systems/GameStatistics.js` — increment `TOTAL_WORLDS`

### Save system

`SaveSystem.js` serializes all game state to a JSON blob downloaded as a file. Each system implements `serialize()` / `load()` (or `deserialize()`). When adding a new system that needs persistence:

1. Add it to `SaveSystem.systems` destructure in both `_buildSaveData()` and `apply()`
2. Call `system.serialize()` in the save data object
3. Call `system.load(data.key)` in `apply()`
4. If the system applies bonuses to other systems on load (e.g., augmentations), implement an `applyBonuses(statsSystem)` method called explicitly during `apply()` rather than relying on the `onPurchase` callback (which isn't set yet at load time)

### HUD / panels

`HUD.js` manages all panels. Adding a new panel requires:

1. Panel HTML in `index.html` (`<div id="my-panel" class="panel-overlay" hidden>`)
2. `_refreshMyPanel()` method in `HUD.js`
3. A case in `_refreshPanel(panelId)`
4. Add panel ID to the `panels` array in `togglePanel()` in `main.js` (so opening it closes others)
5. For a HUD button: add to `_wirePanelToggles()` or a dedicated `_wireMyButton()` method, called from the constructor

### Key files by concern

| Concern | File |
|---|---|
| Game constants | `js/config.js` |
| All systems bootstrap + game loop | `js/main.js` |
| Zone generation, collision, portals | `js/scene/Environment.js` |
| Mine grid layout (procedural) | `js/scene/MineLayout.js` |
| Save/load serialization | `js/systems/SaveSystem.js` |
| Character stats + derived values | `js/systems/StatsSystem.js` |
| Crafting recipes + queue | `js/systems/CraftingSystem.js` |
| Tool durability, material bags | `js/systems/InventorySystem.js` |
| All UI panels + HUD | `js/ui/HUD.js` |
| Combat turn logic | `js/systems/CombatSystem.js` |
| Tech tree nodes + effects | `server/definitions/seedData.js` + `js/systems/TechTreeSystem.js` |

### Seeded RNG

Use `seededRandom(seed)` (mulberry32, defined in `Environment.js`) for any deterministic procedural placement. Each zone/feature should use a distinct seed constant so changes to one don't shift others.

### Three.js conventions

- All materials use `createToonMaterial(hexColor)` from `js/scene/ToonMaterials.js`.
- Outlines are added via `addOutline(mesh, thickness)` (cloned mesh, inverted normals).
- The camera is orthographic; object height affects visual layering but not gameplay — keep interactive objects at `y ≈ 0`.
- `seededRandom` is a module-level function in `Environment.js`, not exported. Inline a copy if needed in other files (see `MineLayout.js`).
