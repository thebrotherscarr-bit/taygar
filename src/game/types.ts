/**
 * C.O.R.E. - Procedural Sci-Fi Sandbox
 * Type Definitions & Data Structures
 */

export const CFG = {
  TILE_SIZE: 16,
  MAP_W: 1200,
  MAP_H: 600,
  GRAVITY: 0.25,
  TERMINAL_VELOCITY: 12,
  PHYSICS_STEP: 1000 / 60
};

export const BLOCKS = {
  VACUUM: 0,
  SCRAP: 1,
  TITANIUM: 2,
  SILICON: 3,
  SLUDGE: 4,
  CONDUIT: 5,
  SOLAR: 6,
  TURRET: 7,
  MANTLE_ROCK: 8,
  MAGMA: 9,
  ROCK: 10,
  MYCELIUM: 11,
  CRYSTAL: 12,
  OBSIDIAN: 13,
  WATER: 14,
  GRASS: 15,
  MUSHROOM: 16,
  CRYSTAL_FLOWER: 17,
  VINE: 18,
  SPORE_POD: 19,
  STEAM: 20,
  SNOW: 21,
  BEACON: 22,
  ALTAR: 23,
  REDROCK: 24,
  SULPHUR: 25,
  METHANE: 26
} as const;

export type BlockId = typeof BLOCKS[keyof typeof BLOCKS];

export interface BlockDef {
  name: string;
  color: string | null;
  solid: boolean;
  hp: number;
  hazard?: boolean;
  conduct?: boolean;
  source?: boolean;
  consume?: boolean;
  liquid?: boolean;
  gas?: boolean;
  vegetation?: boolean;
  glow?: boolean;
  slow?: boolean;
  beacon?: boolean;
  altar?: boolean;
}

export const BLOCK_DATA: Record<number, BlockDef> = {
  [BLOCKS.VACUUM]: { name: 'Vacuum', color: null, solid: false, hp: 0 },
  [BLOCKS.SCRAP]: { name: 'Scrap Metal', color: '#a0522d', solid: true, hp: 20 },
  [BLOCKS.TITANIUM]: { name: 'Titanium Ore', color: '#7a9bb5', solid: true, hp: 300 },
  [BLOCKS.SILICON]: { name: 'Silicon Vein', color: '#00e5d0', solid: true, hp: 150 },
  [BLOCKS.SLUDGE]: { name: 'Bio Sludge', color: '#d62828', solid: false, hp: 0, hazard: true },
  [BLOCKS.CONDUIT]: { name: 'Power Conduit', color: '#f4a261', solid: false, hp: 10, conduct: true },
  [BLOCKS.SOLAR]: { name: 'Solar Cell', color: '#e9c46a', solid: true, hp: 50, source: true },
  [BLOCKS.TURRET]: { name: 'Auto-Turret', color: '#8d0801', solid: true, hp: 90, consume: true },
  [BLOCKS.MANTLE_ROCK]: { name: 'Mantle Rock', color: '#6a1e12', solid: true, hp: 120 },
  [BLOCKS.MAGMA]: { name: 'Molten Magma', color: '#ff4500', solid: false, hp: 0, hazard: true },
  [BLOCKS.ROCK]: { name: 'Bedrock', color: '#6b7280', solid: true, hp: 40 },
  [BLOCKS.MYCELIUM]: { name: 'Bioluminescent Mycelium', color: '#6b21a8', solid: true, hp: 35 },
  [BLOCKS.CRYSTAL]: { name: 'Cyan Crystal', color: '#38bdf8', solid: true, hp: 200 },
  [BLOCKS.OBSIDIAN]: { name: 'Obsidian Plate', color: '#1e1b2e', solid: true, hp: 500 },
  [BLOCKS.WATER]: { name: 'Alien Water', color: '#2563eb', solid: false, hp: 0, liquid: true },
  [BLOCKS.GRASS]: { name: 'Surface Spores', color: '#22c55e', solid: false, hp: 0, vegetation: true },
  [BLOCKS.MUSHROOM]: { name: 'Glow Mushroom', color: '#a855f7', solid: false, hp: 0, vegetation: true, glow: true },
  [BLOCKS.CRYSTAL_FLOWER]: { name: 'Crystal Blossom', color: '#38bdf8', solid: false, hp: 0, vegetation: true, glow: true },
  [BLOCKS.VINE]: { name: 'Toxic Vine', color: '#15803d', solid: false, hp: 0, vegetation: true },
  [BLOCKS.SPORE_POD]: { name: 'Spore Pod', color: '#6b21a8', solid: false, hp: 0, vegetation: true },
  [BLOCKS.STEAM]: { name: 'Geothermal Steam', color: '#94a3b8', solid: false, hp: 0, gas: true },
  [BLOCKS.SNOW]: { name: 'Frozen Methane', color: '#e2e8f0', solid: false, hp: 0, hazard: true, slow: true },
  [BLOCKS.BEACON]: { name: 'Quantum Beacon', color: '#a78bfa', solid: false, hp: 30, beacon: true },
  [BLOCKS.ALTAR]: { name: 'Warden Altar', color: '#fbbf24', solid: false, hp: 60000, altar: true },
  [BLOCKS.REDROCK]: { name: 'Red Strata Rock', color: '#b0402e', solid: true, hp: 30 },
  [BLOCKS.SULPHUR]: { name: 'Sulphur Deposit', color: '#eab308', solid: true, hp: 60 },
  [BLOCKS.METHANE]: { name: 'Liquid Methane', color: '#4ade80', solid: false, hp: 0, liquid: true }
};

