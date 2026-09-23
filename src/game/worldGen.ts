/**
 * C.O.R.E. - Procedural World Generator
 * Features boundless Western & Eastern Oceans at map ends,
 * diverse multi-biome continental interior, complex 3D cavern networks,
 * and an impenetrable boiling Lake of Lava & Mantle Core at the bottom of the world.
 */

import { BLOCKS, CFG, EnemyInstance } from './types';

export class FastNoise {
  private p: Uint8Array;

  constructor(public seed = 1234) {
    this.p = new Uint8Array(512);
    let s = (seed ^ 0x9e3779b9) >>> 0;
    if (s === 0) s = 0x1d872b41;
    const next = () => {
      s ^= (s << 13) >>> 0;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= (s << 5) >>> 0;
      s >>>= 0;
      return s >>> 0;
    };
    for (let i = 0; i < 256; i++) this.p[i] = next() & 255;
    for (let i = 0; i < 256; i++) this.p[i + 256] = this.p[i];
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise2D(x: number, y: number): number {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
    );
  }
}

export interface AltarInfo {
  x: number;
  y: number;
  boss: string;
}

export interface WorldMapData {
  ids: Uint8Array;
  hp: Uint16Array;
  powered: Uint8Array;
  scanned: Uint8Array;
  explored: Uint8Array;
  surfaceHeights: Int32Array;
  altars: AltarInfo[];
  altarTiles: Record<number, string>;
  geyserVents: { x: number; y: number }[];
  initialEnemies: EnemyInstance[];
  getIndex: (x: number, y: number) => number;
  get: (x: number, y: number) => number;
  set: (x: number, y: number, id: number) => void;
}

export const WORLD_CONSTANTS = {
  SEA_LEVEL: 54,
  OCEAN_LEFT_WIDTH: 135,
  OCEAN_RIGHT_WIDTH: 135,
  LAVA_LAKE_SURFACE: 548,
  IMPENETRABLE_CORE_FLOOR: 575
} as const;

