// Colored CSS icons for each item type — avoids emoji, uses styled rectangles/circles
const INV_ICONS = {
  // Materials (square icons)
  copper:    { bg:'#6a3008', border:'#cc7722', label:'Cu', r:'2px' },
  timber:    { bg:'#3a1a08', border:'#8b5a2b', label:'Wd', r:'2px' },
  stone:     { bg:'#3a3a3a', border:'#888888', label:'St', r:'2px' },
  iron:      { bg:'#1a2530', border:'#4a6677', label:'Fe', r:'2px' },
  carbon:    { bg:'#0a0a0a', border:'#444444', label:'C',  r:'50%' },
  quartz:    { bg:'#2a1040', border:'#9977cc', label:'Qz', r:'2px' },
  silica:    { bg:'#0a2a3a', border:'#4499bb', label:'Si', r:'50%' },
  fiber:     { bg:'#0a2808', border:'#449930', label:'Fb', r:'8px' },
  silver:    { bg:'#2a3540', border:'#99aabb', label:'Ag', r:'50%' },
  gold:      { bg:'#502e00', border:'#ddaa00', label:'Au', r:'50%' },
  titanium:  { bg:'#0a1e38', border:'#3366aa', label:'Ti', r:'2px' },
  tungsten:  { bg:'#1a2028', border:'#445566', label:'W',  r:'2px' },
  resin:     { bg:'#3a1a00', border:'#aa6622', label:'Rn', r:'50% 50% 0 50%' },
  seed:      { bg:'#0a2808', border:'#44aa22', label:'Sd', r:'50%' },
  epoxy:     { bg:'#1a2230', border:'#445577', label:'Ep', r:'2px' },
  elastomer: { bg:'#141428', border:'#4444aa', label:'El', r:'2px' },
  magnet:    { bg:'#280a14', border:'#aa3355', label:'Mg', r:'2px' },
  glass:     { bg:'#0a2a38', border:'#66aacc', label:'Gl', r:'2px' },
  lumber:        { bg:'#241408', border:'#7a5030', label:'Lb', r:'2px' },
  // Enemy drop materials
  circuitWire:   { bg:'#0a1a10', border:'#22cc66', label:'CW', r:'2px' },
  ironSpike:     { bg:'#1a1a22', border:'#6688aa', label:'IS', r:'2px' },
  powerCore:     { bg:'#1a0a28', border:'#aa44ff', label:'PC', r:'50%' },
  armorPlate:    { bg:'#1a2020', border:'#667788', label:'AP', r:'2px' },
  burstCapacitor:{ bg:'#2a1a00', border:'#ffaa22', label:'BC', r:'50%' },
  logicChip:     { bg:'#001a2a', border:'#0088ff', label:'LC', r:'2px' },
  // Factory Raw
  silica_sand:           { bg:'#1a1e12', border:'#aabb66', label:'SS', r:'2px' },
  ferrous_ore:           { bg:'#221111', border:'#aa5555', label:'FO', r:'2px' },
  carbon_biomass:        { bg:'#0a1505', border:'#33aa33', label:'CB', r:'50%' },
  // Factory Refined
  silicon_wafer:         { bg:'#002b36', border:'#2aa198', label:'SW', r:'2px' },
  steel_ingot:           { bg:'#222233', border:'#93a1a1', label:'SI', r:'2px' },
  synthetic_resin:       { bg:'#2c1505', border:'#cb4b16', label:'SR', r:'50%' },
  // Factory Components
  logic_processor:       { bg:'#001122', border:'#00aaff', label:'LP', r:'3px' },
  mechanical_servo:      { bg:'#112211', border:'#aaff00', label:'MS', r:'3px' },
  energy_capacitor:      { bg:'#220022', border:'#ff00aa', label:'EC', r:'50%' },
  // Factory Modules
  quantum_processor_ring:{ bg:'#10001a', border:'#bb00ff', label:'QR', r:'50%' },
  exo_servo_harness:     { bg:'#1a1a00', border:'#ffee00', label:'EH', r:'2px' },
  aegis_capacitor_bank:  { bg:'#001a1a', border:'#00ffee', label:'AB', r:'2px' },
  // Consumables (circle icons)
  ration:        { bg:'#221400', border:'#886622', label:'Ra', r:'50%' },
  firstAid:      { bg:'#280008', border:'#cc2233', label:'HP', r:'50%' },
  repairKit:     { bg:'#000a28', border:'#3355aa', label:'RK', r:'50%' },
  antidote:      { bg:'#002010', border:'#339966', label:'An', r:'50%' },
  ironPatch:     { bg:'#0a1228', border:'#4466aa', label:'IP', r:'50%' },
  signalFlare:   { bg:'#280800', border:'#cc5522', label:'SF', r:'50%' },
  energyCell:    { bg:'#002018', border:'#22aaaa', label:'EC', r:'50%' },
  overchargeCell:{ bg:'#001a28', border:'#00ffcc', label:'OC', r:'50%' },
  dataCache:     { bg:'#0a0028', border:'#8844ff', label:'DC', r:'50%' },
  // Tools (square with notch style)
  terrainCutter:    { bg:'#0a200a', border:'#33aa55', label:'TC', r:'3px' },
  chargingStation:  { bg:'#001a10', border:'#22aa66', label:'CS', r:'3px' },
  storageContainer: { bg:'#0a1a1a', border:'#33aaaa', label:'ST', r:'3px' },
};

function _matLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

function _makeIcon(key) {
  const def = INV_ICONS[key] || { bg:'#102210', border:'#336633', label: (key||'?').slice(0,2).toUpperCase(), r:'2px' };
  const el = document.createElement('span');
  el.className = 'inv-icon';
  el.style.background = def.bg;
  el.style.borderColor = def.border;
  el.style.borderRadius = def.r;
  el.textContent = def.label;
  return el;
}

export class HUD {
  constructor(statsSystem, ppSystem, pedometerSystem, inventorySystem, craftingSystem, droneSystem, equipmentSystem, gameStats, achievements, minigame, ascension, autoCombat, drillSystem, techTree = null, mastery = null, syncClient = null, factorySystem = null, codexSystem = null, augmentationSystem = null) {
    this.stats = statsSystem;
    this.pp = ppSystem;
    this.pedometer = pedometerSystem;
    this.inventory = inventorySystem;
    this.crafting = craftingSystem;
    this.drones = droneSystem;
    this.equipment = equipmentSystem;
    this.gameStats = gameStats;
    this.achievements = achievements;
    this.minigame = minigame;
    this.ascension = ascension;
    this.autoCombat = autoCombat;
    this.drill = drillSystem;
    this.techTree = techTree;
    this.mastery = mastery;
    this.syncClient = syncClient;
    this.factory = factorySystem;
    this.codex = codexSystem;
    this.augmentations = augmentationSystem;

    this.ppDisplay = document.getElementById('pp-display');
    this.ppRate = document.getElementById('pp-rate');
    this.hpDisplay = document.getElementById('hp-display');
    this.energyDisplay = document.getElementById('energy-display');
    this.stepsDisplay = document.getElementById('steps-display');
    this.statList = document.getElementById('stat-list');
    this.gatherBar = document.getElementById('gather-bar');
    this.gatherFill = document.getElementById('gather-fill');
    this.gatherText = document.getElementById('gather-text');
    this.interactHint = document.getElementById('interact-hint');
    this.zoneLabel = document.getElementById('zone-label');
    this.drillPanel = document.getElementById('drill-panel');

    this._lastUpdate = 0;
    this._throttleMs = 100;
    this._toastQueue = [];
    this._toastActive = false;
    this._lastCraftingLevel = 1;

    this._buildStatList();
    this._wirePanelToggles();
    this._wireStatsSidebar();
    this._wireStatisticsButton();
    this._wireMinigameButton();
    this._wireAchievementsButton();
    this._wireCodexButton();
    this._wireAugmentationsButton();
    this._wireAscensionButton();
    this._wireDrillButtons();

    if (this.drill) {
      this.drill.onUpdate = () => this.refreshDrillUI();
    }

    // Wire crafting progress to live-update the progress bar
    this.crafting.onCraftProgress = (prog, dur) => {
      this._updateCraftProgressBar(prog, dur);
    };
  }