export interface ToolDef {
  name: string;
  desc: string;
  energyCost: number;
  color: string;
  width: number;
  range: number;
  damage: number;
  glow: string;
  rifle?: boolean;
  fan?: boolean;
  fanAngle?: number;
  fanRays?: number;
  fireRate?: number;
  explodeRadius?: number;
  oc?: number;
}

export interface VoxelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  blockId?: number;
  collectable?: boolean;
}

export interface SonarScanRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
}

export interface ArmorSet {
  name: string;
  defense: number;
  hpBonus: number;
  color: string;
  cost: Record<number | string, number>;
  reflect?: number;
  fireImmune?: boolean;
}

export const ARMOR_SETS: Record<string, ArmorSet> = {
  scrap: { name: 'Scrap Suit', defense: 5, hpBonus: 0, color: '#a0522d', cost: { [BLOCKS.SCRAP]: 15 } },
  titanium: { name: 'Titanium Rig', defense: 12, hpBonus: 10, color: '#7a9bb5', cost: { [BLOCKS.TITANIUM]: 10, [BLOCKS.SILICON]: 5 } },
  crystal: { name: 'Crystal Weave', defense: 18, hpBonus: 0, color: '#38bdf8', cost: { [BLOCKS.CRYSTAL]: 8 }, reflect: 0.10 },
  obsidian: { name: 'Obsidian Plate', defense: 25, hpBonus: 20, color: '#1e1b2e', cost: { [BLOCKS.OBSIDIAN]: 6 }, fireImmune: true }
};

export interface Recipe {
  id: string;
  name: string;
  category: 'survival' | 'equipment' | 'upgrades' | 'tech';
  key: string | null;
  desc: string;
  cost: Record<number | string, number>;
  capped?: () => boolean;
  craft: () => void;
}

export interface BossPhase {
  hpThreshold: number;
  pattern: 'charge' | 'laser' | 'spray' | 'spore_burst' | 'split' | 'erupt' | 'magma_pool' | 'meteor_rain' | 'enraged';
  spawnMinions?: boolean;
  splitAt?: boolean;
}

export interface BossLoot {
  item: number | string;
  min: number;
  max: number;
  chance: number;
}

export interface BossDef {
  key: string;
  name: string;
  title: string;
  hp: number;
  damage: number;
  speed: number;
  w: number;
  h: number;
  biome: 'tech' | 'fungal' | 'crystal' | 'molten';
  phases: BossPhase[];
  minion?: string;
  loot: BossLoot[];
  xp: number;
  lore: string;
}

export interface ActiveBossInstance {
  key: string;
  def: BossDef;
  hp: number;
  maxHp: number;
  phase: number;
  pattern: string;
  timer: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  px?: number;
  py?: number;
  flash: number;
  facingLeft: boolean;
}

