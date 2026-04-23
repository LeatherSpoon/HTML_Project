import { readConfig } from '../config.js';
import { createPool } from '../db/pool.js';

function number(value) {
  return Number(value || 0);
}

function groupInventory(rows) {
  const buckets = {};
  for (const row of rows) {
    buckets[row.bucket] ||= {};
    buckets[row.bucket][row.item_key] = row.qty;
  }
  return buckets;
}

function attachRecipeCosts(recipes, costs) {
  const byRecipe = new Map(recipes.map(r => [r.id, { ...r, costs: {} }]));
  for (const cost of costs) {
    const recipe = byRecipe.get(cost.recipe_id);
    if (recipe) recipe.costs[cost.material_id] = cost.qty;
  }
  return [...byRecipe.values()];
}

export function createProgressionRepository(config = readConfig()) {
  return createProgressionRepositoryFromPool(createPool(config.databaseUrl), config);
}

export function createProgressionRepositoryFromPool(pool, config = readConfig()) {
  const repo = {
    async health() {
      await pool.query('select 1');
      return { ok: true };
    },

    async getBootstrap(playerId = config.defaultPlayerId) {
      const [
        materials,
        masteryTracks,
        techNodes,
        prerequisites,
        recipes,
        recipeCosts,
        wallet,
        inventory,
        tools,
        techUnlocks,
        mastery,
        drones,
        jobs
      ] = await Promise.all([
        pool.query('select * from materials order by id'),
        pool.query('select * from mastery_tracks order by id'),
        pool.query('select * from tech_nodes where enabled = true order by display_order'),
        pool.query('select * from tech_node_prerequisites order by tech_node_id, prerequisite_id'),
        pool.query('select * from recipes where enabled = true order by id'),
        pool.query('select * from recipe_costs order by recipe_id, material_id'),
        pool.query('select * from player_wallets where player_id = $1', [playerId]),
        pool.query('select * from player_inventory where player_id = $1', [playerId]),
        pool.query('select * from player_tools where player_id = $1', [playerId]),
        pool.query('select * from player_tech_unlocks where player_id = $1', [playerId]),
        pool.query('select * from player_mastery where player_id = $1', [playerId]),
        pool.query('select * from player_drones where player_id = $1 order by drone_id', [playerId]),
        pool.query('select * from player_crafting_jobs where player_id = $1 and status in ($2, $3) order by id', [playerId, 'active', 'queued'])
      ]);

      const recipeDefs = attachRecipeCosts(recipes.rows.map(r => ({
        id: r.id,
        label: r.label,
        type: r.recipe_type,
        outputKey: r.output_key,
        outputQty: r.output_qty,
        category: r.category,
        baseTime: number(r.base_time),
        minCraftingLevel: r.min_crafting_level,
        requiredTechNode: r.required_tech_node,
        slot: r.slot,
        tier: r.tier,
        statBonuses: r.stat_bonuses || {}
      })), recipeCosts.rows);

      const walletRow = wallet.rows[0] || {
        pp: 0,
        pp_rate: 1,
        prestige_bonus: 0,
        prestige_count: 0,
        steps: 0,
        state_version: 0
      };

      return {
        definitions: {
          version: 'starter-1',
          materials: materials.rows.map(r => ({
            id: r.id,
            label: r.label,
            stackLimit: r.stack_limit,
            rarity: r.rarity,
            droneGatherable: r.drone_gatherable
          })),
          masteryTracks: masteryTracks.rows.map(r => ({
            id: r.id,
            label: r.label,
            xpPerLevel: r.xp_per_level
          })),
          techNodes: techNodes.rows.map(r => ({
            id: r.id,
            branch: r.branch,
            label: r.label,
            description: r.description,
            costType: r.cost_type,
            costAmount: r.cost_amount,
            materialCosts: r.material_costs || {},
            displayOrder: r.display_order,
            prerequisites: prerequisites.rows.filter(p => p.tech_node_id === r.id).map(p => p.prerequisite_id)
          })),
          recipes: recipeDefs
        },
        player: {
          id: playerId,
          version: walletRow.state_version,
          wallet: {
            pp: number(walletRow.pp),
            ppRate: number(walletRow.pp_rate),
            prestigeBonus: number(walletRow.prestige_bonus),
            prestigeCount: walletRow.prestige_count,
            steps: walletRow.steps
          },
          inventory: groupInventory(inventory.rows),
          tools: tools.rows.map(r => r.tool_key),
          techUnlocks: techUnlocks.rows.map(r => r.tech_node_id),
          mastery: mastery.rows.map(r => ({ trackId: r.track_id, xp: r.xp, level: r.level })),
          drones: drones.rows.map(r => ({
            id: r.drone_id,
            name: r.name,
            assignedMaterial: r.assigned_material,
            efficiency: r.efficiency,
            gatherTimer: number(r.gather_timer)
          })),
          craftingJobs: jobs.rows.map(r => ({
            id: r.local_job_id,
            recipeId: r.recipe_id,
            status: r.status,
            startedAt: r.started_at,
            finishesAt: r.finishes_at
          }))
        }
      };
    },

    async hasAcceptedEvent(eventId) {
      const result = await pool.query('select 1 from player_transactions where event_id = $1 and accepted = true', [eventId]);
      return result.rowCount > 0;
    },

    async getTransactionContext(playerId) {
      const bootstrap = await this.getBootstrap(playerId);
      return {
        definitions: bootstrap.definitions,
        state: {
          version: bootstrap.player.version,
          wallet: bootstrap.player.wallet,
          inventory: bootstrap.player.inventory,
          techUnlocks: bootstrap.player.techUnlocks,
          mastery: bootstrap.player.mastery
        }
      };
    },

    async recordAccepted(event, result) {
      await pool.query(
        `insert into player_transactions (event_id, player_id, transaction_type, payload, accepted, state_version)
         values ($1, $2, $3, $4::jsonb, true, $5)
         on conflict (event_id) do nothing`,
        [event.eventId, event.playerId, event.type, JSON.stringify(event.payload || {}), result.version]
      );
      await pool.query(
        `update player_wallets
         set state_version = greatest(state_version, $2), updated_at = now()
         where player_id = $1`,
        [event.playerId, result.version]
      );
    },

    async recordRejected(event, reason) {
      await pool.query(
        `insert into player_transactions (event_id, player_id, transaction_type, payload, accepted, reason)
         values ($1, $2, $3, $4::jsonb, false, $5)
         on conflict (event_id) do nothing`,
        [event.eventId, event.playerId, event.type || 'unknown', JSON.stringify(event.payload || {}), reason]
      );
    },

    async applyInventoryDelta(playerId, itemKey, bucket, delta) {
      await pool.query(
        `insert into player_inventory (player_id, item_key, bucket, qty)
         values ($1, $2, $3, $4)
         on conflict (player_id, item_key, bucket)
         do update set qty = greatest(0, player_inventory.qty + excluded.qty)`,
        [playerId, itemKey, bucket, delta]
      );
    },

    async updateWalletDelta(playerId, delta) {
      await pool.query(
        `update player_wallets
         set pp = greatest(0, pp + $2),
             steps = greatest(0, steps + $3),
             updated_at = now()
         where player_id = $1`,
        [playerId, delta.pp || 0, delta.steps || 0]
      );
    },

    async insertCraftingJob(playerId, localJobId, recipeId, startedAt, finishesAt, consumedInputs) {
      await pool.query(
        `insert into player_crafting_jobs (player_id, local_job_id, recipe_id, status, started_at, finishes_at, consumed_inputs)
         values ($1, $2, $3, 'active', $4, $5, $6::jsonb)
         on conflict (player_id, local_job_id) do nothing`,
        [playerId, localJobId, recipeId, startedAt, finishesAt, JSON.stringify(consumedInputs)]
      );
    },

    async completeCraftingJob(playerId, localJobId) {
      await pool.query(
        `update player_crafting_jobs set status = 'complete' where player_id = $1 and local_job_id = $2`,
        [playerId, localJobId]
      );
    },

    async unlockTech(playerId, techNodeId) {
      await pool.query(
        `insert into player_tech_unlocks (player_id, tech_node_id)
         values ($1, $2)
         on conflict do nothing`,
        [playerId, techNodeId]
      );
    },

    async awardMastery(playerId, trackId, xp) {
      await pool.query(
        `insert into player_mastery (player_id, track_id, xp, level)
         values ($1, $2, $3, 1 + floor($3 / 100.0)::int)
         on conflict (player_id, track_id)
         do update set
           xp = player_mastery.xp + excluded.xp,
           level = 1 + floor((player_mastery.xp + excluded.xp) / 100.0)::int,
           updated_at = now()`,
        [playerId, trackId, xp]
      );
    },

    async saveSnapshot(snapshot) {
      await pool.query(
        'insert into player_save_snapshots (player_id, snapshot) values ($1, $2::jsonb)',
        [snapshot.playerId, JSON.stringify(snapshot)]
      );
      return { ok: true };
    },

    async getLatestSnapshot(playerId) {
      const result = await pool.query(
        'select snapshot from player_save_snapshots where player_id = $1 order by created_at desc limit 1',
        [playerId]
      );
      return result.rows[0]?.snapshot || null;
    },

    async saveTelemetrySession(report) {
      await pool.query(
        'insert into telemetry_sessions (player_id, session_id, report) values ($1, $2, $3::jsonb)',
        [report.playerId || null, report.meta?.sessionId || report.session?.sessionId || 'unknown', JSON.stringify(report)]
      );
      return { ok: true };
    },

    async saveTelemetryEvent(event) {
      await pool.query(
        'insert into telemetry_events (player_id, session_id, event_id, event_type, payload) values ($1, $2, $3, $4, $5::jsonb)',
        [event.playerId || null, event.sessionId || null, event.eventId || null, event.type, JSON.stringify(event.payload || {})]
      );
      return { ok: true };
    },

    pool
  };

  return repo;
}
