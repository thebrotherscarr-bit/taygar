import React from 'react';
import { GameEngine } from '../game/engine';
import { Sound } from '../game/audio';
import { X, GitBranch, Zap, Shield, Crosshair, Award } from 'lucide-react';

interface UpgradeTreeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const UpgradeTreeModal: React.FC<UpgradeTreeModalProps> = ({ engine, onClose }) => {
  const p = engine.player;
  const tree = engine.tree;

  const buyRifleUpgrade = (type: 'rifleDmg' | 'rifleHaste' | 'rifleSplit') => {
    const costs = {
      rifleDmg: [50, 100, 150],
      rifleHaste: [80, 160],
      rifleSplit: [200]
    };
    const maxRank = { rifleDmg: 3, rifleHaste: 2, rifleSplit: 1 };
    const curRank = tree[type];
    if (curRank >= maxRank[type]) return;
    const cost = costs[type][curRank];
    if (p.xp < cost) return;

    p.xp -= cost;
    tree[type] = curRank + 1;
    Sound.playLevelUp();
    engine.spawnFloatingText(p.x, p.y - 24, 'TECH TREE UPGRADED', '#39ff14');
  };

  const buyBatonUpgrade = (type: 'batonDmg' | 'batonHaste' | 'batonReach') => {
    const costs = {
      batonDmg: [40, 80, 120],
      batonHaste: [60, 120],
      batonReach: [60, 120]
    };
    const maxRank = { batonDmg: 3, batonHaste: 2, batonReach: 2 };
    const curRank = tree[type];
    if (curRank >= maxRank[type]) return;
    const cost = costs[type][curRank];
    if (p.xp < cost) return;

    p.xp -= cost;
    tree[type] = curRank + 1;
    Sound.playLevelUp();
    engine.spawnFloatingText(p.x, p.y - 24, 'SHOCK BATON ENHANCED', '#38bdf8');
  };

