function hasMaterials(inventory, costs) {
  const bucket = inventory.inventory || {};
  return Object.entries(costs).every(([key, qty]) => (bucket[key] || 0) >= qty);
}

function requireEvent(event) {
  if (!event || !event.eventId || !event.playerId || !event.type) {
    return { ok: false, reason: 'malformed_payload' };
  }
  return null;
}

export function createTransactionService(repo) {
  async function applyOne(event) {
    const malformed = requireEvent(event);
    if (malformed) return malformed;

    if (await repo.hasAcceptedEvent(event.eventId)) {
      const bootstrap = await repo.getBootstrap(event.playerId);
      return { ok: true, duplicate: true, version: bootstrap.player.version, player: bootstrap.player };
    }

    const ctx = await repo.getTransactionContext(event.playerId);
    const currentVersion = ctx.state.version || 0;
    if (event.expectedVersion !== undefined && event.expectedVersion < currentVersion - 25) {
      await repo.recordRejected(event, 'stale_version');
      return { ok: false, reason: 'stale_version', version: currentVersion };
    }

    let result;
    switch (event.type) {
      case 'inventory.addMaterial':
        result = await applyInventoryAdd(repo, ctx, event);
        break;
      case 'crafting.start':
        result = await applyCraftingStart(repo, ctx, event);
        break;
      case 'crafting.complete':
        result = await applyCraftingComplete(repo, ctx, event);
        break;
      case 'tech.purchase':
        result = await applyTechPurchase(repo, ctx, event);
        break;
      case 'mastery.awardCraftXp':
        result = await applyMasteryAward(repo, ctx, event);
        break;
      case 'drone.assign':
      case 'drone.upgrade':
      case 'offline.applyGains':
      case 'snapshot.save':
        result = { ok: true };
        break;
      default:
        result = { ok: false, reason: 'unknown_transaction_type' };
    }

    if (!result.ok) {
      await repo.recordRejected(event, result.reason);
      return result;
    }

    const version = currentVersion + 1;
    await repo.recordAccepted(event, { version });
    const bootstrap = await repo.getBootstrap(event.playerId);
    return { ok: true, version, player: bootstrap.player };
  }

  async function applyBatch(playerId, transactions) {
    const results = [];
    for (const tx of transactions) {
      results.push(await applyOne({ ...tx, playerId: tx.playerId || playerId }));
    }
    const bootstrap = await repo.getBootstrap(playerId);
    return { ok: true, results, player: bootstrap.player };
  }

  return { applyOne, applyBatch };
}

async function applyInventoryAdd(repo, _ctx, event) {
  const { itemKey, bucket = 'inventory', qty } = event.payload || {};
  if (!itemKey || !Number.isFinite(qty) || qty <= 0) return { ok: false, reason: 'malformed_payload' };
  await repo.applyInventoryDelta(event.playerId, itemKey, bucket, qty);
  return { ok: true };
}

async function applyCraftingStart(repo, ctx, event) {
  const { localJobId, recipeId, startedAt } = event.payload || {};
  const recipe = ctx.definitions.recipes.find(r => r.id === recipeId);
  if (!localJobId || !recipe || !startedAt) return { ok: false, reason: 'malformed_payload' };
  if (recipe.requiredTechNode && !ctx.state.techUnlocks.includes(recipe.requiredTechNode)) return { ok: false, reason: 'locked_recipe' };
  if (!hasMaterials(ctx.state.inventory, recipe.costs)) return { ok: false, reason: 'insufficient_materials' };

  for (const [materialId, qty] of Object.entries(recipe.costs)) {
    await repo.applyInventoryDelta(event.playerId, materialId, 'inventory', -qty);
  }
  const start = new Date(startedAt);
  const finish = new Date(start.getTime() + recipe.baseTime * 1000);
  await repo.insertCraftingJob(event.playerId, localJobId, recipeId, start, finish, recipe.costs);
  return { ok: true };
}

async function applyCraftingComplete(repo, ctx, event) {
  const { localJobId, recipeId } = event.payload || {};
  const recipe = ctx.definitions.recipes.find(r => r.id === recipeId);
  if (!localJobId || !recipe) return { ok: false, reason: 'malformed_payload' };

  const bucket = recipe.type === 'consumable' ? 'consumable' : recipe.type === 'tool' ? 'tool' : 'equipment';
  await repo.applyInventoryDelta(event.playerId, recipe.outputKey, bucket, recipe.outputQty || 1);
  await repo.completeCraftingJob(event.playerId, localJobId);
  await repo.awardMastery(event.playerId, recipe.category, 25);
  return { ok: true };
}

async function applyTechPurchase(repo, ctx, event) {
  const { techNodeId } = event.payload || {};
  const node = ctx.definitions.techNodes.find(n => n.id === techNodeId);
  if (!node) return { ok: false, reason: 'malformed_payload' };
  if (ctx.state.techUnlocks.includes(techNodeId)) return { ok: true };
  if (!node.prerequisites.every(id => ctx.state.techUnlocks.includes(id))) return { ok: false, reason: 'unmet_prerequisite' };

  if (node.costType === 'pp') {
    if (ctx.state.wallet.pp < node.costAmount) return { ok: false, reason: 'insufficient_pp' };
    await repo.updateWalletDelta(event.playerId, { pp: -node.costAmount });
  } else if (node.costType === 'steps') {
    if (ctx.state.wallet.steps < node.costAmount) return { ok: false, reason: 'insufficient_steps' };
    await repo.updateWalletDelta(event.playerId, { steps: -node.costAmount });
  } else if (node.costType === 'materials') {
    if (!hasMaterials(ctx.state.inventory, node.materialCosts || {})) return { ok: false, reason: 'insufficient_materials' };
    for (const [materialId, qty] of Object.entries(node.materialCosts || {})) {
      await repo.applyInventoryDelta(event.playerId, materialId, 'inventory', -qty);
    }
  }

  await repo.unlockTech(event.playerId, techNodeId);
  return { ok: true };
}

async function applyMasteryAward(repo, ctx, event) {
  const { trackId, xp } = event.payload || {};
  const track = ctx.definitions.masteryTracks.find(t => t.id === trackId);
  if (!track || !Number.isFinite(xp) || xp <= 0) return { ok: false, reason: 'malformed_payload' };
  await repo.awardMastery(event.playerId, trackId, xp);
  return { ok: true };
}
