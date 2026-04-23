import { SceneManager } from './scene/SceneManager.js';
import { Environment } from './scene/Environment.js';
import { Player } from './entities/Player.js';
import { EntityManager } from './entities/EntityManager.js';
import { PPSystem } from './systems/PPSystem.js';
import { StatsSystem } from './systems/StatsSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { PedometerSystem } from './systems/PedometerSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { CraftingSystem } from './systems/CraftingSystem.js';
import { DroneSystem } from './systems/DroneSystem.js';
import { EquipmentSystem } from './systems/EquipmentSystem.js';
import { HUD } from './ui/HUD.js';
import { CombatUI } from './ui/CombatUI.js';
import { TouchInput } from './input/TouchInput.js';
import { GameStatistics } from './systems/GameStatistics.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { OfflineSystem } from './systems/OfflineSystem.js';
import { AchievementSystem } from './systems/AchievementSystem.js';
import { AutoCombatSystem } from './systems/AutoCombatSystem.js';
import { MinigameSystem } from './systems/MinigameSystem.js';
import { DrillSystem } from './systems/DrillSystem.js';
import { AscensionSystem } from './systems/AscensionSystem.js';
import { FactorySystem } from './systems/FactorySystem.js';
import { CONFIG } from './config.js';
import { TelemetrySystem } from './TelemetrySystem.js';
import { MINE_SPAWN_POS } from './scene/MineLayout.js';
import { SyncClient } from './sync/SyncClient.js';
import { createLocalDefinitions, normalizeRecipesForCrafting } from './systems/ProgressionDefinitions.js';
import { TechTreeSystem } from './systems/TechTreeSystem.js';
import { CraftingMasterySystem } from './systems/CraftingMasterySystem.js';
import { CodexSystem } from './systems/CodexSystem.js';
import * as THREE from 'three';
import { AugmentationSystem } from './systems/AugmentationSystem.js';

// ── Bootstrap ────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');

// Touch input (no-op on desktop)
const touchInput = new TouchInput();

// Systems
const ppSystem        = new PPSystem();
const statsSystem     = new StatsSystem();
const inventorySystem = new InventorySystem();
const definitions     = createLocalDefinitions();
const syncClient      = new SyncClient({ playerId: 'local-player' });
const techTree        = new TechTreeSystem({ nodes: definitions.techNodes, sync: syncClient });
const mastery         = new CraftingMasterySystem({ tracks: definitions.masteryTracks, sync: syncClient });
const combatSystem    = new CombatSystem(statsSystem, ppSystem, inventorySystem);
const pedometer       = new PedometerSystem(ppSystem);
const craftingSystem  = new CraftingSystem(inventorySystem, statsSystem, {
  recipes: normalizeRecipesForCrafting(definitions),
  techTree,
  mastery,
  sync: syncClient,
});
const droneSystem     = new DroneSystem(inventorySystem, ppSystem, { sync: syncClient });
const equipmentSystem = new EquipmentSystem(statsSystem);
const gameStats       = new GameStatistics();
const offlineSystem   = new OfflineSystem(ppSystem, droneSystem, inventorySystem);
const achievements    = new AchievementSystem();
const autoCombat      = new AutoCombatSystem(combatSystem, statsSystem);
const minigame        = new MinigameSystem(ppSystem);
const drillSystem     = new DrillSystem(ppSystem, inventorySystem, statsSystem);
const ascension       = new AscensionSystem(ppSystem);
const factorySystem   = new FactorySystem(inventorySystem, ppSystem, statsSystem, pedometer);
const codexSystem     = new CodexSystem();
const augSystem       = new AugmentationSystem();

// Apply ascension multiplier to PP system
ppSystem.globalMultiplier = ascension.ppMultiplier;

// Wire minigame perfect hits to achievements
let _lastMinigamePlay = 0;
minigame.onStateChange = () => {
  const r = minigame.lastResult;
  if (r && r.zone === 'PERFECT' && minigame.plays !== _lastMinigamePlay) {
    _lastMinigamePlay = minigame.plays;
    achievements.recordPerfect();
  }
};

// ── Offline progress on boot ──────────────────────────────────────────────
const offlineSummary = offlineSystem.applyAndSummarize();
offlineSystem.stamp();

// Wire rescue drone — switches zone back to Landing Site after defeat
combatSystem.onRescue = () => {
  setTimeout(() => switchZone('landingSite'), 1200);
};

// Track player damage dealt for highest hit
const _origFight = combatSystem.fight.bind(combatSystem);
combatSystem.fight = function () {
  const hpBefore = this.enemyCurrentHP;
  _origFight();
  const dealt = hpBefore - this.enemyCurrentHP;
  if (dealt > 0) gameStats.recordHit(dealt);
  else gameStats.recordAction();
};

const _origUseSkill = combatSystem.useSkill.bind(combatSystem);
combatSystem.useSkill = function (skillKey) {
  const hpBefore = this.enemyCurrentHP;
  _origUseSkill(skillKey);
  const dealt = hpBefore - this.enemyCurrentHP;
  if (dealt > 0) gameStats.recordHit(dealt);
  else gameStats.recordAction();
};

