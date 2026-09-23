/**
 * C.O.R.E. - Procedural Sky & Parallax Background System
 * Renders dynamic planetary atmosphere, celestial bodies (sun, ringed planet, dual moons),
 * twinkling starfield, parallax mountain ridges, and subterranean cavern backwalls.
 */

import { BLOCKS, CFG } from './types';
import { GameEngine } from './engine';

interface Star {
  x: number; // 0 to 1
  y: number; // 0 to 1
  size: number;
  baseAlpha: number;
  speed: number;
  hue: number;
}

export class SkyBackgroundRenderer {
  private stars: Star[] = [];
  private mountainPointsFar: number[] = [];
  private mountainPointsMid: number[] = [];

  constructor() {
    this.generateStarfield(160);
    this.generateMountainRidges();
  }

  private generateStarfield(count: number) {
    let s = 42891;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: rnd(),
        y: rnd() * 0.75, // Stars in the upper 75% of sky
        size: rnd() < 0.15 ? 2.2 : rnd() < 0.4 ? 1.5 : 1.0,
        baseAlpha: 0.35 + rnd() * 0.65,
        speed: 0.8 + rnd() * 2.5,
        hue: rnd() < 0.2 ? 180 : rnd() < 0.4 ? 280 : rnd() < 0.6 ? 40 : 210
      });
    }
  }

  private generateMountainRidges() {
    // 64 sample points across a looping cycle
    const samples = 64;
    for (let i = 0; i <= samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      // Multi-frequency harmonic mountains
      const farH =
        Math.sin(a * 3) * 60 +
        Math.sin(a * 7 + 1.2) * 35 +
        Math.sin(a * 13 + 2.5) * 15 +
        90;
      this.mountainPointsFar.push(farH);

      const midH =
        Math.sin(a * 4 + 0.8) * 45 +
        Math.sin(a * 9 + 3.1) * 25 +
        Math.sin(a * 17) * 10 +
        60;
      this.mountainPointsMid.push(midH);
    }
  }

  /**
   * Main background draw routine called before rendering foreground world tiles
   */
  public drawSkyAndBackground(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    camX: number,
    camY: number,
    camZoom: number,
    engine: GameEngine
  ) {
    const time = engine.dayNight.time;
    const dayLength = engine.dayNight.dayLength;
    const cycleProgress = time / dayLength; // 0 to 1

    // Determine Day/Night Cycle Phase:
    // 0.00 - 0.40 (0 - 1920): Day
    // 0.40 - 0.50 (1920 - 2400): Sunset / Dusk
    // 0.50 - 0.90 (2400 - 4320): Night
    // 0.90 - 1.00 (4320 - 4800): Sunrise / Dawn
    let dayWeight = 0;
    let sunsetWeight = 0;
    let nightWeight = 0;
    let dawnWeight = 0;

    if (cycleProgress < 0.4) {
      dayWeight = 1;
    } else if (cycleProgress < 0.5) {
      const t = (cycleProgress - 0.4) / 0.1;
      dayWeight = 1 - t;
      sunsetWeight = t;
    } else if (cycleProgress < 0.55) {
      const t = (cycleProgress - 0.5) / 0.05;
      sunsetWeight = 1 - t;
      nightWeight = t;
    } else if (cycleProgress < 0.88) {
      nightWeight = 1;
    } else if (cycleProgress < 0.94) {
      const t = (cycleProgress - 0.88) / 0.06;
      nightWeight = 1 - t;
      dawnWeight = t;
    } else {
      const t = (cycleProgress - 0.94) / 0.06;
      dawnWeight = 1 - t;
      dayWeight = t;
    }

    // 1. SKY GRADIENT (Zenith to Horizon)
    // Interpolate colors based on cycle weights
    const zenithR = Math.round(12 * dayWeight + 28 * sunsetWeight + 3 * nightWeight + 16 * dawnWeight);
    const zenithG = Math.round(35 * dayWeight + 10 * sunsetWeight + 5 * nightWeight + 20 * dawnWeight);
    const zenithB = Math.round(75 * dayWeight + 48 * sunsetWeight + 18 * nightWeight + 45 * dawnWeight);

    const horizonR = Math.round(55 * dayWeight + 195 * sunsetWeight + 12 * nightWeight + 185 * dawnWeight);
    const horizonG = Math.round(115 * dayWeight + 85 * sunsetWeight + 18 * nightWeight + 110 * dawnWeight);
    const horizonB = Math.round(165 * dayWeight + 60 * sunsetWeight + 38 * nightWeight + 95 * dawnWeight);

    // Compute surface horizon Y in screen space
    const avgSurfaceY = 52 * CFG.TILE_SIZE;
    const screenSurfaceY = (avgSurfaceY - camY) * camZoom;

    // Draw Sky Background Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, Math.max(canvasH, screenSurfaceY + 200));
    skyGrad.addColorStop(0, `rgb(${zenithR}, ${zenithG}, ${zenithB})`);
    skyGrad.addColorStop(
      0.65,
      `rgb(${Math.round(zenithR * 0.4 + horizonR * 0.6)}, ${Math.round(zenithG * 0.4 + horizonG * 0.6)}, ${Math.round(zenithB * 0.4 + horizonB * 0.6)})`
    );
    skyGrad.addColorStop(1, `rgb(${horizonR}, ${horizonG}, ${horizonB})`);

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. STARFIELD (Fades in dusk / night, with subtle twinkle)
    const starAlpha = Math.max(0, nightWeight * 0.95 + sunsetWeight * 0.4 + dawnWeight * 0.3 - dayWeight * 0.8);
    if (starAlpha > 0.02) {
      const starParallaxX = (camX * 0.015) % canvasW;
      const t = engine.simClock * 0.05;

      ctx.save();
      for (const star of this.stars) {
        let sx = (star.x * canvasW - starParallaxX) % canvasW;
        if (sx < 0) sx += canvasW;
        const sy = star.y * canvasH;

        // Twinkle factor
        const twinkle = Math.sin(t * star.speed + star.x * 20);
        const a = Math.max(0, Math.min(1, (star.baseAlpha + twinkle * 0.3) * starAlpha));

        ctx.fillStyle = `hsla(${star.hue}, 85%, 85%, ${a})`;
        ctx.fillRect(sx, sy, star.size, star.size);
      }
      ctx.restore();
    }

    // 3. CELESTIAL BODIES (Orbiting Sun, Giant Ringed Exoplanet, Dual Moons)
    // Giant Ringed Exoplanet (Stationary majestic celestial body in upper sky)
    this.drawRingedPlanet(ctx, canvasW, canvasH, camX, camY, nightWeight, dayWeight, sunsetWeight);

    // Sun & Solar Corona (Moves across upper sky during Day / Sunset / Dawn)
    if (dayWeight > 0.05 || sunsetWeight > 0.05 || dawnWeight > 0.05) {
      this.drawSun(ctx, canvasW, canvasH, cycleProgress, camX, sunsetWeight, dawnWeight);
    }

    // Dual Moons (Traverse sky during Night)
    if (nightWeight > 0.05 || sunsetWeight > 0.1 || dawnWeight > 0.1) {
      this.drawMoons(ctx, canvasW, canvasH, cycleProgress, camX, nightWeight);
    }

    // 4. PARALLAX HORIZON MOUNTAIN RIDGES (Surface Silhouette)
    this.drawParallaxMountains(ctx, canvasW, canvasH, camX, screenSurfaceY, horizonR, horizonG, horizonB, nightWeight);

    // 5. DISTANT ATMOSPHERIC CLOUD WISPS
    this.drawAtmosphericClouds(ctx, canvasW, canvasH, camX, screenSurfaceY, dayWeight, sunsetWeight, nightWeight, engine.simClock);
  }

  /**
   * Draw distant giant ringed exoplanet in the cosmic background
   */
  private drawRingedPlanet(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    camX: number,
    camY: number,
    nightWeight: number,
    dayWeight: number,
    sunsetWeight: number
  ) {
    const px = ((canvasW * 0.75 - camX * 0.02) % (canvasW * 1.5) + canvasW * 1.5) % (canvasW * 1.5) - canvasW * 0.25;
    const py = Math.min(canvasH * 0.35, Math.max(60, canvasH * 0.22 - camY * 0.01));
    const radius = 34;

    const planetAlpha = 0.45 + nightWeight * 0.5 + sunsetWeight * 0.35 - dayWeight * 0.15;
    if (planetAlpha <= 0.05) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1, planetAlpha));

    // Outer Glow
    const glowGrad = ctx.createRadialGradient(px, py, radius * 0.8, px, py, radius * 2.2);
    glowGrad.addColorStop(0, 'rgba(129, 140, 248, 0.35)');
    glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
    glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Planet Sphere (Banded gas giant)
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.clip();

    const planetGrad = ctx.createLinearGradient(px - radius, py - radius, px + radius, py + radius);
    planetGrad.addColorStop(0, '#818cf8');
    planetGrad.addColorStop(0.3, '#4f46e5');
    planetGrad.addColorStop(0.5, '#3730a3');
    planetGrad.addColorStop(0.7, '#1e1b4b');
    planetGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = planetGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    // Banded cloud strips
    ctx.fillStyle = 'rgba(199, 210, 254, 0.18)';
    ctx.fillRect(px - radius, py - 12, radius * 2, 5);
    ctx.fillRect(px - radius, py + 4, radius * 2, 7);
    ctx.fillRect(px - radius, py + 18, radius * 2, 4);

    // Shadow crescent on one side
    const shadowGrad = ctx.createRadialGradient(px + radius * 0.3, py - radius * 0.2, radius * 0.4, px, py, radius);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(0.8, 'rgba(5, 8, 20, 0.6)');
    shadowGrad.addColorStop(1, 'rgba(2, 4, 12, 0.95)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    ctx.restore();

    // Equatorial Planetary Rings
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.35); // Tilted rings
    ctx.scale(1, 0.26);

    ctx.strokeStyle = 'rgba(199, 210, 254, 0.65)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(165, 180, 252, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draw rising and setting sun with solar corona
   */
  private drawSun(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    cycleProgress: number,
    camX: number,
    sunsetWeight: number,
    dawnWeight: number
  ) {
    // Day spans roughly 0.0 to 0.5 (or dawn from 0.9 to 1.0)
    let sunT = 0;
    if (cycleProgress < 0.5) {
      sunT = 0.2 + (cycleProgress / 0.5) * 0.6; // 0.2 to 0.8 across sky
    } else if (cycleProgress > 0.9) {
      sunT = ((cycleProgress - 0.9) / 0.1) * 0.2; // 0.0 to 0.2
    } else {
      return;
    }

    const sunX = ((sunT * canvasW - camX * 0.03) % (canvasW * 1.2) + canvasW * 1.2) % (canvasW * 1.2);
    // Arc across the sky
    const arcHeight = Math.sin(sunT * Math.PI);
    const sunY = canvasH * 0.7 - arcHeight * (canvasH * 0.55);

    const isSunset = sunsetWeight > 0.2;
    const isDawn = dawnWeight > 0.2;
    const sunColor = isSunset ? '#fb923c' : isDawn ? '#fdba74' : '#fffbeb';
    const coronaColor = isSunset ? 'rgba(249, 115, 22, 0.3)' : isDawn ? 'rgba(251, 146, 60, 0.3)' : 'rgba(254, 240, 138, 0.25)';

    ctx.save();
    // Solar Corona Flare
    const corona = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 65);
    corona.addColorStop(0, coronaColor);
    corona.addColorStop(0.5, coronaColor.replace('0.3', '0.12').replace('0.25', '0.1'));
    corona.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Sun Core
    ctx.fillStyle = sunColor;
    ctx.shadowColor = sunColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw primary cyan moon and secondary magenta orbital moon
   */
  private drawMoons(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    cycleProgress: number,
    camX: number,
    nightWeight: number
  ) {
    // Night is roughly 0.5 to 0.9
    let moonT = 0.5;
    if (cycleProgress >= 0.45 && cycleProgress <= 0.95) {
      moonT = (cycleProgress - 0.45) / 0.5;
    } else {
      moonT = 0.5;
    }

    const moonX = ((moonT * canvasW - camX * 0.025) % (canvasW * 1.2) + canvasW * 1.2) % (canvasW * 1.2);
    const arcHeight = Math.sin(moonT * Math.PI);
    const moonY = canvasH * 0.65 - arcHeight * (canvasH * 0.45);

    ctx.save();
    ctx.globalAlpha = Math.max(0.2, nightWeight);

    // 1. Primary Cyan Cratered Moon
    const mRadius = 20;
    const mGlow = ctx.createRadialGradient(moonX, moonY, mRadius, moonX, moonY, mRadius * 2.5);
    mGlow.addColorStop(0, 'rgba(103, 232, 249, 0.3)');
    mGlow.addColorStop(1, 'rgba(103, 232, 249, 0)');
    ctx.fillStyle = mGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, mRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cffafe';
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(moonX, moonY, mRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lunar crater details
    ctx.fillStyle = 'rgba(8, 145, 178, 0.4)';
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY - 4, 4.5, 0, Math.PI * 2);
    ctx.arc(moonX + 6, moonY + 3, 3, 0, Math.PI * 2);
    ctx.arc(moonX - 2, moonY + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Secondary Magenta Companion Moon
    const moon2X = moonX + 65;
    const moon2Y = moonY + 22;
    const m2Radius = 8;

    const m2Glow = ctx.createRadialGradient(moon2X, moon2Y, m2Radius, moon2X, moon2Y, m2Radius * 2);
    m2Glow.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
    m2Glow.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = m2Glow;
    ctx.beginPath();
    ctx.arc(moon2X, moon2Y, m2Radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(moon2X, moon2Y, m2Radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw multi-layer parallax mountains along the surface horizon
   */
  private drawParallaxMountains(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    camX: number,
    screenSurfaceY: number,
    horizonR: number,
    horizonG: number,
    horizonB: number,
    nightWeight: number
  ) {
    // Baseline anchor for mountains: relative to surface horizon
    const baseHorizonY = Math.min(canvasH + 100, Math.max(canvasH * 0.35, screenSurfaceY));

    // 1. Far Mountain Ridge (Parallax factor 0.05)
    ctx.save();
    const farDarkness = 0.5 - nightWeight * 0.3;
    ctx.fillStyle = `rgb(${Math.round(horizonR * farDarkness)}, ${Math.round(horizonG * farDarkness)}, ${Math.round(horizonB * farDarkness)})`;
    ctx.beginPath();
    ctx.moveTo(0, canvasH);

    const stepFar = 32;
    const totalStepsFar = Math.ceil(canvasW / stepFar) + 2;
    const farOffset = camX * 0.05;

    for (let i = 0; i <= totalStepsFar; i++) {
      const sx = i * stepFar;
      const worldSample = (sx + farOffset) * 0.005;
      const pointIndex = Math.floor(Math.abs(worldSample * 10)) % (this.mountainPointsFar.length - 1);
      const h = this.mountainPointsFar[pointIndex] * 1.35;
      const sy = baseHorizonY - h;
      if (i === 0) ctx.lineTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.lineTo(canvasW, canvasH);
    ctx.closePath();
    ctx.fill();

    // 2. Mid Mountain Ridge (Parallax factor 0.12)
    const midDarkness = 0.3 - nightWeight * 0.2;
    ctx.fillStyle = `rgb(${Math.round(horizonR * midDarkness + 8)}, ${Math.round(horizonG * midDarkness + 12)}, ${Math.round(horizonB * midDarkness + 20)})`;
    ctx.beginPath();
    ctx.moveTo(0, canvasH);

    const stepMid = 24;
    const totalStepsMid = Math.ceil(canvasW / stepMid) + 2;
    const midOffset = camX * 0.12;

    for (let i = 0; i <= totalStepsMid; i++) {
      const sx = i * stepMid;
      const worldSample = (sx + midOffset) * 0.008;
      const pointIndex = Math.floor(Math.abs(worldSample * 10)) % (this.mountainPointsMid.length - 1);
      const h = this.mountainPointsMid[pointIndex] * 1.1;
      const sy = baseHorizonY - h;
      if (i === 0) ctx.lineTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.lineTo(canvasW, canvasH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw atmospheric drifting cloud wisps along horizon
   */
  private drawAtmosphericClouds(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    camX: number,
    screenSurfaceY: number,
    dayWeight: number,
    sunsetWeight: number,
    nightWeight: number,
    simClock: number
  ) {
    const cloudY = Math.min(canvasH, Math.max(canvasH * 0.2, screenSurfaceY - 120));
    const cloudDrift = (simClock * 0.15 - camX * 0.08) % (canvasW + 300);

    ctx.save();
    const cloudAlpha = 0.22 + sunsetWeight * 0.25 - nightWeight * 0.1;
    ctx.globalAlpha = Math.max(0.08, Math.min(0.55, cloudAlpha));

    const cloudColor = sunsetWeight > 0.3 ? '#f472b6' : dayWeight > 0.4 ? '#e0f2fe' : '#64748b';
    ctx.fillStyle = cloudColor;

    for (let c = 0; c < 4; c++) {
      const cx = ((c * 420 + cloudDrift) % (canvasW + 350)) - 100;
      const cy = cloudY + (c % 2) * 35;
      const w = 180 + (c % 3) * 50;

      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 35, cy - 6, w * 0.35, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw subterranean cavern backwalls for carved out cave chambers (BLOCKS.VACUUM below surface)
   */
  public drawSubterraneanBackwallTile(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    tx: number,
    ty: number,
    tileSize: number
  ) {
    // Biome Stratum Backwall Palette
    if (ty < 200) {
      // Tech Crust Stratum Backwall (Dark basalt & metallic conduit seams)
      const alt = (tx + ty) % 4 === 0;
      ctx.fillStyle = alt ? '#0f141d' : '#141a26';
      ctx.fillRect(px, py, tileSize, tileSize);

      // Subtle metallic girder seams on regular grid intervals
      if (tx % 8 === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py, 2, tileSize);
      }
      if (ty % 8 === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py, tileSize, 2);
      }
    } else if (ty < 350) {
      // Fungal Caverns Stratum Backwall (Deep murky teal-indigo with bioluminescent spore flecks)
      const alt = (tx * 3 + ty * 7) % 5 === 0;
      ctx.fillStyle = alt ? '#08171b' : '#0b1e24';
      ctx.fillRect(px, py, tileSize, tileSize);

      // Faint bioluminescent mycelial spore speckles
      if ((tx * 13 + ty * 19) % 23 === 0) {
        ctx.fillStyle = 'rgba(57, 255, 20, 0.28)';
        ctx.fillRect(px + 6, py + 6, 3, 3);
      }
    } else if (ty < 480) {
      // Crystal Abyss Stratum Backwall (Deep violet geode stone with crystal shard glimmers)
      const alt = (tx * 5 + ty * 11) % 6 === 0;
      ctx.fillStyle = alt ? '#120b21' : '#180f2b';
      ctx.fillRect(px, py, tileSize, tileSize);

      // Subtle geode crystal fleck
      if ((tx * 17 + ty * 23) % 29 === 0) {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.fillRect(px + 4, py + 4, 3, 3);
      }
    } else {
      // Molten Core Stratum Backwall (Basalt crust with glowing volcanic fissures)
      const alt = (tx * 7 + ty * 13) % 5 === 0;
      ctx.fillStyle = alt ? '#1a0905' : '#230c07';
      ctx.fillRect(px, py, tileSize, tileSize);

      // Magmatic heat fissure vein
      if ((tx * 11 + ty * 17) % 27 === 0) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
        ctx.fillRect(px + 5, py + 5, 4, 2);
      }
    }
  }
}

export const skyBackground = new SkyBackgroundRenderer();