  // ── Drill Mini-game ───────────────────────────────────────────────────────
  _wireDrillButtons() {
    const btnAction = document.getElementById('btn-drill-action');
    const btnUpgrade = document.getElementById('btn-drill-upgrade');
    if (!btnAction || !btnUpgrade || !this.drill) return;

    btnAction.addEventListener('click', () => {
      this.drill.clickDrill();
      // Visual feedback: brief shake or color flash on the panel could be added here
    });

    btnUpgrade.addEventListener('click', () => {
      if (this.drill.upgrade()) {
        this.refreshDrillUI();
      }
    });
  }

  toggleDrillPanel() {
    if (!this.drillPanel) return;
    const shouldOpen = this.drillPanel.hidden;
    this._closeCommandPanels('drill-panel');
    this.drillPanel.hidden = !shouldOpen;
    if (!this.drillPanel.hidden) {
      this.refreshDrillUI();
    }
  }

  refreshDrillUI() {
    if (!this.drill || !this.drillPanel || this.drillPanel.hidden) return;

    const stratumEl = document.getElementById('drill-stratum');
    const hpFill = document.getElementById('drill-hp-fill');
    const hpText = document.getElementById('drill-hp-text');
    const powerLv = document.getElementById('drill-power-lv');
    const dmgLabel = document.getElementById('drill-damage-label');
    const costLabel = document.getElementById('drill-upgrade-cost');
    const upgradeBtn = document.getElementById('btn-drill-upgrade');

    if (stratumEl) stratumEl.textContent = `STRATUM ${this.drill.currentStratum}`;
    if (hpFill) {
      const pct = (this.drill.layerHP / this.drill.layerHPMax) * 100;
      hpFill.style.width = pct + '%';
    }
    if (hpText) hpText.textContent = `${Math.ceil(this.drill.layerHP).toLocaleString()} / ${Math.ceil(this.drill.layerHPMax).toLocaleString()} HP`;
    if (powerLv) powerLv.textContent = this.drill.drillPowerLevel;
    if (dmgLabel) dmgLabel.textContent = `Damage: ${this.drill.damagePerClick.toFixed(1)}`;

    if (costLabel) {
      const cost = this.drill.upgradeCost;
      costLabel.innerHTML = `${Math.floor(cost.iron)} Iron, ${Math.floor(cost.copper)} Copper<br>${Math.floor(cost.carbon)} Carbon`;

      const canAfford = this.drill.canUpgrade();
      upgradeBtn.disabled = !canAfford;
      upgradeBtn.style.opacity = canAfford ? '1' : '0.5';
    }
  }

  _buildStatList() {
    this.statList.innerHTML = '';
    for (const name of this.stats.statNames) {
      const label = this.stats.statLabels[name];

      const row = document.createElement('div');
      row.className = 'stat-row';
      row.dataset.stat = name;

      const info = document.createElement('div');
      info.className = 'stat-info';

      const labelEl = document.createElement('span');
      labelEl.className = 'stat-label';
      labelEl.textContent = label;

      const lvlEl = document.createElement('span');
      lvlEl.className = 'stat-level';
      lvlEl.textContent = `Lv ${this.stats.stats[name].level}`;

      info.appendChild(labelEl);
      info.appendChild(lvlEl);

      const btn = document.createElement('button');
      btn.className = 'stat-up-btn';
      btn.textContent = `+${this.stats.upgradeCost(name)}`;
      btn.dataset.stat = name;
      btn.onclick = () => this._onUpgrade(name, btn, lvlEl);

      row.appendChild(info);
      row.appendChild(btn);
      this.statList.appendChild(row);
    }
  }

  _onUpgrade(name, btn, lvlEl) {
    const ok = this.stats.levelUp(name, this.pp);
    if (!ok) {
      btn.classList.add('flash-fail');
      setTimeout(() => btn.classList.remove('flash-fail'), 400);
      return;
    }
    lvlEl.textContent = `Lv ${this.stats.stats[name].level}`;
    btn.textContent = `+${this.stats.upgradeCost(name)}`;
  }

  _wireStatsSidebar() {
    const btn = document.getElementById('btn-toggle-stat-sidebar');
    const sidebar = document.getElementById('stat-sidebar');
    if (btn && sidebar) {
      btn.addEventListener('click', () => {
        const shouldOpen = sidebar.hidden;
        this._closeCommandPanels('stat-sidebar');
        sidebar.hidden = !shouldOpen;
      });
    }
  }

  _wireStatisticsButton() {
    const btn = document.getElementById('btn-statistics');
    const panel = document.getElementById('statistics-panel');
    if (btn && panel) {
      btn.addEventListener('click', () => {
        const shouldOpen = panel.hidden;
        this._closeCommandPanels('statistics-panel');
        panel.hidden = !shouldOpen;
        if (!panel.hidden) this._refreshStatistics();
      });
    }
  }

  _refreshStatistics() {
    const el = document.getElementById('statistics-contents');
    if (!el || !this.gameStats) return;
    el.innerHTML = '';

    const gs = this.gameStats;
    const entries = [
      ['Enemies Defeated', gs.enemiesDefeated],
      ['Times Defeated', gs.defeats],
      ['Actions Taken', gs.actionsTaken],
      ['Highest Hit', gs.highestHit],
      ['Worlds Discovered', `${gs.worldsDiscovered} / ${gs.totalWorlds}`],
      ['Total Steps', gs.totalStepsTaken.toLocaleString()],
    ];

    for (const [label, value] of entries) {
      const row = document.createElement('div');
      row.className = 'statistics-row';
      row.innerHTML = `<span class="statistics-label">${label}</span><span class="statistics-value">${value}</span>`;
      el.appendChild(row);
    }
  }

  _wirePanelToggles() {
    // Toggle panels via buttons in HUD (crafting removed — only at Fabricator)
    const panels = ['inventory-panel', 'equipment-panel', 'pedometer-panel', 'tech-panel', 'mastery-panel', 'factory-panel'];
    for (const panelId of panels) {
      const btn = document.getElementById(`btn-toggle-${panelId}`);
      const panel = document.getElementById(panelId);
      if (btn && panel) {
        btn.addEventListener('click', () => {
          const shouldOpen = panel.hidden;
          this._closeCommandPanels(panelId);
          panel.hidden = !shouldOpen;
          if (!panel.hidden) this._refreshPanel(panelId);
        });
      }
    }
  }

  _closeCommandPanels(exceptId = null) {
    const ids = [
      'inventory-panel', 'equipment-panel', 'pedometer-panel', 'tech-panel',
      'mastery-panel', 'achievements-panel', 'statistics-panel', 'stat-sidebar',
      'ascension-panel', 'drill-panel', 'factory-panel', 'codex-panel', 'augmentations-panel'
    ];
    for (const id of ids) {
      if (id === exceptId) continue;
      const panel = document.getElementById(id);
      if (panel) panel.hidden = true;
    }
  }

  _refreshPanel(panelId) {
    switch (panelId) {
      case 'inventory-panel': this._refreshInventory(); break;
      case 'crafting-panel': this._refreshCrafting(); break;
      case 'drone-panel': this._refreshDrones(); break;
      case 'equipment-panel': this._refreshEquipment(); break;
      case 'pedometer-panel': this._refreshPedometer(); break;
      case 'tech-panel': this._refreshTechTree(); break;
      case 'mastery-panel': this._refreshMastery(); break;
      case 'ascension-panel': this._refreshAscension(); break;
      case 'factory-panel': this._refreshFactory(); break;
      case 'codex-panel': this._refreshCodex(); break;
      case 'augmentations-panel': this._refreshAugmentations(); break;
    }
  }