const _origUseItem = combatSystem.useItem.bind(combatSystem);
combatSystem.useItem = function (itemKey) {
  _origUseItem(itemKey);
  gameStats.recordAction();
};

const _origTryRun = combatSystem.tryRun.bind(combatSystem);
combatSystem.tryRun = function () {
  _origTryRun();
  gameStats.recordAction();
};

// Wire crafting complete callback
craftingSystem.onCraftComplete = (recipe) => {
  codexSystem.discover(recipe.key);
  if (recipe.type === 'equipment') {
    const item = {
      label: recipe.label,
      slot: recipe.slot,
      tier: recipe.tier,
      statBonuses: recipe.statBonuses,
    };
    const displaced = equipmentSystem.equip(item);
    if (displaced) inventorySystem.addToEquipmentBag(displaced);
    hud.showAchievementToast({
      icon: '⚙',
      label: `${recipe.label} Equipped`,
      desc: displaced ? `Old ${displaced.label} moved to inventory bag` : `Equipped to ${recipe.slot} slot`,
      reward: 0,
    });
  }
  // Always refresh the crafting panel so it clears the "Crafting..." state
  hud.onCraftingComplete();
};

// Renderer & scene
const sceneManager = new SceneManager(canvas);
const env = new Environment(sceneManager.scene);

// Entities
const player = new Player(sceneManager.scene, statsSystem);

const entityManager = new EntityManager(sceneManager.scene, (enemy) => {
  player.isInCombat = true;
  combatUI.show(enemy);
  combatSystem.startCombat(enemy);
});

// Spawn entities for current zone
entityManager.spawnForZone(env.getEnemySpawns(), env.getResourceNodeSpawns());

// UI
const hud = new HUD(
  statsSystem, ppSystem, pedometer,
  inventorySystem, craftingSystem, droneSystem, equipmentSystem, gameStats,
  achievements, minigame, ascension, autoCombat, drillSystem,
  techTree, mastery, syncClient, factorySystem, codexSystem, augSystem
);
const combatUI = new CombatUI(
  combatSystem, statsSystem, entityManager, player, inventorySystem, ppSystem
);

// Augmentations — apply stat bonuses on purchase
augSystem.onPurchase = (id) => {
  if (id === 'reinforcedFrame')   statsSystem.addAugBonus('hp',      50);
  if (id === 'titaniumPlating')   statsSystem.addAugBonus('defense',  3);
  if (id === 'adaptiveShielding') statsSystem.addAugBonus('defense',  6);
  if (id === 'servoLegs')         statsSystem.addAugBonus('speed',   0.3);
  if (id === 'capacitorArray')    statsSystem.addAugBonus('energy',  30);
  if (id === 'combatTargeting')   statsSystem.addAugBonus('damage',  15);
  if (id === 'overclockModule')   statsSystem.stats.craftingSpeed.level += 5;
};

// Drone missions — wire completion toast
droneSystem.onMissionComplete = ({ drone, zone, loot }) => {
  const lootStr = Object.entries(loot).map(([m, q]) => `+${q} ${m}`).join(', ');
  hud.showAchievementToast({ icon: '🤖', label: `${drone} returned from ${zone}`, desc: lootStr || 'Nothing found.', reward: 0 });
};

// Research Tree — wire purchase effects
techTree.onPurchase = (id) => {
  if (id === 'combatChip')   statsSystem.stats.strength.level += 5;
  if (id === 'armorCoating') statsSystem.stats.defense.level  += 5;
};

// Codex — wire discovery toast and hooks
codexSystem.onDiscover = (key, entry) => {
  hud.showAchievementToast({ icon: '📖', label: `Codex: ${entry.label}`, desc: entry.flavor, reward: 0 });
};

// First-time material discovery
const _origAddMaterial = inventorySystem.addMaterial.bind(inventorySystem);
inventorySystem.addMaterial = function(name, qty) {
  const wasZero = !this.materials[name];
  _origAddMaterial(name, qty);
  if (wasZero && this.materials[name] > 0) codexSystem.discover(name);
};

// Chain combat end callback to track statistics (CombatUI already wired its own)
const _origOnCombatEnd = combatSystem.onCombatEnd;
combatSystem.onCombatEnd = (won, fled) => {
  if (won && combatSystem.enemy) codexSystem.discover(combatSystem.enemy.archetype);
  if (_origOnCombatEnd) _origOnCombatEnd(won, fled);
  if (won) gameStats.recordEnemyDefeated();
  else if (!fled) gameStats.recordDefeat();
};

// Telemetry — attach AFTER all other callback wiring so it wraps the full chain
const telemetry = new TelemetrySystem();
telemetry.attach({
  combat:    combatSystem,
  stats:     statsSystem,
  pp:        ppSystem,
  pedometer: pedometer,
  crafting:  craftingSystem,
  inventory: inventorySystem,
  drones:    droneSystem,
  player:    player,
});
syncClient.telemetry = telemetry;
syncClient.onStatus = status => hud.setSyncStatus(status);
syncClient.onReconciled = (playerState, serverDefinitions) => {
  if (serverDefinitions) {
    techTree.setDefinitions(serverDefinitions.techNodes);
    mastery.setDefinitions(serverDefinitions.masteryTracks);
    craftingSystem.setRecipes(normalizeRecipesForCrafting(serverDefinitions));
  }
  if (playerState) {
    techTree.applyOwned(playerState.techUnlocks);
    mastery.applyProgress(playerState.mastery);
    inventorySystem.applyServerInventory(playerState.inventory);
  }
};
syncClient.bootstrap();

