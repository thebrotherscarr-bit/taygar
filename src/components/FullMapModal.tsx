import React, { useRef, useEffect } from 'react';
import { GameEngine, BOSS_DEFS } from '../game/engine';
import { BLOCKS, CFG } from '../game/types';
import { X, Navigation, Anchor } from 'lucide-react';

interface FullMapModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const FullMapModal: React.FC<FullMapModalProps> = ({ engine, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const p = engine.player;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mw = canvas.width;
    const mh = canvas.height;

    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, mw, mh);

    const scaleX = mw / CFG.MAP_W;
    const scaleY = mh / CFG.MAP_H;

    // Draw Biome Strata Backgrounds
    const biomeColors = {
      tech: '#1e293b',
      fungal: '#3b0764',
      crystal: '#0c4a6e',
      molten: '#450a0a'
    };

    // Draw sampled tiles
    for (let x = 0; x < CFG.MAP_W; x += 3) {
      for (let y = 0; y < CFG.MAP_H; y += 3) {
        const idx = engine.map.getIndex(x, y);
        if (!engine.map.explored[idx]) continue;
        const id = engine.map.get(x, y);
        if (id === 0) continue;

        if (id === BLOCKS.WATER) {
          ctx.fillStyle = '#1d4ed8';
        } else if (id === BLOCKS.MAGMA || y >= 548) {
          ctx.fillStyle = '#ea580c';
        } else {
          let biome = 'tech';
          if (y >= 200 && y < 350) biome = 'fungal';
          else if (y >= 350 && y < 450) biome = 'crystal';
          else if (y >= 450) biome = 'molten';
          ctx.fillStyle = biomeColors[biome as keyof typeof biomeColors] || '#334155';
        }
        ctx.fillRect(x * scaleX, y * scaleY, Math.max(1, scaleX * 3), Math.max(1, scaleY * 3));
      }
    }

    // Surface line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < CFG.MAP_W; x += 10) {
      const sy = engine.map.surfaceHeights[x];
      if (x === 0) ctx.moveTo(x * scaleX, sy * scaleY);
      else ctx.lineTo(x * scaleX, sy * scaleY);
    }
    ctx.stroke();

    // Altars
    engine.map.altars.forEach(altar => {
      const isDefeated = engine.objectives.defeated[altar.boss];
      const ax = altar.x * scaleX;
      const ay = altar.y * scaleY;

      ctx.fillStyle = isDefeated ? '#39ff14' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(ax, ay, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Waypoints / Placed Beacons
    engine.waypoints.forEach(wp => {
      const wx = (wp.x / 16) * scaleX;
      const wy = (wp.y / 16) * scaleY;
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(wx - 2, wy - 2, 5, 5);
    });

    // Player position
    const px = (p.x / 16) * scaleX;
    const py = (p.y / 16) * scaleY;
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [engine, p.x, p.y]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-display">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">PLANETARY RECON & SECTOR MAP</h2>
            <span className="text-xs text-slate-400">· [M]</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Viewport */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
            <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto block" />
            <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Player Position ({Math.floor(p.x / 16)}m, {Math.floor(p.y / 16)}m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Ancient Altar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Defeated Warden
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-purple-400" /> Quantum Beacon Anchor
              </span>
            </div>
          </div>

          {/* Fast-Travel Waypoint Teleportation List */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-between">
              <span>QUANTUM BEACON TELEPORT NETWORK</span>
              <button
                onClick={() => {
                  engine.placeWaypoint();
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                + Drop Beacon Here
              </button>
            </div>

            {engine.waypoints.length === 0 ? (
              <div className="text-xs text-slate-500 py-2 text-center">
                No Quantum Beacons deployed. Craft a Quantum Beacon [Slot 5 / Craft] to establish instant warp waypoints.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {engine.waypoints.map(wp => (
                  <div
                    key={wp.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">{wp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          X: {Math.floor(wp.x / 16)}m · Y: {Math.floor(wp.y / 16)}m
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        engine.teleportToWaypoint(wp);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 text-xs font-semibold transition-colors"
                    >
                      Warp Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