export interface EnemyType {
  hp: number;
  damage: number;
  speed: number;
  w: number;
  h: number;
  sprite: string;
  biome: string;
  xp: number;
  drops: { item: number | string; min: number; max: number; chance: number }[];
  projectile?: boolean;
  fireRate?: number;
  nightOnly?: boolean;
  swarm?: boolean;
  buffRadius?: number;
  teleport?: boolean;
  teleportCooldown?: number;
  charge?: boolean;
  chargeSpeed?: number;
  flying?: boolean;
  poison?: boolean;
  invisible?: boolean;
  revealDist?: number;
  luminescent?: boolean;
  fireImmune?: boolean;
  boltColor?: string;
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  bot: {
    hp: 45,
    damage: 15,
    speed: 1.4,
    w: 16,
    h: 16,
    sprite: 'enemy_bot',
    biome: 'tech',
    xp: 20,
    drops: [
      { item: BLOCKS.SCRAP, min: 2, max: 5, chance: 1.0 },
      { item: BLOCKS.TITANIUM, min: 1, max: 2, chance: 0.5 }
    ]
  },
  crawler: {
    hp: 35,
    damage: 12,
    speed: 1.8,
    w: 16,
    h: 12,
    sprite: 'enemy_crawler',
    biome: 'tech',
    xp: 15,
    drops: [
      { item: BLOCKS.SCRAP, min: 1, max: 3, chance: 1.0 },
      { item: BLOCKS.SILICON, min: 1, max: 1, chance: 0.4 }
    ]
  },
  drone: {
    hp: 40,
    damage: 18,
    speed: 1.6,
    w: 16,
    h: 16,
    flying: true,
    sprite: 'enemy_drone',
    biome: 'tech',
    xp: 25,
    drops: [
      { item: BLOCKS.SILICON, min: 1, max: 3, chance: 0.8 },
      { item: BLOCKS.SCRAP, min: 2, max: 4, chance: 1.0 }
    ]
  },
  stalker: {
    hp: 75,
    damage: 25,
    speed: 2.2,
    w: 20,
    h: 20,
    sprite: 'enemy_stalker',
    biome: 'fungal',
    xp: 45,
    drops: [
      { item: BLOCKS.MYCELIUM, min: 3, max: 6, chance: 1.0 },
      { item: BLOCKS.CRYSTAL, min: 1, max: 2, chance: 0.4 }
    ]
  },
  sporeSac: {
    hp: 60,
    damage: 16,
    speed: 0.8,
    w: 18,
    h: 18,
    projectile: true,
    fireRate: 80,
    sprite: 'enemy_crawler',
    biome: 'fungal',
    xp: 30,
    drops: [{ item: BLOCKS.MYCELIUM, min: 2, max: 5, chance: 1.0 }]
  },
  sporeCloud: {
    hp: 25,
    damage: 10,
    speed: 1.5,
    w: 14,
    h: 14,
    flying: true,
    poison: true,
    sprite: 'enemy_drone',
    biome: 'fungal',
    xp: 20,
    drops: [{ item: BLOCKS.MYCELIUM, min: 1, max: 3, chance: 0.9 }]
  },
  sentinel: {
    hp: 110,
    damage: 28,
    speed: 1.2,
    w: 20,
    h: 24,
    projectile: true,
    fireRate: 70,
    sprite: 'enemy_bot',
    biome: 'crystal',
    xp: 60,
    drops: [
      { item: BLOCKS.CRYSTAL, min: 3, max: 6, chance: 1.0 },
      { item: BLOCKS.TITANIUM, min: 2, max: 4, chance: 0.7 }
    ]
  },
  sentry: {
    hp: 90,
    damage: 22,
    speed: 0.9,
    w: 18,
    h: 20,
    projectile: true,
    fireRate: 85,
    sprite: 'enemy_bot',
    biome: 'crystal',
    xp: 50,
    drops: [{ item: BLOCKS.CRYSTAL, min: 2, max: 4, chance: 1.0 }]
  },
  shardling: {
    hp: 30,
    damage: 14,
    speed: 2.4,
    w: 12,
    h: 12,
    sprite: 'enemy_crawler',
    biome: 'crystal',
    xp: 22,
    drops: [{ item: BLOCKS.CRYSTAL, min: 1, max: 2, chance: 0.8 }]
  },
  mite: {
    hp: 20,
    damage: 8,
    speed: 2.2,
    w: 10,
    h: 8,
    sprite: 'enemy_crawler',
    biome: 'tech',
    xp: 10,
    drops: [{ item: BLOCKS.SCRAP, min: 1, max: 2, chance: 0.7 }]
  },
  cinderImp: {
    hp: 130,
    damage: 32,
    speed: 1.9,
    w: 20,
    h: 20,
    flying: true,
    fireImmune: true,
    sprite: 'enemy_drone',
    biome: 'molten',
    xp: 80,
    drops: [
      { item: BLOCKS.OBSIDIAN, min: 2, max: 5, chance: 1.0 },
      { item: 'THORIUM', min: 1, max: 3, chance: 0.7 }
    ]
  },
  swarmBot: {
    hp: 25,
    damage: 10,
    speed: 2.2,
    w: 12,
    h: 12,
    sprite: 'enemy_bot',
    biome: 'tech',
    xp: 12,
    drops: [{ item: BLOCKS.SCRAP, min: 1, max: 2, chance: 0.8 }]
  }
};

export interface EnemyInstance {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  facingLeft: boolean;
  biome: string;
  flash: number;
  fireTimer?: number;
  blindTimer?: number;
  visible?: boolean;
  budTimer?: number;
  teleportTimer?: number;
  charging?: boolean;
  chargeDir?: number;
  chargeTimer?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  life: number;
  owner: 'enemy' | 'player';
  color?: string;
  glow?: string;
  explodeRadius?: number;
  pierce?: number;
  seek?: boolean;
  blind?: boolean;
  blindHit?: boolean;
  turret?: boolean;
  hits?: any[];
}

export interface Waypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface HazardAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