hud.setZoneLabel(env.getZoneLabel());
gameStats.recordZoneVisit('landingSite'); // starting zone

// Show offline progress banner if applicable
if (offlineSummary) {
  hud.showOfflineBanner(offlineSummary);
}

// ── Save System ──────────────────────────────────────────────────────────────

const saveSystem = new SaveSystem({
  pp: ppSystem,
  stats: statsSystem,
  inventory: inventorySystem,
  pedometer,
  drones: droneSystem,
  equipment: equipmentSystem,
  gameStats,
  achievements,
  minigame,
  ascension,
  autoCombat,
  drill: drillSystem,
  techTree,
  mastery,
  sync: syncClient,
  factory: factorySystem,
  codex: codexSystem,
  augmentations: augSystem,
});

// Save/load wiring deferred to after all variable declarations (avoid TDZ)
function _initSaveSystem() {
  // Wire SAVE button — prompts for session name, downloads JSON file
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = prompt('Session name:', `Session_${new Date().toISOString().slice(0,10)}`);
      if (!name) return;
      const filename = saveSystem.saveToFile(
        env.currentZone, player.position.x, player.position.z, name
      );
      saveBtn.textContent = 'SAVED!';
      setTimeout(() => { saveBtn.textContent = 'SAVE'; }, 1500);
      console.log(`%cSession saved: ${filename}`, 'color:#ff8800');
    });
  }

  // Wire LOAD button — opens file picker, applies session
  const loadBtn = document.getElementById('btn-load');
  if (loadBtn) {
    const fileInput = document.getElementById('session-file-input');

    loadBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });

    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        const data = await saveSystem.loadFromFile(file);
        if (!data) {
          loadBtn.textContent = 'FAIL';
          setTimeout(() => { loadBtn.textContent = 'LOAD'; }, 1500);
          return;
        }

        const result = saveSystem.apply(data);
        if (result) {
          switchZone(result.zone);
          player.teleportTo(result.playerX, result.playerZ);
          hud._buildStatList();
          const info = SaveSystem.getSaveInfo(data);
          loadBtn.textContent = 'LOADED!';
          setTimeout(() => { loadBtn.textContent = 'LOAD'; }, 1500);
          console.log(`%cSession loaded: ${info.sessionName} (${info.zone}, ${info.pp} PP)`, 'color:#44ff88');
        }

        // Reset file input so the same file can be re-selected
        fileInput.value = '';
      });
    }
  }
}

// ── Zone switching ─────────────────────────────────────────────────────────────

const ZONE_TERRAIN = {
  landingSite: 'grass',
  mine: 'rock',
  verdantMaw: 'forest',
  lagoonCoast: 'grass',
  frozenTundra: 'rock',
  spaceship: 'rock',
  depths: 'rock',
};

// Per-zone player spawn positions — places player near the entry/exit portal
const ZONE_SPAWN_POS = {
  landingSite:  [0, 0],
  mine:         [MINE_SPAWN_POS.x, MINE_SPAWN_POS.z],  // return portal behind, mine ahead
  verdantMaw:   [0, 14],   // near south return portal at z=17
  lagoonCoast:  [15, 0],   // near east entry portal
  frozenTundra: [0, -15],  // near north entry portal
  spaceship:    [0, -3],   // near the entry hatch, away from exit portal at (0,6)
  depths:       [0, -4],  // near the return portal to Mine
};

function switchZone(zoneName) {
  gameStats.recordZoneVisit(zoneName);
  sceneManager.scene.remove(player.group);
  env.switchZone(zoneName);
  sceneManager.scene.add(player.group);

  const spawnPos = ZONE_SPAWN_POS[zoneName] || [0, 0];
  player.teleportTo(spawnPos[0], spawnPos[1]);
  player.currentTerrain = ZONE_TERRAIN[zoneName] || 'grass';

  entityManager.spawnForZone(env.getEnemySpawns(), env.getResourceNodeSpawns());
  hud.setZoneLabel(env.getZoneLabel());
  env.refreshTrackMarkers(pedometer);

  // Reset gather/interaction state on zone switch
  _nearestTree = null;
  _nearestRock = null;
  _gatherTarget = null;
  _gatherTimer = 0;
  _gatherType = null;
  player.isGathering = false;
}

let _pendingZone = null;

// ── Input ──────────────────────────────────────────────────────────────────────

const keysDown = new Set();

