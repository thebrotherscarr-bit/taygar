/**
 * C.O.R.E. - Procedural SVG Sprite Engine
 * Generates cached, high-contrast crisp pixel-art SVG sprites as HTMLImageElements.
 */

const svgToImage = (svgString: string): HTMLImageElement => {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString.trim());
  return img;
};

export const Sprites: Record<string, any> = {
  // 12x24 Astronaut Player Sprite
  player: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 12 24">
      <rect x="0" y="4" width="4" height="12" fill="#333344" rx="1"/>
      <rect x="1" y="16" width="2" height="3" fill="#ffaa00" opacity="0.8"/>
      <rect x="2" y="2" width="8" height="14" fill="#e2e8f0" rx="3"/>
      <rect x="5" y="4" width="6" height="5" fill="#00f3ff" rx="1"/>
      <rect x="7" y="5" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      <rect x="3" y="15" width="3" height="9" fill="#cbd5e1" rx="1"/>
      <rect x="7" y="15" width="3" height="9" fill="#94a3b8" rx="1"/>
      <circle cx="6" cy="10" r="1.5" fill="#38bdf8"/>
    </svg>
  `),

  // 16x16 Scrap Metal Tile
  scrap: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2b120a"/>
      <rect x="1" y="1" width="7" height="7" fill="#8a3b2e"/>
      <rect x="9" y="8" width="6" height="7" fill="#6a2a1f"/>
      <circle cx="4" cy="4" r="1" fill="#d98a6a"/>
      <circle cx="12" cy="11" r="1" fill="#d98a6a"/>
      <rect width="16" height="16" fill="none" stroke="#1a0803" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Titanium Ore Tile
  titanium: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#7a9bb5"/>
      <polygon points="0,0 16,0 0,16" fill="#cfe4f2"/>
      <polygon points="16,16 16,4 4,16" fill="#4a6a85"/>
      <rect width="16" height="16" fill="none" stroke="#3a5470" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Silicon Vein Tile
  silicon: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#0d2430"/>
      <polygon points="3,13 8,3 13,6" fill="#00e5d0"/>
      <polygon points="6,14 11,7 14,10" fill="#4ce8f0"/>
      <polygon points="2,14 5,9 8,13" fill="#0891b2"/>
      <rect width="16" height="16" fill="none" stroke="#155e80" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Bio Sludge Tile
  sludge: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2a0505"/>
      <circle cx="4" cy="5" r="3" fill="#d62828"/>
      <circle cx="11" cy="9" r="4" fill="#ef4444"/>
      <circle cx="7" cy="12" r="2" fill="#f2714a"/>
      <rect width="16" height="16" fill="none" stroke="#7f1d1d" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Conduit Tile
  conduit: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2a1006"/>
      <rect x="2" y="5" width="12" height="6" fill="#e0642a" rx="2"/>
      <rect x="4" y="7" width="2" height="2" fill="#ff8c42"/>
      <rect x="7" y="7" width="2" height="2" fill="#ff8c42"/>
      <rect x="10" y="7" width="2" height="2" fill="#ff8c42"/>
      <rect width="16" height="16" fill="none" stroke="#5a1a0a" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Solar Cell Tile
  solar: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2a1406"/>
      <rect x="1" y="1" width="6" height="6" fill="#f4a261"/>
      <rect x="9" y="1" width="6" height="6" fill="#e07a5f"/>
      <rect x="1" y="9" width="6" height="6" fill="#e07a5f"/>
      <rect x="9" y="9" width="6" height="6" fill="#ffb675"/>
      <rect width="16" height="16" fill="none" stroke="#5a1a0a" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Turret Block Tile
  turret: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2d0a0a"/>
      <rect x="4" y="9" width="8" height="5" fill="#7f1d1d"/>
      <rect x="8" y="3" width="2" height="7" fill="#dc2626"/>
      <circle cx="9" cy="3" r="2" fill="#ef4444"/>
      <rect width="16" height="16" fill="none" stroke="#450a0a" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Mantle Rock Tile
  mantle: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2a0e06"/>
      <polygon points="0,0 8,0 4,6" fill="#3d160b"/>
      <polygon points="4,6 10,2 16,8 8,10" fill="#4a1d10"/>
      <polygon points="0,8 4,6 8,16 2,14" fill="#331009"/>
      <rect width="16" height="16" fill="none" stroke="#140603" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Bedrock Tile
  rock: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#a0522d"/>
      <polygon points="0,0 7,0 4,5" fill="#b5653d"/>
      <polygon points="9,2 14,0 16,6 11,7" fill="#8a4524"/>
      <polygon points="0,9 5,7 7,14 2,16" fill="#c07850"/>
      <circle cx="12" cy="12" r="2" fill="#8a4524"/>
      <circle cx="4" cy="11" r="1" fill="#b5653d"/>
      <rect width="16" height="16" fill="none" stroke="#6a321a" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Magma Core Tile
  magma: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#1c0505"/>
      <ellipse cx="5" cy="5" rx="4" ry="3" fill="#ff4500"/>
      <ellipse cx="11" cy="11" rx="4" ry="3" fill="#ff7b00"/>
      <ellipse cx="8" cy="8" rx="2" ry="2" fill="#fbbf24"/>
      <rect width="16" height="16" fill="none" stroke="#7f1d1d" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Mycelium Tile
  mycelium: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#2d1054"/>
      <circle cx="4" cy="4" r="2" fill="#a855f7" opacity="0.8"/>
      <circle cx="12" cy="8" r="3" fill="#7c3aed" opacity="0.7"/>
      <circle cx="6" cy="12" r="2.5" fill="#c084fc" opacity="0.6"/>
      <circle cx="14" cy="14" r="1.5" fill="#a855f7" opacity="0.9"/>
      <rect width="16" height="16" fill="none" stroke="#4c1d95" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Crystal Tile
  crystal: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#0c1929"/>
      <polygon points="3,14 8,2 13,14" fill="#38bdf8" opacity="0.9"/>
      <polygon points="6,14 10,4 14,12" fill="#7dd3fc" opacity="0.7"/>
      <polygon points="1,12 5,5 9,14" fill="#0ea5e9" opacity="0.8"/>
      <rect width="16" height="16" fill="none" stroke="#0369a1" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Obsidian Tile
  obsidian: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#0f0a1a"/>
      <polygon points="0,0 10,0 5,8" fill="#1e1533" opacity="0.8"/>
      <polygon points="6,4 16,0 16,10 10,8" fill="#2a1f3d" opacity="0.6"/>
      <polygon points="0,8 5,8 3,16 0,16" fill="#16102a" opacity="0.7"/>
      <rect width="16" height="16" fill="none" stroke="#0d0820" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Water Tile
  water: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#1e40af" opacity="0.8"/>
      <ellipse cx="4" cy="6" rx="3" ry="1.5" fill="#3b82f6" opacity="0.6"/>
      <ellipse cx="11" cy="10" rx="4" ry="2" fill="#60a5fa" opacity="0.5"/>
      <ellipse cx="7" cy="13" rx="2" ry="1" fill="#93c5fd" opacity="0.4"/>
      <rect width="16" height="16" fill="none" stroke="#1e3a8a" stroke-width="1"/>
    </svg>
  `),

  // 16x16 Quantum Beacon Pylon
  beacon: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="6" y="12" width="4" height="4" fill="#475569"/>
      <rect x="7" y="4" width="2" height="9" fill="#a78bfa"/>
      <polygon points="8,0 11,5 8,8 5,5" fill="#ddd6fe"/>
      <circle cx="8" cy="4" r="1.5" fill="#ffffff"/>
      <circle cx="8" cy="4" r="3" fill="#a78bfa" opacity="0.4"/>
    </svg>
  `),

  // 2x2 Altar Quadrants (The Ancient Warden Shrines)
  altar_tl: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#92400e"/>
      <rect width="16" height="5" fill="#fbbf24"/>
      <rect width="5" height="16" fill="#fbbf24"/>
      <rect x="5" y="5" width="11" height="11" fill="#1e1b2e"/>
      <circle cx="12" cy="12" r="2" fill="#ef4444" opacity="0.8"/>
    </svg>
  `),
  altar_tr: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#92400e"/>
      <rect width="16" height="5" fill="#fbbf24"/>
      <rect x="11" y="0" width="5" height="16" fill="#fbbf24"/>
      <rect x="0" y="5" width="11" height="11" fill="#1e1b2e"/>
      <circle cx="4" cy="12" r="2" fill="#ef4444" opacity="0.8"/>
    </svg>
  `),
  altar_bl: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#92400e"/>
      <rect y="11" width="16" height="5" fill="#fbbf24"/>
      <rect width="5" height="16" fill="#fbbf24"/>
      <rect x="5" y="0" width="11" height="11" fill="#1e1b2e"/>
      <rect x="2" y="12" width="12" height="2" fill="#fbbf24" opacity="0.6"/>
    </svg>
  `),
  altar_br: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#92400e"/>
      <rect y="11" width="16" height="5" fill="#fbbf24"/>
      <rect x="11" y="0" width="5" height="16" fill="#fbbf24"/>
      <rect x="0" y="0" width="11" height="11" fill="#1e1b2e"/>
      <circle cx="3" cy="3" r="2" fill="#ef4444"/>
    </svg>
  `),

  // Flora & Terrain Sprites
  grass: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="2" y="8" width="2" height="8" fill="#16a34a"/>
      <rect x="6" y="6" width="2" height="10" fill="#22c55e"/>
      <rect x="10" y="7" width="2" height="9" fill="#16a34a"/>
      <rect x="13" y="9" width="2" height="7" fill="#15803d"/>
      <circle cx="7" cy="5" r="2" fill="#4ade80"/>
    </svg>
  `),
  mushroom: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="7" y="10" width="2" height="6" fill="#d4d4d8"/>
      <ellipse cx="8" cy="9" rx="6" ry="4" fill="#a855f7"/>
      <circle cx="5" cy="8" r="1.5" fill="#e9d5ff"/>
      <circle cx="10" cy="7" r="1" fill="#e9d5ff"/>
    </svg>
  `),
  crystalFlower: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="7" y="10" width="2" height="6" fill="#0ea5e9"/>
      <polygon points="8,2 5,8 11,8" fill="#38bdf8"/>
      <polygon points="3,5 7,9 8,3" fill="#7dd3fc"/>
      <polygon points="13,5 9,9 8,3" fill="#7dd3fc"/>
      <circle cx="8" cy="6" r="2" fill="#bae6fd"/>
    </svg>
  `),
  vine: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="7" y="0" width="2" height="16" fill="#15803d"/>
      <circle cx="5" cy="4" r="2" fill="#22c55e"/>
      <circle cx="10" cy="8" r="2" fill="#16a34a"/>
      <circle cx="6" cy="12" r="1.5" fill="#22c55e"/>
    </svg>
  `),
  sporePod: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <ellipse cx="8" cy="10" rx="5" ry="6" fill="#6b21a8"/>
      <ellipse cx="8" cy="9" rx="3" ry="4" fill="#9333ea"/>
      <circle cx="6" cy="8" r="1" fill="#c084fc"/>
    </svg>
  `),
  snow: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#e2e8f0"/>
      <rect x="2" y="3" width="2" height="2" fill="#f1f5f9" opacity="0.8"/>
      <rect x="8" y="6" width="3" height="2" fill="#f8fafc" opacity="0.6"/>
    </svg>
  `),
  steam: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path d="M5 15 C3 12 7 10 5 7 C4 5 6 3 5 1" stroke="#cbd5e1" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M11 15 C9 12 13 10 11 7 C10 5 12 3 11 1" stroke="#f1f5f9" stroke-width="2" fill="none" opacity="0.7"/>
    </svg>
  `),
  redrock: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#8f3226"/>
      <rect y="5" width="16" height="2" fill="#b0402e"/>
      <rect y="11" width="16" height="2" fill="#6e251c"/>
      <rect x="3" y="2" width="3" height="2" fill="#c65a44"/>
    </svg>
  `),
  sulphur: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#8a6d0b"/>
      <polygon points="8,1 12,8 8,15 4,8" fill="#eab308"/>
      <polygon points="8,4 10,8 8,12 6,8" fill="#fef08a"/>
    </svg>
  `),
  methane: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#14532d"/>
      <rect width="16" height="5" fill="#4ade80" opacity="0.85"/>
      <circle cx="5" cy="10" r="1.5" fill="#86efac" opacity="0.7"/>
    </svg>
  `),

  // Parallax Backdrops
  bgTech: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#131c2b"/>
      <rect y="7" width="16" height="2" fill="#26334d"/>
      <rect x="7" width="2" height="16" fill="#26334d"/>
      <circle cx="4" cy="4" r="1" fill="#3b5878"/>
      <circle cx="12" cy="12" r="1" fill="#3b5878"/>
    </svg>
  `),
  bgFungal: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#1c0f2b"/>
      <path d="M0 12 C4 10 6 14 10 12 C12 11 14 12 16 11 L16 16 L0 16 Z" fill="#2a1650"/>
      <circle cx="4" cy="4" r="1.5" fill="#7e22ce" opacity="0.8"/>
    </svg>
  `),
  bgCrystal: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#081826"/>
      <polygon points="4,14 6,6 8,14" fill="#0ea5e9" opacity="0.55"/>
      <polygon points="10,14 12,4 14,14" fill="#38bdf8" opacity="0.45"/>
    </svg>
  `),
  bgMolten: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#1a0e0a"/>
      <path d="M2 0 L4 7 L2 12 L5 16" stroke="#ff4500" stroke-width="1" fill="none" opacity="0.7"/>
      <path d="M11 0 L9 6 L12 11 L10 16" stroke="#fbbf24" stroke-width="1" fill="none" opacity="0.6"/>
    </svg>
  `),

  // Enemies
  drone: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
      <circle cx="7" cy="7" r="5" fill="#1e293b"/>
      <circle cx="7" cy="7" r="2.5" fill="#ef4444"/>
      <polygon points="0,5 3,7 0,9" fill="#94a3b8"/>
      <polygon points="14,5 11,7 14,9" fill="#94a3b8"/>
    </svg>
  `),
  bot: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="2" y="4" width="12" height="8" fill="#475569" rx="2"/>
      <rect x="10" y="6" width="3" height="3" fill="#fbbf24"/>
      <rect x="1" y="12" width="14" height="4" fill="#1e293b" rx="1"/>
      <circle cx="3" cy="14" r="1" fill="#94a3b8"/>
      <circle cx="8" cy="14" r="1" fill="#94a3b8"/>
      <circle cx="13" cy="14" r="1" fill="#94a3b8"/>
    </svg>
  `),
  crawler: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="3" y="5" width="10" height="6" fill="#4a5568" rx="2"/>
      <circle cx="5" cy="7" r="1.5" fill="#ef4444"/>
      <circle cx="11" cy="7" r="1.5" fill="#ef4444"/>
      <line x1="1" y1="8" x2="4" y2="6" stroke="#718096" stroke-width="1.5"/>
      <line x1="15" y1="8" x2="12" y2="6" stroke="#718096" stroke-width="1.5"/>
      <line x1="1" y1="12" x2="4" y2="10" stroke="#718096" stroke-width="1.5"/>
      <line x1="15" y1="12" x2="12" y2="10" stroke="#718096" stroke-width="1.5"/>
    </svg>
  `),
  sporeSac: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <ellipse cx="8" cy="10" rx="6" ry="5" fill="#6b21a8"/>
      <ellipse cx="8" cy="8" rx="4" ry="3" fill="#7c3aed"/>
      <circle cx="5" cy="7" r="1" fill="#c084fc" opacity="0.8"/>
      <circle cx="11" cy="9" r="1.5" fill="#a855f7" opacity="0.7"/>
    </svg>
  `),
  crystalGolem: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="2" y="3" width="12" height="10" fill="#0ea5e9" rx="1"/>
      <polygon points="4,3 8,0 12,3" fill="#38bdf8"/>
      <rect x="5" y="5" width="2" height="2" fill="#bae6fd"/>
      <rect x="9" y="5" width="2" height="2" fill="#bae6fd"/>
      <rect x="3" y="13" width="4" height="3" fill="#0284c7"/>
      <rect x="9" y="13" width="4" height="3" fill="#0284c7"/>
    </svg>
  `),
  magmaSerpent: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <ellipse cx="8" cy="8" rx="7" ry="4" fill="#dc2626"/>
      <ellipse cx="8" cy="8" rx="5" ry="3" fill="#f97316"/>
      <circle cx="3" cy="7" r="1.5" fill="#fbbf24"/>
      <circle cx="13" cy="7" r="1.5" fill="#fbbf24"/>
    </svg>
  `),
  sentinel: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="3" y="2" width="10" height="10" fill="#1e293b" rx="2"/>
      <circle cx="8" cy="6" r="3" fill="#ef4444" opacity="0.9"/>
      <circle cx="8" cy="6" r="1.5" fill="#ffffff"/>
      <rect x="6" y="12" width="4" height="4" fill="#334155"/>
    </svg>
  `),
  stalker: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <polygon points="6,0 12,12 0,12" fill="#1e1b4b" opacity="0.85"/>
      <circle cx="6" cy="7" r="2" fill="#818cf8" opacity="0.95"/>
    </svg>
  `),
  swarmBot: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="4" y="5" width="8" height="7" fill="#0f766e" rx="2"/>
      <circle cx="8" cy="8" r="2" fill="#ef4444"/>
    </svg>
  `),
  shrieker: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18">
      <rect x="3" y="1" width="8" height="16" fill="#7e22ce" rx="3"/>
      <circle cx="5" cy="4" r="1" fill="#fde047"/>
      <circle cx="9" cy="4" r="1" fill="#fde047"/>
      <ellipse cx="7" cy="12" rx="3" ry="4" fill="#3b0764"/>
    </svg>
  `),
  crystalWraith: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
      <polygon points="7,0 13,8 9,14 5,14 1,8" fill="#67e8f9" opacity="0.85"/>
      <polygon points="7,3 10,8 8,12 6,12 4,8" fill="#e0f2fe" opacity="0.9"/>
    </svg>
  `),
  magmaHound: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="12">
      <rect x="2" y="4" width="11" height="6" fill="#7f1d1d" rx="2"/>
      <rect x="11" y="2" width="6" height="6" fill="#991b1b" rx="1"/>
      <circle cx="15" cy="4" r="1.5" fill="#fbbf24"/>
    </svg>
  `),
  sporeCloud: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <circle cx="4" cy="7" r="3" fill="#a855f7" opacity="0.85"/>
      <circle cx="8" cy="6" r="3.5" fill="#9333ea" opacity="0.85"/>
    </svg>
  `),
  scrapTitan: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <rect x="2" y="4" width="20" height="16" fill="#475569" rx="2"/>
      <rect x="9" y="12" width="6" height="6" fill="#f97316"/>
      <circle cx="6" cy="8" r="1.5" fill="#e2e8f0"/>
      <circle cx="17" cy="8" r="1.5" fill="#e2e8f0"/>
    </svg>
  `),
  phantom: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
      <ellipse cx="7" cy="7" rx="5" ry="6" fill="#ddd6fe" opacity="0.8"/>
      <circle cx="5" cy="6" r="1" fill="#4c1d95"/>
      <circle cx="9" cy="6" r="1" fill="#4c1d95"/>
    </svg>
  `),
  lumipede: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="8">
      <circle cx="3" cy="4" r="3" fill="#0e7490"/>
      <circle cx="8" cy="4" r="3" fill="#0e7490"/>
      <circle cx="13" cy="4" r="3" fill="#0e7490"/>
      <circle cx="18" cy="4" r="2" fill="#0e7490"/>
      <circle cx="3" cy="4" r="1" fill="#a5f3fc"/>
    </svg>
  `),
  ashWraith: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16">
      <ellipse cx="7" cy="8" rx="5" ry="7" fill="#57534e" opacity="0.85"/>
      <circle cx="5" cy="6" r="1" fill="#fb923c"/>
      <circle cx="9" cy="6" r="1" fill="#fb923c"/>
    </svg>
  `),
  sentry: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="2" y="6" width="12" height="10" fill="#475569" rx="2"/>
      <rect x="4" y="10" width="8" height="2" fill="#00e5d0"/>
    </svg>
  `),
  mite: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10">
      <ellipse cx="6" cy="5" rx="4" ry="3" fill="#7e22ce"/>
      <circle cx="6" cy="5" r="1.5" fill="#d8b4fe"/>
    </svg>
  `),
  bloom: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <ellipse cx="10" cy="12" rx="8" ry="7" fill="#581c87"/>
      <circle cx="7" cy="10" r="1.5" fill="#d8b4fe"/>
      <circle cx="13" cy="11" r="1.5" fill="#d8b4fe"/>
    </svg>
  `),
  strangler: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <rect x="7" y="2" width="4" height="14" fill="#15803d"/>
      <ellipse cx="9" cy="14" rx="6" ry="3" fill="#14532d"/>
    </svg>
  `),
  shardling: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <polygon points="6,0 10,8 6,12 2,8" fill="#67e8f9" opacity="0.9"/>
    </svg>
  `),
  prism: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <polygon points="8,1 15,13 1,13" fill="#0ea5e9" opacity="0.85"/>
      <circle cx="8" cy="10" r="1.5" fill="#ffffff"/>
    </svg>
  `),
  geodon: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <rect x="3" y="6" width="14" height="12" fill="#57534e" rx="3"/>
      <rect x="5" y="2" width="4" height="6" fill="#a5f3fc"/>
    </svg>
  `),
  cinderImp: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <ellipse cx="6" cy="7" rx="4" ry="4" fill="#7c2d12"/>
      <polygon points="6,0 8,5 4,5" fill="#fbbf24"/>
    </svg>
  `),
  slagGolem: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <rect x="4" y="4" width="14" height="16" fill="#44403c" rx="3"/>
      <rect x="6" y="6" width="10" height="2" fill="#ff4500"/>
    </svg>
  `),
  pyroSac: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <ellipse cx="8" cy="10" rx="6" ry="5" fill="#9a3412"/>
      <circle cx="8" cy="3" r="1" fill="#ff4500"/>
    </svg>
  `),
  projectile: svgToImage(`
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">
      <circle cx="4" cy="4" r="3" fill="#a855f7" opacity="0.85"/>
      <circle cx="4" cy="4" r="1.5" fill="#ffffff"/>
    </svg>
  `)
};

(Sprites as any).get = (key: string): HTMLImageElement | undefined => {
  return Sprites[key] || Sprites.player;
};

export const SPRITE_FOR_ID: Record<number, string> = {
  1: 'scrap',
  2: 'titanium',
  3: 'silicon',
  4: 'sludge',
  5: 'conduit',
  6: 'solar',
  7: 'turret',
  8: 'mantle',
  9: 'magma',
  10: 'rock',
  11: 'mycelium',
  12: 'crystal',
  13: 'obsidian',
  14: 'water',
  15: 'grass',
  16: 'mushroom',
  17: 'crystalFlower',
  18: 'vine',
  19: 'sporePod',
  20: 'steam',
  21: 'snow',
  22: 'beacon',
  23: 'altar_tl',
  24: 'redrock',
  25: 'sulphur',
  26: 'methane'
};
