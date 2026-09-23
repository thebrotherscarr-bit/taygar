/**
 * C.O.R.E. - Procedural Sci-Fi Sandbox Engine
 * Complete game loop, physics, weapon systems, AI, boss orchestrator,
 * crafting & inventory, and state persistence.
 */

import { Sound } from './audio';
import {
  ActiveBossInstance,
  ARMOR_SETS,
  BLOCK_DATA,
  BLOCKS,
  BossDef,
  CFG,
  EnemyInstance,
  ENEMY_TYPES,
  HazardAlert,
  Projectile,
  Recipe,
  SonarScanRing,
  ToolDef,
  VoxelParticle,
  Waypoint
} from './types';
import { createWorldMap, WorldMapData } from './worldGen';

export const LEVEL_XP = [0, 150, 400, 800, 1500];
export const LEVEL_CAP = 5;

export const BOSS_DEFS: Record<string, BossDef> = {
  warden: {
    key: 'warden',
    name: 'THE WARDEN',
    title: 'Automated Bastion Overlord',
    hp: 1000,
    damage: 45,
    speed: 2.0,
    w: 32,
    h: 32,
    biome: 'tech',
    lore: 'The first orbital sentry constructed by the colony before the catastrophe. Armed with hyper-accelerated kinetic lasers.',
    phases: [
      { hpThreshold: 1.0, pattern: 'charge', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'laser', spawnMinions: true },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: true }
    ],
    minion: 'bot',
    loot: [
      { item: BLOCKS.TITANIUM, min: 12, max: 18, chance: 1.0 },
      { item: 'RELIC_WARDEN', min: 1, max: 1, chance: 1.0 }
    ],
    xp: 250
  },
  forgemaster: {
    key: 'forgemaster',
    name: 'THE FORGEMASTER',
    title: 'Sub-Crust Anvil Sovereign',
    hp: 1300,
    damage: 50,
    speed: 1.6,
    w: 40,
    h: 40,
    biome: 'tech',
    lore: 'An industrial smelting AI corrupted by tectonic shifts, continuously forging swarm drones in its internal crucibles.',
    phases: [
      { hpThreshold: 1.0, pattern: 'charge', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'spray', spawnMinions: true },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: true }
    ],
    minion: 'swarmBot',
    loot: [
      { item: BLOCKS.TITANIUM, min: 15, max: 22, chance: 1.0 },
      { item: BLOCKS.SILICON, min: 8, max: 14, chance: 1.0 }
    ],
    xp: 320
  },
  hiveMind: {
    key: 'hiveMind',
    name: 'THE HIVE MIND',
    title: 'Sentient Spore Mother',
    hp: 1500,
    damage: 38,
    speed: 1.2,
    w: 42,
    h: 42,
    biome: 'fungal',
    lore: 'A massive interconnected fungal cluster pulsing with psychic spores that disorient visual sensors.',
    phases: [
      { hpThreshold: 1.0, pattern: 'spore_burst', splitAt: false },
      { hpThreshold: 0.5, pattern: 'split', splitAt: true },
      { hpThreshold: 0.25, pattern: 'spray', splitAt: false }
    ],
    loot: [
      { item: BLOCKS.MYCELIUM, min: 20, max: 30, chance: 1.0 },
      { item: BLOCKS.CRYSTAL, min: 6, max: 12, chance: 0.9 },
      { item: 'RELIC_HIVE', min: 1, max: 1, chance: 1.0 }
    ],
    xp: 380
  },
  tyrant: {
    key: 'tyrant',
    name: 'THE SPORE TYRANT',
    title: 'Arboreal Leviathan',
    hp: 1800,
    damage: 44,
    speed: 1.3,
    w: 44,
    h: 44,
    biome: 'fungal',
    lore: 'Rooted deep in the biological bogs, releasing corrosive acidic spores that burn through exosuits.',
    phases: [
      { hpThreshold: 1.0, pattern: 'spore_burst', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'split', spawnMinions: false, splitAt: true },
      { hpThreshold: 0.25, pattern: 'spray', spawnMinions: true }
    ],
    minion: 'sporeCloud',
    loot: [
      { item: BLOCKS.MYCELIUM, min: 25, max: 35, chance: 1.0 },
      { item: BLOCKS.CRYSTAL, min: 10, max: 15, chance: 1.0 }
    ],
    xp: 450
  },
  sovereign: {
    key: 'sovereign',
    name: 'THE PRISM SOVEREIGN',
    title: 'Refractive Octahedron',
    hp: 2200,
    damage: 55,
    speed: 1.5,
    w: 46,
    h: 46,
    biome: 'crystal',
    lore: 'A floating crystalline anomaly that splits incoming coherent light into focused prismatic laser fans.',
    phases: [
      { hpThreshold: 1.0, pattern: 'laser', spawnMinions: true },
      { hpThreshold: 0.5, pattern: 'split', spawnMinions: false, splitAt: true },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: true }
    ],
    minion: 'shardling',
    loot: [
      { item: BLOCKS.CRYSTAL, min: 20, max: 30, chance: 1.0 },
      { item: BLOCKS.SILICON, min: 10, max: 15, chance: 1.0 }
    ],
    xp: 600
  },
  maw: {
    key: 'maw',
    name: 'THE GEODE MAW',
    title: 'Subterranean Diamond Slicer',
    hp: 2600,
    damage: 65,
    speed: 1.1,
    w: 52,
    h: 52,
    biome: 'crystal',
    lore: 'A titanic geode beast with diamond-hard teeth capable of crushing bedrock and hull plating alike.',
    phases: [
      { hpThreshold: 1.0, pattern: 'charge', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'spore_burst', spawnMinions: false },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: false }
    ],
    loot: [
      { item: BLOCKS.CRYSTAL, min: 25, max: 35, chance: 1.0 },
      { item: BLOCKS.TITANIUM, min: 12, max: 18, chance: 1.0 }
    ],
    xp: 720
  },
  coreGuardian: {
    key: 'coreGuardian',
    name: 'THE CORE GUARDIAN',
    title: 'Volcanic Obsidian Colossus',
    hp: 3000,
    damage: 75,
    speed: 1.4,
    w: 48,
    h: 48,
    biome: 'molten',
    lore: 'Constructed from cooling volcanic mantle rock, this ancient sentinel harnesses geothermal energy to unleash meteor storms.',
    phases: [
      { hpThreshold: 1.0, pattern: 'erupt', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'magma_pool', spawnMinions: true },
      { hpThreshold: 0.25, pattern: 'meteor_rain', spawnMinions: true }
    ],
    minion: 'cinderImp',
    loot: [
      { item: BLOCKS.OBSIDIAN, min: 15, max: 25, chance: 1.0 },
      { item: 'RELIC_CORE', min: 1, max: 1, chance: 1.0 }
    ],
    xp: 850
  },
  wyrm: {
    key: 'wyrm',
    name: 'THE PYRE WYRM',
    title: 'Magmatic Trench Apex',
    hp: 3400,
    damage: 70,
    speed: 2.1,
    w: 50,
    h: 38,
    biome: 'molten',
    lore: 'An ancient serpentine predator that swims effortlessly through molten lava and ambushes miners from the crust.',
    phases: [
      { hpThreshold: 1.0, pattern: 'erupt', spawnMinions: false },
      { hpThreshold: 0.5, pattern: 'magma_pool', spawnMinions: true },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: true }
    ],
    minion: 'cinderImp',
    loot: [
      { item: BLOCKS.OBSIDIAN, min: 20, max: 30, chance: 1.0 },
      { item: BLOCKS.TITANIUM, min: 15, max: 20, chance: 1.0 }
    ],
    xp: 950
  },
  worldheart: {
    key: 'worldheart',
    name: 'THE WORLDHEART',
    title: 'Sovereign Core Citadel',
    hp: 5500,
    damage: 100,
    speed: 1.7,
    w: 64,
    h: 64,
    biome: 'molten',
    lore: 'The biological and cybernetic nexus of the entire planet. Protected by ancient seals that break only when the Eight Wardens fall.',
    phases: [
      { hpThreshold: 1.0, pattern: 'meteor_rain', spawnMinions: true },
      { hpThreshold: 0.5, pattern: 'split', spawnMinions: false, splitAt: true },
      { hpThreshold: 0.25, pattern: 'enraged', spawnMinions: true }
    ],
    minion: 'cinderImp',
    loot: [
      { item: BLOCKS.OBSIDIAN, min: 40, max: 60, chance: 1.0 },
      { item: BLOCKS.CRYSTAL, min: 30, max: 45, chance: 1.0 },
      { item: BLOCKS.TITANIUM, min: 25, max: 35, chance: 1.0 }
    ],
    xp: 2000
  }
};

export const ALTAR_TRIBUTES: Record<string, { item: number | string; count: number; label: string }> = {
  warden: { item: BLOCKS.TITANIUM, count: 10, label: '10 TITANIUM' },
  forgemaster: { item: BLOCKS.SILICON, count: 12, label: '12 SILICON' },
  hiveMind: { item: BLOCKS.MYCELIUM, count: 15, label: '15 MYCELIUM' },
  tyrant: { item: BLOCKS.CRYSTAL, count: 12, label: '12 CRYSTAL' },
  sovereign: { item: BLOCKS.CRYSTAL, count: 15, label: '15 CRYSTAL' },
  maw: { item: 'THORIUM', count: 8, label: '8 THORIUM' },
  coreGuardian: { item: BLOCKS.OBSIDIAN, count: 10, label: '10 OBSIDIAN' },
  wyrm: { item: BLOCKS.OBSIDIAN, count: 12, label: '12 OBSIDIAN' },
  worldheart: { item: BLOCKS.OBSIDIAN, count: 20, label: '20 OBSIDIAN' }
};