document.addEventListener('keydown', e => {
  keysDown.add(e.code);
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault();
  }

  // Panel toggles
  if (e.code === 'KeyI') togglePanel('inventory-panel');
  if (e.code === 'KeyR' && !player.isInCombat) togglePanel('drone-panel');
  if (e.code === 'KeyL') togglePanel('equipment-panel');
  if (e.code === 'KeyP') togglePanel('pedometer-panel');
  if (e.code === 'KeyB' && !player.isInCombat && env.currentZone !== 'landingSite') {
    _pendingZone = 'landingSite';
  }
  if (e.code === 'KeyT' && !player.isInCombat && pedometer.pendingTracks > 0) {
    const snappedX = Math.round(player.position.x / 2) * 2;
    const snappedZ = Math.round(player.position.z / 2) * 2;
    pedometer.placeTrack(env.currentZone, snappedX, snappedZ, statsSystem);
    env.refreshTrackMarkers(pedometer);
    hud._refreshPanel('pedometer-panel');
  }
  // [G] — remove nearest track
  if (e.code === 'KeyG' && !player.isInCombat) {
    const nearTrack = pedometer.getPlacedTracksForZone(env.currentZone)
      .find(t => Math.hypot(player.position.x - t.x, player.position.z - t.z) < 1.0);
    if (nearTrack) {
      pedometer.removeTrack(env.currentZone, nearTrack.x, nearTrack.z);
      env.refreshTrackMarkers(pedometer);
      hud._refreshPanel('pedometer-panel');
    }
  }
  // [F] key — plant seed
  if (e.code === 'KeyF' && !player.isInCombat && !player.isGathering) {
    _tryPlantSeed();
  }
  // [Q] key — toggle auto-combat
  if (e.code === 'KeyQ') {
    const on = autoCombat.toggle();
    hud.showAutoCombatStatus(on);
  }
});

document.addEventListener('keyup', e => {
  keysDown.delete(e.code);
});

window.addEventListener('blur', () => keysDown.clear());

const _menuBtn = document.getElementById('menu-toggle-btn');
const _panelBtns = document.getElementById('panel-buttons');
if (_menuBtn && _panelBtns) {
  _menuBtn.addEventListener('click', () => _panelBtns.classList.toggle('open'));
}

document.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    setTimeout(() => document.body.focus(), 0);
  }
  if (_panelBtns && _panelBtns.classList.contains('open') &&
      !_panelBtns.contains(e.target) && e.target !== _menuBtn) {
    _panelBtns.classList.remove('open');
  }
});
document.body.tabIndex = -1;

function _closeMenu() {
  _panelBtns?.classList.remove('open');
}

function togglePanel(panelId) {
  _closeMenu();
  const panels = ['inventory-panel', 'crafting-panel', 'drone-panel', 'equipment-panel', 'pedometer-panel', 'tech-panel', 'mastery-panel', 'achievements-panel', 'ascension-panel', 'factory-panel', 'codex-panel', 'augmentations-panel'];
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const wasHidden = panel.hidden;
  for (const id of panels) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
  panel.hidden = !wasHidden;
  if (!panel.hidden) {
    hud._refreshPanel(panelId);
    const name = panelId.replace('-panel', '');
    telemetry.trackPanelOpen(name);
  }
}

window.togglePanel = togglePanel;

function _tryPlantSeed() {
  if (inventorySystem.materials.seed <= 0) return;
  if (!statsSystem.spendEnergy(CONFIG.ENERGY_COST_PLANT)) {
    hud.showInteractHint('Not enough energy to plant!');
    return;
  }
  // Check no collision nearby (don't plant on top of obstacles)
  const px = player.position.x, pz = player.position.z;
  const tooClose = env.getCollisionCircles().some(c =>
    Math.hypot(px - c.x, pz - c.z) < c.r + 1.5
  );
  if (tooClose) {
    statsSystem.currentEnergy += CONFIG.ENERGY_COST_PLANT; // refund
    hud.showInteractHint('No room to plant here!');
    return;
  }
  inventorySystem.removeMaterial('seed', 1);
  env.plantTree(px, pz);
  hud.showInteractHint('Seed planted!');
}

// ── Extended gathering: trees & rocks ────────────────────────────────────────

let _nearestTree = null;
let _nearestRock = null;
let _gatherTarget = null;  // currently being gathered (tree or rock)
let _gatherTimer  = 0;
let _gatherDuration = 0;
let _gatherType   = null;  // 'tree' | 'rock'
let _gatherHintCooldown = 0;  // suppresses gather hints briefly after completion

function _energyCost(base) {
  return techTree?.owned.has('energyEfficiency') ? Math.max(1, base - 1) : base;
}