  const buyPlatingUpgrade = (suitKey: 'scrap' | 'titanium' | 'crystal' | 'obsidian') => {
    const costs = [60, 120, 180];
    const curRank = tree.plating[suitKey] || 0;
    if (curRank >= 3) return;
    const cost = costs[curRank];
    if (p.xp < cost) return;

    p.xp -= cost;
    tree.plating[suitKey] = curRank + 1;
    engine.recalcVitals();
    Sound.playShieldDeflect();
    engine.spawnFloatingText(p.x, p.y - 24, 'PLATING REINFORCED', '#fbbf24');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">EXPERIENCE & PROGRESSION TECH TREE</h2>
            <span className="text-xs text-slate-400">· [T]</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              <span className="text-slate-400">AVAILABLE:</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums text-sm">{p.xp} XP</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Branch 1: Pulse Weapon Engineering */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <Crosshair className="w-4 h-4" />
              <span>BRANCH 1: PULSE RIFLE & BALLISTICS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Rifle Dmg */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">RIFLE AMPS</span>
                    <span className="text-xs font-mono text-cyan-400">{tree.rifleDmg}/3</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">+4 bolt damage per rank</p>
                </div>
                <button
                  disabled={tree.rifleDmg >= 3 || p.xp < [50, 100, 150][tree.rifleDmg]}
                  onClick={() => buyRifleUpgrade('rifleDmg')}
                  className="w-full py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.rifleDmg >= 3 ? 'MAXED' : `Upgrade (${[50, 100, 150][tree.rifleDmg]} XP)`}
                </button>
              </div>

              {/* Rifle Haste */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">RAPID CYCLING</span>
                    <span className="text-xs font-mono text-cyan-400">{tree.rifleHaste}/2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">-1 shot cooldown interval</p>
                </div>
                <button
                  disabled={tree.rifleHaste >= 2 || p.xp < [80, 160][tree.rifleHaste]}
                  onClick={() => buyRifleUpgrade('rifleHaste')}
                  className="w-full py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.rifleHaste >= 2 ? 'MAXED' : `Upgrade (${[80, 160][tree.rifleHaste]} XP)`}
                </button>
              </div>

              {/* Rifle Split */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">TWIN SPLIT BOLT</span>
                    <span className="text-xs font-mono text-cyan-400">{tree.rifleSplit}/1</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">Fires twin parallel plasma bolts</p>
                </div>
                <button
                  disabled={tree.rifleSplit >= 1 || p.xp < 200 || p.level < 2}
                  onClick={() => buyRifleUpgrade('rifleSplit')}
                  className="w-full py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.rifleSplit >= 1 ? 'MAXED' : p.level < 2 ? 'Requires LV.2' : 'Unlock (200 XP)'}
                </button>
              </div>
            </div>
          </div>

          {/* Branch 2: Shock Baton Sidearm */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
              <Zap className="w-4 h-4" />
              <span>BRANCH 2: SHOCK BATON AUXILIARY [KEY V]</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">KINETIC FORCE</span>
                    <span className="text-xs font-mono text-sky-400">{tree.batonDmg}/3</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">+8 arc damage per rank</p>
                </div>
                <button
                  disabled={tree.batonDmg >= 3 || p.xp < [40, 80, 120][tree.batonDmg]}
                  onClick={() => buyBatonUpgrade('batonDmg')}
                  className="w-full py-1.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.batonDmg >= 3 ? 'MAXED' : `Upgrade (${[40, 80, 120][tree.batonDmg]} XP)`}
                </button>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">REACTIVE FLOW</span>
                    <span className="text-xs font-mono text-sky-400">{tree.batonHaste}/2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">-8 tick swing recovery</p>
                </div>
                <button
                  disabled={tree.batonHaste >= 2 || p.xp < [60, 120][tree.batonHaste]}
                  onClick={() => buyBatonUpgrade('batonHaste')}
                  className="w-full py-1.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.batonHaste >= 2 ? 'MAXED' : `Upgrade (${[60, 120][tree.batonHaste]} XP)`}
                </button>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">IONIZED ARC</span>
                    <span className="text-xs font-mono text-sky-400">{tree.batonReach}/2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">+12px forward sweep radius</p>
                </div>
                <button
                  disabled={tree.batonReach >= 2 || p.xp < [60, 120][tree.batonReach]}
                  onClick={() => buyBatonUpgrade('batonReach')}
                  className="w-full py-1.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  {tree.batonReach >= 2 ? 'MAXED' : `Upgrade (${[60, 120][tree.batonReach]} XP)`}
                </button>
              </div>
            </div>
          </div>

          {/* Branch 3: Exosuit Plating Reinforcement */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4" />
              <span>BRANCH 3: REINFORCED EXOSUIT PLATING (+3 DEFENSE PER RANK)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['scrap', 'titanium', 'crystal', 'obsidian'] as const).map(suit => {
                const rank = tree.plating[suit] || 0;
                const cost = [60, 120, 180][rank];
                return (
                  <div key={suit} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white uppercase">{suit}</span>
                        <span className="text-xs font-mono text-amber-400">{rank}/3</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">+{rank * 3} Passive Def</p>
                    </div>
                    <button
                      disabled={rank >= 3 || p.xp < cost}
                      onClick={() => buyPlatingUpgrade(suit)}
                      className="w-full py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {rank >= 3 ? 'MAX' : `${cost} XP`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* The Eight Relics */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <Award className="w-4 h-4" />
              <span>WARDEN REACTION RELICS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${engine.hasRelic('RELIC_WARDEN') ? 'border-amber-500/80 bg-amber-950/30' : 'border-slate-800 bg-slate-900/40 opacity-50'}`}>
                <div className="text-xs font-bold text-amber-300">WARDEN COILS</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Bolts pierce +2 enemy targets</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Source: The Warden</div>
              </div>

              <div className={`p-3 rounded-lg border ${engine.hasRelic('RELIC_HIVE') ? 'border-amber-500/80 bg-amber-950/30' : 'border-slate-800 bg-slate-900/40 opacity-50'}`}>
                <div className="text-xs font-bold text-amber-300">HIVE SPORE</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Bolts blind hostile ranged units</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Source: The Hive Mind</div>
              </div>

              <div className={`p-3 rounded-lg border ${engine.hasRelic('RELIC_CORE') ? 'border-amber-500/80 bg-amber-950/30' : 'border-slate-800 bg-slate-900/40 opacity-50'}`}>
                <div className="text-xs font-bold text-amber-300">GUARDIAN HEART</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Bolts curve to seek hostile targets</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Source: The Core Guardian</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