export class GameEngine {
  public map: WorldMapData;
  public seed: number;

  // Player State
  public player = {
    x: (CFG.MAP_W / 2) * CFG.TILE_SIZE,
    y: 20 * CFG.TILE_SIZE,
    w: 12,
    h: 24,
    vx: 0,
    vy: 0,
    speed: 3,
    jumpForce: 6,
    jetpackForce: 0.6,
    hp: 100,
    maxHp: 100,
    shield: 100,
    maxShield: 100,
    energy: 100,
    maxEnergy: 100,
    jet: 100,
    maxJet: 100,
    hpBoost: 0,
    shieldBoost: 0,
    jetBoost: 0,
    grounded: false,
    facingLeft: false,
    invuln: 0,
    poison: null as { dmg: number; ticks: number } | null,
    dead: false,
    respawnTimer: 0,
    inventory: {
      [BLOCKS.TITANIUM]: 0,
      [BLOCKS.SILICON]: 0,
      [BLOCKS.SCRAP]: 0,
      THORIUM: 0,
      [BLOCKS.MYCELIUM]: 0,
      [BLOCKS.CRYSTAL]: 0,
      [BLOCKS.OBSIDIAN]: 0
    } as Record<number | string, number>,
    crafted: {
      medkit: 0,
      fuelcell: 0,
      energycell: 0,
      sporeGrenade: 0
    },
    xp: 0,
    xpTotal: 0,
    level: 1,
    beamLevel: 0
  };

  // Equipment Loadout
  public equipment = {
    head: null as string | null,
    chest: null as string | null,
    legs: null as string | null,
    getDefense: () => {
      let d = 0;
      if (this.equipment.head && ARMOR_SETS[this.equipment.head]) d += ARMOR_SETS[this.equipment.head].defense;
      if (this.equipment.chest && ARMOR_SETS[this.equipment.chest]) d += ARMOR_SETS[this.equipment.chest].defense;
      if (this.equipment.legs && ARMOR_SETS[this.equipment.legs]) d += ARMOR_SETS[this.equipment.legs].defense;
      for (const slot of [this.equipment.head, this.equipment.chest, this.equipment.legs]) {
        if (slot && ARMOR_SETS[slot]) d += 3 * (this.tree.plating[slot] || 0);
      }
      return d;
    },
    getHpBonus: () => {
      let h = 0;
      if (this.equipment.head && ARMOR_SETS[this.equipment.head]) h += ARMOR_SETS[this.equipment.head].hpBonus;
      if (this.equipment.chest && ARMOR_SETS[this.equipment.chest]) h += ARMOR_SETS[this.equipment.chest].hpBonus;
      if (this.equipment.legs && ARMOR_SETS[this.equipment.legs]) h += ARMOR_SETS[this.equipment.legs].hpBonus;
      return h;
    },
    hasFireImmune: () => {
      return (
        (this.equipment.head && ARMOR_SETS[this.equipment.head]?.fireImmune) ||
        (this.equipment.chest && ARMOR_SETS[this.equipment.chest]?.fireImmune) ||
        (this.equipment.legs && ARMOR_SETS[this.equipment.legs]?.fireImmune)
      );
    },
    getReflect: () => {
      let r = 0;
      if (this.equipment.head) {
        const set = ARMOR_SETS[this.equipment.head];
        if (set?.reflect) r += set.reflect;
      }
      if (this.equipment.chest) {
        const set = ARMOR_SETS[this.equipment.chest];
        if (set?.reflect) r += set.reflect;
      }
      if (this.equipment.legs) {
        const set = ARMOR_SETS[this.equipment.legs];
        if (set?.reflect) r += set.reflect;
      }
      return Math.min(0.5, r);
    }
  };

  // Progression Tree State
  public tree = {
    rifleDmg: 0,
    rifleHaste: 0,
    rifleSplit: 0,
    batonDmg: 0,
    batonHaste: 0,
    batonReach: 0,
    plating: {
      scrap: 0,
      titanium: 0,
      crystal: 0,
      obsidian: 0
    } as Record<string, number>
  };

  // The 6 System Hotbar Tools (Strictly matching original index specification)
  // 0 Pulse Rifle (enemy-only) · 1 Plasma Cutter (beam) · 2 Omni-Tool ·
  // 3 Disassembler Ray · 4 Quantum Beacon (scan) · 5 Ion Cannon (fan)
  public tools: ToolDef[] = [
    { name: 'PULSE RIFLE', desc: 'Shoots enemy-only bolts', energyCost: 0.8, color: '#ef4444', width: 3, range: 350, damage: 24, glow: '#fca5a5', rifle: true, fireRate: 4 },
    { name: 'PLASMA CUTTER', desc: 'Mines any block', energyCost: 0.25, color: '#00f3ff', width: 8, range: 120, damage: 8, glow: '#7ff6ff' },
    { name: 'OMNI-TOOL', desc: 'High-damage impact bolts', energyCost: 0.15, color: '#39ff14', width: 3, range: 300, damage: 40, glow: '#7dff6a', rifle: true, fireRate: 6, explodeRadius: 12 },
    { name: 'DISASM RAY', desc: 'Explosive AoE bolts', energyCost: 0.5, color: '#fbbf24', width: 5, range: 300, damage: 9, glow: '#ffd489', rifle: true, fireRate: 8, explodeRadius: 48 },
    { name: 'QUANTUM BEACON', desc: 'AoE sonar scan bolts', energyCost: 0.3, color: '#a78bfa', width: 4, range: 300, damage: 0, glow: '#d0c0ff', rifle: true, fireRate: 10, explodeRadius: 256 },
    { name: 'ION CANNON', desc: 'Wide fan beam, slow', energyCost: 1.5, color: '#f97316', width: 3, range: 200, damage: 14, glow: '#fdba74', fan: true, fanAngle: 0.7, fanRays: 9 }
  ];

  public activeTool = 0;
  public beamFxTool: ToolDef | null = null;
  public batonCooldown = 0;
  public batonSwingT = 0;
  public screenShake = 0;
  public rifleCooldown = 0;
  public prevMouseDown = false;

  // Camera Zoom State
  public zoom = 2.0;
  public targetZoom = 2.0;
  public minZoom = 1.0;
  public maxZoom = 3.5;