function handleExtendedGather(delta) {
  if (player.isInCombat) return false;
  if (player.isGathering) {
    // Clear stale interaction targets so hints don't linger
    _nearestRock = null;
    _nearestTree = null;
    return false;
  }

  // Tick down hint cooldown
  if (_gatherHintCooldown > 0) _gatherHintCooldown -= delta;

  // If mid-gather (tree or rock)
  if (_gatherType) {
    // Tree/rock clearing runs automatically once started — E only initiates it

    _gatherTimer += delta;
    hud.showGatherProgress(_gatherTimer, _gatherDuration);

    if (_gatherTimer >= _gatherDuration) {
      // Complete the action
      if (_gatherType === 'timber_harvest') {
        const result = env.harvestTimber(_gatherTarget);
        if (result) {
          inventorySystem.addMaterial('timber', result.timber);
          hud.showInteractHint(`+${result.timber} timber`);
          gameStats.recordGather(result.timber);
        }
      } else if (_gatherType === 'tree') {
        const result = env.clearTree(_gatherTarget);
        if (result) {
          inventorySystem.addMaterial('timber', result.timber);
          if (result.seed > 0) inventorySystem.addMaterial('seed', result.seed);
          hud.showInteractHint(`+${result.timber} timber${result.seed > 0 ? ' +1 seed' : ''}`);
          gameStats.recordGather(result.timber);
          inventorySystem.degradeTool('terrainCutter');
        }
      } else if (_gatherType === 'rock') {
        const result = env.drillRock(_gatherTarget, techTree?.owned.has('deepVeins') ? 1.5 : 1.0);
        _nearestRock = null;
        if (result) {
          inventorySystem.addMaterial('stone', result.stone);
          let extraLoot = '';
          for (let key in result) {
            if (key !== 'stone') {
              inventorySystem.addMaterial(key, result[key]);
              extraLoot += ` +${result[key]} ${key}`;
            }
          }
          hud.showInteractHint(`+${result.stone} stone${extraLoot}`);
          gameStats.recordGather(result.stone);
          gameStats.recordMine();
        }
      }
      _gatherHintCooldown = augSystem.has('neuralLink') ? 0.3 : 1.5;
      _gatherTimer = 0;
      _gatherType = null;
      _gatherTarget = null;
      hud.hideGatherProgress();
    }
    return true; // consuming interaction
  }

  // Trees — always interactable; cutter clears permanently, otherwise harvests timber
  const hasCutter = inventorySystem.hasTool('terrainCutter');
  _nearestTree = env.findNearestTree(player.position); // any alive tree
  _nearestRock = env.findNearestRock(player.position);

  // Priority: tree > rock
  if (_nearestTree && _gatherHintCooldown <= 0) {
    if (hasCutter) {
      // Terrain Cutter: clear tree permanently for 1-2 timber + seed
      if (statsSystem.currentEnergy >= _energyCost(CONFIG.ENERGY_COST_TREE)) {
        hud.showInteractHint('[E/ACT] Clear Tree (Terrain Cutter)');
        if (keysDown.has('KeyE') || touchInput.actionPressed) {
          statsSystem.spendEnergy(_energyCost(CONFIG.ENERGY_COST_TREE));
          _gatherTarget = _nearestTree;
          _gatherTimer = 0;
          _gatherDuration = 2.5 * (techTree?.owned.has('swiftHarvest') ? 0.8 : 1);
          _gatherType = 'tree';
        }
      }
    }
    return true;
  }

  if (_nearestRock && _gatherHintCooldown <= 0) {
    const energyCost = _energyCost(_nearestRock.props ? _nearestRock.props.cost : CONFIG.ENERGY_COST_ROCK);
    const duration = _nearestRock.props ? _nearestRock.props.duration : 3.0;
    const richnessLabel = _nearestRock.richness === 3 ? ' (Rich)' : _nearestRock.richness === 2 ? ' (Cracked)' : ' (Depleted)';
    const label = _nearestRock.props && _nearestRock.props.tier > 0
                  ? `Mine T${_nearestRock.props.tier} Rock${richnessLabel}`
                  : `Drill Rock${richnessLabel}`;

    if (statsSystem.currentEnergy >= energyCost) {
      hud.showInteractHint(`[E/ACT] ${label}`);
      if (keysDown.has('KeyE') || touchInput.actionPressed) {
        statsSystem.spendEnergy(energyCost);
        _gatherTarget = _nearestRock;
        _gatherTimer = 0;
        _gatherDuration = duration * (techTree?.owned.has('efficientMining') ? 0.75 : 1);
        _gatherType = 'rock';
      }
    }
    return true;
  }

  return false;
}

// ── Drill Interaction ─────────────────────────────────────────────────────────

function handleDrillInteraction() {
  if (env.currentZone !== 'mine') return false;
  if (player.isInCombat || player.isGathering) return false;
  if (_actionCooldown > 0) return false;

  const drillPos = env.getDrillPos();
  if (!drillPos) return false;

  const dist = Math.hypot(player.position.x - drillPos.x, player.position.z - drillPos.z);
  if (dist < 4.0) {
    hud.showInteractHint('[E/ACT] Deep Core Drill');
    if (keysDown.has('KeyE') || touchInput.actionPressed) {
      hud.toggleDrillPanel();
      _actionCooldown = 0.5; // Debounce interaction
    }
    return true;
  }
  return false;
}

// ── Spaceship station interactions ────────────────────────────────────────────