  _refreshFactory() {
    const el = document.getElementById('factory-contents');
    if (!el || !this.factory) return;
    el.innerHTML = '';

    for (const [id, machine] of Object.entries(this.factory.machines)) {
      if (!machine.unlocked) continue;

      const card = document.createElement('div');
      card.className = 'machine-card';

      const header = document.createElement('div');
      header.className = 'machine-header';
      header.innerHTML = `<span class="machine-title">${machine.name} (Lv ${machine.count})</span>
                          <span class="machine-status" style="color: ${machine.isAutomated ? '#00ffcc' : '#ffaa44'}">${machine.isAutomated ? 'Auto' : 'Manual'}</span>`;
      card.appendChild(header);

      const body = document.createElement('div');
      body.className = 'machine-body';

      // Recipe Selector
      const selectorWrap = document.createElement('div');
      selectorWrap.className = 'recipe-selector';
      const select = document.createElement('select');
      for (const recipeId of this.factory.machineRecipes[id]) {
        const rOpts = document.createElement('option');
        rOpts.value = recipeId;
        const recipeDef = this.factory.recipes[recipeId];
        const outList = Object.keys(recipeDef.outputs).map(k => _matLabel(k)).join(', ');
        rOpts.textContent = outList;
        if (machine.currentRecipe === recipeId) rOpts.selected = true;
        select.appendChild(rOpts);
      }
      select.onchange = () => {
        this.factory.setRecipe(id, select.value);
        this._refreshFactory();
      };
      selectorWrap.appendChild(select);
      body.appendChild(selectorWrap);

      // Recipe IO Display
      if (machine.currentRecipe) {
        const recipeDef = this.factory.recipes[machine.currentRecipe];
        const io = document.createElement('div');
        io.className = 'machine-io';
        const inStr = Object.entries(recipeDef.inputs).map(([k,v])=>`${v}x ${_matLabel(k)}`).join(', ');
        const outStr = Object.entries(recipeDef.outputs).map(([k,v])=>`${v * machine.yieldRatio}x ${_matLabel(k)}`).join(', ');
        io.innerHTML = `<span>${inStr} &rarr;</span><span>${outStr}</span>`;
        body.appendChild(io);
      }

      // Progress Track
      const track = document.createElement('div');
      track.className = 'progress-track';
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.id = 'fill-' + id;
      fill.style.width = `${machine.progress * 100}%`;
      track.appendChild(fill);
      body.appendChild(track);

      card.appendChild(body);

      // Controls
      const controls = document.createElement('div');
      controls.className = 'machine-controls';
      
      const processBtn = document.createElement('button');
      processBtn.className = 'btn-process';
      processBtn.textContent = 'PROCESS [Tap]';
      if (machine.isAutomated) {
        processBtn.disabled = true;
        processBtn.style.opacity = '0.5';
      }
      processBtn.onclick = () => {
        this.factory.manualProcess(id);
        this._refreshFactory();
      };
      controls.appendChild(processBtn);

      if (!machine.isAutomated) {
        const automateBtn = document.createElement('button');
        automateBtn.className = 'btn-automate';
        automateBtn.textContent = 'AUTOMATE (100 PP)';
        automateBtn.onclick = () => {
          this.factory.automate(id, 100);
          this._refreshFactory();
        };
        controls.appendChild(automateBtn);
      } else {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'btn-automate';
        const cost = 100 * Math.pow(2, machine.count);
        upgradeBtn.textContent = `UPGRADE (${cost} PP)`;
        upgradeBtn.onclick = () => {
          if (this.pp.spend(cost)) {
            machine.count++;
            this._refreshFactory();
          }
        };
        controls.appendChild(upgradeBtn);
      }
      
      card.appendChild(controls);
      el.appendChild(card);
    }
  }

  // ── Inventory Panel (20×2 material grid) ──────────────────────────────────
  _refreshInventory() {
    const el = document.getElementById('inventory-contents');
    if (!el) return;
    el.innerHTML = '';

    const allMatNames = Object.keys(this.inventory.materials);
    const GRID_CELLS = 40; // 20 wide × 2 tall

    // ── Material grid ──
    const matTitle = document.createElement('div');
    matTitle.className = 'panel-subtitle';
    matTitle.textContent = 'Materials (max 99/slot)';
    el.appendChild(matTitle);

    const grid = document.createElement('div');
    grid.className = 'inv-material-grid';
    for (let i = 0; i < GRID_CELLS; i++) {
      const name = allMatNames[i] || null;
      const raw = name ? this.inventory.materials[name] : 0;
      const cell = document.createElement('div');
      cell.className = 'inv-grid-cell' + (name && raw > 0 ? ' has-item' : ' empty-slot');
      if (name && raw > 0) {
        const icon = _makeIcon(name);
        icon.style.width = '20px'; icon.style.height = '20px'; icon.style.fontSize = '0.48rem';
        cell.appendChild(icon);
        const cnt = document.createElement('div');
        cnt.className = 'inv-grid-count';
        cnt.textContent = Math.min(raw, 99);
        cell.appendChild(cnt);
        cell.title = `${_matLabel(name)}: ${raw}`;
      }
      grid.appendChild(cell);
    }
    el.appendChild(grid);

    // ── Storage grid (when container owned) ──
    if (this.inventory.hasTool('storageContainer')) {
      const storTitle = document.createElement('div');
      storTitle.className = 'panel-subtitle';
      storTitle.style.marginTop = '10px';
      storTitle.textContent = 'Storage Container (click cell to withdraw)';
      el.appendChild(storTitle);

      const storGrid = document.createElement('div');
      storGrid.className = 'inv-material-grid';
      for (let i = 0; i < GRID_CELLS; i++) {
        const name = allMatNames[i] || null;
        const count = name ? (this.inventory.storageItems[name] || 0) : 0;
        const cell = document.createElement('div');
        cell.className = 'inv-grid-cell' + (name && count > 0 ? ' has-item' : ' empty-slot');
        if (name && count > 0) {
          const icon = _makeIcon(name);
          icon.style.width = '20px'; icon.style.height = '20px'; icon.style.fontSize = '0.48rem';
          cell.appendChild(icon);
          const cnt = document.createElement('div');
          cnt.className = 'inv-grid-count';
          cnt.textContent = Math.min(count, 99);
          cell.appendChild(cnt);
          cell.title = `${name}: ${count} stored — click to withdraw 1`;
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', () => { this.inventory.withdrawFromStorage(name, 1); this._refreshInventory(); });
        }
        storGrid.appendChild(cell);
      }
      el.appendChild(storGrid);
    }

    // ── Equipment Bag ──
    if (this.inventory.equipmentBag.length > 0) {
      const bagTitle = document.createElement('div');
      bagTitle.className = 'panel-subtitle'; bagTitle.style.marginTop = '10px';
      bagTitle.textContent = 'Equipment Bag'; el.appendChild(bagTitle);
      this.inventory.equipmentBag.forEach((item, idx) => {
        const row = document.createElement('div'); row.className = 'inv-row';
        const nameEl = document.createElement('span'); nameEl.style.flex = '1';
        const tierColor = { Rare:'#cc88ff', Good:'#44aaff', Epic:'#ff8800' }[item.tier] || '#aaffcc';
        nameEl.style.color = tierColor;
        nameEl.textContent = `${item.label} [${item.slot}]${item.tier ? ' ('+item.tier+')' : ''}`;
        const equipBtn = document.createElement('button'); equipBtn.className = 'stat-up-btn';
        equipBtn.textContent = 'Equip';
        equipBtn.addEventListener('click', () => this._equipFromBag(idx));
        row.appendChild(nameEl); row.appendChild(equipBtn); el.appendChild(row);
      });
    }

    // ── Consumables ──
    const cons = this.inventory.getConsumableList();
    if (cons.length > 0) {
      const consTitle = document.createElement('div');
      consTitle.className = 'panel-subtitle'; consTitle.style.marginTop = '10px';
      consTitle.textContent = 'Consumables'; el.appendChild(consTitle);
      for (const c of cons) {
        const row = document.createElement('div'); row.className = 'inv-row';
        row.appendChild(_makeIcon(c.key));
        const nameSpan = document.createElement('span'); nameSpan.style.flex = '1';
        nameSpan.textContent = `${c.label}: x${c.count}`;
        const useBtn = document.createElement('button'); useBtn.className = 'stat-up-btn';
        useBtn.textContent = 'Use';
        const atFullHP = c.heal > 0 && this.stats.currentHP >= this.stats.maxHP;
        useBtn.disabled = c.count <= 0 || atFullHP;
        useBtn.title = atFullHP ? 'HP is already full' : '';
        useBtn.addEventListener('mousedown', () => {
          if (c.heal > 0 && this.stats.currentHP >= this.stats.maxHP) return;
          this.inventory.useConsumable(c.key, this.stats, this.pp);
          this.hpDisplay.textContent = `HP: ${Math.ceil(this.stats.currentHP)} / ${this.stats.maxHP}`;
          this._refreshInventory();
        });
        row.appendChild(nameSpan); row.appendChild(useBtn); el.appendChild(row);
      }
    }
  }

