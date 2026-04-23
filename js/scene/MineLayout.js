export const MINE_PORTAL_POS = { x: 0, z: -12 };
export const MINE_SPAWN_POS  = { x: 0, z: -9 };

function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

// 5-tier ore properties, indexed by tier
const TIER_PROPS = [
  { tier: 0, ore: 'copper', chance: 0.15, cost: 5,  duration: 2.0, color: 0x4a4035 },
  { tier: 1, ore: 'iron',   chance: 0.20, cost: 8,  duration: 3.5, color: 0x5a504a },
  { tier: 2, ore: 'carbon', chance: 0.25, cost: 12, duration: 5.0, color: 0x3a3a3a },
  { tier: 3, ore: 'quartz', chance: 0.30, cost: 18, duration: 6.5, color: 0x6a6a7a },
  { tier: 4, ore: 'gold',   chance: 0.35, cost: 25, duration: 9.0, color: 0x605530 },
];

// Grid layout: 9×9 positions at 4m spacing, range ±16m
export function getMineableWallBlocks() {
  const rng = seededRandom(11111);
  const blocks = [];
  const spacing = 3.2; // matches block width so blocks touch
  const half = 5;     // grid: gi/gj from -5 to +5 (range ±16m)

  for (let gi = -half; gi <= half; gi++) {
    for (let gj = -half; gj <= half; gj++) {
      const x = gi * spacing;
      const z = gj * spacing;

      // Clear south portal corridor (portal at z=-12, x=0)
      if (z < -6 && Math.abs(x) < 7) continue;

      // Clear centre area for drill rig and Depths portal
      if (Math.abs(gi) <= 1 && Math.abs(gj) <= 1) continue;

      const isBorder = (Math.abs(gi) === half || Math.abs(gj) === half);

      // Interior blocks placed with ~55% density to create navigable corridors
      if (!isBorder && rng() > 0.55) continue;

      // Tier by Chebyshev distance from centre
      const cheb = Math.max(Math.abs(gi), Math.abs(gj));
      const tierIdx = Math.min(4, Math.max(0, cheb - 1));

      blocks.push({
        x: Number(x.toFixed(2)),
        z: Number(z.toFixed(2)),
        r: 1.6,
        isBorder,
        props: TIER_PROPS[tierIdx],
      });
    }
  }
  return blocks;
}
