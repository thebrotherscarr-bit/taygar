import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { BLOCK_DATA, BLOCKS, CFG } from '../game/types';
import { Sprites } from '../game/sprites';
import { skyBackground } from '../game/skyBackground';

interface GameCanvasProps {
  engine: GameEngine;
  onOpenModal: (modal: 'inventory' | 'crafting' | 'tree' | 'map' | 'help' | 'architecture') => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onOpenModal }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camRef = useRef({ x: 0, y: 0, zoom: 2.2 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Keyboard Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        engine.input.w = true;
        engine.jumpQueued = true;
      }
      if (code === 'KeyA' || code === 'ArrowLeft') engine.input.a = true;
      if (code === 'KeyS' || code === 'ArrowDown') engine.input.s = true;
      if (code === 'KeyD' || code === 'ArrowRight') engine.input.d = true;
      if (code === 'Space') {
        engine.input.space = true;
        e.preventDefault();
      }

      // Hotbar selection
      if (code === 'Digit1') engine.activeTool = 0;
      if (code === 'Digit2') engine.activeTool = 1;
      if (code === 'Digit3') engine.activeTool = 2;
      if (code === 'Digit4') engine.activeTool = 3;
      if (code === 'Digit5') engine.activeTool = 4;
      if (code === 'Digit6') engine.activeTool = 5;

      // Mode switch for Omni Tool
      if (code === 'KeyC') engine.toggleOmniMode();

      // Camera Zoom Shortcuts
      if (code === 'Equal' || code === 'NumpadAdd') engine.setZoom(0.25);
      if (code === 'Minus' || code === 'NumpadSubtract') engine.setZoom(-0.25);

      // Consumables & Actions
      if (code === 'KeyQ') engine.useConsumable('medkit');
      if (code === 'KeyE') engine.useConsumable('fuelcell');
      if (code === 'KeyR') engine.useConsumable('energycell');
      if (code === 'KeyG') engine.input.g = true;
      if (code === 'KeyV') engine.input.v = true;
      if (code === 'KeyF') engine.communeQueued = true;

      // Navigation Shortcuts
      if (code === 'Tab') {
        e.preventDefault();
        onOpenModal('inventory');
      }
      if (code === 'KeyB') onOpenModal('crafting');
      if (code === 'KeyT') onOpenModal('tree');
      if (code === 'KeyM') onOpenModal('map');
      if (code === 'KeyH') onOpenModal('help');
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') engine.input.w = false;
      if (code === 'KeyA' || code === 'ArrowLeft') engine.input.a = false;
      if (code === 'KeyS' || code === 'ArrowDown') engine.input.s = false;
      if (code === 'KeyD' || code === 'ArrowRight') engine.input.d = false;
      if (code === 'Space') engine.input.space = false;
      if (code === 'KeyV') engine.input.v = false;
      if (code === 'KeyG') engine.input.g = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      engine.input.mx = e.clientX;
      engine.input.my = e.clientY;
    };

    // CRITICAL FIX: Only fire weapons if mouse click was initiated directly on the game canvas,
    // not on any UI buttons, modals, cards, or hotbar elements!
    const onMouseDown = (e: MouseEvent) => {
      if (e.target !== canvas) return;
      if (e.button === 0) engine.input.mb = true;
      if (e.button === 2) {
        e.preventDefault();
        engine.input.mb2 = true;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) engine.input.mb = false;
      if (e.button === 2) engine.input.mb2 = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.18;
      engine.setZoom(delta);
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('contextmenu', onContextMenu);

    // Animation & Physics Loop
    let animId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const stepTime = 1000 / 60;

    const render = (time: number) => {
      const dt = Math.min(100, time - lastTime);
      lastTime = time;
      accumulator += dt;

      while (accumulator >= stepTime) {
        engine.step();
        const cam = camRef.current;
        engine.updateMechanics(cam.x, cam.y, cam.zoom);
        accumulator -= stepTime;
      }

      // Smooth Camera tracking with screen shake and zoom
      const p = engine.player;
      const cam = camRef.current;
      cam.zoom += (engine.targetZoom - cam.zoom) * 0.15;
      const targetCamX = p.x + p.w / 2 - canvas.width / (2 * cam.zoom);
      const targetCamY = p.y + p.h / 2 - canvas.height / (2 * cam.zoom);
      cam.x += (targetCamX - cam.x) * 0.14;
      cam.y += (targetCamY - cam.y) * 0.14;

      // Screen shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (engine.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * engine.screenShake * 1.5;
        shakeY = (Math.random() - 0.5) * engine.screenShake * 1.5;
      }

      // Render Procedural Dynamic Sky, Celestial Bodies, Starfield & Parallax Mountains
      skyBackground.drawSkyAndBackground(
        ctx,
        canvas.width,
        canvas.height,
        cam.x - shakeX,
        cam.y - shakeY,
        cam.zoom,
        engine
      );

      ctx.save();
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x + shakeX, -cam.y + shakeY);

      // Visible World Range
      const startTx = Math.max(0, Math.floor(cam.x / CFG.TILE_SIZE) - 2);
      const endTx = Math.min(CFG.MAP_W - 1, Math.ceil((cam.x + canvas.width / cam.zoom) / CFG.TILE_SIZE) + 2);
      const startTy = Math.max(0, Math.floor(cam.y / CFG.TILE_SIZE) - 2);
      const endTy = Math.min(CFG.MAP_H - 1, Math.ceil((cam.y + canvas.height / cam.zoom) / CFG.TILE_SIZE) + 2);

      // Render World Tiles & Subterranean Cavern Backwalls
      for (let tx = startTx; tx <= endTx; tx++) {
        const sHeight = engine.map.surfaceHeights[tx] ?? 52;
        for (let ty = startTy; ty <= endTy; ty++) {
          const bid = engine.map.get(tx, ty);
          const px = tx * CFG.TILE_SIZE;
          const py = ty * CFG.TILE_SIZE;

          if (bid === BLOCKS.VACUUM) {
            // Below surface elevation, render depth-tailored subterranean cavern backwalls!
            if (ty >= sHeight) {
              skyBackground.drawSubterraneanBackwallTile(ctx, px, py, tx, ty, CFG.TILE_SIZE);
            }
            continue;
          }

          const bdef = BLOCK_DATA[bid];

          if (bid === BLOCKS.ALTAR) {
            // Draw ancient ornate shrine altar
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(px + 4, py + 4, 8, 8);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, CFG.TILE_SIZE - 2, CFG.TILE_SIZE - 2);
          } else if (bid === BLOCKS.BEACON) {
            // Draw placed quantum beacon
            ctx.fillStyle = '#4c1d95';
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);
            ctx.fillStyle = '#a78bfa';
            ctx.beginPath();
            ctx.arc(px + 8, py + 8, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (bid === BLOCKS.TURRET) {
            ctx.fillStyle = '#831843';
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(px + 3, py + 3, 10, 10);
          } else if (bid === BLOCKS.WATER) {
            // Oceanic water with animated wave surface
            ctx.fillStyle = 'rgba(29, 78, 216, 0.72)';
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);
            const above = engine.map.get(tx, ty - 1);
            if (above === BLOCKS.VACUUM) {
              const wave = Math.sin(tx * 0.8 + engine.simClock * 0.08) * 2;
              ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
              ctx.fillRect(px, py + Math.max(0, wave), CFG.TILE_SIZE, 3);
            }
          } else if (bid === BLOCKS.MAGMA) {
            // Molten lake of lava with convective heat pulsing
            const pulse = Math.sin(tx * 0.6 + ty * 0.8 + engine.simClock * 0.1);
            ctx.fillStyle = pulse > 0.2 ? '#ff5400' : pulse < -0.2 ? '#cc2900' : '#ea4300';
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);
            ctx.fillStyle = 'rgba(255, 230, 0, 0.4)';
            ctx.fillRect(px + 3, py + 3, CFG.TILE_SIZE - 6, CFG.TILE_SIZE - 6);
            if (ty >= 575) {
              // Impenetrable core bedrock base
              ctx.fillStyle = 'rgba(15, 5, 2, 0.65)';
              ctx.fillRect(px + 4, py + 4, CFG.TILE_SIZE - 8, CFG.TILE_SIZE - 8);
            }
          } else if (bdef && bdef.color) {
            ctx.fillStyle = bdef.color;
            ctx.fillRect(px, py, CFG.TILE_SIZE, CFG.TILE_SIZE);

            // Shading highlight borders for 3D depth
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(px, py, CFG.TILE_SIZE, 2);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(px, py + CFG.TILE_SIZE - 2, CFG.TILE_SIZE, 2);

            // Subtle glowing core for crystal & silicon
            if (bid === BLOCKS.CRYSTAL || bid === BLOCKS.SILICON) {
              ctx.fillStyle = 'rgba(0,243,255,0.25)';
              ctx.fillRect(px + 4, py + 4, 8, 8);
            }
          }

          // Voxel damage cracking overlay
          const idx = engine.map.getIndex(tx, ty);
          const dmg = engine.voxelDamage[idx];
          if (dmg > 0) {
            const alpha = Math.min(0.7, (dmg / 100) * 0.9);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(px + 2, py + 2, CFG.TILE_SIZE - 4, CFG.TILE_SIZE - 4);
          }
        }
      }

      // Render Voxel Physical Debris Particles
      for (const vp of engine.voxelParticles) {
        ctx.fillStyle = vp.color;
        ctx.fillRect(vp.x, vp.y, vp.size, vp.size);
      }

      // Render Sonar Scanning Rings (Omni Tool)
      for (const ring of engine.sonarRings) {
        const alpha = Math.max(0, ring.life / 55);
        ctx.strokeStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render Corpses
      for (const c of engine.corpses) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(c.x, c.y + 14, 14, 8);
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(c.x + 4, c.y + 10, 6, 4);
      }

      // Render Enemies
      for (const e of engine.enemies) {
        if (e.x < cam.x - 50 || e.x > cam.x + canvas.width / cam.zoom + 50) continue;
        if (e.y < cam.y - 50 || e.y > cam.y + canvas.height / cam.zoom + 50) continue;

        ctx.save();
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        if (e.facingLeft) ctx.scale(-1, 1);

        // Flash white on damage
        if (e.flash > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
        } else {
          const img = Sprites[e.type] || Sprites.bot || Sprites.player;
          if (img && img.complete) {
            ctx.drawImage(img, -e.w / 2, -e.h / 2, e.w, e.h);
          } else {
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
          }
        }
        ctx.restore();

        // Mini health bar over enemy
        if (e.hp < e.maxHp) {
          const hpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(e.x, e.y - 6, e.w, 3);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(e.x, e.y - 6, e.w * hpPct, 3);
        }
      }

      // Render Active Boss
      if (engine.activeBoss) {
        const b = engine.activeBoss;
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        if (b.facingLeft) ctx.scale(-1, 1);

        // Outer Aura
        ctx.shadowColor = b.pattern === 'enraged' ? '#ef4444' : '#fbbf24';
        ctx.shadowBlur = 24;

        if (b.flash > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        } else {
          const bossImg = Sprites.scrapTitan || Sprites.sentinel || Sprites.player;
          if (bossImg && bossImg.complete) {
            ctx.drawImage(bossImg, -b.w / 2, -b.h / 2, b.w, b.h);
          } else {
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          }
        }
        ctx.restore();
      }

      // Render Player Character
      if (!p.dead) {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        if (p.facingLeft) ctx.scale(-1, 1);

        // Jetpack thruster flame
        if (engine.input.space && p.jet > 0) {
          ctx.fillStyle = '#00f3ff';
          ctx.beginPath();
          ctx.moveTo(-p.w / 2 - 2, 6);
          ctx.lineTo(-p.w / 2 - 7, 18 + Math.random() * 8);
          ctx.lineTo(-p.w / 2 + 3, 6);
          ctx.fill();
        }

        if (p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0) {
          // Blink during invulnerability
        } else {
          const playerImg = Sprites.player;
          if (playerImg && playerImg.complete) {
            ctx.drawImage(playerImg, -p.w / 2 - 2, -p.h / 2 - 2, p.w + 4, p.h + 4);
          } else {
            ctx.fillStyle = '#00f3ff';
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
        }

        // Weapon Aim Line / Muzzle glow
        const wMx = cam.x + engine.input.mx / cam.zoom;
        const wMy = cam.y + engine.input.my / cam.zoom;
        const aimAngle = Math.atan2(wMy - (p.y + p.h / 2), wMx - (p.x + p.w / 2));
        ctx.restore();

        // Active Beam Weapon Ray FX (Plasma Cutter continuous beam & Ion Cannon 9-ray fan)
        if (engine.beamFxTool) {
          const tool = engine.beamFxTool;
          ctx.strokeStyle = tool.color;
          ctx.lineWidth = tool.width;
          ctx.shadowColor = tool.glow;
          ctx.shadowBlur = 12;
          ctx.beginPath();

          if (tool.fan) {
            // Ion Cannon Fan Arc: 9 fan rays spanning 0.7 rad cone
            const fanAngle = tool.fanAngle || 0.7;
            const rays = tool.fanRays || 9;
            for (let r = 0; r < rays; r++) {
              const a = aimAngle - fanAngle / 2 + (fanAngle / (rays - 1)) * r;
              ctx.moveTo(p.x + p.w / 2, p.y + p.h / 2);
              ctx.lineTo(p.x + p.w / 2 + Math.cos(a) * tool.range, p.y + p.h / 2 + Math.sin(a) * tool.range);
            }
          } else {
            // Plasma Cutter mining beam directly to cursor
            ctx.moveTo(p.x + p.w / 2, p.y + p.h / 2);
            ctx.lineTo(wMx, wMy);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Shock Baton Arc Swing (Key V)
        if (engine.batonSwingT > 0) {
          const dir = p.facingLeft ? -1 : 1;
          const swingAngle = dir > 0 ? 0 : Math.PI;
          ctx.save();
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 44, swingAngle - 0.7, swingAngle + 0.7);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Render Player Projectiles (Pulse Rifle, Omni-Tool, Disasm Ray, Quantum Beacon, Spore Grenade)
      for (const proj of engine.playerProjectiles) {
        ctx.fillStyle = proj.color || '#ef4444';
        ctx.shadowColor = proj.glow || '#fca5a5';
        ctx.shadowBlur = 8;
        const radius = proj.explodeRadius ? (proj.explodeRadius > 100 ? 5 : 4) : 3.5;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Hostile Projectiles
      for (const proj of engine.projectiles) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Render Floating Text
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      for (const ft of engine.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // Ambient Lighting Filter (Day/Night cycle)
      if (engine.dayNight.ambientAlpha > 0) {
        ctx.fillStyle = `rgba(3, 7, 18, ${engine.dayNight.ambientAlpha})`;
        ctx.fillRect(cam.x, cam.y, canvas.width / cam.zoom, canvas.height / cam.zoom);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [engine, onOpenModal]);

  return <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />;
};