  _equipFromBag(idx) {
    const item = this.inventory.removeFromEquipmentBag(idx);
    if (!item) return;
    const displaced = this.equipment.equip(item);
    if (displaced) this.inventory.addToEquipmentBag(displaced);
    this._refreshInventory();
  }

  // Populate the inventory side-panel inside the crafting modal
  _refreshCraftingInventory() {
    const el = document.getElementById('crafting-inv-contents');
    if (!el) return;
    el.innerHTML = '';
    const mats = this.inventory.getMaterialList();
    if (mats.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'inv-row';
      empty.style.cssText = 'opacity:0.4;padding:4px 8px;';
      empty.textContent = 'Empty';
      el.appendChild(empty);
      return;
    }
    for (const m of mats) {
      const row = document.createElement('div');
      row.className = 'inv-row';
      row.appendChild(_makeIcon(m.name));
      const label = document.createElement('span');
      label.style.fontSize = '0.68rem';
      label.textContent = `${m.name}: ${m.count}`;
      row.appendChild(label);
      el.appendChild(row);
    }
  }

  // ── Crafting Panel ─────────────────────────────────────────────────────────
  _refreshCrafting() {
    // Always sync crafting level so prerequisite locks are current on every open
    this._lastCraftingLevel = this.stats.stats.crafting.level;
    this._refreshCraftingInventory();
    const el = document.getElementById('crafting-contents');
    if (!el) return;
    el.innerHTML = '';

    const recipes = this.crafting.getAvailableRecipes();
    if (recipes.length === 0) {
      el.innerHTML = '<div class="inv-row" style="opacity:0.5">No recipes available</div>';
      return;
    }

    for (const recipe of recipes) {
      const row = document.createElement('div');
      row.className = 'craft-row';

      const info = document.createElement('div');
      info.className = 'craft-info';
      const btn = document.createElement('button');
      btn.className = 'stat-up-btn';

      if (recipe.isLocked) {
        // Show locked recipes greyed out with level requirement
        info.style.opacity = '0.4';
        const matList = Object.entries(recipe.materials).map(([m, q]) => `${_matLabel(m)}×${q}`).join(', ');
        const typeLabel = recipe.type === 'tool' ? ' [Tool]' : recipe.type === 'equipment' ? ' [Equip]' : '';
        info.innerHTML = `<span class="craft-name">${recipe.label}${typeLabel}</span><span class="craft-mats">Crafting Lv ${recipe.minCraftingLevel} needed</span>`;
        btn.textContent = 'Locked';
        btn.disabled = true;
        btn.style.opacity = '0.4';
      } else {
        const matList = Object.entries(recipe.materials).map(([m, q]) => `${_matLabel(m)}×${q}`).join(', ');
        const typeLabel = recipe.type === 'tool' ? ' [Tool]' : recipe.type === 'equipment' ? ' [Equip]' : '';
        info.innerHTML = `<span class="craft-name">${recipe.label}${typeLabel}</span><span class="craft-mats">${matList}</span>`;
        if (recipe.alreadyOwned) {
          btn.textContent = 'Owned';
          btn.disabled = true;
        } else {
          btn.textContent = `Craft (${recipe.craftTime.toFixed(1)}s)`;
          btn.disabled = !recipe.canCraft || this.crafting.isCrafting;
          btn.addEventListener('click', () => {
            this.crafting.startCraft(recipe.id);
            this._refreshCrafting();
          });
        }
      }

      row.appendChild(info);
      row.appendChild(btn);

      // Queue button (for consumables/equipment when already crafting)
      if (!recipe.isLocked && !recipe.alreadyOwned && recipe.canCraft && this.crafting.isCrafting) {
        const qBtn = document.createElement('button');
        qBtn.className = 'stat-up-btn';
        qBtn.style.marginLeft = '4px';
        qBtn.textContent = '+Q';
        qBtn.title = 'Add to queue';
        qBtn.disabled = this.crafting.queueLength >= this.crafting.maxQueueSize;
        qBtn.addEventListener('click', () => {
          this.crafting.queueCraft(recipe.id);
          this._refreshCrafting();
        });
        row.appendChild(qBtn);
      }

      el.appendChild(row);
    }

    // Progress bar
    if (this.crafting.isCrafting) {
      const wrap = document.createElement('div');
      wrap.id = 'craft-progress-wrap';
      wrap.style.cssText = 'margin-top:8px;padding:6px 0;';

      const label = document.createElement('div');
      label.id = 'craft-progress-label';
      label.style.cssText = 'font-size:0.7rem;color:#00ffcc;text-align:center;margin-bottom:4px;';
      const remaining = Math.max(0, this.crafting.craftDuration - this.crafting.craftProgress).toFixed(1);
      label.textContent = `Crafting ${this.crafting.craftingRecipeName}... ${remaining}s`;
      wrap.appendChild(label);

      const track = document.createElement('div');
      track.style.cssText = 'background:#0a1a12;border:1px solid #00ffcc44;border-radius:3px;height:8px;overflow:hidden;';
      const fill = document.createElement('div');
      fill.id = 'craft-progress-fill';
      const pct = this.crafting.craftDuration > 0
        ? Math.min(100, (this.crafting.craftProgress / this.crafting.craftDuration) * 100)
        : 0;
      fill.style.cssText = `background:#00ffcc;height:100%;width:${pct}%;transition:width 0.1s linear;`;
      track.appendChild(fill);
      wrap.appendChild(track);
      el.appendChild(wrap);
    }

    // Queue display
    this._refreshCraftingWithQueue();
  }

  // Live-update the craft progress bar without full re-render
  _updateCraftProgressBar(prog, dur) {
    const fill = document.getElementById('craft-progress-fill');
    const label = document.getElementById('craft-progress-label');
    if (!fill || !label) return;
    const pct = dur > 0 ? Math.min(100, (prog / dur) * 100) : 0;
    fill.style.width = pct + '%';
    const remaining = Math.max(0, dur - prog).toFixed(1);
    label.textContent = `Crafting ${this.crafting.craftingRecipeName}... ${remaining}s`;
  }

  // Called by main.js when crafting completes
  onCraftingComplete() {
    const panel = document.getElementById('crafting-panel');
    if (panel && !panel.hidden) {
      this._refreshCrafting();
    }
  }

