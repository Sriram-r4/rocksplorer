// src/components/GameCanvas.jsx
import { useRef, useEffect, useState } from "react";
import { layersData } from "../data/layersData";
import { StarField } from "../utils/StarField";
import { ObstacleDrawer } from "../components/game/ObstacleDrawer";
import drawRocketObject from "./game/rocket";
/**
 * GameCanvas
 * - Visuals driven by visualScrollRef (pixels-like accumulator) so star/obstacle motion remains perceptible
 * - distanceRef keeps the "true" astronomical distance for HUD only
 * - Sci-fi plasma burst on collision (blue/purple particles)
 */
export default function GameCanvas({ onUpdate }) {
  const gameCanvasRef = useRef(null);
  const starCanvasRef = useRef(null);

  const keys = useRef({});
  const distanceRef = useRef(0); // true distance in km (for HUD)
  const visualScrollRef = useRef(0); // visual scroll accumulator (px-like)
  const visualSpeedRef = useRef(0); // current visual speed in px/ms
  const animationRef = useRef(null);
  const starFieldRef = useRef(null);
  const obstaclesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const particlesRef = useRef([]); // for explosion effect
  const [gameOver, setGameOver] = useState(false);
  const explosionRef = useRef({ active: false, t: 0 });

  useEffect(() => {
    // Defensive check
    if (!Array.isArray(layersData) || layersData.length === 0) {
      console.warn(
        "layersData missing — GameCanvas will not start until layersData is provided."
      );
      return;
    }

    const gameCanvas = gameCanvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!gameCanvas || !starCanvas) return;

    const ctx = gameCanvas.getContext("2d");
    const starCtx = starCanvas.getContext("2d");

    // ----- Resize -----
    const resize = () => {
      gameCanvas.width = window.innerWidth;
      gameCanvas.height = window.innerHeight;
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      if (starFieldRef.current)
        starFieldRef.current.resize(starCanvas.width, starCanvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // ----- Rocket -----
    const rocket = {
      x: gameCanvas.width / 2 - 20,
      y: gameCanvas.height * 0.7,
      w: 40,
      h: 60,
      vx: 0,
      vy: 0,
      targetVy: -0.02,
      baseClimb: -0.02,
      thrustSpeed: -0.1,
      boostSpeed: -0.26, // slightly stronger boost for thrill
    };

    // ----- Input -----
    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // ----- Restart handlers -----
    const restartGame = () => {
      setGameOver(false);
      obstaclesRef.current = [];
      particlesRef.current = [];
      explosionRef.current = { active: false, t: 0 };
      distanceRef.current = 0;
      visualScrollRef.current = 0;
      visualSpeedRef.current = 0;
      rocket.x = gameCanvas.width / 2 - 20;
      rocket.vx = 0;
      rocket.vy = 0;
      rocket.targetVy = rocket.baseClimb;
      spawnTimerRef.current = 0;
      // resume loop if it was stopped
      if (!animationRef.current)
        animationRef.current = requestAnimationFrame(loop);
    };

    const handleRestartKey = (e) => {
      if (gameOver && (e.key === "r" || e.key === "R")) restartGame();
    };
    const handleRestartClick = () => {
      if (gameOver) restartGame();
    };
    window.addEventListener("keydown", handleRestartKey);
    window.addEventListener("click", handleRestartClick);

    // ----- Helpers -----
    function interpolateColor(color1, color2, factor) {
      const safe1 = typeof color1 === "string" ? color1 : "#000000";
      const safe2 = typeof color2 === "string" ? color2 : "#000000";
      const c1 = parseInt(safe1.slice(1), 16);
      const c2 = parseInt(safe2.slice(1), 16);
      const r1 = (c1 >> 16) & 255,
        g1 = (c1 >> 8) & 255,
        b1 = c1 & 255;
      const r2 = (c2 >> 16) & 255,
        g2 = (c2 >> 8) & 255,
        b2 = c2 & 255;
      return `rgb(${Math.round(r1 + (r2 - r1) * factor)}, ${Math.round(
        g1 + (g2 - g1) * factor
      )}, ${Math.round(b1 + (b2 - b1) * factor)})`;
    }

    // ----- Layer helpers (defensive) -----
    function getLayer(distance) {
      if (!Array.isArray(layersData) || layersData.length === 0) return 0;
      for (let i = 0; i < layersData.length - 1; i++) {
        const nextDist = layersData[i + 1]?.distanceKm ?? Infinity;
        if (distance < nextDist) return i;
      }
      return layersData.length - 1;
    }

    function drawGradientForLayer(distance) {
      const idx = getLayer(distance);
      const current = layersData[idx] ?? layersData[0];
      const next = layersData[idx + 1] ?? current;
      const curKm =
        typeof current.distanceKm === "number" ? current.distanceKm : 0;
      const nextKm =
        typeof next.distanceKm === "number" ? next.distanceKm : curKm + 1;
      const range = Math.max(1, nextKm - curKm);
      const factor = Math.min(Math.max((distance - curKm) / range, 0), 1);

      const bottomColor = interpolateColor(
        current.colorFrom ?? "#000000",
        next.colorFrom ?? "#000000",
        factor
      );
      const topColor = interpolateColor(
        current.colorTo ?? "#000000",
        next.colorTo ?? "#000000",
        factor
      );

      const gradient = starCtx.createLinearGradient(0, starCanvas.height, 0, 0);
      gradient.addColorStop(0, bottomColor);
      gradient.addColorStop(1, topColor);
      starCtx.fillStyle = gradient;
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);

      return { current, next, factor, idx };
    }

    // ----- StarField -----
    if (!starFieldRef.current)
      starFieldRef.current = new StarField(
        starCtx,
        starCanvas.width,
        starCanvas.height,
        160
      );

    // ----- Macro regions (tuned for smoother distance scaling) -----
    const macroRegions = [
      {
        name: "EARTH & ATMOSPHERE",
        start: layersData[0]?.distanceKm ?? 0,
        end:
          layersData.find((l) => l.name === "Exosphere")?.distanceKm ?? 10000,
        durationSec: 35,
        baseSpeedFactor: 1.0,
      },
      {
        name: "EARTH ORBIT & SOLAR SYSTEM",
        start:
          layersData.find((l) => l.name === "Low Earth Orbit")?.distanceKm ??
          10000,
        end:
          layersData.find((l) => l.name === "Heliopause")?.distanceKm ?? 2e10,
        durationSec: 50,
        baseSpeedFactor: 1.15,
      },
      {
        name: "INTERSTELLAR SPACE",
        start:
          layersData.find((l) => l.name === "Local Interstellar Cloud")
            ?.distanceKm ?? 2e10,
        end:
          layersData.find((l) => l.name === "Galactic Halo")?.distanceKm ??
          9e17,
        durationSec: 70,
        baseSpeedFactor: 1.35,
      },
      {
        name: "COSMIC SCALE",
        start:
          layersData.find((l) => l.name === "Local Group")?.distanceKm ?? 9e17,
        end: Infinity,
        durationSec: 80,
        baseSpeedFactor: 1.6,
      },
    ];

    function getMacroRegionIndex(distance) {
      for (let i = 0; i < macroRegions.length; i++) {
        const r = macroRegions[i];
        if (distance >= r.start && distance < r.end) return i;
      }
      return macroRegions.length - 1;
    }

    // ----- Obstacles -----
    function spawnObstacle(regionIndex) {
      const baseSize = Math.random() * 28 + 20;
      const sizeScale = 1 + regionIndex * 0.5;
      const size = Math.round(baseSize * sizeScale);

      const x = Math.max(
        0,
        Math.min(
          gameCanvas.width - size,
          Math.random() * (gameCanvas.width - size)
        )
      );
      const baseSpeed = 1.8 + regionIndex * 1.8;
      const speed = baseSpeed + Math.random() * (0.9 + regionIndex * 0.7);

      const typeRoll = Math.random();
      const type =
        typeRoll < 0.12 ? "satellite" : typeRoll < 0.62 ? "rock" : "debris";

      obstaclesRef.current.push({
        x,
        y: -size - Math.random() * 120, // spawn slightly off-screen for stagger
        size,
        speed,
        type,
      });
    }

    function updateObstacles(deltaMs, visualSpeed, regionIndex) {
      spawnTimerRef.current += deltaMs;

      const baseIntervals = [1500, 1200, 900, 700];
      const safeIndex = Math.max(
        0,
        Math.min(baseIntervals.length - 1, regionIndex)
      );
      const base = baseIntervals[safeIndex];

      // interval reduces with region index and visual speed, but clamped
      const interval = Math.max(
        300,
        base / (1 + regionIndex * 0.7 + Math.abs(visualSpeed) * 0.01)
      );

      if (spawnTimerRef.current > interval) {
        if (regionIndex >= 2 && Math.random() < 0.22) {
          const burst = 1 + Math.floor(Math.random() * (2 + regionIndex));
          for (let i = 0; i < burst; i++) spawnObstacle(regionIndex);
        } else {
          spawnObstacle(regionIndex);
        }
        spawnTimerRef.current = 0;
      }

      // move obstacles downward using visualSpeed (not astronomical distance)
      obstaclesRef.current.forEach((obs) => {
        // motion = obstacle own speed + small fraction of visual scroll, clamped
        const down =
          obs.speed * (0.6 + regionIndex * 0.18) +
          Math.min(visualSpeed * 0.018, 45);
        obs.y += down;
      });

      // cull offscreen with buffer
      obstaclesRef.current = obstaclesRef.current.filter(
        (obs) => obs.y < gameCanvas.height + obs.size * 3
      );
    }
    function drawObstacles() {
      // NOTE: If you are using canvas scaling (ctx.scale) for responsiveness,
      // apply the scale/translate *before* this loop, as demonstrated in my previous answer.

      obstaclesRef.current.forEach((obs) => {
        // This single line replaces the entire switch/if-else block from before
        ObstacleDrawer.draw(ctx, obs);
      });
    }

    function checkCollision() {
      return obstaclesRef.current.some((obs) => {
        const w = obs.size * (obs.type === "satellite" ? 1.06 : 1);
        const h = obs.size * (obs.type === "satellite" ? 0.6 : 1);
        return (
          rocket.x < obs.x + w &&
          rocket.x + rocket.w > obs.x &&
          rocket.y < obs.y + h &&
          rocket.y + rocket.h > obs.y
        );
      });
    }

    // ----- Particles: Sci-fi Plasma Burst -----
    function createPlasmaBurst(cx, cy) {
      particlesRef.current = [];
      const count = 48 + Math.floor(Math.random() * 24);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 8;
        const life = 700 + Math.random() * 600; // ms
        const size = 1 + Math.random() * 3;
        // color palette: electric cyan -> deep purple
        const mix = Math.random();
        const r = Math.round(20 + 120 * mix);
        const g = Math.round(180 + 40 * (1 - mix));
        const b = Math.round(255 - 40 * mix);
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          age: 0,
          size,
          color: `rgba(${r},${g},${b},`,
          flick: Math.random() * 0.6 + 0.4,
        });
      }
      explosionRef.current = { active: true, t: 0 };
    }

    function updateParticles(deltaMs) {
      if (!explosionRef.current.active) return;
      explosionRef.current.t += deltaMs;
      particlesRef.current.forEach((p) => {
        // magnetic pull center effect for plasma swirl
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.02; // slight downward drift
        p.x += p.vx + (Math.random() - 0.5) * 0.3;
        p.y += p.vy + (Math.random() - 0.5) * 0.3;
        p.age += deltaMs;
      });
      // remove dead
      particlesRef.current = particlesRef.current.filter((p) => p.age < p.life);
      if (particlesRef.current.length === 0)
        explosionRef.current.active = false;
    }

    function drawParticles() {
      if (!explosionRef.current.active) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      particlesRef.current.forEach((p) => {
        const alpha = Math.max(0, 1 - p.age / p.life);
        const glow = Math.min(1, alpha * 0.9) * p.flick;
        ctx.beginPath();
        ctx.fillStyle = `${p.color}${(0.6 * glow).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // inner bright dot
        ctx.beginPath();
        ctx.fillStyle = `${p.color}${(0.9 * glow).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // ----- Distance advancement (keeps core behavior but uses balanced region timings) -----
    const PLAYER_MULT_NONE = 1;
    const PLAYER_MULT_UP = 2;
    const PLAYER_MULT_BOOST = 5;

    function advanceDistance(deltaMs) {
      let remainingMs = deltaMs;
      let safety = 0;
      while (remainingMs > 0 && safety < 4) {
        safety++;

        const regionIdx = getMacroRegionIndex(distanceRef.current);
        const region = macroRegions[regionIdx];

        const regionWidthKm =
          region.end === Infinity
            ? Math.max(1e6, region.start * 0.02)
            : Math.max(1, region.end - region.start);

        const regionMs = Math.max(1000, region.durationSec * 1000);
        const baseFractionPerMs = 1 / regionMs;
        const fractionPerMs = baseFractionPerMs * (region.baseSpeedFactor || 1);

        const upPressed = keys.current["ArrowUp"] || keys.current["w"];
        const boostPressed =
          keys.current["Shift"] ||
          keys.current["ShiftLeft"] ||
          keys.current["ShiftRight"];
        const playerMultiplier = upPressed
          ? boostPressed
            ? PLAYER_MULT_BOOST
            : PLAYER_MULT_UP
          : PLAYER_MULT_NONE;

        const effectiveFractionPerMs = fractionPerMs * playerMultiplier;

        const progressInRegion = Math.min(
          1,
          (distanceRef.current - region.start) / (regionWidthKm || 1)
        );
        const fractionRemaining = Math.max(0, 1 - progressInRegion);
        const msToFinishAtEffective =
          fractionRemaining / Math.max(1e-9, effectiveFractionPerMs);

        const msStep = Math.min(remainingMs, msToFinishAtEffective);

        const fractionStep = effectiveFractionPerMs * msStep;
        const kmStep = fractionStep * regionWidthKm;

        distanceRef.current += kmStep;
        remainingMs -= msStep;

        if (msStep === msToFinishAtEffective) {
          if (region.end !== Infinity)
            distanceRef.current = Math.max(
              distanceRef.current,
              region.end - 1e-6
            );
        }

        if (fractionStep <= 0) break;
      }
    }

    // ----- Physics update (unchanged controls, but updates visual speed) -----
    function updatePhysics(deltaMs) {
      const upPressed = keys.current["ArrowUp"] || keys.current["w"];
      const boostPressed =
        keys.current["Shift"] ||
        keys.current["ShiftLeft"] ||
        keys.current["ShiftRight"];

      if (upPressed && boostPressed) rocket.targetVy = rocket.boostSpeed;
      else if (upPressed) rocket.targetVy = rocket.thrustSpeed;
      else rocket.targetVy = rocket.baseClimb;

      // smooth vertical interpolation
      const smooth = 0.08;
      rocket.vy += (rocket.targetVy - rocket.vy) * smooth;

      // horizontal movement
      if (keys.current["ArrowLeft"] || keys.current["a"]) rocket.vx -= 0.22;
      if (keys.current["ArrowRight"] || keys.current["d"]) rocket.vx += 0.22;
      rocket.vx *= 0.96;
      rocket.x += rocket.vx;
      rocket.x = Math.max(0, Math.min(gameCanvas.width - rocket.w, rocket.x));

      // advance "real" distance
      advanceDistance(deltaMs);

      // compute visual speed (normalized) from region factors and player action
      const regionIdx = getMacroRegionIndex(distanceRef.current);
      const region = macroRegions[regionIdx];
      const regionMs = Math.max(1000, region.durationSec * 1000);
      const baseFractionPerMs = 1 / regionMs;
      const fracPerMs = baseFractionPerMs * (region.baseSpeedFactor || 1);

      // visualAcceleration is a small number that maps to pixels/ms feel
      const baseVisual = 0.02 + regionIdx * 0.006; // base visual per ms increases with region
      const thrustFactor = Math.max(0, -rocket.vy) * 0.85; // vertical input contributes
      const boostFactor = keys.current["Shift"] ? 1.2 : 1;

      // combine to get a smooth visual speed (pixels per ms)
      const targetVisualSpeed =
        (baseVisual + fracPerMs * 0.18) *
        (1 + thrustFactor) *
        boostFactor *
        1.0;

      // smooth visual speed
      visualSpeedRef.current +=
        (targetVisualSpeed - visualSpeedRef.current) * 0.06;

      // advance visual scroll by visualSpeed * deltaMs (clamped)
      const step = Math.max(
        0,
        Math.min(visualSpeedRef.current * deltaMs * 1.0, 200)
      ); // clamp per-frame step
      visualScrollRef.current += step;

      // limit visualScrollRef to prevent float runaway (wrap)
      if (visualScrollRef.current > 1e7) visualScrollRef.current %= 1e7;
    }

    // ----- Draw rocket -----
    function drawRocket() {
      drawRocketObject(ctx, rocket);
    }

    // ----- Main loop -----
    let lastTime = 0;
    function loop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const deltaMs = Math.min(60, timestamp - lastTime); // ms clamp
      lastTime = timestamp;

      // if not game over, update mechanics
      if (!gameOver) {
        updatePhysics(deltaMs);
      }

      // draw gradient for layer once (star canvas)
      const { idx: layerIdx } = drawGradientForLayer(distanceRef.current);

      // clear game canvas only
      ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

      // 1) obstacles (game canvas)
      updateObstacles(
        deltaMs,
        visualSpeedRef.current,
        getMacroRegionIndex(distanceRef.current)
      );
      drawObstacles();

      // const currentLayer =
      //   layersData[layerIdx]?.name || `Unknown Layer (${layerIdx})`;

      // if (
      //   !window._lastLoggedLayer ||
      //   window._lastLoggedLayer !== currentLayer
      // ) {
      //   console.log(`🛰️ Layer Changed → ${currentLayer} (Index: ${layerIdx})`);
      //   window._lastLoggedLayer = currentLayer;
      // }
      // 2) starfield (draw on star canvas)
      if (starFieldRef.current) {
        // --- STARFIELD VISIBILITY LOGIC --- //
        let starAlpha = 0;
        if (layerIdx <= 1) starAlpha = 0; // No stars in ground/troposphere
        else if (layerIdx === 5)
          starAlpha = 0.4; // Subtle start in stratosphere
        else if (layerIdx >= 6) starAlpha = 1; // Full stars beyond

        // Smooth fade transition
        starFieldRef.current.fadeProgress +=
          (starAlpha - starFieldRef.current.fadeProgress) * 0.05;
        const effectiveAlpha = starFieldRef.current.fadeProgress;

        // --- STARFIELD MOTION LOGIC --- //
        const movingUp =
          keys.current["ArrowUp"] || keys.current["w"] || keys.current["W"];
        const movingLeft =
          keys.current["ArrowLeft"] || keys.current["a"] || keys.current["A"];
        const movingRight =
          keys.current["ArrowRight"] || keys.current["d"] || keys.current["D"];
        const boostActive =
          movingUp &&
          (keys.current["Shift"] ||
            keys.current["ShiftLeft"] ||
            keys.current["ShiftRight"]);

        const baseDrift = visualSpeedRef.current * 25;
        let starSpeed = baseDrift;
        if (movingUp) starSpeed = baseDrift * 1.5;
        if (boostActive) starSpeed = baseDrift * 3.0;

        const horizontalDrift =
          (movingRight ? 1 : movingLeft ? -1 : 0) * (baseDrift * 0.4);

        // Only draw stars if visible (above layer 1)
        if (effectiveAlpha > 0.01) {
          starFieldRef.current.update(true, starSpeed * 0.6, horizontalDrift);
          starFieldRef.current.draw(boostActive, effectiveAlpha);
        }
      }

      // 3) rocket (top)
      drawRocket();
      // === Plasma Warp Lines Around Rocket ===
      // === Plasma Warp Lines (Safe Version) ===
      // === Cinematic Plasma Warp Field ===
      // === Side Plasma Warp Lines (Sci-Fi Realistic) ===
      // === Plasma Flow Around Rocket (Curved Sci-Fi Trails) ===
      // === Rocket Rear Plasma Exhaust ===
      {
        try {
          const movingUp =
            keys.current["ArrowUp"] || keys.current["w"] || keys.current["W"];
          const boostActive =
            movingUp &&
            (keys.current["Shift"] ||
              keys.current["ShiftLeft"] ||
              keys.current["ShiftRight"]);

          // --- Color logic ---
          const hue = boostActive ? 48 : movingUp ? 210 : 210; // warm gold for boost, blue-white otherwise
          const saturation = boostActive ? 100 : movingUp ? 70 : 40;
          const lightness = boostActive ? 70 : movingUp ? 85 : 90;
          const alpha = boostActive ? 0.8 : movingUp ? 0.45 : 0.2;

          // --- Shape/size control ---
          const exhaustCount = boostActive ? 22 : movingUp ? 16 : 8;
          const exhaustLength = boostActive ? 140 : movingUp ? 100 : 50;
          const exhaustWidth = boostActive ? 1.8 : movingUp ? 1.3 : 0.8;

          const rocketCenterX = rocket.x + rocket.w / 2;
          const rocketBottomY = rocket.y + rocket.h - 2;

          ctx.save();
          ctx.globalAlpha = alpha;

          for (let i = 0; i < exhaustCount; i++) {
            // Gentle jitter for turbulence look
            const jitterX = (Math.random() - 0.5) * rocket.w * 0.4;
            const startX = rocketCenterX + jitterX;
            const startY = rocketBottomY;

            // More vertical exhaust — slightly flaring outward
            const controlX = startX + jitterX * 0.4;
            const controlY = startY + exhaustLength * 0.35;
            const endX = startX + jitterX * 0.7;
            const endY = startY + exhaustLength;

            const gradient = ctx.createLinearGradient(
              startX,
              startY,
              endX,
              endY
            );
            gradient.addColorStop(
              0,
              `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`
            );
            gradient.addColorStop(
              0.3,
              `hsla(${hue}, ${saturation}%, ${lightness}%, ${
                0.85 - Math.random() * 0.2
              })`
            );
            gradient.addColorStop(
              1,
              `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`
            );

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = exhaustWidth;
            ctx.stroke();
          }

          // --- Core glow near rocket ---
          const coreGradient = ctx.createRadialGradient(
            rocketCenterX,
            rocketBottomY,
            0,
            rocketCenterX,
            rocketBottomY,
            18
          );
          coreGradient.addColorStop(
            0,
            `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`
          );
          coreGradient.addColorStop(1, `transparent`);

          ctx.fillStyle = coreGradient;
          ctx.fillRect(rocketCenterX - 20, rocketBottomY - 4, 40, 30);

          ctx.restore();
        } catch (err) {
          console.warn("Plasma exhaust draw skipped:", err);
        }
      }

      // === High-Speed Plasma Lines Around Rocket ===
      // === High-Speed Plasma Lines Around Rocket ===
      if (!gameOver) {
        const speed = visualSpeedRef.current * 100; // convert your speedRef into visible intensity

        if (speed > 15) {
          const streakCount = Math.min(20, Math.floor(speed / 8));
          const streakLength = Math.min(80, speed * 1.4);
          const streakAlpha = Math.min(0.85, speed / 150);
          const hue = 190 + Math.min(100, speed / 2);

          for (let i = 0; i < streakCount; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const tilt = (Math.random() - 0.5) * 0.3; // small angle tilt per line
            const x = rocket.x + rocket.w / 2 + offsetX;
            const y1 = rocket.y - streakLength / 2;
            const y2 = rocket.y + streakLength / 2;

            ctx.save();
            ctx.translate(x, rocket.y);
            ctx.rotate(tilt);
            ctx.translate(-x, -rocket.y);

            const gradient = ctx.createLinearGradient(x, y1, x, y2);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 75%, 0)`);
            gradient.addColorStop(
              0.5,
              `hsla(${hue}, 100%, 70%, ${streakAlpha})`
            );
            gradient.addColorStop(1, `hsla(${hue}, 100%, 75%, 0)`);

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 4) particles (if explosion active)
      updateParticles(deltaMs);
      drawParticles();

      // collision check (only active while not game over)
      if (!gameOver && checkCollision()) {
        // create plasma burst at rocket center
        const cx = rocket.x + rocket.w / 2;
        const cy = rocket.y + rocket.h / 2;
        createPlasmaBurst(cx, cy);
        //setGameOver(true);
      }

      // report HUD/parent
      const layerInfo =
        layersData[
          Math.max(
            0,
            Math.min(layersData.length - 1, getLayer(distanceRef.current))
          )
        ] || {};
      const regionName =
        macroRegions[getMacroRegionIndex(distanceRef.current)]?.name;
      onUpdate?.({
        distanceKm: Math.floor(distanceRef.current),
        distanceAU: (distanceRef.current / 1.496e8).toFixed(6),
        layer: layerInfo.name,
        place: layerInfo.place,
        region: regionName,
      });

      // overlay gameover text with slight fade after explosion begins
      if (gameOver) {
        // fade background overlay in proportion to explosion progress (t capped)
        const alpha = Math.min(0.7, 0.25 + explosionRef.current.t / 900);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "GAME OVER",
          gameCanvas.width / 2,
          gameCanvas.height / 2 - 20
        );
        ctx.font = "22px sans-serif";
        ctx.fillText(
          "Click or press 'R' to restart",
          gameCanvas.width / 2,
          gameCanvas.height / 2 + 24
        );
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    // ----- Cleanup -----
    return () => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleRestartKey);
      window.removeEventListener("click", handleRestartClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdate, gameOver]);

  // ----- JSX -----
  return (
    <div
      className="absolute inset-0"
      style={{
        pointerEvents: "auto",
      }}
    >
      <canvas
        ref={starCanvasRef}
        id="star-canvas"
        className="absolute inset-0"
        style={{ zIndex: 0, position: "absolute", inset: 0 }}
      />
      <canvas
        ref={gameCanvasRef}
        id="game-canvas"
        className="absolute inset-0"
        style={{ zIndex: 1, position: "absolute", inset: 0 }}
      />
    </div>
  );
}
