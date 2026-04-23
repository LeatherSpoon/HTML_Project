# Graph Report - D:/HTML_Project  (2026-04-22)

## Corpus Check
- 81 files · ~107,806 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2635 nodes · 6174 edges · 43 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 848 edges (avg confidence: 0.8)
- Token cost: 12,500 input · 4,800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Achievement System|Achievement System]]
- [[_COMMUNITY_Combat UI + Scene|Combat UI + Scene]]
- [[_COMMUNITY_Three.js Core|Three.js Core]]
- [[_COMMUNITY_Augmentation + Server DB|Augmentation + Server DB]]
- [[_COMMUNITY_Combat System|Combat System]]
- [[_COMMUNITY_BufferGeometry Utils|BufferGeometry Utils]]
- [[_COMMUNITY_Animation Interpolation|Animation Interpolation]]
- [[_COMMUNITY_Vector Math|Vector Math]]
- [[_COMMUNITY_Entity + Environment|Entity + Environment]]
- [[_COMMUNITY_Three.js Serialization|Three.js Serialization]]
- [[_COMMUNITY_Architecture + Docs|Architecture + Docs]]
- [[_COMMUNITY_Crafting Mastery|Crafting Mastery]]
- [[_COMMUNITY_Server + GLTFLoader|Server + GLTFLoader]]
- [[_COMMUNITY_Euler + Quaternion|Euler + Quaternion]]
- [[_COMMUNITY_Telemetry System|Telemetry System]]
- [[_COMMUNITY_PMREM Environment Map|PMREM Environment Map]]
- [[_COMMUNITY_Three.js Buffer Types|Three.js Buffer Types]]
- [[_COMMUNITY_Keyframe Tracks|Keyframe Tracks]]
- [[_COMMUNITY_Texture Loader|Texture Loader]]
- [[_COMMUNITY_Minigame + PP System|Minigame + PP System]]
- [[_COMMUNITY_Touch Input Tests|Touch Input Tests]]
- [[_COMMUNITY_Three.js Spherical|Three.js Spherical]]
- [[_COMMUNITY_Floating Joystick|Floating Joystick]]
- [[_COMMUNITY_Progression Definitions|Progression Definitions]]
- [[_COMMUNITY_DB Migration|DB Migration]]
- [[_COMMUNITY_Progression Repo Tests|Progression Repo Tests]]
- [[_COMMUNITY_Transaction Service Tests|Transaction Service Tests]]
- [[_COMMUNITY_Sync Client Tests|Sync Client Tests]]
- [[_COMMUNITY_Save System Tests|Save System Tests]]
- [[_COMMUNITY_Game Config|Game Config]]
- [[_COMMUNITY_Server Entry Point|Server Entry Point]]
- [[_COMMUNITY_Seed Data|Seed Data]]
- [[_COMMUNITY_Test Runner|Test Runner]]
- [[_COMMUNITY_DB CLI Tests|DB CLI Tests]]
- [[_COMMUNITY_DB Pool Tests|DB Pool Tests]]
- [[_COMMUNITY_Health Check Tests|Health Check Tests]]
- [[_COMMUNITY_Seed Data Tests|Seed Data Tests]]
- [[_COMMUNITY_Crafting Mastery Tests|Crafting Mastery Tests]]
- [[_COMMUNITY_Crafting Sync Tests|Crafting Sync Tests]]
- [[_COMMUNITY_Progression Defs Tests|Progression Defs Tests]]
- [[_COMMUNITY_Save Progression Tests|Save Progression Tests]]
- [[_COMMUNITY_Tech Tree Tests|Tech Tree Tests]]
- [[_COMMUNITY_Game Statistics|Game Statistics]]