function handleSpaceshipInteractions() {
  if (env.currentZone !== 'spaceship') return false;
  if (player.isInCombat || player.isGathering) return false;

  const px = player.position.x, pz = player.position.z;

  // Offload Station — Prestige: sacrifice PP for a permanent cumulative PP rate bonus
  const offloadPos = env.getOffloadStationPos();
  if (offloadPos && Math.hypot(px - offloadPos.x, pz - offloadPos.z) < 2.2) {
    const ppAvail = Math.floor(ppSystem.ppTotal);
    if (ppAvail >= 1) {
      const previewGain = (Math.sqrt(ppAvail / 100) * 0.1).toFixed(3);
      hud.showInteractHint(`[E/ACT] Prestige: −${ppAvail} PP → +${previewGain} PP/s forever`);
      if (keysDown.has('KeyE') || touchInput.actionPressed) {
        const result = ppSystem.prestige();
        if (result) {
          hud.showInteractHint(`Prestige! −${result.taken} PP → +${result.gain} PP/s (total: +${result.totalBonus} PP/s)`);
        }
      }
    }
    return true;
  }

  // Fabricator (Workbench) — open crafting panel (never toggle closed)
  const fabPos = env.getFabricatorPos();
  if (fabPos && Math.hypot(px - fabPos.x, pz - fabPos.z) < 2.2) {
    hud.showInteractHint('[E/ACT] Open Fabricator');
    if (keysDown.has('KeyE') || touchInput.actionPressed) {
      const panel = document.getElementById('crafting-panel');
      if (panel && panel.hidden) togglePanel('crafting-panel');
    }
    return true;
  }

  // Charging Station — restore HP and Energy to full
  const chargePos = env.getChargingStationPos();
  if (chargePos && Math.hypot(px - chargePos.x, pz - chargePos.z) < 2.2) {
    if (statsSystem.currentHP < statsSystem.maxHP || statsSystem.currentEnergy < statsSystem.maxEnergy) {
      hud.showInteractHint('[E/ACT] Recharge — Restore HP & Energy');
      if (keysDown.has('KeyE') || touchInput.actionPressed) {
        const hpBefore = statsSystem.currentHP;
        const enBefore = statsSystem.currentEnergy;
        statsSystem.currentHP = statsSystem.maxHP;
        statsSystem.restoreEnergy();
        const restoredHP = Math.ceil(statsSystem.maxHP - hpBefore);
        const restoredEN = Math.ceil(statsSystem.maxEnergy - enBefore);
        hud.showInteractHint(`Recharged! +${restoredHP} HP, +${restoredEN} Energy`);
        gameStats.recordAction();
      }
    }
    return true;
  }

  // Drone Monitor — open drone management panel
  const droneMonitorPos = env.getDroneMonitorPos();
  if (droneMonitorPos && Math.hypot(px - droneMonitorPos.x, pz - droneMonitorPos.z) < 2.2) {
    hud.showInteractHint('[E/ACT] Drone Control');
    if ((keysDown.has('KeyE') || touchInput.actionPressed) && _actionCooldown <= 0) {
      togglePanel('drone-panel');
      _actionCooldown = 0.5;
    }
    return true;
  }

  // Ascension Terminal — open ascension panel
  const ascTerminalPos = env.getAscensionTerminalPos();
  if (ascTerminalPos && Math.hypot(px - ascTerminalPos.x, pz - ascTerminalPos.z) < 2.2) {
    hud.showInteractHint('[E/ACT] Ascension Terminal');
    if ((keysDown.has('KeyE') || touchInput.actionPressed) && _actionCooldown <= 0) {
      togglePanel('ascension-panel');
      _actionCooldown = 0.5;
    }
    return true;
  }

  // Mastery Terminal — open mastery panel
  const masteryTerminalPos = env.getMasteryTerminalPos();
  if (masteryTerminalPos && Math.hypot(px - masteryTerminalPos.x, pz - masteryTerminalPos.z) < 2.2) {
    hud.showInteractHint('[E/ACT] Mastery Terminal');
    if ((keysDown.has('KeyE') || touchInput.actionPressed) && _actionCooldown <= 0) {
      togglePanel('mastery-panel');
      _actionCooldown = 0.5;
    }
    return true;
  }

  return false;
}

// ── Gathering logic ───────────────────────────────────────────────────────────

let nearestNode = null;

function handleGathering(delta) {
  if (player.isInCombat) return;

  // Check resource nodes first
  nearestNode = entityManager.findNearestNode(player.position);

  if (player.isGathering) {
    hud.showGatherProgress(player.gatherProgress, player.gatherDuration);
    const result = player.getGatherResult();
    if (result) {
      const focusBonus = techTree?.owned.has('materialFocus') ? 1 : 0;
      inventorySystem.addMaterial(result.material, result.amount + focusBonus);
      hud.hideGatherProgress();
      hud.showInteractHint(`+${result.amount + focusBonus} ${result.material}`);
      _gatherHintCooldown = 1.5;
      gameStats.recordGather(result.amount);
      telemetry.trackGather('complete', result.material);
    }
    return;
  }

  if (nearestNode) {
    if (statsSystem.currentEnergy >= CONFIG.ENERGY_COST_GATHER) {
      hud.showInteractHint(`[E/ACT] Gather ${nearestNode.materialType}`);
      if (keysDown.has('KeyE') || touchInput.actionPressed) {
        statsSystem.spendEnergy(CONFIG.ENERGY_COST_GATHER);
        player.startGathering(nearestNode);
        telemetry.trackGather('start');
      }
    }
    return;
  }

  // No resource node — try tree/rock extended gather
  if (_gatherType) {
    // Already doing extended gather — handled above
    return;
  }
}

