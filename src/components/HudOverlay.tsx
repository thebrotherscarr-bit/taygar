import React from 'react';
import { GameEngine, BOSS_DEFS } from '../game/engine';
import { Sound } from '../game/audio';
import {
  Shield,
  Heart,
  Zap,
  Flame,
  Map as MapIcon,
  BookOpen,
  GitBranch,
  Backpack,
  HelpCircle,
  FileCode2,
  Volume2,
  VolumeX,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';

interface HudOverlayProps {
  engine: GameEngine;
  onOpenModal: (modal: 'inventory' | 'crafting' | 'tree' | 'map' | 'help' | 'architecture') => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  engine,
  onOpenModal,
  muted,
  onToggleMute
}) => {
  const p = engine.player;
  const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  const shPct = Math.max(0, Math.min(100, (p.shield / p.maxShield) * 100));
  const enPct = Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100));
  const jetPct = Math.max(0, Math.min(100, (p.jet / p.maxJet) * 100));
  const depth = Math.floor(p.y / 16);

  // Time formatting
  const gameHour = Math.floor((engine.dayNight.time / engine.dayNight.dayLength) * 24);
  const gameMin = Math.floor(((engine.dayNight.time / engine.dayNight.dayLength) * 24 - gameHour) * 60);
  const timeStr = `${String(gameHour).padStart(2, '0')}:${String(gameMin).padStart(2, '0')}`;
  const isNight = engine.dayNight.isNight;

  const bossesSlain = engine.bossesSlainCount();
  const worldheartUnlocked = engine.isWorldheartUnlocked();
  const activeBoss = engine.activeBoss;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-display">
      {/* Top Header Navigation & Telemetry */}
      <header className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-3 pointer-events-auto">
        {/* Left Telemetry Cluster */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f3ff]" />
            <span className="text-white font-bold tracking-wider text-xs">C.O.R.E.</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Depth Meter */}
          <div className="flex items-baseline gap-1 text-[11px]">
            <span className="text-slate-400">DEPTH:</span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums">{depth}m</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Time & Planetary Phase */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-mono text-slate-200 tabular-nums font-semibold">{timeStr}</span>
            <span className={`px-1 py-0.5 rounded text-[9px] font-bold tracking-wider ${isNight ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50' : 'bg-amber-950 text-amber-300 border border-amber-700/50'}`}>
              {isNight ? 'NIGHT' : 'DAY'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Level & XP */}
          <div className="flex items-baseline gap-1.5 text-[11px]">
            <span className="text-amber-400 font-bold">LV.{p.level}</span>
            <span className="font-mono text-slate-400 tabular-nums text-[10px]">{p.xp} XP</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Wardens Objective */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">WARDENS:</span>
            <span className={`font-mono font-bold ${bossesSlain >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {bossesSlain}/8
            </span>
            {worldheartUnlocked && !engine.objectives.defeated.worldheart && (
              <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold animate-pulse">
                · WORLDHEART UNLOCKED
              </span>
            )}
            {engine.objectives.defeated.worldheart && (
              <span className="text-[9px] text-amber-300 uppercase tracking-wider font-bold">
                · CORE SECURED
              </span>
            )}
          </div>
        </div>

        {/* Right Menu Action Buttons & Camera Zoom */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 shadow-2xl">
          {/* Camera Zoom In / Out */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => engine.setZoom(-0.25)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out [-]"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-cyan-300 w-9 text-center tabular-nums font-semibold">
              {Math.round(engine.targetZoom * 100)}%
            </span>
            <button
              onClick={() => engine.setZoom(0.25)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In [+]"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={() => onOpenModal('inventory')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
            title="Open Backpack [TAB]"
          >
            <Backpack className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bag</span>
            <kbd className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">TAB</kbd>
          </button>

          <button
            onClick={() => onOpenModal('crafting')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
            title="Open Recipe Book [B]"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Craft</span>
            <kbd className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">B</kbd>
          </button>

          <button
            onClick={() => onOpenModal('tree')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
            title="Progression Tech Tree [T]"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span>Tree</span>
            <kbd className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">T</kbd>
          </button>

          <button
            onClick={() => onOpenModal('map')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
            title="Full Tactical Map [M]"
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Map</span>
            <kbd className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">M</kbd>
          </button>

          <button
            onClick={() => onOpenModal('architecture')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-xs font-medium transition-colors"
            title="Game Architecture & Specs"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Specs</span>
          </button>

          <button
            onClick={() => onOpenModal('help')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
            title="Controls & Quick-help [H]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <kbd className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">H</kbd>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* TOP-LEFT DOCKED SURVIVAL VITALS (Never obstructs the play area!) */}
      <div className="absolute top-14 left-2.5 w-60 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-2xl pointer-events-auto">
        {/* Buff Chips & Hazard Warnings */}
        <div className="flex items-center gap-1 mb-1.5 min-h-[14px]">
          {p.poison && (
            <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-purple-950 text-purple-300 border border-purple-700 animate-pulse">
              POISONED
            </span>
          )}
          {p.shield <= 0 && p.maxShield > 0 && !p.dead && (
            <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-sky-950 text-sky-300 border border-sky-700">
              SHIELD COLLAPSE
            </span>
          )}
          {p.hp <= p.maxHp * 0.25 && !p.dead && (
            <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-red-950 text-red-300 border border-red-700 animate-pulse">
              CRITICAL HULL
            </span>
          )}
        </div>

        {/* Health Row (HP) */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center gap-1 w-8 text-[10px] font-bold text-red-400">
            <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400/30" />
            <span>HP</span>
          </div>
          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-100 ${hpPct > 50 ? 'bg-red-500' : hpPct > 25 ? 'bg-orange-500' : 'bg-red-700'}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-200 tabular-nums w-12 text-right">
            {Math.ceil(p.hp)}/{p.maxHp}
          </span>
        </div>

        {/* Shield Row (SH) */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center gap-1 w-8 text-[10px] font-bold text-cyan-400">
            <Shield className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400/30" />
            <span>SH</span>
          </div>
          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-100"
              style={{ width: `${shPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-200 tabular-nums w-12 text-right">
            {Math.ceil(p.shield)}/{p.maxShield}
          </span>
        </div>

        {/* Energy (EN) & Jetpack Fuel (JET) Row */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
          <div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>ENERGY</span>
              </span>
              <span className="font-mono text-amber-300">{Math.ceil(p.energy)}%</span>
            </div>
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${enPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Flame className="w-2 h-2 text-emerald-400" />
                <span>JETPACK</span>
              </span>
              <span className={`font-mono ${jetPct < 25 ? 'text-red-400 animate-pulse font-bold' : 'text-emerald-400'}`}>
                {Math.ceil(p.jet)}%
              </span>
            </div>
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${jetPct < 25 ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${jetPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Boss Bar (Top Center) */}
      {activeBoss && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[440px] pointer-events-auto">
          <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/70 rounded-xl p-2.5 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {activeBoss.def.name}
              </span>
              <span className="font-mono text-slate-300 text-[11px] tabular-nums">
                {Math.max(0, activeBoss.hp)} / {activeBoss.def.hp} HP
              </span>
            </div>

            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-amber-950 mb-1">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-300 transition-all duration-100"
                style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.def.hp) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
              <span>PATTERN: <span className="text-amber-300 uppercase">{activeBoss.pattern}</span></span>
              <span>PHASE {activeBoss.phase + 1} OF {activeBoss.def.phases.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Environmental Hazard Alerts (Top Right Stack) */}
      <div className="absolute top-14 right-2.5 flex flex-col gap-1.5 pointer-events-auto max-w-xs">
        {engine.hazardAlerts.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 p-2 rounded-lg border backdrop-blur-md shadow-lg transition-all animate-in fade-in slide-in-from-right-4 ${
              alert.type === 'danger'
                ? 'bg-red-950/90 border-red-600/80 text-red-200'
                : alert.type === 'warning'
                ? 'bg-amber-950/90 border-amber-600/80 text-amber-200'
                : 'bg-cyan-950/90 border-cyan-600/80 text-cyan-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`} />
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-wide">{alert.title}</div>
              <div className="text-[10px] opacity-90 leading-tight mt-0.5">{alert.message}</div>
            </div>
            <button
              onClick={() => engine.dismissAlert(alert.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Altar Prompt Docked Just Above Hotbar */}
      {(() => {
        const altar = engine.nearestAltar();
        if (altar && !p.dead && BOSS_DEFS[altar.boss]) {
          const key = altar.boss;
          const def = BOSS_DEFS[key];
          const isSlain = engine.objectives.defeated[key];
          if (!isSlain) {
            const isWorldheart = key === 'worldheart';
            const isLocked = isWorldheart && !engine.isWorldheartUnlocked();
            return (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-amber-500/80 rounded-lg px-4 py-1.5 text-center shadow-[0_0_18px_rgba(251,191,36,0.3)] pointer-events-auto">
                {isLocked ? (
                  <div className="text-[11px] text-orange-300 font-semibold">
                    Core Seal Active: Slay all 8 Wardens first ({bossesSlain}/8)
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-200">
                    Press <kbd className="px-1 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px]">F</kbd> to awaken{' '}
                    <span className="font-bold text-amber-300">{def.name}</span>
                  </div>
                )}
              </div>
            );
          }
        }
        return null;
      })()}

      {/* TOOL & WEAPON HOTBAR (Only element at the bottom of the screen!) */}
      <nav aria-label="Tool and Weapon Hotbar" className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-auto">
        {/* Active Tool Sub-label */}
        <div className="text-[10px] tracking-wide text-cyan-300 font-semibold flex items-center gap-1.5 bg-slate-950/75 px-2.5 py-0.5 rounded-full border border-slate-800/80">
          <span>SLOT {engine.activeTool + 1}:</span>
          <span className="text-white font-bold">{engine.tools[engine.activeTool].name}</span>
          <span className="text-slate-400 text-[9px]">— {engine.tools[engine.activeTool].desc}</span>
        </div>

        {/* 6 Weapon / Tool Slots */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 p-1 rounded-xl shadow-2xl">
          {engine.tools.map((tool, idx) => {
            const isActive = engine.activeTool === idx;

            return (
              <button
                key={tool.name}
                onClick={() => {
                  engine.activeTool = idx;
                  Sound.playItemPickup();
                }}
                className={`relative w-12 h-12 rounded-lg border flex flex-col items-center justify-center p-1 transition-all ${
                  isActive
                    ? 'bg-slate-900 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.35)] scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="absolute top-0.5 left-1 font-mono text-[8px] text-slate-500 border border-slate-800 rounded px-0.5 bg-slate-950">
                  {idx + 1}
                </span>

                <div
                  className="w-3 h-3 rounded-full mb-0.5"
                  style={{ backgroundColor: tool.color, boxShadow: `0 0 6px ${tool.glow}` }}
                />

                <span className="text-[8px] font-bold leading-none text-center truncate max-w-[42px]">
                  {tool.name.split(' ')[0]}
                </span>
                <span className="text-[7px] text-slate-500 leading-none mt-0.5 truncate max-w-[42px]">
                  {tool.name.split(' ')[1] || ''}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Death Screen Overlay */}
      {p.dead && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center pointer-events-auto">
          <div className="border border-red-600/80 bg-slate-950/90 p-8 rounded-2xl max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold text-red-500 tracking-widest mb-2">HULL BREACH</h2>
            <p className="text-slate-300 text-sm mb-4">
              Severe structural decompression detected. Reconstructing clone from orbital matrix...
            </p>
            <div className="text-xs font-mono text-red-400">
              Respawning in {Math.ceil(p.respawnTimer / 60)}s
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Overlay */}
      {engine.objectives.victory && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg flex flex-col items-center justify-center text-center pointer-events-auto p-6 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900/95 border-2 border-amber-400/90 rounded-3xl p-8 max-w-xl shadow-[0_0_60px_rgba(251,191,36,0.4)]">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-1">
              MISSION OBJECTIVE COMPLETE
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-wider mb-3">
              CORE SECURED
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              The Eight Wardens have fallen, and the Worldheart has been neutralized. The planetary core is stabilized under your sovereign control.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => onOpenModal('architecture')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider transition-colors shadow-lg"
              >
                VIEW SYSTEM ARCHITECTURE & CODE
              </button>
              <button
                onClick={() => {
                  engine.objectives.victory = false;
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tracking-wider transition-colors border border-slate-700"
              >
                CONTINUE EXPLORING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