## God Nodes (most connected - your core abstractions)
1. `Ci` - 76 edges
2. `Environment` - 57 edges
3. `Kn` - 55 edges
4. `Mi` - 51 edges
5. `HUD` - 50 edges
6. `Ir` - 47 edges
7. `ri()` - 40 edges
8. `sr` - 38 edges
9. `Yr` - 38 edges
10. `ii()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `TelemetrySystem` --semantically_similar_to--> `DataEventSystem â€” Structured Field Event Recording`  [INFERRED] [semantically similar]
  D:\HTML_Project\js\Telemetry.js → docs/superpowers/specs/2026-04-21-field-research-expedition-loop-design.md
- `CraftingSystem.js â€” Crafting Recipes and Queue` --shares_data_with--> `Crafting Materials (copper, timber, stone, etc.)`  [INFERRED]
  js/systems/CraftingSystem.js → Direction.md
- `Processing Power Project (CLAUDE.md)` --references--> `config.js â€” Game Constants`  [EXTRACTED]
  CLAUDE.md → js/config.js
- `Processing Power Project (CLAUDE.md)` --references--> `ToonMaterials.js â€” Toon Shading Materials`  [EXTRACTED]
  CLAUDE.md → js/scene/ToonMaterials.js
- `PostgreSQL Progression Implementation Plan` --references--> `CraftingMasterySystem.js â€” Mastery XP and Bonuses`  [EXTRACTED]
  docs/superpowers/plans/2026-04-19-postgresql-progression.md → js/systems/CraftingMasterySystem.js

## Hyperedges (group relationships)
- **Field Research Expedition Core Loop (Explore, Gather Data, Offload, Unlock)** — concept_field_research_loop, concept_offload_ritual, concept_data_event_system, concept_offload_system, concept_processing_power [EXTRACTED 0.95]
- **PostgreSQL Progression Architecture (SyncClient, TransactionService, ProgressionRepository, PostgreSQL)** — system_syncclient_js, server_transaction_svc_js, server_progression_repo_js, server_db_pool_js, concept_local_first_sync [EXTRACTED 0.92]
- **Zone Registration Pattern (Environment.js + main.js + config.js + GameStatistics.js)** — system_environment_js, system_main_js, system_config_js, concept_game_statistics_js [EXTRACTED 0.95]

## Communities

### Community 0 - "Achievement System"
Cohesion: 0.01
Nodes (38): AchievementSystem, AscensionSystem, AugmentationSystem, deinterleaveGeometry(), CodexSystem, CraftingSystem, DroneSystem, EntityManager (+30 more)

### Community 1 - "Combat UI + Scene"
Cohesion: 0.02
Nodes (23): bh, Dh(), dp, ep, ha, hs, ii(), Ir (+15 more)

### Community 2 - "Three.js Core"
Cohesion: 0.01
Nodes (115): ac, ai(), Ao(), au, bi, bl, bo(), Bu() (+107 more)

### Community 3 - "Augmentation + Server DB"
Cohesion: 0.02
Nodes (50): isDirectRun(), addMorphTargets(), addPrimitiveAttributes(), addUnknownExtensionsToUserData(), assignExtrasToUserData(), createAttributesKey(), createDefaultMaterial(), createPrimitiveKey() (+42 more)

### Community 4 - "Combat System"
Cohesion: 0.01
Nodes (11): AutoCombatSystem, CombatSystem, CombatUI, DrillSystem, getMineableWallBlocks(), seededRandom(), StatsSystem, Kn (+3 more)

### Community 5 - "BufferGeometry Utils"
Cohesion: 0.02
Nodes (35): computeMikkTSpaceTangents(), computeMorphedAttributes(), deepCloneAttribute(), deinterleaveAttribute(), estimateBytesUsed(), interleaveAttributes(), mergeAttributes(), mergeGeometries() (+27 more)

### Community 6 - "Animation Interpolation"
Cohesion: 0.02
Nodes (10): ad, am, dd, Hp, pd, qp, rd, rm (+2 more)

### Community 7 - "Vector Math"
Cohesion: 0.02
Nodes (6): Ci, gr, oa, rr, Sm, Xn()

### Community 8 - "Entity + Environment"
Cohesion: 0.04
Nodes (15): Enemy, cloneModel(), Environment, loadModel(), seededRandom(), switchZone(), Player, ResourceNode (+7 more)

### Community 9 - "Three.js Serialization"
Cohesion: 0.03
Nodes (14): ec, Gh, gp, hm, jn(), kc, mh, _p (+6 more)

### Community 10 - "Architecture + Docs"
Cohesion: 0.04
Nodes (60): Processing Power Project (CLAUDE.md), Codebase Explainer HTML, System Wiring via Optional Callbacks Pattern, Character Stats (Strength, Health, Defense, etc.), Circle Collision on XZ Plane, Pokemon-style Combat Cutaway, Crafting Mastery â€” Category XP and Bonuses, Crafting Materials (copper, timber, stone, etc.) (+52 more)

### Community 11 - "Crafting Mastery"
Cohesion: 0.04
Nodes (13): readConfig(), CraftingMasterySystem, OfflineSystem, createPool(), createProgressionRepository(), createProgressionRepositoryFromPool(), number(), SyncClient (+5 more)

### Community 12 - "Server + GLTFLoader"
Cohesion: 0.06
Nodes (11): readJson(), bp, Hd, kd(), pp, qd, wc, wd() (+3 more)

### Community 13 - "Euler + Quaternion"
Cohesion: 0.04
Nodes (7): fr, js(), kl(), ri(), sp, Vl(), zl()

### Community 14 - "Telemetry System"
Cohesion: 0.04
Nodes (7): bind(), getValue(), il, nm, setValue(), yc, zc

### Community 15 - "PMREM Environment Map"
Cohesion: 0.08
Nodes (8): ba(), Dm, Ga(), ka(), mp, Va(), wa(), Ym

### Community 16 - "Three.js Buffer Types"
Cohesion: 0.06
Nodes (6): constructor(), da(), ic, im, Wn(), yi

### Community 17 - "Keyframe Tracks"
Cohesion: 0.07
Nodes (5): cd(), ld, md, od, sd

### Community 18 - "Texture Loader"
Cohesion: 0.1
Nodes (3): ap, ea, Qs

### Community 19 - "Minigame + PP System"
Cohesion: 0.1
Nodes (2): MinigameSystem, PPSystem

### Community 20 - "Touch Input Tests"
Cohesion: 0.18
Nodes (1): FakeElement

### Community 21 - "Three.js Spherical"
Cohesion: 0.29
Nodes (1): vm

### Community 22 - "Floating Joystick"
Cohesion: 0.5
Nodes (5): Floating Joystick â€” Tap/Drag Mobile Control, Floating Joystick Implementation Plan, Rationale: Tap Implies Intent, Drag Moves (Floating Joystick), Floating Joystick Design Spec, TouchInput.js â€” Mobile Touch/Joystick Input

### Community 23 - "Progression Definitions"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "DB Migration"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Progression Repo Tests"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Transaction Service Tests"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Sync Client Tests"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Save System Tests"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Game Config"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Server Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Seed Data"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Test Runner"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "DB CLI Tests"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "DB Pool Tests"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Health Check Tests"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Seed Data Tests"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Crafting Mastery Tests"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Crafting Sync Tests"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Progression Defs Tests"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Save Progression Tests"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Tech Tree Tests"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Game Statistics"
Cohesion: 1.0
Nodes (1): GameStatistics.js â€” Zone Count and Global Statistics

## Knowledge Gaps
- **15 isolated node(s):** `Codebase Explainer HTML`, `seedData.js â€” Tech Tree Nodes and Effects Definitions`, `ProgressionDefinitions.js â€” Local Fallback and Server Definitions`, `OffloadSystem â€” Expedition Data Aggregation and Reward Conversion`, `ShipConsoleUI â€” Readable Sci-fi Research Console` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `DB Migration`** (2 nodes): `migrate.js`, `runMigrations()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Progression Repo Tests`** (2 nodes): `progressionRepository.test.js`, `fakePool()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Transaction Service Tests`** (2 nodes): `transactionService.test.js`, `fakeRepo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sync Client Tests`** (2 nodes): `syncClient.test.js`, `storage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Save System Tests`** (2 nodes): `saveSystemProgression.test.js`, `makeSystems()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Config`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Server Entry Point`** (1 nodes): `start.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Seed Data`** (1 nodes): `seedData.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Runner`** (1 nodes): `runAll.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB CLI Tests`** (1 nodes): `dbCli.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Pool Tests`** (1 nodes): `dbPool.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Check Tests`** (1 nodes): `health.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Seed Data Tests`** (1 nodes): `seedData.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Crafting Mastery Tests`** (1 nodes): `craftingMasterySystem.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Crafting Sync Tests`** (1 nodes): `craftingSync.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Progression Defs Tests`** (1 nodes): `progressionDefinitions.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Save Progression Tests`** (1 nodes): `saveProgressionState.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tech Tree Tests`** (1 nodes): `techTreeSystem.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Statistics`** (1 nodes): `GameStatistics.js â€” Zone Count and Global Statistics`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Ci` connect `Vector Math` to `Achievement System`, `Combat UI + Scene`, `Three.js Core`, `Combat System`, `BufferGeometry Utils`, `Entity + Environment`, `Architecture + Docs`, `Euler + Quaternion`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `Kn` connect `Combat System` to `Achievement System`, `Combat UI + Scene`, `Three.js Core`, `BufferGeometry Utils`, `Vector Math`, `Architecture + Docs`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `TelemetrySystem` connect `Architecture + Docs` to `Achievement System`, `Crafting Mastery`, `Telemetry System`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `Codebase Explainer HTML`, `seedData.js â€” Tech Tree Nodes and Effects Definitions`, `ProgressionDefinitions.js â€” Local Fallback and Server Definitions` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Achievement System` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Combat UI + Scene` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Three.js Core` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._