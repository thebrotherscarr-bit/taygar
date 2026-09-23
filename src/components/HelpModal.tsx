import React from 'react';
import { X, Keyboard, Compass, ShieldAlert, Award } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">SURVIVAL OPERATING MANUAL</h2>
            <span className="text-xs text-slate-400">· [H]</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Controls Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <Keyboard className="w-4 h-4" />
              <span>MOVEMENT & TACTICAL CONTROLS</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Horizontal Movement:</span>
                <span className="font-mono text-cyan-300 font-bold">A / D</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Jump / Fast-fall Dive:</span>
                <span className="font-mono text-cyan-300 font-bold">W / S</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Jetpack Thrust [JET]:</span>
                <span className="font-mono text-cyan-300 font-bold">SPACE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Camera Zoom In / Out:</span>
                <span className="font-mono text-cyan-300 font-bold">Mouse Wheel / + and -</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Primary Tool / Fire Weapon:</span>
                <span className="font-mono text-cyan-300 font-bold">Left Mouse Button (LMB)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Spore Grenade (AoE / Blinding):</span>
                <span className="font-mono text-cyan-300 font-bold">Right Mouse Button (RMB) / G</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Emergency Shock Baton:</span>
                <span className="font-mono text-cyan-300 font-bold">V</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Field Consumables:</span>
                <span className="font-mono text-cyan-300 font-bold">Q (HP) · E (Shield) · R (Energy)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Commune with Ancient Altar:</span>
                <span className="font-mono text-cyan-300 font-bold">F</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hotbar Selection (Slots 1-6):</span>
                <span className="font-mono text-cyan-300 font-bold">Keys 1 – 6</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Backpack · Recipes · Tree · Map:</span>
                <span className="font-mono text-cyan-300 font-bold">TAB · B · T · M</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Quick Save & Quick Load:</span>
                <span className="font-mono text-cyan-300 font-bold">F9 (Save) · F10 (Load)</span>
              </div>
            </div>
          </div>

          {/* Tools & Weapons Breakdown */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4" />
              <span>THE 6 INTEGRATED SYSTEM TOOLS</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-red-400">1. Pulse Rifle:</span>{' '}
                <span className="text-slate-300">Long-range rapid plasma projectile. Damages hostile bio-cybernetic units exclusively without destroying terrain.</span>
              </div>
              <div>
                <span className="font-bold text-cyan-400">2. Plasma Cutter:</span>{' '}
                <span className="text-slate-300">Continuous high-thermal mining beam that extracts minerals, cuts solid bedrock, and vaporizes close-range threats.</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400">3. Omni Tool:</span>{' '}
                <span className="text-slate-300">Versatile multi-frequency tool for high-impact point bursts, mineral sampling, and structural construction.</span>
              </div>
              <div>
                <span className="font-bold text-amber-400">4. Disassembly Ray:</span>{' '}
                <span className="text-slate-300">High-yield kinetic blast that shatters manufactured structures, machinery, and rock formations into raw scrap metal and volatile thorium.</span>
              </div>
              <div>
                <span className="font-bold text-purple-400">5. Quantum Beacon:</span>{' '}
                <span className="text-slate-300">Emits acoustic sub-surface sonar waves to illuminate concealed mineral deposits and creates permanent spatial fast-travel waypoints.</span>
              </div>
              <div>
                <span className="font-bold text-orange-400">6. Ion Cannon:</span>{' '}
                <span className="text-slate-300">Heavy capacitor weapon. Unleashes a sweeping fan beam that decimates swarming hostiles across a wide sector.</span>
              </div>
            </div>
          </div>

          {/* End-Game Objectives */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>VICTORY CONDITION: SECURING THE CORE</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              The planet is guarded by <span className="text-amber-300 font-bold">The Eight Wardens</span>, sealed inside ancient monolith shrines spread across the four depth strata. Collect tributes (Titanium, Silicon, Mycelium, Crystal, Thorium, Obsidian), approach each altar, and press <kbd className="px-1 bg-amber-400 text-slate-950 font-bold rounded">F</kbd> to awaken them.
            </p>
            <p className="leading-relaxed text-slate-300 mt-2">
              Defeating all eight Wardens shatters the protective energy barriers surrounding <span className="text-red-400 font-bold">The Worldheart</span> in the Molten Core Abyss. Slay the Worldheart to stabilize the tectonic grid and achieve <span className="text-emerald-400 font-bold">CORE SECURED</span> status!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
