import React from 'react';
import { GameEngine } from '../game/engine';
import { BLOCKS, ARMOR_SETS } from '../game/types';
import { Sound } from '../game/audio';
import { X, Shield, Heart, Zap, Bomb, Anchor } from 'lucide-react';

interface InventoryModalProps {
  engine: GameEngine;
  onClose: () => void;
  onOpenCrafting: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ engine, onClose, onOpenCrafting }) => {
  const p = engine.player;

  const rawResources = [
    { id: BLOCKS.SCRAP, name: 'Scrap Metal', count: p.inventory[BLOCKS.SCRAP] || 0, color: '#a0522d' },
    { id: BLOCKS.TITANIUM, name: 'Titanium Ore', count: p.inventory[BLOCKS.TITANIUM] || 0, color: '#7a9bb5' },
    { id: BLOCKS.SILICON, name: 'Silicon Vein', count: p.inventory[BLOCKS.SILICON] || 0, color: '#00e5d0' },
    { id: 'THORIUM', name: 'Refined Thorium', count: p.inventory.THORIUM || 0, color: '#fbbf24' },
    { id: BLOCKS.MYCELIUM, name: 'Biolum Mycelium', count: p.inventory[BLOCKS.MYCELIUM] || 0, color: '#a855f7' },
    { id: BLOCKS.CRYSTAL, name: 'Prismatic Crystal', count: p.inventory[BLOCKS.CRYSTAL] || 0, color: '#38bdf8' },
    { id: BLOCKS.OBSIDIAN, name: 'Obsidian Plate', count: p.inventory[BLOCKS.OBSIDIAN] || 0, color: '#94a3b8' }
  ];

  const relics = [
    { key: 'RELIC_WARDEN', name: 'Warden Coils', desc: 'Plasma bolts pierce +2 targets', owned: engine.hasRelic('RELIC_WARDEN') },
    { key: 'RELIC_HIVE', name: 'Hive Spore Core', desc: 'Projectiles blind targets on impact', owned: engine.hasRelic('RELIC_HIVE') },
    { key: 'RELIC_CORE', name: 'Guardian Heart', desc: 'Projectiles seek nearest enemies', owned: engine.hasRelic('RELIC_CORE') }
  ];

  const currentArmor = engine.equipment.chest ? ARMOR_SETS[engine.equipment.chest] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">SURVIVAL BACKPACK & RIG</h2>
            <span className="text-xs text-slate-400">· [TAB]</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Equipped Armor Loadout */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-between">
              <span>ACTIVE EXOSUIT RIG</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenCrafting();
                }}
                className="text-cyan-400 hover:underline text-xs"
              >
                Craft Upgraded Rig →
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center">
                <Shield className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-white">
                  {currentArmor ? currentArmor.name : 'Standard EVA Light Suit'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Defense: <span className="font-mono text-cyan-300 font-semibold">+{engine.equipment.getDefense()}</span> ·
                  Bonus HP: <span className="font-mono text-emerald-400 font-semibold">+{engine.equipment.getHpBonus()}</span>
                  {currentArmor?.fireImmune && <span className="text-amber-400 font-bold ml-2">· LAVA IMMUNE</span>}
                  {currentArmor?.reflect && <span className="text-sky-400 font-bold ml-2">· +10% REFLECT</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-use Consumables */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
              TACTICAL FIELD CONSUMABLES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Medkit */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="font-mono font-bold text-white text-sm">{p.crafted.medkit}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">MEDKIT</div>
                  <div className="text-[10px] text-slate-400">+45 HP [Q]</div>
                </div>
                <button
                  disabled={p.crafted.medkit <= 0}
                  onClick={() => engine.useConsumable('medkit')}
                  className="mt-2 w-full py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use [Q]
                </button>
              </div>

              {/* Fuel Cell */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span className="font-mono font-bold text-white text-sm">{p.crafted.fuelcell}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">FUEL CELL</div>
                  <div className="text-[10px] text-slate-400">+45 Shield [E]</div>
                </div>
                <button
                  disabled={p.crafted.fuelcell <= 0}
                  onClick={() => engine.useConsumable('fuelcell')}
                  className="mt-2 w-full py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use [E]
                </button>
              </div>

              {/* Energy Cell */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-white text-sm">{p.crafted.energycell}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">ENERGY CELL</div>
                  <div className="text-[10px] text-slate-400">100% Charge [R]</div>
                </div>
                <button
                  disabled={p.crafted.energycell <= 0}
                  onClick={() => engine.useConsumable('energycell')}
                  className="mt-2 w-full py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use [R]
                </button>
              </div>

              {/* Spore Grenade */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Bomb className="w-4 h-4 text-purple-400" />
                    <span className="font-mono font-bold text-white text-sm">{p.crafted.sporeGrenade || 0}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">GRENADE</div>
                  <div className="text-[10px] text-slate-400">AoE Blind [G / RMB]</div>
                </div>
                <div className="mt-2 text-center text-[10px] text-purple-300 font-mono py-1">
                  Trigger: G / RMB
                </div>
              </div>
            </div>
          </div>

          {/* Raw Materials Grid */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
              MINED MINERALS & SALVAGE
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {rawResources.map(res => (
                <div
                  key={res.name}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: res.color, boxShadow: `0 0 6px ${res.color}` }}
                    />
                    <span className="text-xs font-medium text-slate-200">{res.name}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">{res.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relics Section */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
              ANCIENT WARDEN RELICS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relics.map(relic => (
                <div
                  key={relic.key}
                  className={`border rounded-xl p-3.5 ${
                    relic.owned
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${relic.owned ? 'text-amber-300' : 'text-slate-400'}`}>
                      {relic.name}
                    </span>
                    <span className={`text-[10px] font-mono ${relic.owned ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {relic.owned ? 'ACTIVE' : 'SEALED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{relic.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anchor Quick Action */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                engine.placeWaypoint();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-semibold transition-colors"
            >
              <Anchor className="w-4 h-4 text-purple-400" />
              <span>Anchor Current Waypoint</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCrafting();
              }}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors shadow-lg"
            >
              Open Crafting Workshop [B]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