export function createWorldMap(seed: number = 1234): WorldMapData {
  const ids = new Uint8Array(CFG.MAP_W * CFG.MAP_H);
  const hp = new Uint16Array(CFG.MAP_W * CFG.MAP_H);
  const powered = new Uint8Array(CFG.MAP_W * CFG.MAP_H);
  const scanned = new Uint8Array(CFG.MAP_W * CFG.MAP_H);
  const explored = new Uint8Array(CFG.MAP_W * CFG.MAP_H);
  const surfaceHeights = new Int32Array(CFG.MAP_W);
  const altars: AltarInfo[] = [];
  const altarTiles: Record<number, string> = {};
  const geyserVents: { x: number; y: number }[] = [];
  const initialEnemies: EnemyInstance[] = [];

  let wrstate = ((seed ^ 0x85ebca6b) >>> 0) || 1;
  const wrand = () => {
    wrstate ^= (wrstate << 13) >>> 0;
    wrstate >>>= 0;
    wrstate ^= wrstate >>> 17;
    wrstate ^= (wrstate << 5) >>> 0;
    wrstate >>>= 0;
    return (wrstate >>> 0) / 4294967296;
  };

  const getIndex = (x: number, y: number) => y * CFG.MAP_W + x;

  const get = (x: number, y: number): number => {
    if (x < 0 || x >= CFG.MAP_W || y < 0 || y >= CFG.MAP_H) return BLOCKS.VACUUM;
    return ids[getIndex(x, y)];
  };

  const set = (x: number, y: number, id: number) => {
    if (x < 0 || x >= CFG.MAP_W || y < 0 || y >= CFG.MAP_H) return;
    const idx = getIndex(x, y);
    ids[idx] = id;
    hp[idx] =
      y >= WORLD_CONSTANTS.IMPENETRABLE_CORE_FLOOR
        ? 65535
        : id === BLOCKS.ALTAR
          ? 60000
          : id === BLOCKS.OBSIDIAN
            ? 500
            : id === BLOCKS.TITANIUM
              ? 300
              : id === BLOCKS.CRYSTAL
                ? 200
                : id === BLOCKS.SILICON
                  ? 150
                  : id === BLOCKS.MANTLE_ROCK
                    ? 120
                    : id === BLOCKS.ROCK
                      ? 40
                      : 20;
  };

  const noise = new FastNoise(seed);
  const { SEA_LEVEL, OCEAN_LEFT_WIDTH, OCEAN_RIGHT_WIDTH, LAVA_LAKE_SURFACE, IMPENETRABLE_CORE_FLOOR } = WORLD_CONSTANTS;

  // 1. Procedural Surface & Ocean Floor Topology
  for (let x = 0; x < CFG.MAP_W; x++) {
    // Continental elevation base (x = 135 to 1065)
    const contN =
      noise.noise2D(x * 0.007, 10) * 18 +
      noise.noise2D(x * 0.022, 50) * 9 +
      noise.noise2D(x * 0.065, 120) * 3;
    const inlandElev = Math.floor(40 + contN); // Inland ranges from ~26 to ~48 (all above sea level 54)

    if (x < OCEAN_LEFT_WIDTH) {
      // Western Ocean: Trench dips down to y = 115..135
      const trench = 118 + Math.floor(noise.noise2D(x * 0.035, 80) * 14);
      const t = x / OCEAN_LEFT_WIDTH; // 0 at left boundary, 1 at shoreline
      const smoothT = t * t * (3 - 2 * t);
      surfaceHeights[x] = Math.round(trench * (1 - smoothT) + (SEA_LEVEL - 2) * smoothT);
    } else if (x > CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH) {
      // Eastern Ocean: Trench dips down to y = 115..135
      const trench = 118 + Math.floor(noise.noise2D(x * 0.035, 140) * 14);
      const t = (CFG.MAP_W - 1 - x) / OCEAN_RIGHT_WIDTH; // 0 at right boundary, 1 at shoreline
      const smoothT = t * t * (3 - 2 * t);
      surfaceHeights[x] = Math.round(trench * (1 - smoothT) + (SEA_LEVEL - 2) * smoothT);
    } else {
      // Continental Interior
      // Coastal transition smoothing at the borders
      if (x < OCEAN_LEFT_WIDTH + 30) {
        const t = (x - OCEAN_LEFT_WIDTH) / 30;
        surfaceHeights[x] = Math.round((SEA_LEVEL - 2) * (1 - t) + inlandElev * t);
      } else if (x > CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH - 30) {
        const t = (CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH - x) / 30;
        surfaceHeights[x] = Math.round((SEA_LEVEL - 2) * (1 - t) + inlandElev * t);
      } else {
        surfaceHeights[x] = inlandElev;
      }
    }
  }

  // 2. Voxel Population (Air, Oceans, Strata, Caves & Deep Lake of Lava)
  for (let x = 0; x < CFG.MAP_W; x++) {
    const isWestOcean = x < OCEAN_LEFT_WIDTH;
    const isEastOcean = x > CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH;
    const isOcean = isWestOcean || isEastOcean;
    const surfY = surfaceHeights[x];

    for (let y = 0; y < CFG.MAP_H; y++) {
      // A. Sky & Open Oceans
      if (y < surfY) {
        if (isOcean && y >= SEA_LEVEL) {
          // Vast Ocean bodies on both ends of the map
          set(x, y, BLOCKS.WATER);
        } else {
          set(x, y, BLOCKS.VACUUM);
        }
        continue;
      }

      // B. World Bottom World Boundaries: Impenetrable Magma Lake & Core Bedrock
      if (y >= IMPENETRABLE_CORE_FLOOR) {
        // Bottom impenetrable core bedrock crust
        set(x, y, BLOCKS.OBSIDIAN);
        continue;
      }

      if (y >= LAVA_LAKE_SURFACE) {
        // Continuous Boiling Lake of Lava across entire world width
        // With occasional volcanic obsidian pillars and islands
        const pillarNoise = noise.noise2D(x * 0.12, y * 0.12);
        if (pillarNoise > 0.65 && y < IMPENETRABLE_CORE_FLOOR - 4) {
          set(x, y, BLOCKS.OBSIDIAN);
        } else {
          set(x, y, BLOCKS.MAGMA);
        }
        continue;
      }

      // C. Core Cavern Vault (y = 525 to 547)
      // Grand open volcanic underworld chamber with towering columns
      if (y >= 525 && y < LAVA_LAKE_SURFACE) {
        const colNoise = noise.noise2D(x * 0.04, 200);
        const stalactiteNoise = noise.noise2D(x * 0.1, y * 0.1);
        if (colNoise > 0.45 || (y <= 530 && stalactiteNoise > 0.35)) {
          set(x, y, BLOCKS.MANTLE_ROCK);
        } else {
          set(x, y, BLOCKS.VACUUM);
        }
        continue;
      }

      // D. Deep Mantle (y = 450 to 525)
      if (y >= 450 && y < 525) {
        const coreNoise = noise.noise2D(x * 0.07, y * 0.07);
        const caveN = noise.noise2D(x * 0.035, y * 0.035);
        if (caveN > 0.42) {
          set(x, y, BLOCKS.VACUUM);
        } else if (coreNoise > 0.32) {
          set(x, y, BLOCKS.MAGMA);
        } else if (wrand() < 0.06 && coreNoise > 0.1) {
          set(x, y, BLOCKS.OBSIDIAN);
        } else {
          set(x, y, BLOCKS.MANTLE_ROCK);
        }
        continue;
      }

      // E. Crystal Depths (y = 350 to 450)
      if (y >= 350 && y < 450) {
        const crystalNoise = noise.noise2D(x * 0.05, y * 0.05);
        const caveN = noise.noise2D(x * 0.03, y * 0.03);
        if (caveN > 0.38) {
          set(x, y, BLOCKS.VACUUM);
        } else if (crystalNoise > -0.15) {
          set(x, y, BLOCKS.CRYSTAL);
          if (wrand() < 0.05) set(x, y, BLOCKS.SILICON);
        } else {
          set(x, y, BLOCKS.ROCK);
        }
        continue;
      }

      // F. Fungal Caverns (y = 200 to 350)
      if (y >= 200 && y < 350) {
        const fungalNoise = noise.noise2D(x * 0.04, y * 0.04);
        const caveN = noise.noise2D(x * 0.032, y * 0.032);
        if (caveN > 0.36) {
          set(x, y, BLOCKS.VACUUM);
        } else if (fungalNoise > 0.08) {
          set(x, y, BLOCKS.MYCELIUM);
          if (wrand() < 0.04) set(x, y, BLOCKS.CRYSTAL);
        } else {
          set(x, y, BLOCKS.ROCK);
        }
        continue;
      }

      // G. Tech Crust & Seabeds (surfY to y = 200)
      if (y >= surfY && y < 200) {
        // Natural cave networks in the upper crust
        const caveNoise = noise.noise2D(x * 0.045, y * 0.045);
        if (!isOcean && caveNoise > 0.44 && y > surfY + 4) {
          set(x, y, BLOCKS.VACUUM);
          continue;
        }

        const oreNoise = noise.noise2D(x * 0.09, y * 0.09);
        const vein = noise.noise2D(x * 0.14, y * 0.12);
        if (oreNoise > 0.42) {
          set(x, y, BLOCKS.SILICON);
        } else if (oreNoise < -0.42 || vein > 0.58) {
          set(x, y, BLOCKS.TITANIUM);
        } else if (isOcean) {
          // Seabed materials
          set(x, y, wrand() < 0.3 ? BLOCKS.SCRAP : BLOCKS.ROCK);
        } else {
          set(x, y, BLOCKS.ROCK);
        }

        // Spawn initial hostile bots in upper continental caves
        if (!isOcean && wrand() < 0.012 && get(x, y - 1) === BLOCKS.VACUUM) {
          initialEnemies.push({
            type: wrand() > 0.5 ? 'bot' : 'drone',
            x: x * CFG.TILE_SIZE,
            y: (y - 2) * CFG.TILE_SIZE,
            w: 16,
            h: 16,
            vx: -1,
            vy: 0,
            hp: 60,
            maxHp: 60,
            facingLeft: true,
            biome: 'tech',
            flash: 0
          });
        }
      }
    }
  }

  // 3. Cellular Automata Smoothing for Deep Caves
  for (let iter = 0; iter < 3; iter++) {
    const tempIds = new Uint8Array(ids);
    for (let x = 1; x < CFG.MAP_W - 1; x++) {
      for (let y = 200; y < 450; y++) {
        let solidNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const b = get(x + i, y + j);
            if (b !== BLOCKS.VACUUM && b !== BLOCKS.WATER) solidNeighbors++;
          }
        }
        const cur = get(x, y);
        if (solidNeighbors > 4) {
          tempIds[getIndex(x, y)] = cur === BLOCKS.VACUUM ? (y < 350 ? BLOCKS.MYCELIUM : BLOCKS.CRYSTAL) : cur;
        } else if (solidNeighbors < 3 && cur !== BLOCKS.WATER) {
          tempIds[getIndex(x, y)] = BLOCKS.VACUUM;
        }
      }
    }
    ids.set(tempIds);
  }

  // 4. Continental Surface Biomes (Coastal Beach, Tech Badlands, Lush Forest, Fungal Glade, Sulphur Calderas)
  const surfaceBandAt = (tx: number) => {
    if (tx < OCEAN_LEFT_WIDTH + 25) return 'beach_west';
    if (tx < 370) return 'badlands';
    if (tx < 630) return 'verdant';
    if (tx < 870) return 'fungal';
    if (tx < CFG.MAP_W - OCEAN_RIGHT_WIDTH - 25) return 'sulphur';
    return 'beach_east';
  };

  for (let x = 0; x < CFG.MAP_W; x++) {
    const isOcean = x < OCEAN_LEFT_WIDTH || x > CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH;
    const sy = surfaceHeights[x];

    if (isOcean) {
      // Seabed vegetation and marine features
      if (wrand() < 0.18) {
        set(x, sy - 1, BLOCKS.VINE); // Marine alien kelp
        if (wrand() < 0.5) set(x, sy - 2, BLOCKS.VINE);
      } else if (wrand() < 0.08) {
        set(x, sy - 1, BLOCKS.CRYSTAL_FLOWER); // Bioluminescent deep-sea anemone
      }
      continue;
    }

    const band = surfaceBandAt(x);
    if (get(x, sy) === BLOCKS.VACUUM) continue;

    if (band === 'beach_west' || band === 'beach_east') {
      // Coastal shoreline dunes & silicon sands
      set(x, sy, BLOCKS.SILICON);
      if (wrand() < 0.4) set(x, sy + 1, BLOCKS.SILICON);
    } else if (band === 'badlands') {
      // Arid redrock badlands with scrap metal deposits
      set(x, sy, BLOCKS.REDROCK);
      if (wrand() < 0.15 && get(x, sy - 1) === BLOCKS.VACUUM) {
        set(x, sy - 1, BLOCKS.SCRAP);
      }
    } else if (band === 'verdant') {
      // Lush alien surface grass and hanging vines
      set(x, sy, BLOCKS.ROCK);
      if (get(x, sy - 1) === BLOCKS.VACUUM) {
        set(x, sy - 1, BLOCKS.GRASS);
      }
      if (wrand() < 0.25) {
        for (let y = sy - 6; y < sy; y++) {
          if (y > 1 && get(x, y) === BLOCKS.VACUUM && get(x, y - 1) !== BLOCKS.VACUUM) {
            const vLen = 2 + Math.floor(wrand() * 4);
            for (let v = 0; v < vLen; v++) {
              if (get(x, y + v) === BLOCKS.VACUUM) set(x, y + v, BLOCKS.VINE);
              else break;
            }
            break;
          }
        }
      }
    } else if (band === 'fungal') {
      // Bioluminescent mycelial moss & giant glow mushrooms
      set(x, sy, BLOCKS.MYCELIUM);
      if (wrand() < 0.2 && get(x, sy - 1) === BLOCKS.VACUUM) set(x, sy - 1, BLOCKS.MUSHROOM);
      if (wrand() < 0.1 && get(x, sy - 1) === BLOCKS.VACUUM) set(x, sy - 1, BLOCKS.SPORE_POD);
    } else if (band === 'sulphur') {
      // Geothermal sulphur fields
      set(x, sy, BLOCKS.SULPHUR);
      if (wrand() < 0.25) set(x, sy + 1, BLOCKS.SULPHUR);
    }
  }

  // 5. Geothermal Steam Vents (Sulphur Caldera & Underwater Seabed Vents)
  // Continental Geysers
  for (let x = 880; x < 1020; x += 16 + Math.floor(wrand() * 18)) {
    const sy = surfaceHeights[x];
    if (get(x, sy) === BLOCKS.VACUUM) continue;
    set(x, sy - 1, BLOCKS.ROCK);
    set(x, sy - 2, BLOCKS.ROCK);
    set(x, sy - 3, BLOCKS.STEAM);
    geyserVents.push({ x, y: sy - 3 });
  }

  // Deep Underwater Ocean Hydrothermal Vents
  for (let x = 20; x < OCEAN_LEFT_WIDTH - 20; x += 30 + Math.floor(wrand() * 25)) {
    const sy = surfaceHeights[x];
    set(x, sy - 1, BLOCKS.STEAM);
    geyserVents.push({ x, y: sy - 1 });
  }
  for (let x = CFG.MAP_W - OCEAN_RIGHT_WIDTH + 20; x < CFG.MAP_W - 20; x += 30 + Math.floor(wrand() * 25)) {
    const sy = surfaceHeights[x];
    set(x, sy - 1, BLOCKS.STEAM);
    geyserVents.push({ x, y: sy - 1 });
  }

  // 6. Subterranean Liquid Pools
  for (let x = OCEAN_LEFT_WIDTH; x < CFG.MAP_W - OCEAN_RIGHT_WIDTH; x++) {
    for (let y = 200; y < 350; y++) {
      if (get(x, y) === BLOCKS.VACUUM && get(x, y + 1) !== BLOCKS.VACUUM && wrand() < 0.2) {
        set(x, y, BLOCKS.WATER);
      }
    }
    for (let y = 350; y < 450; y++) {
      if (get(x, y) === BLOCKS.VACUUM && get(x, y + 1) !== BLOCKS.VACUUM && wrand() < 0.15) {
        set(x, y, BLOCKS.SLUDGE);
      }
    }
  }

  // 7. Place The Eight Wardens + Worldheart Altars
  const setShrine = (x: number, y: number, boss: string) => {
    set(x, y, BLOCKS.ALTAR);
    altarTiles[getIndex(x, y)] = 'altar_tl';
    set(x + 1, y, BLOCKS.ALTAR);
    altarTiles[getIndex(x + 1, y)] = 'altar_tr';
    set(x, y + 1, BLOCKS.ALTAR);
    altarTiles[getIndex(x, y + 1)] = 'altar_bl';
    set(x + 1, y + 1, BLOCKS.ALTAR);
    altarTiles[getIndex(x + 1, y + 1)] = 'altar_br';
    altars.push({ x, y, boss });
  };

  const bossOrders = [
    { boss: 'warden', y0: 140, y1: 185 },
    { boss: 'forgemaster', y0: 155, y1: 195 },
    { boss: 'hiveMind', y0: 250, y1: 310 },
    { boss: 'tyrant', y0: 280, y1: 340 },
    { boss: 'sovereign', y0: 360, y1: 420 },
    { boss: 'maw', y0: 380, y1: 435 },
    { boss: 'coreGuardian', y0: 465, y1: 515 },
    { boss: 'wyrm', y0: 480, y1: 524 },
    { boss: 'worldheart', y0: 536, y1: 544 } // Sovereign Citadel right above the Boiling Lake of Lava
  ];

  for (const b of bossOrders) {
    let placed = false;
    // Keep bosses within the continental landmass (x = 180 to CFG.MAP_W - 180)
    const minX = OCEAN_LEFT_WIDTH + 45;
    const maxX = CFG.MAP_W - OCEAN_RIGHT_WIDTH - 45;
    const span = maxX - minX;
    const x0 = minX + Math.floor(wrand() * span);

    if (b.boss === 'worldheart') {
      // Carve out obsidian citadel platform hovering in the Core Vault directly over the magma sea
      const cx = Math.floor(CFG.MAP_W / 2);
      const cy = 540;
      // Build obsidian support foundation
      for (let ox = -6; ox <= 7; ox++) {
        set(cx + ox, cy + 2, BLOCKS.OBSIDIAN);
        set(cx + ox, cy + 3, BLOCKS.OBSIDIAN);
        for (let oy = -4; oy <= 1; oy++) {
          set(cx + ox, cy + oy, BLOCKS.VACUUM);
        }
      }
      setShrine(cx, cy, 'worldheart');
      placed = true;
    } else {
      for (let k = 0; k < span && !placed; k++) {
        const x = minX + ((x0 - minX + k) % span);
        for (let y = b.y0; y <= b.y1 && !placed; y++) {
          if (
            get(x, y) === BLOCKS.VACUUM &&
            get(x + 1, y) === BLOCKS.VACUUM &&
            get(x, y + 1) === BLOCKS.VACUUM &&
            get(x + 1, y + 1) === BLOCKS.VACUUM &&
            get(x, y + 2) !== BLOCKS.VACUUM &&
            get(x + 1, y + 2) !== BLOCKS.VACUUM &&
            get(x, y - 1) === BLOCKS.VACUUM &&
            get(x + 1, y - 1) === BLOCKS.VACUUM
          ) {
            setShrine(x, y, b.boss);
            placed = true;
          }
        }
      }
      if (!placed) {
        const x = minX + Math.floor(wrand() * span);
        const y = Math.floor((b.y0 + b.y1) / 2);
        set(x, y, BLOCKS.VACUUM);
        set(x + 1, y, BLOCKS.VACUUM);
        set(x, y + 1, BLOCKS.VACUUM);
        set(x + 1, y + 1, BLOCKS.VACUUM);
        set(x, y + 2, BLOCKS.ROCK);
        set(x + 1, y + 2, BLOCKS.ROCK);
        setShrine(x, y, b.boss);
      }
    }
  }

  // 8. Test Infrastructure on Continental Surface
  const testX = Math.floor(CFG.MAP_W / 2) + 12;
  set(testX, surfaceHeights[testX] - 1, BLOCKS.SOLAR);
  set(testX + 1, surfaceHeights[testX] - 1, BLOCKS.CONDUIT);
  set(testX + 2, surfaceHeights[testX] - 1, BLOCKS.TURRET);

  // 9. Initial Fog of War: Ocean, sky, and continental surface revealed
  for (let x = 0; x < CFG.MAP_W; x++) {
    const isOcean = x < OCEAN_LEFT_WIDTH || x > CFG.MAP_W - 1 - OCEAN_RIGHT_WIDTH;
    const revealLimit = isOcean ? SEA_LEVEL + 6 : surfaceHeights[x] + 2;
    for (let y = 0; y <= revealLimit; y++) {
      explored[getIndex(x, y)] = 1;
    }
  }

  return {
    ids,
    hp,
    powered,
    scanned,
    explored,
    surfaceHeights,
    altars,
    altarTiles,
    geyserVents,
    initialEnemies,
    getIndex,
    get,
    set
  };
}