  // ── Drone Panel ────────────────────────────────────────────────────────────
  _refreshDrones() {
    const el = document.getElementById('drone-contents');
    if (!el) return;
    el.innerHTML = '';

    const drones = this.drones.getDroneStatus();
    const materials = ['copper', 'timber', 'stone', 'iron', 'fiber', 'quartz', 'silica', 'carbon', 'gold'];

    for (const drone of drones) {
      const card = document.createElement('div');
      card.className = 'drone-card';

      const header = document.createElement('div');
      header.className = 'drone-header';
      header.textContent = `${drone.name} (Eff: ${drone.efficiency})`;
      card.appendChild(header);

      // Material assignment selector
      const select = document.createElement('select');
      select.className = 'drone-select';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- Idle --';
      select.appendChild(emptyOpt);
      for (const mat of materials) {
        const opt = document.createElement('option');
        opt.value = mat;
        opt.textContent = mat;
        if (drone.assignedMaterial === mat) opt.selected = true;
        select.appendChild(opt);
      }
      select.onchange = () => {
        if (select.value) {
          this.drones.assignDrone(drone.id, select.value);
        } else {
          this.drones.unassignDrone(drone.id);
        }
      };
      card.appendChild(select);

      // Upgrade button
      const upBtn = document.createElement('button');
      upBtn.className = 'stat-up-btn';
      upBtn.textContent = `Upgrade (${drone.efficiencyUpgradeCost} PP)`;
      upBtn.onclick = () => {
        this.drones.upgradeDroneEfficiency(drone.id);
        this._refreshDrones();
      };
      card.appendChild(upBtn);

      el.appendChild(card);
    }

    // Buy new drone button
    if (this.drones.canBuyDrone) {
      const buyBtn = document.createElement('button');
      buyBtn.className = 'stat-up-btn drone-buy-btn';
      buyBtn.textContent = `Buy Drone (${this.drones.nextDroneCost} PP)`;
      buyBtn.onclick = () => {
        this.drones.buyNewDrone();
        this._refreshDrones();
      };
      el.appendChild(buyBtn);
    }

    // ── Missions section ──────────────────────────────────────────────────────
    const missionTitle = document.createElement('div');
    missionTitle.className = 'panel-subtitle';
    missionTitle.style.marginTop = '12px';
    missionTitle.textContent = 'Drone Missions';
    el.appendChild(missionTitle);

    const visitedZones = this.gameStats?._visitedZones || new Set();
    const allZones = this.drones.constructor.MISSION_ZONES;
    const idleDrones = this.drones.drones.filter(d => !this.drones.isDroneOnMission(d.id) && !d.assignedMaterial);

    // Active missions
    const activeMissions = this.drones.getMissions().filter(m => !m.done);
    if (activeMissions.length > 0) {
      for (const m of activeMissions) {
        const remaining = Math.max(0, Math.ceil(m.duration - m.elapsed));
        const pct = Math.min(100, (m.elapsed / m.duration) * 100).toFixed(0);
        const drone = this.drones.drones.find(d => d.id === m.droneId);
        const row = document.createElement('div');
        row.style.cssText = 'padding:4px 0;border-bottom:1px solid #00cc6622;font-size:0.75rem;display:flex;align-items:center;gap:8px;';
        row.innerHTML = `<span style="flex:1;color:#55bb88;">${drone?.name || 'Drone'} → ${allZones[m.zoneName]?.label || m.zoneName}</span><span style="color:#aaa;">${remaining}s</span>`;
        const recallBtn = document.createElement('button');
        recallBtn.className = 'stat-up-btn';
        recallBtn.textContent = 'Recall';
        recallBtn.onclick = () => { this.drones.recallDrone(m.droneId); this._refreshDrones(); };
        row.appendChild(recallBtn);
        el.appendChild(row);
      }
    }

    // Send on mission UI
    if (idleDrones.length > 0) {
      const sendWrap = document.createElement('div');
      sendWrap.style.cssText = 'margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;';

      const droneSelect = document.createElement('select');
      droneSelect.className = 'drone-select';
      for (const d of idleDrones) {
        const o = document.createElement('option');
        o.value = d.id; o.textContent = d.name;
        droneSelect.appendChild(o);
      }

      const zoneSelect = document.createElement('select');
      zoneSelect.className = 'drone-select';
      for (const [key, zone] of Object.entries(allZones)) {
        if (!visitedZones.has(key)) continue;
        const o = document.createElement('option');
        o.value = key;
        o.textContent = `${zone.label} (~${Math.round(zone.duration / 60)}m)`;
        zoneSelect.appendChild(o);
      }

      if (zoneSelect.options.length > 0) {
        const sendBtn = document.createElement('button');
        sendBtn.className = 'stat-up-btn';
        sendBtn.textContent = 'Send';
        sendBtn.onclick = () => {
          this.drones.sendOnMission(Number(droneSelect.value), zoneSelect.value);
          this._refreshDrones();
        };
        sendWrap.appendChild(droneSelect);
        sendWrap.appendChild(zoneSelect);
        sendWrap.appendChild(sendBtn);
        el.appendChild(sendWrap);
      } else {
        const note = document.createElement('div');
        note.style.cssText = 'font-size:0.7rem;color:#556677;margin-top:4px;';
        note.textContent = 'Visit more zones to unlock mission destinations.';
        el.appendChild(note);
      }
    } else if (activeMissions.length === 0) {
      const note = document.createElement('div');
      note.style.cssText = 'font-size:0.7rem;color:#556677;margin-top:4px;';
      note.textContent = 'All drones are busy gathering. Unassign one to send on a mission.';
      el.appendChild(note);
    }
  }

  // ── Pedometer / Steps Shop Panel ───────────────────────────────────────────
  _refreshPedometer() {
    const el = document.getElementById('pedometer-contents');
    if (!el) return;
    el.innerHTML = '';
    const ped = this.pedometer;
    const steps = ped.totalSteps;

    const stepInfo = document.createElement('div');
    stepInfo.className = 'panel-subtitle';
    stepInfo.textContent = `Available Steps: ${steps.toLocaleString()}`;
    el.appendChild(stepInfo);

    // Show current speed so track boost is observable
    const speedBonus = this.stats._trackBonus;
    const baseSpeed = this.stats.moveSpeed - speedBonus;
    const speedInfo = document.createElement('div');
    speedInfo.style.cssText = 'font-size:0.7rem;color:#aaccbb;margin-bottom:6px;text-align:center';
    speedInfo.textContent = speedBonus > 0
      ? `Speed: ${baseSpeed.toFixed(1)} + ${speedBonus.toFixed(1)} track boost = ${this.stats.moveSpeed.toFixed(1)}`
      : `Speed: ${this.stats.moveSpeed.toFixed(1)}`;
    el.appendChild(speedInfo);

    // ── PP Bonus per Step ──
    this._pedometerSection(el, 'PP Bonus / Step');
    const ppRow = this._pedometerShopRow(
      `+${ped.ppBonusPerStep.toFixed(2)} PP/step → +${(ped.ppBonusPerStep + 0.10).toFixed(2)}`,
      `${ped.nextBonusCost} steps`,
      steps >= ped.nextBonusCost,
      () => { ped.buyPPBonus(); this._refreshPedometer(); }
    );
    el.appendChild(ppRow);

    // ── Speed Tracks ──
    const tracksFree = ped.trackCount < 10;
    const trackCostLabel = tracksFree ? `FREE (${10 - ped.trackCount} remaining)` : `${ped.nextTrackCost} steps`;
    this._pedometerSection(el, `Speed Tracks (owned: ${ped.trackCount}${ped.pendingTracks > 0 ? `, ${ped.pendingTracks} unplaced — press T` : ''})`);
    const trackRow = this._pedometerShopRow(
      `Track #${ped.trackCount + 1} (+0.3 speed, place with T)`,
      trackCostLabel,
      ped.canBuyTrack(),
      () => { ped.buyTrack(); this._refreshPedometer(); }
    );
    el.appendChild(trackRow);

    // ── Stat Levels ──
    this._pedometerSection(el, `Stat Level (cost: ${ped.nextStatCost} steps)`);
    const statNames = this.stats.statNames;
    const statLabels = this.stats.statLabels;
    const canAfford = steps >= ped.nextStatCost;
    for (const name of statNames) {
      const row = this._pedometerShopRow(
        `${statLabels[name]} (Lv ${this.stats.stats[name].level} → ${this.stats.stats[name].level + 1})`,
        `${ped.nextStatCost} steps`,
        canAfford,
        () => { ped.buyStatLevel(name, this.stats); this._refreshPedometer(); }
      );
      el.appendChild(row);
    }

    // ── Environment Unlocks ──
    this._pedometerSection(el, 'Environment Unlocks');
    const envOptions = ped.getEnvUnlockOptions();
    const envLabels = { verdantMaw: 'Verdant Maw', lagoonCoast: 'Lagoon Coast', frozenTundra: 'Frozen Tundra' };
    for (const { zone, cost, unlocked } of envOptions) {
      const row = this._pedometerShopRow(
        `${envLabels[zone] || zone}`,
        unlocked ? 'UNLOCKED' : `${cost.toLocaleString()} steps`,
        !unlocked && steps >= cost,
        () => { ped.unlockZone(zone); this._refreshPedometer(); }
      );
      if (unlocked) row.querySelector('button').textContent = 'Owned';
      el.appendChild(row);
    }
  }