// ── Game loop ──────────────────────────────────────────────────────────────────

let lastTime = performance.now();
let _actionCooldown = 0; // prevents instant re-trigger of [E] across interaction types

// ── Occlusion (X-ray) system ──────────────────────────────────────────────────
// An object occludes the player when it sits between the player and camera in Z
// (0 < obj.z - player.z < CAMERA_OFFSET.z) and overlaps in X.

function _fadeObj(obj, targetOp) {
  obj.traverse(child => {
    if (!child.isMesh) return;
    // Skip outline meshes (BackSide culling) — they break when made transparent
    if (child.material.side === THREE.BackSide) return;
    if (targetOp < 1.0 && !child.material.transparent) {
      child.material.transparent = true;
      child.material.needsUpdate = true; // required: triggers shader recompile
    }
    child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOp, 0.15);
    if (targetOp === 1.0 && child.material.opacity > 0.98) {
      child.material.opacity = 1.0;
      if (child.material.transparent) {
        child.material.transparent = false;
        child.material.needsUpdate = true;
      }
    }
  });
}

function _updateOccluders() {
  if (player.isInCombat) return;
  const px = player.position.x, pz = player.position.z;

  // Fade any tree or mine block within a proximity radius of the player.
  // This creates a transparent "window" around the PC so they're always visible
  // regardless of which direction they're approaching a wall or tree from.
  const TREE_R  = 3.5; // slightly larger than tree collision radius
  const BLOCK_R = 4.5; // slightly larger than one grid step (3.2m)

  for (const tree of env._trees) {
    if (!tree.alive) continue;
    const near = Math.hypot(tree.x - px, tree.z - pz) < TREE_R;
    _fadeObj(tree.group, near ? 0.15 : 1.0);
  }

  for (const rock of env._rocks) {
    if (!rock.alive) continue;
    const near = Math.hypot(rock.x - px, rock.z - pz) < BLOCK_R;
    _fadeObj(rock.mesh, near ? 0.15 : 1.0);
  }
}

