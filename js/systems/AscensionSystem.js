// ── Ascension System (Second Prestige Layer) ────────────────────────────────
// After accumulating enough prestige bonus, players can "Ascend" for
// permanent multipliers that affect everything.

export class AscensionSystem {
  constructor(ppSystem) {
    this.pp = ppSystem;
    this.ascensionCount = 0;
    this.ascensionPoints = 0;

    this.ppMultiplier = 1.0;
    this.combatMultiplier = 1.0;
    this.gatherMultiplier = 1.0;
    this.droneMultiplier = 1.0;

    this._upgradeCounts = { ppMult: 0, combatMult: 0, gatherMult: 0, droneMult: 0 };
  }

  get ascensionThreshold() {
    return 1.0 * Math.pow(3, this.ascensionCount);
  }

  canAscend() {
    return this.pp.prestigeBonus >= this.ascensionThreshold;
  }

  ascend() {
    if (!this.canAscend()) return null;

    const prestigeBonus = this.pp.prestigeBonus;
    const threshold = this.ascensionThreshold;
    const apEarned = Math.floor(Math.sqrt(prestigeBonus / threshold) * 3) + 1;
    const oldPP = Math.floor(this.pp.ppTotal);

    // Reset PP state
    this.pp.ppTotal = 0;
    this.pp.prestigeBonus = 0;
    this.pp.ppRate = 1.0;
    this.pp._rateModifiers = {};

    this.ascensionCount++;
    this.ascensionPoints += apEarned;

    return { ascensionCount: this.ascensionCount, apEarned, totalAP: this.ascensionPoints, oldPP, oldPrestige: prestigeBonus };
  }

  getUpgrades() {
    return [
      { id: 'ppMult',      label: 'PP Amplifier',      desc: `+25% PP rate`,     value: `${this.ppMultiplier.toFixed(2)}x`,      cost: this._cost('ppMult') },
      { id: 'combatMult',  label: 'Combat Amplifier',   desc: `+20% damage`,      value: `${this.combatMultiplier.toFixed(2)}x`,  cost: this._cost('combatMult') },
      { id: 'gatherMult',  label: 'Gather Amplifier',   desc: `+25% gather speed`,value: `${this.gatherMultiplier.toFixed(2)}x`,  cost: this._cost('gatherMult') },
      { id: 'droneMult',   label: 'Drone Amplifier',    desc: `+30% drone eff.`,  value: `${this.droneMultiplier.toFixed(2)}x`,   cost: this._cost('droneMult') },
    ];
  }

  _cost(id) {
    const n = this._upgradeCounts[id] || 0;
    return 1 + Math.floor(n * (n + 1) / 2);
  }

  buyUpgrade(id) {
    const cost = this._cost(id);
    if (this.ascensionPoints < cost) return false;
    this.ascensionPoints -= cost;
    this._upgradeCounts[id] = (this._upgradeCounts[id] || 0) + 1;

    switch (id) {
      case 'ppMult':      this.ppMultiplier += 0.25; break;
      case 'combatMult':  this.combatMultiplier += 0.20; break;
      case 'gatherMult':  this.gatherMultiplier += 0.25; break;
      case 'droneMult':   this.droneMultiplier += 0.30; break;
    }
    return true;
  }

  serialize() {
    return {
      ascensionCount: this.ascensionCount,
      ascensionPoints: this.ascensionPoints,
      ppMultiplier: this.ppMultiplier,
      combatMultiplier: this.combatMultiplier,
      gatherMultiplier: this.gatherMultiplier,
      droneMultiplier: this.droneMultiplier,
      upgradeCounts: { ...this._upgradeCounts },
    };
  }

  deserialize(data) {
    if (!data) return;
    this.ascensionCount = data.ascensionCount || 0;
    this.ascensionPoints = data.ascensionPoints || 0;
    this.ppMultiplier = data.ppMultiplier || 1.0;
    this.combatMultiplier = data.combatMultiplier || 1.0;
    this.gatherMultiplier = data.gatherMultiplier || 1.0;
    this.droneMultiplier = data.droneMultiplier || 1.0;
    this._upgradeCounts = data.upgradeCounts || { ppMult: 0, combatMult: 0, gatherMult: 0, droneMult: 0 };
  }
}