  _refreshTechTree() {
    const el = document.getElementById('tech-contents');
    if (!el || !this.techTree) return;
    el.innerHTML = '';
    const systems = { pp: this.pp, pedometer: this.pedometer, inventory: this.inventory };
    for (const node of this.techTree.nodes) {
      const state = this.techTree.getNodeState(node.id, systems);
      const row = document.createElement('div');
      row.className = 'craft-row';
      const info = document.createElement('div');
      info.className = 'craft-info';
      info.innerHTML = `<span class="craft-name">${node.label}</span><span class="craft-mats">${node.description} | ${state.owned ? 'Owned' : state.reason || 'Available'}</span>`;
      const btn = document.createElement('button');
      btn.className = 'stat-up-btn';
      btn.textContent = state.owned ? 'Owned' : 'Unlock';
      btn.disabled = state.owned || state.locked || !state.affordable;
      btn.addEventListener('click', async () => {
        await this.techTree.purchase(node.id, systems);
        this._refreshTechTree();
        this._refreshCrafting();
      });
      row.appendChild(info);
      row.appendChild(btn);
      el.appendChild(row);
    }
  }

  _refreshMastery() {
    const el = document.getElementById('mastery-contents');
    if (!el || !this.mastery) return;
    el.innerHTML = '';
    for (const track of this.mastery.tracks) {
      const progress = this.mastery.progress[track.id] || { xp: 0, level: 1 };
      const row = document.createElement('div');
      row.className = 'craft-row';
      const info = document.createElement('div');
      info.className = 'craft-info';
      const next = track.xpPerLevel * progress.level;
      info.innerHTML = `<span class="craft-name">${track.label} Lv ${progress.level}</span><span class="craft-mats">${progress.xp}/${next} XP | craft time x${this.mastery.getCraftTimeMultiplier(track.id).toFixed(2)}</span>`;
      row.appendChild(info);
      el.appendChild(row);
    }
  }

  setSyncStatus(status) {
    const el = document.getElementById('sync-status');
    if (el) el.textContent = status;
  }

  _pedometerSection(el, title) {
    const h = document.createElement('div');
    h.className = 'panel-subtitle';
    h.style.marginTop = '8px';
    h.textContent = title;
    el.appendChild(h);
  }

