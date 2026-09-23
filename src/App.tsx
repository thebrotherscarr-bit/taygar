import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/engine';
import { Sound } from './game/audio';
import { GameCanvas } from './components/GameCanvas';
import { HudOverlay } from './components/HudOverlay';
import { InventoryModal } from './components/InventoryModal';
import { CraftingModal } from './components/CraftingModal';
import { UpgradeTreeModal } from './components/UpgradeTreeModal';
import { FullMapModal } from './components/FullMapModal';
import { HelpModal } from './components/HelpModal';
import { ArchitecturalGuideModal } from './components/ArchitecturalGuideModal';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(1234);
  }
  const engine = engineRef.current;

  const [activeModal, setActiveModal] = useState<
    'inventory' | 'crafting' | 'tree' | 'map' | 'help' | 'architecture' | null
  >(null);
  const [muted, setMuted] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    Sound.setMuted(next);
  };

  // Quick Save & Quick Load Handlers (F9 & F10)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.code === 'F9') {
        e.preventDefault();
        try {
          const saveState = {
            player: {
              x: engine.player.x,
              y: engine.player.y,
              hp: engine.player.hp,
              shield: engine.player.shield,
              energy: engine.player.energy,
              jet: engine.player.jet,
              inventory: engine.player.inventory,
              crafted: engine.player.crafted,
              xp: engine.player.xp,
              xpTotal: engine.player.xpTotal,
              level: engine.player.level,
              beamLevel: engine.player.beamLevel,
              hpBoost: engine.player.hpBoost,
              shieldBoost: engine.player.shieldBoost,
              jetBoost: engine.player.jetBoost
            },
            tree: engine.tree,
            equipment: {
              head: engine.equipment.head,
              chest: engine.equipment.chest,
              legs: engine.equipment.legs
            },
            objectives: engine.objectives,
            waypoints: engine.waypoints
          };
          localStorage.setItem('CORE_SAVEGAME', JSON.stringify(saveState));
          engine.spawnFloatingText(engine.player.x, engine.player.y - 20, 'GAME STATE SAVED (F9)', '#39ff14');
          Sound.playLevelUp();
          setSaveToast('Game state safely recorded to local telemetry matrix.');
          setTimeout(() => setSaveToast(null), 3000);
        } catch {
          // ignore storage error
        }
      } else if (e.code === 'F10') {
        e.preventDefault();
        try {
          const raw = localStorage.getItem('CORE_SAVEGAME');
          if (raw) {
            const data = JSON.parse(raw);
            Object.assign(engine.player, data.player);
            Object.assign(engine.tree, data.tree);
            engine.equipment.head = data.equipment.head;
            engine.equipment.chest = data.equipment.chest;
            engine.equipment.legs = data.equipment.legs;
            Object.assign(engine.objectives, data.objectives);
            engine.waypoints = data.waypoints || [];
            engine.recalcVitals();
            engine.spawnFloatingText(engine.player.x, engine.player.y - 20, 'GAME STATE RESTORED (F10)', '#00f3ff');
            Sound.playTeleport();
            setSaveToast('Telemetry checkpoint restored.');
            setTimeout(() => setSaveToast(null), 3000);
          }
        } catch {
          // ignore load error
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [engine]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-display select-none">
      {/* 2D Viewport Canvas */}
      <GameCanvas engine={engine} onOpenModal={setActiveModal} />

      {/* Cybernetic HUD Interface */}
      <HudOverlay
        engine={engine}
        onOpenModal={setActiveModal}
        muted={muted}
        onToggleMute={toggleMute}
      />

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="absolute top-18 right-4 bg-slate-900/90 border border-cyan-500/80 rounded-xl px-4 py-2.5 text-xs text-cyan-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 z-50">
          {saveToast}
        </div>
      )}

      {/* Modal Dialogs */}
      {activeModal === 'inventory' && (
        <InventoryModal
          engine={engine}
          onClose={() => setActiveModal(null)}
          onOpenCrafting={() => setActiveModal('crafting')}
        />
      )}

      {activeModal === 'crafting' && (
        <CraftingModal engine={engine} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'tree' && (
        <UpgradeTreeModal engine={engine} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'map' && (
        <FullMapModal engine={engine} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'architecture' && (
        <ArchitecturalGuideModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
