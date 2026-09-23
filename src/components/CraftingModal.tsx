import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { BLOCKS, BLOCK_DATA } from '../game/types';
import { Sound } from '../game/audio';
import { X, Shield, Heart, Zap, Bomb, Anchor, Crosshair, Wrench } from 'lucide-react';

interface CraftingModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'survival' | 'armor' | 'upgrades' | 'tech'>('all');
  const p = engine.player;

  const canAfford = (cost: any) => {
    for (const res in cost) {
      if ((p.inventory[res] || 0) < cost[res]) return false;
    }
    return true;
  };

  const spendCost = (cost: any) => {
    for (const res in cost) {
      p.inventory[res] = (p.inventory[res] || 0) - cost[res];
    }
  };

  const recipes = [
    // Consumables
    {
      id: 'medkit',
      name: 'MEDKIT',
      cat: 'survival',
      desc: 'Restores +45 hull integrity on demand [Key Q]',
      cost: { [BLOCKS.SCRAP]: 4, [BLOCKS.SILICON]: 2 },
      craft: () => {
        p.crafted.medkit++;
        Sound.playItemPickup();
      }
    },
    {
      id: 'fuelcell',
      name: 'FUEL CELL',
      cat: 'survival',
      desc: 'Restores +45 deflector shields immediately [Key E]',
      cost: { [BLOCKS.TITANIUM]: 2, [BLOCKS.SILICON]: 2 },
      craft: () => {
        p.crafted.fuelcell++;
        Sound.playShieldDeflect();
      }
    },
    {
      id: 'energycell',
      name: 'ENERGY CELL',
      cat: 'survival',
      desc: 'Instantly refills blaster energy capacitor [Key R]',
      cost: { [BLOCKS.SCRAP]: 2, THORIUM: 2 },
      craft: () => {
        p.crafted.energycell++;
        Sound.playItemPickup();
      }
    },
    {
      id: 'spore_grenade',
      name: 'SPORE GRENADE',
      cat: 'survival',
      desc: 'Heavy auxiliary weapon: high AoE damage + blinds targets [Key G / RMB]',
      cost: { [BLOCKS.MYCELIUM]: 3, [BLOCKS.SCRAP]: 2 },
      craft: () => {
        p.crafted.sporeGrenade = (p.crafted.sporeGrenade || 0) + 1;
        Sound.playItemPickup();
      }
    },

    // Armor Rigs
    {
      id: 'armor_scrap',
      name: 'SCRAP SUIT',
      cat: 'armor',
      desc: 'Light riveted field armor: +5 defense rating',
      cost: { [BLOCKS.SCRAP]: 15 },
      craft: () => engine.equipArmor('scrap')
    },
    {
      id: 'armor_titanium',
      name: 'TITANIUM RIG',
      cat: 'armor',
      desc: 'Reinforced industrial exosuit: +12 defense, +10 max HP',
      cost: { [BLOCKS.TITANIUM]: 10, [BLOCKS.SILICON]: 5 },
      craft: () => engine.equipArmor('titanium')
    },
    {
      id: 'armor_crystal',
      name: 'CRYSTAL WEAVE',
      cat: 'armor',
      desc: 'Prismatic kinetic weave: +18 defense, 10% damage reflection',
      cost: { [BLOCKS.CRYSTAL]: 8 },
      craft: () => engine.equipArmor('crystal')
    },
    {
      id: 'armor_obsidian',
      name: 'OBSIDIAN PLATE',
      cat: 'armor',
      desc: 'Tectonic mantle plate: +25 defense, 100% LAVA & FIRE IMMUNITY',
      cost: { [BLOCKS.OBSIDIAN]: 6 },
      craft: () => engine.equipArmor('obsidian')
    },

    // Permanent Upgrades
    {
      id: 'tool_upgrade',
      name: 'WEAPON OVERCLOCK',
      cat: 'upgrades',
      desc: `Overclocks active tool (${engine.tools[engine.activeTool].name}): +10 damage (Cap 3)`,
      cost: { [BLOCKS.CRYSTAL]: 4, THORIUM: 4 },
      capped: () => (engine.tools[engine.activeTool].oc || 0) >= 3,
      craft: () => {
        const cur = engine.tools[engine.activeTool];
        cur.damage += 10;
        cur.oc = (cur.oc || 0) + 1;
        Sound.playLevelUp();
      }
    },
    {
      id: 'beam_upgrade',
      name: 'BEAM CORE UPGRADE',
      cat: 'upgrades',
      desc: 'Enhances all energy beams (+5 dmg) and adds +10 max capacitor (Cap LV5)',
      cost: { [BLOCKS.CRYSTAL]: 6, [BLOCKS.TITANIUM]: 4, THORIUM: 3 },
      capped: () => p.beamLevel >= 5,
      craft: () => {
        p.beamLevel++;
        for (const t of engine.tools) t.damage += 5;
        p.maxEnergy += 10;
        p.energy = p.maxEnergy;
        Sound.playLevelUp();
      }
    },
    {
      id: 'hp_boost',
      name: 'HULL REINFORCEMENT',
      cat: 'upgrades',
      desc: 'Permanently increases maximum hull integrity by +25 HP (Cap 4)',
      cost: { [BLOCKS.OBSIDIAN]: 3, [BLOCKS.TITANIUM]: 5 },
      capped: () => (p.hpBoost || 0) >= 4,
      craft: () => {
        p.hpBoost = (p.hpBoost || 0) + 1;
        engine.recalcVitals();
        p.hp = p.maxHp;
        Sound.playLevelUp();
      }
    },
    {
      id: 'shield_boost',
      name: 'SHIELD CAPACITOR +25',
      cat: 'upgrades',
      desc: 'Permanently boosts maximum deflector shield capacity by +25 (Cap 4)',
      cost: { [BLOCKS.TITANIUM]: 5, [BLOCKS.SILICON]: 4 },
      capped: () => (p.shieldBoost || 0) >= 4,
      craft: () => {
        p.shieldBoost = (p.shieldBoost || 0) + 1;
        engine.recalcVitals();
        p.shield = p.maxShield;
        Sound.playShieldDeflect();
      }
    },
    {
      id: 'jetpack_boost',
      name: 'JETPACK TURBO INJECTOR',
      cat: 'upgrades',
      desc: 'Expands jetpack fuel tank by +50 max thrust (Cap 3)',
      cost: { [BLOCKS.TITANIUM]: 8, [BLOCKS.SCRAP]: 6 },
      capped: () => (p.jetBoost || 0) >= 3,
      craft: () => {
        p.jetBoost = (p.jetBoost || 0) + 1;
        p.maxJet += 50;
        p.jet = p.maxJet;
        Sound.playLevelUp();
      }
    },

    // Tech Deployables
    {
      id: 'beacon',
      name: 'QUANTUM BEACON',
      cat: 'tech',
      desc: 'Spatial anchor waypoint for instant fast travel and sub-surface sonar scans',
      cost: { [BLOCKS.SILICON]: 3, [BLOCKS.TITANIUM]: 2 },
      craft: () => {
        engine.placeWaypoint();
      }
    },
    {
      id: 'turret',
      name: 'AUTOMATED DEFENSE TURRET',
      cat: 'tech',
      desc: 'Places an autonomous perimeter defense turret that engages hostile lifeforms',
      cost: { [BLOCKS.TITANIUM]: 6, [BLOCKS.SCRAP]: 4 },
      craft: () => {
        const tx = Math.floor((p.x + p.w / 2) / 16);
        const ty = Math.floor((p.y + p.h / 2) / 16) + 1;
        if (engine.map.get(tx, ty) === BLOCKS.VACUUM) {
          engine.map.set(tx, ty, BLOCKS.TURRET);
          engine.spawnFloatingText(tx * 16, ty * 16 - 8, 'DEFENSE TURRET DEPLOYED', '#8d0801');
          Sound.playItemPickup();
        }
      }
    }
  ];

  const filtered = recipes.filter(r => activeTab === 'all' || r.cat === activeTab);

  const getResourceName = (key: string | number) => {
    if (key === 'THORIUM') return 'Thorium';
    return BLOCK_DATA[Number(key)]?.name || String(key);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">CRAFTING & RECIPE WORKSHOP</h2>
            <span className="text-xs text-slate-400">· [B]</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Blueprints
          </button>
          <button
            onClick={() => setActiveTab('survival')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'survival' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Consumables
          </button>
          <button
            onClick={() => setActiveTab('armor')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'armor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Exosuit Rigs
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'upgrades' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overclocks & Hull
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'tech' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tactical Tech
          </button>
        </div>

        {/* Recipe Cards List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filtered.map(recipe => {
            const affordable = canAfford(recipe.cost);
            const isCapped = recipe.capped && recipe.capped();

            return (
              <div
                key={recipe.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  isCapped
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : affordable
                    ? 'bg-slate-950/80 border-slate-700/80 hover:border-cyan-500/50 shadow-md'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{recipe.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {recipe.cat}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{recipe.desc}</p>

                  {/* Cost Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Cost:</span>
                    {Object.entries(recipe.cost).map(([resKey, amt]) => {
                      const userHas = p.inventory[resKey] || 0;
                      const hasEnough = userHas >= amt;
                      return (
                        <span
                          key={resKey}
                          className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                            hasEnough
                              ? 'bg-slate-900 border-slate-700 text-emerald-400'
                              : 'bg-red-950/50 border-red-900/60 text-red-300'
                          }`}
                        >
                          {getResourceName(resKey)}: {userHas}/{amt}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 shrink-0">
                  <button
                    disabled={!affordable || isCapped}
                    onClick={() => {
                      if (!affordable || isCapped) return;
                      spendCost(recipe.cost);
                      recipe.craft();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all shadow-md ${
                      isCapped
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : affordable
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                        : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    {isCapped ? 'MAX LEVEL' : affordable ? 'CRAFT NOW' : 'LACKING MATERIALS'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