  _pedometerShopRow(label, costLabel, canAfford, onBuy) {
    const row = document.createElement('div');
    row.className = 'craft-row';
    const info = document.createElement('div');
    info.className = 'craft-info';
    info.innerHTML = `<span class="craft-name">${label}</span><span class="craft-mats">${costLabel}</span>`;
    const btn = document.createElement('button');
    btn.className = 'stat-up-btn';
    btn.textContent = 'Buy';
    btn.disabled = !canAfford;
    btn.style.touchAction = 'manipulation';
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault(); // cancels the subsequent click on any rebuilt DOM node
      if (btn.disabled) return;
      onBuy();
    });
    row.appendChild(info);
    row.appendChild(btn);
    return row;
  }

  // ── Equipment Panel ────────────────────────────────────────────────────────
  _refreshEquipment() {
    const el = document.getElementById('equipment-contents');
    if (!el) return;
    el.innerHTML = '';

    const slots = this.equipment.getEquippedList();
    for (const { slot, item } of slots) {
      const row = document.createElement('div');
      row.className = 'equip-row';
      const slotLabel = slot.charAt(0).toUpperCase() + slot.slice(1);
      if (item) {
        row.innerHTML = `<span class="equip-slot">${slotLabel}:</span> <span class="equip-item tier-${item.tier?.toLowerCase()}">${item.label}</span>`;
      } else {
        row.innerHTML = `<span class="equip-slot">${slotLabel}:</span> <span class="equip-empty">Empty</span>`;
      }
      el.appendChild(row);
    }

    // ── Tools ──
    const tools = this.inventory.getToolList();
    if (tools.length > 0) {
      const toolTitle = document.createElement('div');
      toolTitle.className = 'panel-subtitle'; toolTitle.style.marginTop = '10px';
      toolTitle.textContent = 'Tools'; el.appendChild(toolTitle);
      const TOOL_LABELS = { terrainCutter:'Terrain Cutter', chargingStation:'Charging Station', storageContainer:'Storage Container' };
      for (const key of tools) {
        const row = document.createElement('div'); row.className = 'inv-row';
        row.appendChild(_makeIcon(key));
        const durVal = this.inventory.tools[key];
        const maxDur = (typeof durVal === 'number') ? (this.inventory.constructor.TOOL_MAX_DURABILITY[key] || durVal) : null;
        const durText = maxDur !== null ? ` (${durVal}/${maxDur})` : '';
        const lbl = document.createElement('span'); lbl.textContent = (TOOL_LABELS[key] || key) + durText;
        row.appendChild(lbl);
        if (maxDur !== null && durVal < maxDur) {
          const repairBtn = document.createElement('button'); repairBtn.className = 'stat-up-btn';
          repairBtn.textContent = 'Repair (1 iron + 1 resin)';
          repairBtn.title = 'Costs 1 iron + 1 resin';
          repairBtn.addEventListener('click', () => {
            const ok = this.inventory.repairTool(key);
            if (!ok) this.showInteractHint('Need 1 iron + 1 resin to repair.');
            this._refreshEquipment();
          });
          row.appendChild(repairBtn);
        }
        el.appendChild(row);
      }
    }
  }

  // ── Gather progress ────────────────────────────────────────────────────────
  showGatherProgress(progress, total) {
    if (this.gatherBar) {
      this.gatherBar.hidden = false;
      const pct = Math.min(100, (progress / total) * 100);
      this.gatherFill.style.width = pct + '%';
      this.gatherText.textContent = `Gathering... ${pct.toFixed(0)}%`;
    }
  }

  hideGatherProgress() {
    if (this.gatherBar) this.gatherBar.hidden = true;
  }

  showInteractHint(text) {
    if (this.interactHint) {
      this.interactHint.hidden = false;
      this.interactHint.textContent = text;
    }
  }

  hideInteractHint() {
    if (this.interactHint) this.interactHint.hidden = true;
  }

  setZoneLabel(name) {
    if (this.zoneLabel) this.zoneLabel.textContent = name;
  }


  // ── Frame update ───────────────────────────────────────────────────────────
  update(now) {
    if (now - this._lastUpdate < this._throttleMs) return;
    this._lastUpdate = now;

    const pp = this.pp.displayTotal;
    const rate = this.pp.ppRate.toFixed(1);
    this.ppDisplay.childNodes[0].nodeValue = `PP: ${pp.toLocaleString()} `;
    this.ppRate.textContent = `(+${rate}/s)`;

    // Update prestige bonus display if visible
    const prestigeEl = document.getElementById('prestige-display');
    if (prestigeEl) prestigeEl.textContent = `+${this.pp.prestigeBonus.toFixed(3)} PP/s`;

    this.hpDisplay.textContent = `HP: ${Math.ceil(this.stats.currentHP)} / ${this.stats.maxHP}`;
    this.energyDisplay.textContent = `Energy: ${Math.ceil(this.stats.currentEnergy)} / ${this.stats.maxEnergy}`;
    this.stepsDisplay.textContent = `Steps: ${this.pedometer.totalSteps.toLocaleString()}`;

    // Refresh stat levels
    const rows = this.statList.querySelectorAll('.stat-row');
    rows.forEach(row => {
      const name = row.dataset.stat;
      const lvlEl = row.querySelector('.stat-level');
      const btn = row.querySelector('.stat-up-btn');
      lvlEl.textContent = `Lv ${this.stats.stats[name].level}`;
      const cost = this.stats.upgradeCost(name);
      btn.textContent = `+${cost}`;
      btn.disabled = this.pp.ppTotal < cost;
    });

    // Refresh open panels periodically
    const invPanel = document.getElementById('inventory-panel');
    if (invPanel && !invPanel.hidden) this._refreshInventory();

    // Crafting panel: always refresh inventory section; rebuild recipes if crafting level changed
    const craftPanel = document.getElementById('crafting-panel');
    if (craftPanel && !craftPanel.hidden) {
      const curCraftLevel = this.stats.stats.crafting.level;
      if (curCraftLevel !== this._lastCraftingLevel) {
        this._lastCraftingLevel = curCraftLevel;
        this._refreshCrafting();
      } else {
        this._refreshCraftingInventory();
      }
    }

    const dronePanel = document.getElementById('drone-panel');
    if (dronePanel && !dronePanel.hidden) {
      const droneContents = document.getElementById('drone-contents');
      if (!droneContents || !droneContents.contains(document.activeElement)) {
        this._refreshDrones();
      }
    }

    const pedPanel = document.getElementById('pedometer-panel');
    if (pedPanel && !pedPanel.hidden) this._refreshPedometer();

    // Update minigame bar if active
    this._updateMinigameBar();

    // Update auto-combat indicator
    const acInd = document.getElementById('auto-combat-indicator');
    if (acInd) acInd.hidden = !this.autoCombat.enabled;

    // Update minigame cooldown text
    const mgBtn = document.getElementById('btn-toggle-minigame');
    if (mgBtn && this.minigame) {
      if (this.minigame.active) {
        mgBtn.textContent = 'FOCUS!';
        mgBtn.style.borderColor = '#ffcc00';
        mgBtn.style.color = '#ffcc00';
      } else if (this.minigame.cooldownRemaining > 0) {
        mgBtn.textContent = `GAME ${Math.ceil(this.minigame.cooldownRemaining)}s`;
        mgBtn.style.borderColor = '#555';
        mgBtn.style.color = '#777';
      } else {
        mgBtn.textContent = 'GAME';
        mgBtn.style.borderColor = '#ffcc00';
        mgBtn.style.color = '#ffcc00';
      }
    }
  }

  // ── Offline Progress Banner ─────────────────────────────────────────────
  showOfflineBanner(summary) {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    const content = document.getElementById('offline-content');
    if (content) {
      content.innerHTML = `
        <div style="font-size:1rem;font-weight:bold;color:#00ffcc;margin-bottom:8px;">WELCOME BACK</div>
        <div style="color:#aaccbb;font-size:0.8rem;margin-bottom:4px;">Time away: ${summary.timeAway}</div>
        <div style="color:#44ffaa;font-size:0.85rem;margin-bottom:4px;">+${summary.ppGained.toLocaleString()} PP (50% offline rate)</div>
        <div style="color:#aaccbb;font-size:0.75rem;">Drone haul: ${summary.matSummary}</div>
      `;
    }
    banner.hidden = false;
    setTimeout(() => { banner.hidden = true; }, 8000);
  }

  // ── Achievement Toast ───────────────────────────────────────────────────
  showAchievementToast(ach) {
    this._toastQueue.push(ach);
    if (!this._toastActive) this._processToastQueue();
  }

  _processToastQueue() {
    if (this._toastQueue.length === 0) { this._toastActive = false; return; }
    this._toastActive = true;
    const ach = this._toastQueue.shift();

    const toast = document.getElementById('achievement-toast');
    if (!toast) { this._toastActive = false; return; }
    const icon = document.getElementById('ach-toast-icon');
    const label = document.getElementById('ach-toast-label');
    const desc = document.getElementById('ach-toast-desc');
    const reward = document.getElementById('ach-toast-reward');

    if (icon) icon.textContent = ach.icon;
    if (label) label.textContent = ach.label;
    if (desc) desc.textContent = ach.desc;
    if (reward) reward.textContent = ach.reward > 0 ? `+${ach.reward} PP` : '';

    toast.hidden = false;
    toast.classList.remove('toast-exit');
    toast.classList.add('toast-enter');

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove('toast-exit');
        this._processToastQueue();
      }, 500);
    }, 3000);
  }

  // ── Auto-Combat Status ──────────────────────────────────────────────────
  showAutoCombatStatus(on) {
    const ind = document.getElementById('auto-combat-indicator');
    if (ind) ind.hidden = !on;
  }

  // ── Minigame ────────────────────────────────────────────────────────────
  _wireMinigameButton() {
    const btn = document.getElementById('btn-toggle-minigame');
    if (!btn || !this.minigame) return;
    btn.addEventListener('click', () => {
      if (this.minigame.active) {
        const result = this.minigame.hit();
        if (result) this._showMinigameResult(result);
      } else if (this.minigame.canPlay()) {
        this.minigame.start();
        const bar = document.getElementById('minigame-bar');
        if (bar) bar.hidden = false;
      }
    });
  }

  _updateMinigameBar() {
    const bar = document.getElementById('minigame-bar');
    const cursor = document.getElementById('minigame-cursor');
    if (!bar || !cursor || !this.minigame) return;

    if (!this.minigame.active) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    cursor.style.left = (this.minigame.cursor * 100) + '%';
  }

  _showMinigameResult(result) {
    const bar = document.getElementById('minigame-bar');
    if (bar) bar.hidden = true;

    const colors = { PERFECT: '#ffcc00', GOOD: '#44ffaa', OK: '#aaccbb', MISS: '#ff4444' };
    this.showAchievementToast({
      icon: '🎯',
      label: result.zone,
      desc: `${result.multiplier}x multiplier`,
      reward: result.ppAwarded,
    });
  }

  // ── Achievements Panel ──────────────────────────────────────────────────
  _wireAchievementsButton() {
    const btn = document.getElementById('btn-toggle-achievements');
    const panel = document.getElementById('achievements-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      this._closeCommandPanels('achievements-panel');
      panel.hidden = !shouldOpen;
      if (!panel.hidden) this._refreshAchievements();
    });
  }

  // ── Augmentations Panel ──────────────────────────────────────────────────────
  _wireAugmentationsButton() {
    const btn = document.getElementById('btn-toggle-augmentations-panel');
    const panel = document.getElementById('augmentations-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      this._closeCommandPanels('augmentations-panel');
      panel.hidden = !shouldOpen;
      if (!panel.hidden) this._refreshAugmentations();
    });
  }

  _refreshAugmentations() {
    const el = document.getElementById('augmentations-contents');
    if (!el || !this.augmentations) return;
    el.innerHTML = '';

    const aug = this.augmentations;
    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#cc88ff;font-size:0.75rem;margin-bottom:8px;';
    header.textContent = `Installed: ${aug.ownedCount} / ${aug.totalCount}`;
    el.appendChild(header);

    const categories = [...new Set(aug.constructor.ALL.map(a => a.category))];
    for (const cat of categories) {
      const catTitle = document.createElement('div');
      catTitle.className = 'panel-subtitle'; catTitle.style.marginTop = '8px';
      catTitle.textContent = cat; el.appendChild(catTitle);

      for (const augDef of aug.constructor.ALL.filter(a => a.category === cat)) {
        const owned = aug.has(augDef.id);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #cc88ff22;';

        const info = document.createElement('div');
        info.style.flex = '1';
        info.innerHTML = `<div style="color:${owned ? '#cc88ff' : '#aaaaaa'};font-size:0.8rem;">${augDef.label}${owned ? ' ✓' : ''}</div><div style="color:#556677;font-size:0.7rem;">${augDef.desc}</div>`;
        row.appendChild(info);

        if (!owned) {
          const btn = document.createElement('button');
          btn.className = 'stat-up-btn';
          btn.style.borderColor = '#cc88ff44'; btn.style.color = '#cc88ff';
          btn.textContent = `${augDef.cost} PP`;
          btn.disabled = this.pp.ppTotal < augDef.cost;
          btn.addEventListener('click', () => {
            if (aug.purchase(augDef.id, this.pp)) this._refreshAugmentations();
          });
          row.appendChild(btn);
        }
        el.appendChild(row);
      }
    }
  }

  // ── Codex Panel ─────────────────────────────────────────────────────────────
  _wireCodexButton() {
    const btn = document.getElementById('btn-toggle-codex-panel');
    const panel = document.getElementById('codex-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      this._closeCommandPanels('codex-panel');
      panel.hidden = !shouldOpen;
      if (!panel.hidden) this._refreshCodex();
    });
  }

  _refreshCodex() {
    const el = document.getElementById('codex-contents');
    if (!el || !this.codex) return;
    el.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#88ccff;font-size:0.75rem;margin-bottom:8px;';
    header.textContent = `Discovered: ${this.codex.discoveredCount} / ${this.codex.totalCount}`;
    el.appendChild(header);

    const entries = this.codex.getEntries();
    const categories = ['Material', 'Enemy', 'Crafted'];
    for (const cat of categories) {
      const catEntries = entries.filter(e => e.category === cat);
      const catTitle = document.createElement('div');
      catTitle.className = 'panel-subtitle';
      catTitle.style.marginTop = '8px';
      catTitle.textContent = cat + 's';
      el.appendChild(catTitle);

      for (const entry of catEntries) {
        const row = document.createElement('div');
        row.style.cssText = 'padding:4px 0;border-bottom:1px solid #44aaff22;';
        if (entry.discovered) {
          row.innerHTML = `<div style="color:#88ccff;font-size:0.8rem;">${entry.label}</div><div style="color:#556677;font-size:0.7rem;font-style:italic;">${entry.flavor}</div>`;
        } else {
          row.innerHTML = `<div style="color:#334455;font-size:0.8rem;">???</div>`;
        }
        el.appendChild(row);
      }
    }
  }

  _refreshAchievements() {
    const el = document.getElementById('achievements-contents');
    if (!el || !this.achievements) return;
    el.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#ffcc00;font-size:0.75rem;margin-bottom:8px;';
    header.textContent = `${this.achievements.totalUnlocked} / ${this.achievements.totalAchievements} Unlocked`;
    el.appendChild(header);

    for (const ach of this.achievements.constructor.ALL) {
      const row = document.createElement('div');
      const unlocked = this.achievements.unlocked.has(ach.id);
      row.className = 'ach-row' + (unlocked ? ' ach-unlocked' : '');
      row.innerHTML = `
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-info">
          <span class="ach-name">${ach.label}</span>
          <span class="ach-desc">${ach.desc}</span>
        </div>
        <span class="ach-reward">${ach.reward > 0 ? '+' + ach.reward + ' PP' : ''}</span>
      `;
      el.appendChild(row);
    }
  }

  // ── Ascension Panel ─────────────────────────────────────────────────────
  _wireAscensionButton() {
    const btn = document.getElementById('btn-toggle-ascension');
    const panel = document.getElementById('ascension-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      this._closeCommandPanels('ascension-panel');
      panel.hidden = !shouldOpen;
      if (!panel.hidden) this._refreshAscension();
    });
  }

  _refreshAscension() {
    const el = document.getElementById('ascension-contents');
    if (!el || !this.ascension) return;
    el.innerHTML = '';

    // Status
    const status = document.createElement('div');
    status.style.cssText = 'text-align:center;margin-bottom:8px;';
    status.innerHTML = `
      <div style="color:#cc88ff;font-size:0.8rem;font-weight:bold;">Ascensions: ${this.ascension.ascensionCount}</div>
      <div style="color:#aa77dd;font-size:0.7rem;">AP: ${this.ascension.ascensionPoints}</div>
      <div style="color:#887799;font-size:0.65rem;margin-top:4px;">Need ${this.ascension.ascensionThreshold.toFixed(2)} prestige bonus to ascend</div>
      <div style="color:#887799;font-size:0.65rem;">Current prestige: ${this.pp.prestigeBonus.toFixed(4)}</div>
    `;
    el.appendChild(status);

    // Ascend button
    const ascBtn = document.createElement('button');
    ascBtn.className = 'stat-up-btn';
    ascBtn.style.cssText = 'width:100%;padding:6px;margin-bottom:8px;background:rgba(80,0,120,0.7);border-color:#cc88ff;color:#cc88ff;font-size:0.75rem;';
    ascBtn.textContent = this.ascension.canAscend() ? 'ASCEND' : 'LOCKED';
    ascBtn.disabled = !this.ascension.canAscend();
    ascBtn.addEventListener('click', () => {
      const result = this.ascension.ascend();
      if (result) {
        this.showAchievementToast({
          icon: '✦',
          label: `Ascension ${result.ascensionCount}`,
          desc: `+${result.apEarned} AP earned!`,
          reward: 0,
        });
        this._refreshAscension();
      }
    });
    el.appendChild(ascBtn);

    // Upgrades
    const title = document.createElement('div');
    title.className = 'panel-subtitle';
    title.textContent = 'Ascension Upgrades';
    el.appendChild(title);

    for (const upg of this.ascension.getUpgrades()) {
      const row = document.createElement('div');
      row.className = 'craft-row';
      const info = document.createElement('div');
      info.className = 'craft-info';
      info.innerHTML = `<span class="craft-name" style="color:#cc88ff;">${upg.label} (${upg.value})</span><span class="craft-mats">${upg.desc} — Cost: ${upg.cost} AP</span>`;
      const btn = document.createElement('button');
      btn.className = 'stat-up-btn';
      btn.textContent = 'Buy';
      btn.disabled = this.ascension.ascensionPoints < upg.cost;
      btn.addEventListener('click', () => {
        this.ascension.buyUpgrade(upg.id);
        this.pp.globalMultiplier = this.ascension.ppMultiplier;
        this._refreshAscension();
      });
      row.appendChild(info);
      row.appendChild(btn);
      el.appendChild(row);
    }
  }

  // ── Crafting Panel (updated with queue support) ─────────────────────────
  _refreshCraftingWithQueue() {
    // Show queue status at top of crafting panel
    const el = document.getElementById('crafting-contents');
    if (!el) return;

    // Add queue info after existing craft content
    const queueWrap = document.createElement('div');
    queueWrap.style.cssText = 'margin-top:8px;border-top:1px solid #00cc6644;padding-top:6px;';

    if (this.crafting.queueLength > 0) {
      const qTitle = document.createElement('div');
      qTitle.className = 'panel-subtitle';
      qTitle.textContent = `Queue (${this.crafting.queueLength}/${this.crafting.maxQueueSize})`;
      queueWrap.appendChild(qTitle);

      for (const item of this.crafting.queue) {
        const row = document.createElement('div');
        row.className = 'inv-row';
        row.style.color = '#55aa77';
        row.textContent = `⏳ ${item.label}`;
        queueWrap.appendChild(row);
      }
    }
    el.appendChild(queueWrap);
  }
}