  public setZoom(delta: number) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + delta));
  }

  // Voxel Physics, Particles & Damage Grids
  public voxelParticles: VoxelParticle[] = [];
  public voxelDamage = new Uint8Array(CFG.MAP_W * CFG.MAP_H);

  // Sonar Scanning Rings (Omni Tool)
  public sonarRings: SonarScanRing[] = [];

  // Omni Tool Mode ('scan' | 'build' | 'interact')
  public omniMode: 'scan' | 'build' | 'interact' = 'scan';

  // Ion Cannon Capacitor Charge (0 to 1.0)
  public ionCharge = 0;

  // Day / Night & Environmental Cycles
  public dayNight = {
    time: 0,
    dayLength: 4800,
    isNight: false,
    ambientAlpha: 0
  };

  // Boss & Enemy Collections
  public activeBoss: ActiveBossInstance | null = null;
  public enemies: EnemyInstance[] = [];
  public projectiles: Projectile[] = [];
  public playerProjectiles: Projectile[] = [];
  public corpses: { x: number; y: number; items: Record<string, number>; life: number }[] = [];
  public floatingTexts: { x: number; y: number; text: string; color: string; life: number; vy: number }[] = [];
  public waypoints: Waypoint[] = [];
  public hazardAlerts: HazardAlert[] = [];

  // Progression & Directives
  public objectives = {
    descend: false,
    summoned: {} as Record<string, boolean>,
    defeated: {} as Record<string, boolean>,
    victory: false
  };

  public simClock = 0;
  private spawnCooldown = 180;
  private tickCounter = 0;
  private liquidTick = 0;
  private beaconPulse = 0;
  private turretCd: Record<number, number> = {};

  // Input State
  public input = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    mb: false,
    mb2: false,
    v: false,
    g: false,
    mx: 0,
    my: 0
  };
  public prevMb2 = false;
  public prevG = false;
  public jumpQueued = false;
  public communeQueued = false;

  constructor(seed: number = 1234) {
    this.seed = seed;
    this.map = createWorldMap(seed);
    this.enemies = [...this.map.initialEnemies];
    this.recalcVitals();
    this.respawnPlayer();
  }

  public recalcVitals() {
    this.player.maxHp = 100 + this.equipment.getHpBonus() + (this.player.hpBoost || 0) * 25;
    this.player.maxShield = 100 + (this.player.shieldBoost || 0) * 25;
    this.player.maxEnergy = 100 + (this.player.beamLevel || 0) * 10;
  }

  public bossesSlainCount(): number {
    const keys = ['warden', 'forgemaster', 'hiveMind', 'tyrant', 'sovereign', 'maw', 'coreGuardian', 'wyrm'];
    return keys.filter(k => this.objectives.defeated[k]).length;
  }

  public isWorldheartUnlocked(): boolean {
    return this.bossesSlainCount() >= 8;
  }

  public hasRelic(key: string): boolean {
    return (this.player.inventory[key] || 0) > 0;
  }

  public addHazardAlert(type: 'danger' | 'warning' | 'info', title: string, message: string) {
    const alert: HazardAlert = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: Date.now()
    };
    this.hazardAlerts.unshift(alert);
    if (this.hazardAlerts.length > 4) this.hazardAlerts.pop();

    if (type === 'danger') Sound.playHullBreach();
  }

  public dismissAlert(id: string) {
    this.hazardAlerts = this.hazardAlerts.filter(a => a.id !== id);
  }

  public spawnFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({ x, y, text, color, life: 60, vy: -0.8 });
  }

  public awardXp(n: number) {
    this.player.xp += n;
    this.player.xpTotal = (this.player.xpTotal || 0) + n;
    let lv = 1;
    for (let i = 0; i < LEVEL_XP.length; i++) {
      if (this.player.xpTotal >= LEVEL_XP[i]) lv = i + 1;
    }
    lv = Math.min(lv, LEVEL_CAP);
    if (lv > this.player.level) {
      this.player.level = lv;
      this.spawnFloatingText(this.player.x, this.player.y - 32, `LEVEL ${lv} ACHIEVED`, '#fbbf24');
      this.addHazardAlert('info', 'LEVEL UP', `System enhanced to Level ${lv}`);
      Sound.playLevelUp();
    }
  }

  public killPlayer() {
    if (this.player.dead) return;
    this.player.dead = true;
    this.player.poison = null;
    this.player.respawnTimer = 120;
    Sound.playHit();
    Sound.playHullBreach();
    this.addHazardAlert('danger', 'HULL BREACH', 'Life support failure. Re-establishing remote clone beacon...');

    // Drop 30% of inventory as a recover corpse
    const dropped: Record<string, number> = {};
    for (const key in this.player.inventory) {
      const amt = this.player.inventory[key];
      if (amt > 0) {
        const dropCount = Math.ceil(amt * 0.3);
        dropped[key] = dropCount;
        this.player.inventory[key] -= dropCount;
      }
    }
    if (Object.keys(dropped).length > 0) {
      this.corpses.push({ x: this.player.x, y: this.player.y, items: dropped, life: 2400 });
    }
  }

  public respawnPlayer() {
    this.player.dead = false;
    this.recalcVitals();
    this.player.hp = this.player.maxHp;
    this.player.shield = this.player.maxShield;
    this.player.energy = this.player.maxEnergy;
    this.player.jet = this.player.maxJet;

    const spawnX = Math.floor(CFG.MAP_W / 2);
    let spawnY = 0;
    for (let y = 0; y < CFG.MAP_H; y++) {
      if (BLOCK_DATA[this.map.get(spawnX, y)]?.solid) {
        spawnY = y - 1;
        break;
      }
    }
    this.player.x = spawnX * CFG.TILE_SIZE;
    this.player.y = spawnY * CFG.TILE_SIZE - this.player.h;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  public aabb(x: number, y: number, w: number, h: number): boolean {
    const tx1 = Math.floor(x / CFG.TILE_SIZE);
    const tx2 = Math.floor((x + w - 0.1) / CFG.TILE_SIZE);
    const ty1 = Math.floor(y / CFG.TILE_SIZE);
    const ty2 = Math.floor((y + h - 0.1) / CFG.TILE_SIZE);
    for (let tx = tx1; tx <= tx2; tx++) {
      for (let ty = ty1; ty <= ty2; ty++) {
        if (BLOCK_DATA[this.map.get(tx, ty)]?.solid) return true;
      }
    }
    return false;
  }

  public isImpenetrable(tx: number, ty: number): boolean {
    if (ty >= 575) return true;
    const bid = this.map.get(tx, ty);
    return bid === BLOCKS.ALTAR;
  }

  public equipArmor(setKey: string) {
    if (!ARMOR_SETS[setKey]) return;
    this.equipment.head = setKey;
    this.equipment.chest = setKey;
    this.equipment.legs = setKey;
    this.recalcVitals();
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    this.spawnFloatingText(this.player.x, this.player.y - 16, ARMOR_SETS[setKey].name + ' EQUIPPED', '#fbbf24');
    Sound.playShieldDeflect();
  }

  public useConsumable(id: 'medkit' | 'fuelcell' | 'energycell') {
    if (this.player.crafted[id] <= 0) return;
    if (id === 'medkit') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 45);
      this.spawnFloatingText(this.player.x, this.player.y - 12, '+45 HP', '#ef4444');
      Sound.playItemPickup();
    } else if (id === 'fuelcell') {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 45);
      this.spawnFloatingText(this.player.x, this.player.y - 12, '+45 SHIELD', '#38bdf8');
      Sound.playShieldDeflect();
    } else if (id === 'energycell') {
      this.player.energy = this.player.maxEnergy;
      this.spawnFloatingText(this.player.x, this.player.y - 12, 'ENERGY RESTORED', '#ffaa00');
      Sound.playItemPickup();
    }
    this.player.crafted[id]--;
  }

  public throwSporeGrenade(targetWorldX: number, targetWorldY: number) {
    if (this.player.dead) return;
    if ((this.player.crafted.sporeGrenade || 0) <= 0) return;
    this.player.crafted.sporeGrenade--;

    const pCx = this.player.x + this.player.w / 2;
    const pCy = this.player.y + this.player.h / 2;
    const angle = Math.atan2(targetWorldY - pCy, targetWorldX - pCx);
    const speed = 7.5;

    this.playerProjectiles.push({
      x: pCx,
      y: pCy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: 35,
      life: 75,
      color: '#a855f7',
      glow: '#c084fc',
      explodeRadius: 65,
      blind: true,
      owner: 'player'
    });
    this.screenShake = 4;
    Sound.playExplosion();
  }

  public placeWaypoint(name?: string) {
    const wx = Math.floor(this.player.x / CFG.TILE_SIZE);
    const wy = Math.floor(this.player.y / CFG.TILE_SIZE);
    const wp: Waypoint = {
      id: Math.random().toString(36).substring(2, 9),
      name: name || `BEACON-LOC ${this.waypoints.length + 1} (${wx}m, ${wy}m)`,
      x: this.player.x,
      y: this.player.y,
      timestamp: Date.now()
    };
    this.waypoints.push(wp);
    this.map.set(wx, wy + 1, BLOCKS.BEACON);
    this.spawnFloatingText(this.player.x, this.player.y - 20, 'QUANTUM BEACON ANCHORED', '#a78bfa');
    Sound.playTeleport();
  }

  public teleportToWaypoint(wp: Waypoint) {
    this.player.x = wp.x;
    this.player.y = wp.y - 8;
    this.player.vx = 0;
    this.player.vy = 0;
    this.spawnFloatingText(this.player.x, this.player.y - 20, 'WARPED TO ' + wp.name, '#38bdf8');
    Sound.playTeleport();
  }

  public spawnBoss(bossKey: string) {
    const def = BOSS_DEFS[bossKey];
    if (!def) return;
    const spawnX = this.player.x + 180;
    const spawnY = this.player.y - 80;
    this.activeBoss = {
      key: bossKey,
      def,
      hp: def.hp,
      maxHp: def.hp,
      phase: 0,
      pattern: def.phases[0].pattern,
      timer: 0,
      x: spawnX,
      y: spawnY,
      w: def.w,
      h: def.h,
      vx: 0,
      vy: 0,
      flash: 0,
      facingLeft: true
    };
    this.spawnFloatingText(this.player.x, this.player.y - 32, `${def.name} AWAKENS!`, '#ef4444');
    this.addHazardAlert('danger', 'WARDEN DETECTED', `${def.name} - ${def.title}`);
    Sound.playBossAwaken();
  }

  public nearestAltar(): { x: number; y: number; boss: string } | null {
    const pCx = this.player.x + this.player.w / 2;
    const pCy = this.player.y + this.player.h / 2;
    let best = null;
    let bestD = 3.5 * CFG.TILE_SIZE;
    for (const a of this.map.altars) {
      const ax = a.x * CFG.TILE_SIZE + 16;
      const ay = a.y * CFG.TILE_SIZE + 16;
      const d = Math.hypot(ax - pCx, ay - pCy);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }

  public tryCommune() {
    const altar = this.nearestAltar();
    if (!altar) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, 'NO ANCIENT ALTAR IN REACH', '#889');
      return;
    }
    const key = altar.boss;
    const def = BOSS_DEFS[key];
    if (!def) return;

    if (key === 'worldheart' && !this.isWorldheartUnlocked()) {
      this.spawnFloatingText(
        this.player.x,
        this.player.y - 16,
        `SEAL INTACT — DEFEAT THE EIGHT WARDENS (${this.bossesSlainCount()}/8)`,
        '#f97316'
      );
      return;
    }

    if (this.objectives.defeated[key]) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, `${def.name} IS SLAIN — ALTAR SILENT`, '#889');
      return;
    }

    if (this.activeBoss) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, 'ANOTHER WARDEN IS ALREADY ACTIVE', '#f97316');
      return;
    }

    const tribute = ALTAR_TRIBUTES[key];
    if ((this.player.inventory[tribute.item] || 0) < tribute.count) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, `TRIBUTE REQUIRED: ${tribute.label}`, '#f97316');
      return;
    }

    this.player.inventory[tribute.item] -= tribute.count;
    this.objectives.summoned[key] = true;
    this.spawnBoss(key);
  }

  // Fixed Physics Update Step
  public updatePhysics() {
    // Jetpack & Gravity
    if (this.input.space && this.player.jet > 0) {
      this.player.vy -= this.player.jetpackForce;
      this.player.jet = Math.max(0, this.player.jet - 1.4);
      Sound.startJetpack();
    } else {
      this.player.vy += CFG.GRAVITY;
      if (this.player.jet < this.player.maxJet) {
        this.player.jet = Math.min(this.player.maxJet, this.player.jet + 0.6);
      }
      Sound.stopJetpack();
    }
    if (this.player.vy > CFG.TERMINAL_VELOCITY) this.player.vy = CFG.TERMINAL_VELOCITY;

    // Energy recharge
    if (!this.input.mb && this.player.energy < this.player.maxEnergy) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 0.85);
    }

    // Horizontal Movement
    if (this.input.a) {
      this.player.vx = -this.player.speed;
      this.player.facingLeft = true;
    } else if (this.input.d) {
      this.player.vx = this.player.speed;
      this.player.facingLeft = false;
    } else {
      this.player.vx = 0;
    }

    // X Collision with Voxel Step-Up
    this.player.x += this.player.vx;
    if (this.aabb(this.player.x, this.player.y, this.player.w, this.player.h)) {
      // Step-up attempt for small terrain/voxel bumps (up to 6px)
      let stepped = false;
      if (this.player.grounded || this.player.vy >= 0) {
        for (let s = 1; s <= 6; s++) {
          if (!this.aabb(this.player.x, this.player.y - s, this.player.w, this.player.h)) {
            this.player.y -= s;
            stepped = true;
            break;
          }
        }
      }
      if (!stepped) {
        if (this.player.vx > 0) {
          this.player.x = Math.floor((this.player.x + this.player.w) / CFG.TILE_SIZE) * CFG.TILE_SIZE - this.player.w;
        }
        if (this.player.vx < 0) {
          this.player.x = Math.floor(this.player.x / CFG.TILE_SIZE + 1) * CFG.TILE_SIZE;
        }
        this.player.vx = 0;
      }
    }

    // Hard World Boundaries (Oceans at left/right ends, exosphere ceiling, impenetrable lava floor)
    const worldW = CFG.MAP_W * CFG.TILE_SIZE;
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.vx = 0;
    } else if (this.player.x + this.player.w > worldW) {
      this.player.x = worldW - this.player.w;
      this.player.vx = 0;
    }

    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.vy = Math.max(0, this.player.vy);
    } else if (this.player.y + this.player.h > 575 * CFG.TILE_SIZE) {
      // Impenetrable molten bedrock core boundary floor
      this.player.y = 575 * CFG.TILE_SIZE - this.player.h;
      this.player.vy = -3;
      this.player.grounded = true;
    }

    // Y Collision
    this.player.y += this.player.vy;
    this.player.grounded = false;
    if (this.aabb(this.player.x, this.player.y, this.player.w, this.player.h)) {
      if (this.player.vy > 0) {
        this.player.y = Math.floor((this.player.y + this.player.h) / CFG.TILE_SIZE) * CFG.TILE_SIZE - this.player.h;
        this.player.grounded = true;
      }
      if (this.player.vy < 0) {
        this.player.y = Math.floor(this.player.y / CFG.TILE_SIZE + 1) * CFG.TILE_SIZE;
      }
      this.player.vy = 0;
    }

    // Jump & Dive
    if (this.jumpQueued) {
      if (this.player.grounded) {
        this.player.vy = -this.player.jumpForce;
        Sound.playJump();
      }
      this.jumpQueued = false;
    }
    if (this.input.s && !this.player.grounded) {
      this.player.vy = Math.min(this.player.vy + 0.4, CFG.TERMINAL_VELOCITY);
    }

    // Fluid & Environmental Hazard Physics
    const ctx = Math.floor((this.player.x + this.player.w / 2) / CFG.TILE_SIZE);
    const cty = Math.floor((this.player.y + this.player.h / 2) / CFG.TILE_SIZE);
    const standingIn = this.map.get(ctx, cty);

    // Alien Ocean Swimming Physics
    if (standingIn === BLOCKS.WATER) {
      this.player.vy *= 0.82;
      this.player.vx *= 0.88;
      if (this.input.space || this.jumpQueued) {
        this.player.vy = Math.max(-3.5, this.player.vy - 0.7); // Swim upward
        this.jumpQueued = false;
      } else if (this.input.s) {
        this.player.vy = Math.min(3.2, this.player.vy + 0.4); // Dive down
      } else {
        this.player.vy += 0.05; // Gentle sinking in water
      }
    } else if (standingIn === BLOCKS.MAGMA) {
      // Lake of Lava: violent thermal buoyant rejection pushing player upward
      this.player.vy = Math.max(-5.0, this.player.vy - 0.85);
    }

    if (
      BLOCK_DATA[standingIn]?.hazard &&
      !this.player.dead &&
      !(standingIn === BLOCKS.MAGMA && this.equipment.hasFireImmune())
    ) {
      let dmg = 0.5;
      if (this.player.shield > 0) {
        const abs = Math.min(this.player.shield, dmg);
        this.player.shield -= abs;
        dmg -= abs;
      }
      this.player.hp -= dmg;
      if (this.player.hp <= 0) {
        this.player.hp = 0;
        this.killPlayer();
      }
    }
  }

  // Enemy & Combat AI Update
  public updateEnemies() {
    if (this.player.invuln > 0) this.player.invuln--;
    if (this.screenShake > 0) this.screenShake--;

    // Poison damage ticks
    if (this.player.poison && !this.player.dead) {
      if (this.player.poison.ticks % 60 === 0) {
        this.player.hp -= 2;
        this.spawnFloatingText(this.player.x + this.player.w / 2, this.player.y - 8, '-2 POISON', '#6b21a8');
        if (this.player.hp <= 0) {
          this.player.hp = 0;
          this.killPlayer();
          this.player.poison = null;
        }
      }
      if (this.player.poison) {
        this.player.poison.ticks--;
        if (this.player.poison.ticks <= 0) this.player.poison = null;
      }
    }

    // Process all active regular enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const edef = ENEMY_TYPES[e.type];
      if (!edef) continue;
      if (e.flash > 0) e.flash--;
      if (e.blindTimer && e.blindTimer > 0) e.blindTimer--;

      // Movement & Patrol
      if (e.type === 'bot' || e.type === 'crawler' || e.type === 'mite' || e.type === 'shardling') {
        e.vy += CFG.GRAVITY;
        if (e.vy > CFG.TERMINAL_VELOCITY) e.vy = CFG.TERMINAL_VELOCITY;
        const dxp = this.player.x - e.x;
        if (!this.player.dead && Math.abs(dxp) < 300 && Math.abs(this.player.y - e.y) < 220) {
          e.vx = dxp > 0 ? edef.speed : -edef.speed;
          e.facingLeft = dxp < 0;
        } else {
          e.vx = e.facingLeft ? -edef.speed : edef.speed;
        }
        e.x += e.vx;
        if (this.aabb(e.x, e.y, e.w, e.h)) {
          e.x -= e.vx;
          e.facingLeft = !e.facingLeft;
        }
        e.y += e.vy;
        if (this.aabb(e.x, e.y, e.w, e.h)) {
          if (e.vy > 0) e.y = Math.floor((e.y + e.h) / CFG.TILE_SIZE) * CFG.TILE_SIZE - e.h;
          e.vy = 0;
        }
      } else if (e.type === 'drone' || e.type === 'stalker') {
        const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
        const range = e.type === 'stalker' ? 240 : 480;
        if (dist < range && !this.player.dead) {
          const angle = Math.atan2(
            this.player.y + this.player.h / 2 - (e.y + e.h / 2),
            this.player.x + this.player.w / 2 - (e.x + e.w / 2)
          );
          e.x += Math.cos(angle) * edef.speed;
          e.y += Math.sin(angle) * edef.speed;
          e.facingLeft = Math.cos(angle) < 0;
        }
      }

      // Ranged Projectiles
      if ((e.type === 'sporeSac' || e.type === 'sentinel' || e.type === 'sentry') && !this.player.dead) {
        e.fireTimer = (e.fireTimer || 60) - 1;
        if (e.fireTimer <= 0 && (!e.blindTimer || e.blindTimer <= 0)) {
          e.fireTimer = edef.fireRate || 90;
          const angle = Math.atan2(
            this.player.y + this.player.h / 2 - (e.y + e.h / 2),
            this.player.x + this.player.w / 2 - (e.x + e.w / 2)
          );
          this.projectiles.push({
            x: e.x + e.w / 2,
            y: e.y + e.h / 2,
            vx: Math.cos(angle) * 3.5,
            vy: Math.sin(angle) * 3.5,
            damage: edef.damage,
            life: 120,
            owner: 'enemy'
          });
        }
      }

      // Enemy Hurt Player Collision
      if (
        !this.player.dead &&
        this.player.invuln <= 0 &&
        this.player.x < e.x + e.w &&
        this.player.x + this.player.w > e.x &&
        this.player.y < e.y + e.h &&
        this.player.y + this.player.h > e.y
      ) {
        let dmg = Math.max(1, edef.damage - this.equipment.getDefense());
        if (this.player.shield > 0) {
          const a = Math.min(this.player.shield, dmg);
          this.player.shield -= a;
          dmg -= a;
          Sound.playShieldDeflect();
        } else {
          Sound.playHit();
        }
        this.player.hp -= dmg;
        this.player.invuln = 45;
        this.screenShake = 8;
        this.spawnFloatingText(this.player.x + this.player.w / 2, this.player.y - 8, `-${edef.damage}`, '#ef4444');
        if (this.player.hp <= 0) {
          this.player.hp = 0;
          this.killPlayer();
        }

        // Crystal reflect
        const ref = this.equipment.getReflect();
        if (ref > 0) {
          const rDmg = Math.floor(edef.damage * ref);
          e.hp -= rDmg;
          if (rDmg > 0) this.spawnFloatingText(e.x + e.w / 2, e.y - 8, `-${rDmg}`, '#38bdf8');
        }

        if (e.type === 'sporeCloud') {
          this.player.poison = { dmg: 6, ticks: 180 };
          this.addHazardAlert('warning', 'TOXIC SPORES', 'Toxic bioluminescent spores degrading suit integrity');
        }

        this.player.vy = -5;
        this.player.vx = this.player.x < e.x ? -6 : 6;
      }

      // Death check
      if (e.hp <= 0) {
        for (const drop of edef.drops) {
          if (Math.random() < drop.chance) {
            const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            this.player.inventory[drop.item] = (this.player.inventory[drop.item] || 0) + count;
            Sound.playItemPickup();
          }
        }
        this.awardXp(edef.xp);
        this.enemies.splice(i, 1);
      }
    }

    // Process Enemy Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (
        !this.player.dead &&
        this.player.invuln <= 0 &&
        p.x > this.player.x &&
        p.x < this.player.x + this.player.w &&
        p.y > this.player.y &&
        p.y < this.player.y + this.player.h
      ) {
        let dmg = p.damage;
        if (this.player.shield > 0) {
          const a = Math.min(this.player.shield, dmg);
          this.player.shield -= a;
          dmg -= a;
          Sound.playShieldDeflect();
        } else {
          Sound.playHit();
        }
        this.player.hp -= dmg;
        this.player.invuln = 30;
        this.screenShake = 5;
        this.spawnFloatingText(this.player.x + this.player.w / 2, this.player.y - 8, `-${p.damage}`, '#ef4444');
        if (this.player.hp <= 0) {
          this.player.hp = 0;
          this.killPlayer();
        }
        this.projectiles.splice(i, 1);
        continue;
      }
      const ptx = Math.floor(p.x / CFG.TILE_SIZE);
      const pty = Math.floor(p.y / CFG.TILE_SIZE);
      if (BLOCK_DATA[this.map.get(ptx, pty)]?.solid || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Process Player Projectiles (all rifle tools: Pulse Rifle, Omni-Tool, Disasm Ray, Quantum Beacon, Spore Grenade)
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];

      // Seeking guidance from Guardian Heart relic
      if (p.seek) {
        let best = null;
        let bestD = 160;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x + e.w / 2 - p.x, e.y + e.h / 2 - p.y);
          if (d < bestD) {
            bestD = d;
            best = e;
          }
        }
        if (best) {
          const speed = Math.hypot(p.vx, p.vy) || 8;
          const cur = Math.atan2(p.vy, p.vx);
          const want = Math.atan2(best.y + best.h / 2 - p.y, best.x + best.w / 2 - p.x);
          let diff = want - cur;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = Math.max(-0.07, Math.min(0.07, diff));
          p.vx = Math.cos(cur + turn) * speed;
          p.vy = Math.sin(cur + turn) * speed;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      let hit = false;

      // AoE explosion on hit
      const doExplosion = (cx: number, cy: number) => {
        const r = p.explodeRadius || 0;
        // Damage all enemies in radius
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const eCx = e.x + e.w / 2;
          const eCy = e.y + e.h / 2;
          if (Math.hypot(eCx - cx, eCy - cy) <= r) {
            e.hp -= p.damage;
            e.flash = 6;
            if (p.blind) {
              e.blindTimer = 180;
              this.spawnFloatingText(e.x + e.w / 2, e.y - 20, 'BLINDED', '#c084fc');
            }
            if (p.damage > 0) {
              this.spawnFloatingText(e.x + e.w / 2, e.y - 8, `-${p.damage}`, '#ef4444');
            }
            this.screenShake = Math.max(this.screenShake, 3);
            if (e.hp <= 0) {
              this.awardKill(e, j);
            }
          }
        }
        // Damage boss in radius
        if (this.activeBoss) {
          const b = this.activeBoss;
          const bCx = b.x + b.w / 2;
          const bCy = b.y + b.h / 2;
          if (Math.hypot(bCx - cx, bCy - cy) <= r) {
            b.hp -= p.damage;
            b.flash = 6;
            if (p.damage > 0) {
              this.spawnFloatingText(b.x + b.w / 2, b.y - 8, `-${p.damage}`, '#ef4444');
            }
            this.screenShake = Math.max(this.screenShake, 3);
          }
        }
        // Mine blocks in radius (only if damage > 0)
        if (p.damage > 0) {
          const rTiles = Math.ceil(r / CFG.TILE_SIZE);
          const cTx = Math.floor(cx / CFG.TILE_SIZE);
          const cTy = Math.floor(cy / CFG.TILE_SIZE);
          for (let dx = -rTiles; dx <= rTiles; dx++) {
            for (let dy = -rTiles; dy <= rTiles; dy++) {
              if (Math.hypot(dx, dy) * CFG.TILE_SIZE > r) continue;
              const ttx = cTx + dx;
              const tty = cTy + dy;
              if (ttx < 0 || tty < 0 || ttx >= CFG.MAP_W || tty >= CFG.MAP_H) continue;
              const bid = this.map.get(ttx, tty);
              if (bid === BLOCKS.VACUUM) continue;
              const idx = this.map.getIndex(ttx, tty);
              if (this.map.hp[idx] > 0) this.map.hp[idx] = Math.max(0, this.map.hp[idx] - p.damage);
              const bdef = BLOCK_DATA[bid];
              const maxHp = bdef?.hp || 30;
              this.voxelDamage[idx] = Math.min(100, Math.floor(((maxHp - this.map.hp[idx]) / maxHp) * 100));
              if (this.map.hp[idx] <= 0) this.mineBlock(ttx, tty);
              else this.spawnVoxelParticles(ttx * 16 + 8, tty * 16 + 8, p.color || '#fff', 1);
            }
          }
        }
        // Explosion particles
        for (let k = 0; k < 12; k++) {
          this.spawnVoxelParticles(cx + (Math.random() - 0.5) * r, cy + (Math.random() - 0.5) * r, p.color || '#fbbf24', 2);
        }
        // Quantum Beacon: sonar scan on impact — reveal fog + scan ores/hazards
        if (p.damage === 0 && p.glow === '#d0c0ff') {
          const rTiles = Math.ceil(r / CFG.TILE_SIZE);
          const cTx = Math.floor(cx / CFG.TILE_SIZE);
          const cTy = Math.floor(cy / CFG.TILE_SIZE);
          this.revealExplored(cTx, cTy, rTiles);
          for (let dy = -rTiles; dy <= rTiles; dy++) {
            for (let dx = -rTiles; dx <= rTiles; dx++) {
              if (dx * dx + dy * dy > rTiles * rTiles) continue;
              const sx = cTx + dx;
              const sy = cTy + dy;
              if (sx < 0 || sy < 0 || sx >= CFG.MAP_W || sy >= CFG.MAP_H) continue;
              if (this.isScannable(this.map.get(sx, sy))) {
                this.map.scanned[this.map.getIndex(sx, sy)] = 255;
              }
            }
          }
          this.sonarRings.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: r,
            life: 60
          });
          this.spawnFloatingText(cx, cy - 20, 'SONAR SURVEY COMPLETE (256M)', '#a78bfa');
          Sound.playPulseShot();
        }
      };

      // Hit enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (p.x > e.x && p.x < e.x + e.w && p.y > e.y && p.y < e.y + e.h) {
          if (p.hits && p.hits.indexOf(e) >= 0) continue;
          if (p.explodeRadius) {
            doExplosion(p.x, p.y);
          } else {
            e.hp -= p.damage;
            e.flash = 6;
            if (p.blindHit) {
              e.blindTimer = 60;
              this.spawnFloatingText(e.x + e.w / 2, e.y - 20, 'BLINDED', '#a855f7');
            }
            this.spawnFloatingText(e.x + e.w / 2, e.y - 8, `-${p.damage}`, '#ef4444');
            this.screenShake = 3;
            this.spawnVoxelParticles(p.x, p.y, p.color || '#ef4444', 2);
            if (e.hp <= 0) {
              this.awardKill(e, j);
            }
          }
          if (p.pierce && p.pierce > 0 && !p.explodeRadius) {
            p.pierce--;
            (p.hits = p.hits || []).push(e);
          } else {
            hit = true;
            break;
          }
        }
      }

      // Hit boss
      if (!hit && this.activeBoss) {
        const b = this.activeBoss;
        if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) {
          if (p.explodeRadius) {
            doExplosion(p.x, p.y);
          } else {
            b.hp -= p.damage;
            b.flash = 6;
            this.spawnFloatingText(b.x + b.w / 2, b.y - 8, `-${p.damage}`, '#ef4444');
            this.screenShake = 3;
            this.spawnVoxelParticles(p.x, p.y, p.color || '#ef4444', 2);
          }
          hit = true;
        }
      }

      if (hit) {
        this.playerProjectiles.splice(i, 1);
        continue;
      }

      // Hit solid block
      const ptx = Math.floor(p.x / CFG.TILE_SIZE);
      const pty = Math.floor(p.y / CFG.TILE_SIZE);
      if (BLOCK_DATA[this.map.get(ptx, pty)]?.solid) {
        if (p.explodeRadius) {
          const idx = this.map.getIndex(ptx, pty);
          if (this.map.hp[idx] > 0) this.map.hp[idx] = Math.max(0, this.map.hp[idx] - p.damage);
          if (this.map.hp[idx] <= 0) this.mineBlock(ptx, pty);
          doExplosion(p.x, p.y);
        }
        this.playerProjectiles.splice(i, 1);
        continue;
      }

      // Expire
      if (p.life <= 0) {
        if (p.explodeRadius && p.damage === 0) {
          // Quantum beacon scans even if expiring in air
          doExplosion(p.x, p.y);
        }
        this.playerProjectiles.splice(i, 1);
      }
    }
  }

  // Active Boss Controller
  public updateBoss() {
    if (!this.activeBoss) return;
    const b = this.activeBoss;
    b.flash = Math.max(0, b.flash - 1);
    b.timer++;
    b.px = b.x;
    b.py = b.y;

    const hpPct = b.hp / b.maxHp;
    for (let i = b.def.phases.length - 1; i >= 0; i--) {
      if (hpPct <= b.def.phases[i].hpThreshold) {
        if (b.phase !== i) {
          b.phase = i;
          b.pattern = b.def.phases[i].pattern;
          b.timer = 0;
          this.spawnFloatingText(b.x, b.y - 20, `PHASE ${i + 1}`, '#fbbf24');
          this.addHazardAlert('warning', 'WARDEN ENRAGED', `${b.def.name} shifted to Phase ${i + 1}!`);
          Sound.playBossAwaken();
        }
        break;
      }
    }

    const dx = this.player.x - b.x;
    const dy = this.player.y - b.y;
    const angle = Math.atan2(dy, dx);

    if (b.pattern === 'charge' || b.pattern === 'enraged') {
      const spd = b.pattern === 'enraged' ? b.def.speed * 1.8 : b.def.speed;
      b.vx = Math.cos(angle) * spd;
      b.vy = Math.sin(angle) * spd;
      b.x += b.vx;
      b.y += b.vy;
      b.facingLeft = dx < 0;
    } else if (b.pattern === 'laser' || b.pattern === 'spray') {
      if (b.timer % 30 === 0) {
        for (let k = -4; k <= 4; k++) {
          const a = k * 0.08;
          this.projectiles.push({
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            vx: Math.cos(angle + a) * 4.2,
            vy: Math.sin(angle + a) * 4.2,
            damage: b.def.damage,
            life: 180,
            owner: 'enemy'
          });
        }
      }
      b.x += Math.cos(angle) * b.def.speed * 0.8;
      b.y += Math.sin(angle) * b.def.speed * 0.8;
      b.facingLeft = dx < 0;
    } else if (b.pattern === 'meteor_rain') {
      if (b.timer % 40 === 0) {
        const mx = this.player.x + (Math.random() - 0.5) * 220;
        this.projectiles.push({
          x: mx,
          y: b.y - 280,
          vx: 0,
          vy: 5.5,
          damage: b.def.damage,
          life: 200,
          owner: 'enemy'
        });
      }
      b.x += Math.cos(angle) * b.def.speed * 0.9;
      b.y += Math.sin(angle) * b.def.speed * 0.9;
    }

    // Boss vs Player contact
    if (
      !this.player.dead &&
      this.player.invuln <= 0 &&
      this.player.x < b.x + b.w &&
      this.player.x + this.player.w > b.x &&
      this.player.y < b.y + b.h &&
      this.player.y + this.player.h > b.y
    ) {
      let dmg = Math.max(1, b.def.damage - this.equipment.getDefense());
      if (this.player.shield > 0) {
        const a = Math.min(this.player.shield, dmg);
        this.player.shield -= a;
        dmg -= a;
        Sound.playShieldDeflect();
      } else {
        Sound.playHit();
      }
      this.player.hp -= dmg;
      this.player.invuln = 60;
      this.screenShake = 12;
      this.spawnFloatingText(this.player.x + this.player.w / 2, this.player.y - 8, `-${b.def.damage}`, '#ef4444');
      if (this.player.hp <= 0) {
        this.player.hp = 0;
        this.killPlayer();
      }
      this.player.vy = -6;
      this.player.vx = this.player.x < b.x ? -8 : 8;
    }

    // Boss Defeated
    if (b.hp <= 0) {
      for (const drop of b.def.loot) {
        const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
        this.player.inventory[drop.item] = (this.player.inventory[drop.item] || 0) + count;
      }
      this.awardXp(b.def.xp);
      this.spawnFloatingText(b.x, b.y - 32, `${b.def.name} DEFEATED!`, '#39ff14');
      this.addHazardAlert('info', 'WARDEN SLAIN', `${b.def.name} has fallen! Seal energy dissipating.`);
      Sound.playBossDefeated();
      this.objectives.defeated[b.key] = true;

      if (b.key === 'worldheart') {
        this.objectives.victory = true;
        this.addHazardAlert('info', 'CORE SECURED', 'Planetary core stabilized. All Wardens and Worldheart secured!');
      }

      this.activeBoss = null;
    }
  }

  // Voxel Particles & Physics
  public spawnVoxelParticles(x: number, y: number, color: string, count: number = 6, blockId?: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.0;
      this.voxelParticles.push({
        x: x + Math.random() * 12,
        y: y + Math.random() * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2 + Math.floor(Math.random() * 2),
        color,
        life: 140 + Math.floor(Math.random() * 60),
        maxLife: 200,
        blockId,
        collectable: blockId !== undefined && blockId !== BLOCKS.VACUUM && blockId !== BLOCKS.ROCK
      });
    }
  }

  public updateVoxelParticles() {
    const pCx = this.player.x + this.player.w / 2;
    const pCy = this.player.y + this.player.h / 2;

    for (let i = this.voxelParticles.length - 1; i >= 0; i--) {
      const vp = this.voxelParticles[i];
      vp.life--;
      if (vp.life <= 0) {
        this.voxelParticles.splice(i, 1);
        continue;
      }

      // Vacuum magnetic attraction towards player
      if (vp.collectable && !this.player.dead) {
        const dx = pCx - vp.x;
        const dy = pCy - vp.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 65) {
          vp.vx += (dx / dist) * 0.85;
          vp.vy += (dy / dist) * 0.85;
          if (dist < 14) {
            if (vp.blockId && this.player.inventory[vp.blockId] !== undefined) {
              this.player.inventory[vp.blockId] = (this.player.inventory[vp.blockId] || 0) + 1;
            } else {
              this.player.inventory[BLOCKS.SCRAP] = (this.player.inventory[BLOCKS.SCRAP] || 0) + 1;
            }
            Sound.playItemPickup();
            this.voxelParticles.splice(i, 1);
            continue;
          }
        }
      }

      // Physics integration
      vp.vy += 0.18; // gravity
      vp.vx *= 0.96; // air drag
      vp.vy *= 0.96;

      vp.x += vp.vx;
      vp.y += vp.vy;

      // Voxel collision bounce
      const tx = Math.floor(vp.x / CFG.TILE_SIZE);
      const ty = Math.floor(vp.y / CFG.TILE_SIZE);
      const bid = this.map.get(tx, ty);
      if (BLOCK_DATA[bid]?.solid) {
        vp.vy = -vp.vy * 0.45;
        vp.vx *= 0.7;
        vp.y = ty * CFG.TILE_SIZE - vp.size;
      }
    }
  }

  public updateLiquidPhysics() {
    this.liquidTick++;
    if (this.liquidTick % 6 !== 0) return;

    // Simulate liquid voxels around player view
    const pTx = Math.floor(this.player.x / CFG.TILE_SIZE);
    const pTy = Math.floor(this.player.y / CFG.TILE_SIZE);
    const rad = 24;
    const startX = Math.max(1, pTx - rad);
    const endX = Math.min(CFG.MAP_W - 2, pTx + rad);
    const startY = Math.max(1, pTy - rad);
    const endY = Math.min(CFG.MAP_H - 2, pTy + rad);

    for (let ty = endY; ty >= startY; ty--) {
      for (let tx = startX; tx <= endX; tx++) {
        const bid = this.map.get(tx, ty);
        if (bid === BLOCKS.WATER || bid === BLOCKS.MAGMA || bid === BLOCKS.SLUDGE || bid === BLOCKS.METHANE) {
          // Flow downwards
          const below = this.map.get(tx, ty + 1);
          if (below === BLOCKS.VACUUM) {
            this.map.set(tx, ty + 1, bid);
            this.map.set(tx, ty, BLOCKS.VACUUM);
          } else if ((bid === BLOCKS.WATER && below === BLOCKS.MAGMA) || (bid === BLOCKS.MAGMA && below === BLOCKS.WATER)) {
            // Obsidian reaction
            this.map.set(tx, ty + 1, BLOCKS.OBSIDIAN);
            this.map.set(tx, ty, BLOCKS.VACUUM);
            this.spawnVoxelParticles(tx * 16, ty * 16, '#1e1b2e', 6, BLOCKS.OBSIDIAN);
          } else if (BLOCK_DATA[below]?.solid) {
            // Spread left or right
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (this.map.get(tx + dir, ty) === BLOCKS.VACUUM) {
              this.map.set(tx + dir, ty, bid);
              this.map.set(tx, ty, BLOCKS.VACUUM);
            } else if (this.map.get(tx - dir, ty) === BLOCKS.VACUUM) {
              this.map.set(tx - dir, ty, bid);
              this.map.set(tx, ty, BLOCKS.VACUUM);
            }
          }
        }
      }
    }
  }

  public updateSonarRings() {
    for (let i = this.sonarRings.length - 1; i >= 0; i--) {
      const ring = this.sonarRings[i];
      ring.radius += 6.0;
      ring.life--;
      if (ring.life <= 0 || ring.radius >= ring.maxRadius) {
        this.sonarRings.splice(i, 1);
      }
    }
  }

  public trySpendEnergy(cost: number): boolean {
    if (this.player.energy >= cost) {
      this.player.energy = Math.max(0, this.player.energy - cost);
      return true;
    }
    return false;
  }

  public tilesAlongBeam(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const tiles: [number, number][] = [];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / CFG.TILE_SIZE));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x0 + dx * t;
      const py = y0 + dy * t;
      const ttx = Math.floor(px / CFG.TILE_SIZE);
      const tty = Math.floor(py / CFG.TILE_SIZE);
      if (ttx < 0 || tty < 0 || ttx >= CFG.MAP_W || tty >= CFG.MAP_H) continue;
      const last = tiles[tiles.length - 1];
      if (!last || last[0] !== ttx || last[1] !== tty) tiles.push([ttx, tty]);
    }
    return tiles;
  }

  public isScannable(bid: number): boolean {
    if (bid === BLOCKS.VACUUM || bid === BLOCKS.ROCK || bid === BLOCKS.MANTLE_ROCK) return false;
    const b = BLOCK_DATA[bid];
    if (b && (b.hazard || b.source || b.conduct)) return true;
    return (
      bid === BLOCKS.TITANIUM ||
      bid === BLOCKS.SILICON ||
      bid === BLOCKS.SCRAP ||
      bid === BLOCKS.SULPHUR ||
      bid === BLOCKS.METHANE ||
      bid === BLOCKS.CRYSTAL ||
      bid === BLOCKS.OBSIDIAN
    );
  }

  public revealExplored(cx: number, cy: number, r: number) {
    const r2 = r * r;
    for (let dy = -r; dy <= r; dy++) {
      const ty = cy + dy;
      if (ty < 0 || ty >= CFG.MAP_H) continue;
      for (let dx = -r; dx <= r; dx++) {
        const tx = cx + dx;
        if (tx < 0 || tx >= CFG.MAP_W) continue;
        if (dx * dx + dy * dy <= r2) {
          this.map.explored[this.map.getIndex(tx, ty)] = 1;
        }
      }
    }
  }

  public awardKill(e: EnemyInstance, idx: number) {
    const edef = ENEMY_TYPES[e.type];
    if (edef) {
      if (edef.drops) {
        for (const drop of edef.drops) {
          if (Math.random() < drop.chance) {
            const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            this.player.inventory[drop.item] = (this.player.inventory[drop.item] || 0) + count;
            Sound.playItemPickup();
          }
        }
      }
      this.awardXp(edef.xp || 10);
    }
    this.spawnVoxelParticles(e.x + e.w / 2, e.y + e.h / 2, '#ef4444', 4);
    this.enemies.splice(idx, 1);
    Sound.playHit();
  }

  public toggleOmniMode() {
    if (this.omniMode === 'scan') this.omniMode = 'build';
    else if (this.omniMode === 'build') this.omniMode = 'interact';
    else this.omniMode = 'scan';
    this.spawnFloatingText(this.player.x, this.player.y - 18, `OMNI MODE: ${this.omniMode.toUpperCase()}`, '#39ff14');
    Sound.playItemPickup();
  }

  // Mining & Block Harvest with Voxel Physics
  public mineBlock(tx: number, ty: number, bonusYield = false) {
    const bid = this.map.get(tx, ty);
    if (bid === BLOCKS.VACUUM || this.isImpenetrable(tx, ty)) return;

    const bdef = BLOCK_DATA[bid];
    const color = (bdef && bdef.color) ? bdef.color : '#64748b';
    const mult = bonusYield ? 2 : 1;

    if (bid === BLOCKS.SCRAP) {
      const amt = 1 * mult;
      this.player.inventory[BLOCKS.SCRAP] = (this.player.inventory[BLOCKS.SCRAP] || 0) + amt;
    } else if (bid === BLOCKS.TITANIUM) {
      const amt = 1 * mult;
      this.player.inventory[BLOCKS.TITANIUM] = (this.player.inventory[BLOCKS.TITANIUM] || 0) + amt;
    } else if (bid === BLOCKS.SILICON) {
      const amt = 1 * mult;
      this.player.inventory[BLOCKS.SILICON] = (this.player.inventory[BLOCKS.SILICON] || 0) + amt;
      if (bonusYield || Math.random() < 0.35) {
        this.player.inventory.THORIUM = (this.player.inventory.THORIUM || 0) + 1;
      }
    } else if (bid === BLOCKS.MYCELIUM) {
      this.player.inventory[BLOCKS.MYCELIUM] = (this.player.inventory[BLOCKS.MYCELIUM] || 0) + 1;
    } else if (bid === BLOCKS.CRYSTAL) {
      this.player.inventory[BLOCKS.CRYSTAL] = (this.player.inventory[BLOCKS.CRYSTAL] || 0) + 1;
    } else if (bid === BLOCKS.OBSIDIAN) {
      this.player.inventory[BLOCKS.OBSIDIAN] = (this.player.inventory[BLOCKS.OBSIDIAN] || 0) + 1;
    } else if (bid === BLOCKS.SULPHUR) {
      this.player.inventory.THORIUM = (this.player.inventory.THORIUM || 0) + 2;
    } else if (bid === BLOCKS.ROCK || bid === BLOCKS.REDROCK) {
      this.player.inventory[BLOCKS.SCRAP] = (this.player.inventory[BLOCKS.SCRAP] || 0) + 1;
    }

    // Reset voxel damage and spawn physical voxel debris particles
    const idx = this.map.getIndex(tx, ty);
    this.voxelDamage[idx] = 0;
    this.spawnVoxelParticles(tx * 16, ty * 16, color, 6, bid);

    this.map.set(tx, ty, BLOCKS.VACUUM);
    Sound.playItemPickup();
  }

  // Active Tool Use matching the 6 Original System Specifications
  public updateMechanics(camX: number, camY: number, zoom: number) {
    if (this.player.dead) return;
    this.beamFxTool = null;

    const wMx = camX + this.input.mx / zoom;
    const wMy = camY + this.input.my / zoom;
    const pCx = this.player.x + this.player.w / 2;
    const pCy = this.player.y + this.player.h / 2;
    const dist = Math.hypot(pCx - wMx, pCy - wMy);
    const active = this.tools[this.activeTool];

    // --- PULSE RIFLE & ALL RIFLE TOOLS: semi-auto, one bolt per trigger pull. Edge-triggered on !this.prevMouseDown
    if (active.rifle && this.input.mb && !this.prevMouseDown) {
      if (this.rifleCooldown <= 0 && this.player.energy >= active.energyCost) {
        this.player.energy -= active.energyCost;
        const angle = Math.atan2(wMy - pCy, wMx - pCx);
        const speed = 8;
        // Tree amps feed bolts, never the scanner: a 0-damage tool
        // stays 0-damage no matter the rank (the rifle/beam split).
        const dmg = active.damage > 0 ? active.damage + this.tree.rifleDmg * 4 : 0;
        const flags = {
          pierce: this.hasRelic('RELIC_WARDEN') ? 2 : 0,
          seek: this.hasRelic('RELIC_CORE'),
          blindHit: this.hasRelic('RELIC_HIVE'),
          hits: [] as any[]
        };
        this.playerProjectiles.push({
          x: pCx,
          y: pCy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          damage: dmg,
          life: 80,
          color: active.color,
          glow: active.glow,
          explodeRadius: active.explodeRadius || 0,
          pierce: flags.pierce,
          seek: flags.seek,
          blindHit: flags.blindHit,
          hits: flags.hits,
          owner: 'player'
        });

        // Split rank: one sister bolt, slightly off-axis.
        if (this.tree.rifleSplit > 0 && active.damage > 0) {
          const a2 = angle + 0.09;
          this.playerProjectiles.push({
            x: pCx,
            y: pCy,
            vx: Math.cos(a2) * speed,
            vy: Math.sin(a2) * speed,
            damage: dmg,
            life: 80,
            color: active.color,
            glow: active.glow,
            explodeRadius: active.explodeRadius || 0,
            pierce: flags.pierce,
            seek: flags.seek,
            blindHit: flags.blindHit,
            hits: [],
            owner: 'player'
          });
        }

        this.rifleCooldown = Math.max(2, (active.fireRate || 4) - this.tree.rifleHaste);
        this.screenShake = 2;
        Sound.playPulseShot();
        for (let i = 0; i < 4; i++) {
          this.spawnVoxelParticles(pCx, pCy, active.color, 1);
        }
      }
    } else if (!active.rifle && dist < active.range) {
      if (this.input.mb && this.trySpendEnergy(active.energyCost)) {
        // Ion Cannon: fan beam damages all enemies in cone + mines blocks in cone
        if (active.fan) {
          this.beamFxTool = active;
          Sound.playPlasmaHum();
          const baseAngle = Math.atan2(wMy - pCy, wMx - pCx);
          const halfAngle = (active.fanAngle || 0.7) / 2;

          // Damage ALL enemies in the cone (index-based to allow splice)
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            const eCx = e.x + e.w / 2, eCy = e.y + e.h / 2;
            const eDist = Math.hypot(eCx - pCx, eCy - pCy);
            if (eDist > active.range) continue;
            let eAngle = Math.atan2(eCy - pCy, eCx - pCx);
            let angleDiff = Math.abs(eAngle - baseAngle);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            if (angleDiff <= halfAngle) {
              e.hp -= active.damage;
              e.flash = 6;
              this.spawnFloatingText(e.x + e.w / 2, e.y - 8, `-${active.damage}`, '#f97316');
              this.spawnVoxelParticles(eCx, eCy, active.color, 1);
              if (e.hp <= 0) {
                this.awardKill(e, i);
              }
            }
          }

          // Damage boss in the cone
          if (this.activeBoss) {
            const b = this.activeBoss;
            const bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
            const bDist = Math.hypot(bCx - pCx, bCy - pCy);
            if (bDist <= active.range) {
              let bAngle = Math.atan2(bCy - pCy, bCx - pCx);
              let angleDiff = Math.abs(bAngle - baseAngle);
              if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
              if (angleDiff <= halfAngle) {
                b.hp -= active.damage;
                b.flash = 6;
                this.spawnFloatingText(b.x + b.w / 2, b.y - 8, `-${active.damage}`, '#f97316');
                this.spawnVoxelParticles(bCx, bCy, active.color, 1);
                this.screenShake = 3;
              }
            }
          }

          // Damage blocks along EACH beam ray
          const rays = active.fanRays || 9;
          for (let r = 0; r < rays; r++) {
            const t = rays === 1 ? 0 : (r / (rays - 1)) - 0.5;
            const angle = baseAngle + t * halfAngle * 2;
            const endX = pCx + Math.cos(angle) * active.range;
            const endY = pCy + Math.sin(angle) * active.range;
            const rayTiles = this.tilesAlongBeam(pCx, pCy, endX, endY);
            for (const tile of rayTiles) {
              const ttx = tile[0], tty = tile[1];
              const bid = this.map.get(ttx, tty);
              if (bid === BLOCKS.VACUUM || this.isImpenetrable(ttx, tty)) continue;
              const idx = this.map.getIndex(ttx, tty);
              if (this.map.hp[idx] > 0) this.map.hp[idx] = Math.max(0, this.map.hp[idx] - active.damage);
              const bdef = BLOCK_DATA[bid];
              const maxHp = bdef?.hp || 30;
              this.voxelDamage[idx] = Math.min(100, Math.floor(((maxHp - this.map.hp[idx]) / maxHp) * 100));
              if (this.map.hp[idx] <= 0) this.mineBlock(ttx, tty);
              else this.spawnVoxelParticles(ttx * 16 + 8, tty * 16 + 8, active.color, 1);
            }
          }
        } else {
          // Plasma Cutter: continuous mining beam + cursor enemy damage
          this.beamFxTool = active;
          Sound.playPlasmaHum();
          // Damage enemy under cursor
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (wMx > e.x && wMx < e.x + e.w && wMy > e.y && wMy < e.y + e.h) {
              if (active.damage > 0) {
                e.hp -= active.damage;
                e.flash = 6;
                this.screenShake = 3;
              }
              if (e.hp <= 0) {
                this.awardKill(e, i);
              }
              break;
            }
          }
          if (this.activeBoss) {
            const b = this.activeBoss;
            if (wMx > b.x && wMx < b.x + b.w && wMy > b.y && wMy < b.y + b.h) {
              if (active.damage > 0) {
                b.hp -= active.damage;
                b.flash = 6;
                this.screenShake = 3;
              }
            }
          }
          const beamTiles = this.tilesAlongBeam(pCx, pCy, wMx, wMy);
          for (let k = 0; k < beamTiles.length; k++) {
            const ttx = beamTiles[k][0], tty = beamTiles[k][1];
            const bid = this.map.get(ttx, tty);
            if (bid === BLOCKS.VACUUM || this.isImpenetrable(ttx, tty)) continue;
            const idx = this.map.getIndex(ttx, tty);
            if (this.map.hp[idx] > 0) this.map.hp[idx] = Math.max(0, this.map.hp[idx] - active.damage);
            const bdef = BLOCK_DATA[bid];
            const maxHp = bdef?.hp || 30;
            this.voxelDamage[idx] = Math.min(100, Math.floor(((maxHp - this.map.hp[idx]) / maxHp) * 100));
            if (this.map.hp[idx] <= 0) this.mineBlock(ttx, tty);
            else this.spawnVoxelParticles(ttx * 16 + 8, tty * 16 + 8, active.color, 1);
          }
        }
      }
    }

    // --- SPORE GRENADE (RMB, G): consumable explosive lobbed along aim line
    const wantsGrenade = (this.input.g && !this.prevG) || (this.input.mb2 && !this.prevMb2);
    if (wantsGrenade && !this.player.dead && (this.player.crafted.sporeGrenade || 0) > 0) {
      this.player.crafted.sporeGrenade--;
      const angle = Math.atan2(wMy - pCy, wMx - pCx);
      const speed = 7;
      this.playerProjectiles.push({
        x: pCx,
        y: pCy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 30,
        life: 70,
        color: '#6b21a8',
        glow: '#c084fc',
        explodeRadius: 64,
        blind: true,
        owner: 'player'
      });
      this.screenShake = 3;
      Sound.playPulseShot();
    }

    // --- SHOCK BATON (V, backup): energy-free short arc
    if (this.input.v && this.batonCooldown <= 0) {
      this.batonCooldown = Math.max(15, 30 - this.tree.batonHaste * 8);
      this.batonSwingT = 6;
      const dir = this.player.facingLeft ? -1 : 1;
      const range = 44 + this.tree.batonReach * 12;
      const dmg = 12 + this.tree.batonDmg * 8;

      // Flesh: forward half-plane arc
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const dx = e.x + e.w / 2 - pCx;
        const dy = e.y + e.h / 2 - pCy;
        if (dx * dir > -8 && Math.abs(dx) <= range && Math.abs(dy) <= 26) {
          e.hp -= dmg;
          e.flash = 6;
          this.spawnFloatingText(e.x + e.w / 2, e.y - 8, `-${dmg}`, '#00e5d0');
          this.screenShake = Math.max(this.screenShake, 2);
          this.spawnVoxelParticles(e.x + e.w / 2, e.y + e.h / 2, '#00e5d0', 2);
          if (e.hp <= 0) {
            this.awardKill(e, i);
          }
        }
      }

      if (this.activeBoss) {
        const b = this.activeBoss;
        const dx = b.x + b.w / 2 - pCx;
        const dy = b.y + b.h / 2 - pCy;
        if (dx * dir > -8 && Math.abs(dx) <= range + b.w / 2 && Math.abs(dy) <= 26 + b.h / 2) {
          b.hp -= dmg;
          b.flash = 6;
          this.spawnFloatingText(b.x + b.w / 2, b.y - 8, `-${dmg}`, '#00e5d0');
          this.screenShake = Math.max(this.screenShake, 2);
        }
      }

      // Rock: chips the tiles ahead of the swing (emergency mining)
      const edgeX = pCx + dir * (this.player.w / 2);
      const tx0 = Math.floor(edgeX / CFG.TILE_SIZE);
      const reach = Math.ceil(range / CFG.TILE_SIZE);
      const ty0 = Math.floor((pCy - 10) / CFG.TILE_SIZE);
      const ty1 = Math.floor((pCy + 10) / CFG.TILE_SIZE);
      for (let k = 0; k <= reach; k++) {
        const ttx = tx0 + dir * k;
        for (let tty = ty0; tty <= ty1; tty++) {
          if (ttx < 0 || tty < 0 || ttx >= CFG.MAP_W || tty >= CFG.MAP_H) continue;
          const bid = this.map.get(ttx, tty);
          if (bid === BLOCKS.VACUUM || this.isImpenetrable(ttx, tty)) continue;
          const idx = this.map.getIndex(ttx, tty);
          if (this.map.hp[idx] > 0) this.map.hp[idx] = Math.max(0, this.map.hp[idx] - dmg);
          const bdef = BLOCK_DATA[bid];
          const maxHp = bdef?.hp || 30;
          this.voxelDamage[idx] = Math.min(100, Math.floor(((maxHp - this.map.hp[idx]) / maxHp) * 100));
          if (this.map.hp[idx] <= 0) this.mineBlock(ttx, tty);
        }
      }
      Sound.playHit();
    }

    if (this.rifleCooldown > 0) this.rifleCooldown--;
    if (this.batonCooldown > 0) this.batonCooldown--;
    if (this.batonSwingT > 0) this.batonSwingT--;
    this.prevMouseDown = this.input.mb;
    this.prevMb2 = this.input.mb2;
    this.prevG = this.input.g;

    // Environmental Checks & Directives
    if (!this.objectives.descend && Math.floor(this.player.y / CFG.TILE_SIZE) >= 450) {
      this.objectives.descend = true;
      this.spawnFloatingText(this.player.x, this.player.y - 32, 'DIRECTIVE: MOLTEN CORE REACHED', '#39ff14');
      this.addHazardAlert('warning', 'EXTREME GEOTHERMAL HEAT', 'Entering Molten Core Abyss. High radiation and magma flows.');
    }

    if (this.communeQueued) {
      this.communeQueued = false;
      this.tryCommune();
    }
  }

  // Master Fixed Timestep Loop
  public step() {
    this.simClock++;
    if (!this.player.dead) {
      this.updatePhysics();
      this.updateEnemies();
      this.updateBoss();
      this.updateVoxelParticles();
      this.updateLiquidPhysics();
      this.updateSonarRings();
    } else {
      this.player.respawnTimer--;
      if (this.player.respawnTimer <= 0) this.respawnPlayer();
    }

    // Corpse life decrement
    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const c = this.corpses[i];
      c.life--;
      if (c.life <= 0) {
        this.corpses.splice(i, 1);
        continue;
      }
      if (
        this.player.x < c.x + 16 &&
        this.player.x + this.player.w > c.x &&
        this.player.y < c.y + 24 &&
        this.player.y + this.player.h > c.y
      ) {
        for (const k in c.items) {
          this.player.inventory[k] = (this.player.inventory[k] || 0) + c.items[k];
        }
        Sound.playItemPickup();
        this.corpses.splice(i, 1);
      }
    }

    // Floating text upward drift
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Day / Night step
    this.dayNight.time = (this.dayNight.time + 1) % this.dayNight.dayLength;
    const t = this.dayNight.time;
    if (t < 2000) {
      this.dayNight.isNight = false;
      this.dayNight.ambientAlpha = 0;
    } else if (t < 2400) {
      this.dayNight.ambientAlpha = ((t - 2000) / 400) * 0.35;
    } else if (t < 4400) {
      this.dayNight.isNight = true;
      this.dayNight.ambientAlpha = 0.35;
    } else {
      this.dayNight.ambientAlpha = (1 - (t - 4400) / 400) * 0.35;
    }
  }
}