function gameLoop(now) {
  if (_pendingZone) {
    switchZone(_pendingZone);
    _pendingZone = null;
  }

  const rawDelta = (now - lastTime) / 1000;
  lastTime = now;
  const delta = Math.min(rawDelta, 0.1);
  if (_actionCooldown > 0) _actionCooldown -= delta;

  // Update player
  player.update(keysDown, delta, touchInput);

  // Telemetry per-frame tracking
  telemetry.trackMovement(keysDown, player, touchInput);
  telemetry.trackPosition(player._totalDist || 0, pedometer.totalSteps);
  telemetry.trackPP(ppSystem.ppTotal, ppSystem.ppRate);

  // Collision resolution
  if (!player.isInCombat) {
    const PLAYER_R = 0.35;

    // Circle collision (trees, portals, boulders, spaceship walls, etc.)
    for (const c of env.getCollisionCircles()) {
      const cdx = player.position.x - c.x;
      const cdz = player.position.z - c.z;
      const dist = Math.hypot(cdx, cdz);
      if (dist < c.r + PLAYER_R && dist > 0.001) {
        const nx = cdx / dist, nz = cdz / dist;
        player.position.x = c.x + nx * (c.r + PLAYER_R);
        player.position.z = c.z + nz * (c.r + PLAYER_R);
        player.group.position.copy(player.position);
      }
    }

    // AABB collision (mine/depths grid blocks — exact box shape, parented to block)
    for (const box of env.getCollisionBoxes()) {
      const px = player.position.x, pz = player.position.z;
      const clampX = Math.max(box.minX, Math.min(px, box.maxX));
      const clampZ = Math.max(box.minZ, Math.min(pz, box.maxZ));
      const dx = px - clampX, dz = pz - clampZ;
      const dist = Math.hypot(dx, dz);
      if (dist < PLAYER_R) {
        if (dist < 0.001) {
          // Player center inside box — push out via shortest face exit
          const exits = [
            { gap: px - box.minX, nx: -1, nz: 0 },
            { gap: box.maxX - px, nx:  1, nz: 0 },
            { gap: pz - box.minZ, nx: 0, nz: -1 },
            { gap: box.maxZ - pz, nx: 0, nz:  1 },
          ];
          const e = exits.reduce((a, b) => a.gap < b.gap ? a : b);
          player.position.x += e.nx * (e.gap + PLAYER_R);
          player.position.z += e.nz * (e.gap + PLAYER_R);
        } else {
          const nx = dx / dist, nz = dz / dist;
          player.position.x = clampX + nx * PLAYER_R;
          player.position.z = clampZ + nz * PLAYER_R;
        }
        player.group.position.copy(player.position);
      }
    }
  }

  // Track proximity — speed boost
  const nearTracks = pedometer.getPlacedTracksForZone(env.currentZone)
    .filter(t => Math.hypot(player.position.x - t.x, player.position.z - t.z) < 1.0).length;
  statsSystem.setTrackBonus(nearTracks * CONFIG.PEDOMETER_TRACK_SPEED_BONUS);

  // Energy only replenishes via consumables or Charging Station (no passive regen)

  // Update PP
  ppSystem.update(delta);

  // Update pedometer
  const steps = player.consumeSteps();
  pedometer.update(steps);
  if (steps > 0) gameStats.recordSteps(steps);

  // Update entities (pass collision circles so enemies respect walls)
  entityManager.update(delta, player.position, env.getCollisionCircles());

  // Update drone gathering
  droneSystem.update(delta);

  // Update factory
  factorySystem.update(delta);
  const factoryPanel = document.getElementById('factory-panel');
  if (factoryPanel && !factoryPanel.hidden) {
    for (const [id, machine] of Object.entries(factorySystem.machines)) {
      if (!machine.unlocked) continue;
      const fill = document.getElementById('fill-' + id);
      if (fill) fill.style.width = `${machine.progress * 100}%`;
    }
  }

  // Update crafting progress
  craftingSystem.update(delta);

  // Update environment (growing trees, etc.)
  env.update(delta);

  // ── New busy-box systems ────────────────────────────────────────────────────
  offlineSystem.tick();
  autoCombat.update(delta);
  minigame.update(delta);

  // Keep ascension multiplier synced
  ppSystem.globalMultiplier = ascension.ppMultiplier;

  // Achievement checks
  achievements.update(delta, {
    pp: ppSystem,
    statsSystem,
    gameStats,
    inventory: inventorySystem,
    drones: droneSystem,
    ascension,
    drill: drillSystem,
  });

  // Achievement toast display
  const newAch = achievements.popPending();
  if (newAch) hud.showAchievementToast(newAch);

  // ── Interaction priority chain ──────────────────────────────────────────────
  let showingHint = false;

  // Extended gather (tree clear / rock drill) — takes priority over portals
  // Always call handleExtendedGather so the gather timer advances when active.
  if (!player.isInCombat) {
    if (handleExtendedGather(delta) || _gatherType) {
      showingHint = true;
    }
  }

  // Drill interaction
  if (!showingHint && !player.isInCombat && !player.isGathering) {
    if (handleDrillInteraction()) showingHint = true;
  }

  // Spaceship station interactions
  if (!showingHint && !player.isInCombat) {
    if (handleSpaceshipInteractions()) showingHint = true;
  }

  // Resource node gathering
  // We handle gathering completion even if showingHint is true from elsewhere,
  // otherwise completing a gather while standing near a tree or rock causes a soft-lock.
  if (!player.isInCombat && (player.isGathering || !showingHint)) {
    nearestNode = entityManager.findNearestNode(player.position);
    if (nearestNode || player.isGathering) {
      handleGathering(delta);
      showingHint = true;
    }
  }

  // Zone portals
  let showingPortalHint = false;
  if (!player.isInCombat && !player.isGathering && !_gatherType && !showingHint) {
    const portals = env.getPortals();
    for (const portal of portals) {
      const dist = player.position.distanceTo(portal.position);
      if (dist < 2.5) {
        showingHint = true;
        showingPortalHint = true;
        const zoneUnlocked = portal.ppRequired === 0
          || ppSystem.ppTotal >= portal.ppRequired
          || pedometer.isZoneUnlocked(portal.targetZone);
        if (zoneUnlocked) {
          hud.showInteractHint(`[E/ACT] Enter ${portal.label}`);
          if ((keysDown.has('KeyE') || touchInput.actionPressed) && _actionCooldown <= 0) {
            _pendingZone = portal.targetZone;
            _actionCooldown = 0.8; // Prevent accidental double-jump
          }
        }
        break;
      }
    }
  }

  // Seed planting hint — only when standing still, not on every frame
  // (prevents the hint from dominating the HUD on session load)

  // Track placement / removal hints
  if (!showingHint && !player.isInCombat) {
    const nearTrackHint = pedometer.getPlacedTracksForZone(env.currentZone)
      .find(t => Math.hypot(player.position.x - t.x, player.position.z - t.z) < 1.0);
    if (nearTrackHint) {
      hud.showInteractHint('[G] Remove Track');
      showingHint = true;
    } else if (pedometer.pendingTracks > 0 && !showingPortalHint) {
      hud.showInteractHint(`[T] Place Track (${pedometer.pendingTracks} ready)`);
      showingHint = true;
    }
  }

  if (!showingHint) hud.hideInteractHint();
  if (!player.isGathering && !_gatherType) hud.hideGatherProgress();
  touchInput.consumeActionPulse?.();

  // Camera follows player
  sceneManager.update(player.position);

  // HUD update
  hud.update(now);

  // X-ray: fade trees that occlude the player
  _updateOccluders();

  // Render
  sceneManager.render();
}

// Initialize save system after all variables are declared
_initSaveSystem();

sceneManager.renderer.setAnimationLoop(gameLoop);

// Finalise telemetry on page close
window.addEventListener('beforeunload', () => {
  const report = telemetry.finalise();
  syncClient.uploadTelemetrySession(report);
});

console.log('%c⚡ Processing Power — ready', 'color:#00ffcc;font-size:1rem;');
console.log('WASD/Arrows: move | E: interact/gather | T: place track | F: plant seed | B: return to base | I: inventory | R: drones | L: equipment | Q: auto-combat');
