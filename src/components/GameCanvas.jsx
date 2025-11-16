import { useRef, useEffect, useState } from "react";
import { layersData } from "../data/layersData";
import { StarField } from "../utils/StarField";
import { ObstacleDrawer } from "../components/game/ObstacleDrawer";
import drawRocketObject from "./game/rocket";
import { CloudField } from "../utils/CloudField";

export default function GameCanvas({ onUpdate }) {
  const gameCanvasRef = useRef(null);
  const starCanvasRef = useRef(null);
  const cloudFieldRef = useRef(null);
  const keys = useRef({});
  const distanceRef = useRef(0);
  const visualScrollRef = useRef(0);
  const visualSpeedRef = useRef(0);
  const animationRef = useRef(null);
  const starFieldRef = useRef(null);
  const obstaclesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const particlesRef = useRef([]);
  const explosionRef = useRef({ active: false, t: 0 });
  const lastDistanceUpdateRef = useRef(0);
  const lastDistanceValueRef = useRef(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState("hard");

  useEffect(() => {
    function updateGameMode() {
      if (window.innerWidth < 900) {
        setGameMode("easy");
      } else {
        setGameMode("hard");
      }
    }

    updateGameMode(); 
    window.addEventListener("resize", updateGameMode);

    return () => window.removeEventListener("resize", updateGameMode);
  }, []);

  useEffect(() => {
    const gameCanvas = gameCanvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!gameCanvas || !starCanvas) return;

    const ctx = gameCanvas.getContext("2d");
    const starCtx = starCanvas.getContext("2d");

    const getViewportHeight = () => {
      return window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = getViewportHeight();

      gameCanvas.width = width;
      gameCanvas.height = height;
      starCanvas.width = width;
      starCanvas.height = height;

      if (starFieldRef.current) starFieldRef.current.resize(width, height);
      if (cloudFieldRef.current) cloudFieldRef.current.resize(width, height);
    };

    resize();

    window.addEventListener("resize", resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
    }

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
      boostSpeed: -0.26,
    };

    const handleKeyDown = (e) => (keys.current[e.key] = true);
    const handleKeyUp = (e) => (keys.current[e.key] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const restartGame = () => {
      setGameOver(false);
      obstaclesRef.current = [];
      particlesRef.current = [];
      explosionRef.current = { active: false, t: 0 };
      distanceRef.current = 0;
      visualScrollRef.current = 0;
      visualSpeedRef.current = 0;
      lastDistanceUpdateRef.current = 0;
      lastDistanceValueRef.current = 0;
      rocket.x = gameCanvas.width / 2 - 20;
      rocket.vx = 0;
      rocket.vy = 0;
      rocket.targetVy = rocket.baseClimb;
      spawnTimerRef.current = 0;
      if (!animationRef.current)
        animationRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("keydown", (e) => {
      if (gameOver && (e.key === "r" || e.key === "R")) restartGame();
    });
    window.addEventListener("click", () => {
      if (gameOver) restartGame();
    });

    let touchStartX = 0,
      touchStartY = 0;
    let touchActive = false;

    function handleTouchStart(e) {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchActive = true;
      keys.current["ArrowUp"] = true;
    }

    function handleTouchMove(e) {
      if (!touchActive) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      keys.current["ArrowLeft"] = false;
      keys.current["ArrowRight"] = false;
      keys.current["Shift"] = false;

      if (dx > 30) keys.current["ArrowRight"] = true;
      else if (dx < -30) keys.current["ArrowLeft"] = true;

      if (dy < -50) keys.current["Shift"] = true;
    }

    function handleTouchEnd() {
      touchActive = false;
      keys.current["ArrowUp"] = false;
      keys.current["ArrowLeft"] = false;
      keys.current["ArrowRight"] = false;
      keys.current["Shift"] = false;
    }

    const handleRestartKey = (e) => {
      if (gameOver && (e.key === "r" || e.key === "R")) restartGame();
    };
    const handleRestartClick = () => {
      if (gameOver) restartGame();
    };

    gameCanvas.addEventListener("touchstart", handleTouchStart);
    gameCanvas.addEventListener("touchmove", handleTouchMove);
    gameCanvas.addEventListener("touchend", handleTouchEnd);
    gameCanvas.addEventListener("touchcancel", handleTouchEnd);

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

    if (!starFieldRef.current)
      starFieldRef.current = new StarField(
        starCtx,
        starCanvas.width,
        starCanvas.height,
        160
      );

    if (!cloudFieldRef.current)
      cloudFieldRef.current = new CloudField(
        starCtx,
        starCanvas.width,
        starCanvas.height,
        25
      );

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
    function getScaleFactor() {
      const w = window.innerWidth;
      if (w <= 400) return 0.5;
      if (w <= 600) return 0.65;
      if (w <= 900) return 0.8;
      if (w <= 1200) return 0.9;
      return 1;
    }

    function getDifficultySettings() {
      return gameMode === "hard"
        ? {
            spawnMultiplier: 0.75,
            speedMultiplier: 1.5,
            hitboxMargin: 3.5,
          }
        : {
            spawnMultiplier: 1.3,
            speedMultiplier: 0.85,
            hitboxMargin: 7,
          };
    }

    function spawnObstacle(regionIndex) {
      const scaleFactor = getScaleFactor();
      const { speedMultiplier } = getDifficultySettings();

      const { width: cw, height: ch } = gameCanvas;

      const typeSets = [
        ["debris", "junk", "satellite"],
        ["satellite", "asteroid", "comet", "moon"],
        ["asteroid", "comet", "nebula"],
        ["nebula", "blackhole", "asteroid"],
      ];
      const possibleTypes = typeSets[Math.min(regionIndex, 3)];
      const type =
        possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

      const sizeBase =
        {
          satellite: 40,
          asteroid: 50,
          comet: 45,
          moon: 70,
          nebula: 90,
          blackhole: 80,
          debris: 35,
          junk: 30,
        }[type] || 40;

      const size = sizeBase * scaleFactor * (1 + Math.random() * 0.3);
      const speed =
        (1.2 + regionIndex * 0.8) *
        scaleFactor *
        (0.8 + Math.random() * 0.4) *
        speedMultiplier;

      const x = Math.random() * (cw - size);
      const y = -size - Math.random() * (ch * 0.3);

      obstaclesRef.current.push({
        x,
        y,
        size,
        speed,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    function updateObstacles(deltaMs, visualSpeed, regionIndex) {
      spawnTimerRef.current += deltaMs;

      const { spawnMultiplier } = getDifficultySettings();
      const scaleFactor = getScaleFactor();

      const baseIntervals = [1600, 1300, 1000, 800];
      const difficultyBoost =
        1 + regionIndex * 0.25 + Math.abs(visualSpeed) * 0.003;
      const screenAdjustment = scaleFactor < 0.8 ? 1.3 : 1.0;

      const interval =
        (baseIntervals[Math.min(regionIndex, baseIntervals.length - 1)] *
          screenAdjustment *
          spawnMultiplier) /
        difficultyBoost;

      if (spawnTimerRef.current > interval) {
        const burstChance = 0.18 + regionIndex * 0.05;
        const burstCount =
          Math.random() < burstChance ? 1 + Math.floor(Math.random() * 2) : 1;

        for (let i = 0; i < burstCount; i++) {
          spawnObstacle(regionIndex);
        }

        spawnTimerRef.current = 0;
      }

      obstaclesRef.current.forEach((obs) => {
        obs.y += obs.speed;
        obs.rotation += obs.rotSpeed;
      });

      obstaclesRef.current = obstaclesRef.current.filter(
        (obs) => obs.y < gameCanvas.height + obs.size * 1.5
      );
    }

    function drawObstacles() {
      if (!ctx) return;
      ctx.save();
      obstaclesRef.current.forEach((obs) => {
        ObstacleDrawer.draw(ctx, obs);
      });
      ctx.restore();
    }

    function checkCollision() {
      const { hitboxMargin } = getDifficultySettings();
      return obstaclesRef.current.some((obs) => {
        const m = hitboxMargin;
        return (
          rocket.x + m < obs.x + obs.size - m &&
          rocket.x + rocket.w - m > obs.x + m &&
          rocket.y + m < obs.y + obs.size - m &&
          rocket.y + rocket.h - m > obs.y + m
        );
      });
    }

    function createPlasmaBurst(cx, cy) {
      particlesRef.current = [];
      const count = 48 + Math.floor(Math.random() * 24);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 8;
        const life = 700 + Math.random() * 600;
        const size = 1 + Math.random() * 3;
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
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.02;
        p.x += p.vx + (Math.random() - 0.5) * 0.3;
        p.y += p.vy + (Math.random() - 0.5) * 0.3;
        p.age += deltaMs;
      });
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

        ctx.beginPath();
        ctx.fillStyle = `${p.color}${(0.9 * glow).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

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

    function updatePhysics(deltaMs) {
      const upPressed = keys.current["ArrowUp"] || keys.current["w"];
      const boostPressed =
        keys.current["Shift"] ||
        keys.current["ShiftLeft"] ||
        keys.current["ShiftRight"];

      if (upPressed && boostPressed) rocket.targetVy = rocket.boostSpeed;
      else if (upPressed) rocket.targetVy = rocket.thrustSpeed;
      else rocket.targetVy = rocket.baseClimb;

      const smooth = 0.08;
      rocket.vy += (rocket.targetVy - rocket.vy) * smooth;

      if (keys.current["ArrowLeft"] || keys.current["a"]) rocket.vx -= 0.22;
      if (keys.current["ArrowRight"] || keys.current["d"]) rocket.vx += 0.22;
      rocket.vx *= 0.96;
      rocket.x += rocket.vx;
      rocket.x = Math.max(0, Math.min(gameCanvas.width - rocket.w, rocket.x));

      advanceDistance(deltaMs);

      const regionIdx = getMacroRegionIndex(distanceRef.current);
      const region = macroRegions[regionIdx];
      const regionMs = Math.max(1000, region.durationSec * 1000);
      const baseFractionPerMs = 1 / regionMs;
      const fracPerMs = baseFractionPerMs * (region.baseSpeedFactor || 1);

      const baseVisual = 0.02 + regionIdx * 0.006;
      const thrustFactor = Math.max(0, -rocket.vy) * 0.85;
      const boostFactor = keys.current["Shift"] ? 1.2 : 1;

      const targetVisualSpeed =
        (baseVisual + fracPerMs * 0.18) *
        (1 + thrustFactor) *
        boostFactor *
        1.0;

      visualSpeedRef.current +=
        (targetVisualSpeed - visualSpeedRef.current) * 0.06;

      const step = Math.max(
        0,
        Math.min(visualSpeedRef.current * deltaMs * 1.0, 200)
      );
      visualScrollRef.current += step;

      if (visualScrollRef.current > 1e7) visualScrollRef.current %= 1e7;
    }

    function drawRocket() {
      drawRocketObject(ctx, rocket);
    }

    let lastTime = 0;
    function loop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const deltaMs = Math.min(60, timestamp - lastTime);
      lastTime = timestamp;

      if (!gameOver) {
        updatePhysics(deltaMs);
      }

      const { idx: layerIdx } = drawGradientForLayer(distanceRef.current);

      ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

      updateObstacles(
        deltaMs,
        visualSpeedRef.current,
        getMacroRegionIndex(distanceRef.current)
      );
      drawObstacles();

      if (cloudFieldRef.current) {
        cloudFieldRef.current.setFade(distanceRef.current);
        const effectiveCloudAlpha = cloudFieldRef.current.fadeProgress;

        const movingUp =
          keys.current["ArrowUp"] || keys.current["w"] || keys.current["W"];
        const movingLeft =
          keys.current["ArrowLeft"] || keys.current["a"] || keys.current["A"];
        const movingRight =
          keys.current["ArrowRight"] || keys.current["d"] || keys.current["D"];

        const baseDrift = visualSpeedRef.current * 25;
        const cloudSpeed = movingUp ? baseDrift * 1.2 : baseDrift * 0.5;
        const horizontalDrift =
          (movingRight ? 1 : movingLeft ? -1 : 0) * (baseDrift * 0.4);

        if (effectiveCloudAlpha > 0.01) {
          cloudFieldRef.current.update(true, cloudSpeed * 0.4, horizontalDrift);
          cloudFieldRef.current.draw(movingUp);
        }
      }

      if (starFieldRef.current) {
        let starAlpha = 0;
        if (layerIdx <= 1) starAlpha = 0;
        else if (layerIdx === 5) starAlpha = 0.4;
        else if (layerIdx >= 6) starAlpha = 1;

        starFieldRef.current.fadeProgress +=
          (starAlpha - starFieldRef.current.fadeProgress) * 0.05;
        const effectiveAlpha = starFieldRef.current.fadeProgress;

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

        if (effectiveAlpha > 0.01) {
          starFieldRef.current.update(true, starSpeed * 0.6, horizontalDrift);
          starFieldRef.current.draw(boostActive, effectiveAlpha);
        }
      }

      drawRocket();

      {
        try {
          const movingUp =
            keys.current["ArrowUp"] || keys.current["w"] || keys.current["W"];
          const boostActive =
            movingUp &&
            (keys.current["Shift"] ||
              keys.current["ShiftLeft"] ||
              keys.current["ShiftRight"]);

          const hue = boostActive ? 48 : movingUp ? 210 : 210;
          const saturation = boostActive ? 100 : movingUp ? 70 : 40;
          const lightness = boostActive ? 70 : movingUp ? 85 : 90;
          const alpha = boostActive ? 0.8 : movingUp ? 0.45 : 0.2;

          const exhaustCount = boostActive ? 22 : movingUp ? 16 : 8;
          const exhaustLength = boostActive ? 140 : movingUp ? 100 : 50;
          const exhaustWidth = boostActive ? 1.8 : movingUp ? 1.3 : 0.8;

          const rocketCenterX = rocket.x + rocket.w / 2;
          const rocketBottomY = rocket.y + rocket.h - 2;

          ctx.save();
          ctx.globalAlpha = alpha;

          for (let i = 0; i < exhaustCount; i++) {
            const jitterX = (Math.random() - 0.5) * rocket.w * 0.4;
            const startX = rocketCenterX + jitterX;
            const startY = rocketBottomY;

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

      if (!gameOver) {
        const speed = visualSpeedRef.current * 100;

        if (speed > 15) {
          const streakCount = Math.min(20, Math.floor(speed / 8));
          const streakLength = Math.min(80, speed * 1.4);
          const streakAlpha = Math.min(0.85, speed / 150);
          const hue = 190 + Math.min(100, speed / 2);

          for (let i = 0; i < streakCount; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const tilt = (Math.random() - 0.5) * 0.3;
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

      updateParticles(deltaMs);
      drawParticles();

      if (!gameOver && checkCollision()) {
        const cx = rocket.x + rocket.w / 2;
        const cy = rocket.y + rocket.h / 2;
        createPlasmaBurst(cx, cy);
        setGameOver(true);
      }

      const layerInfo =
        layersData[
          Math.max(
            0,
            Math.min(layersData.length - 1, getLayer(distanceRef.current))
          )
        ] || {};

      const currentTime = timestamp;
      const shouldUpdateDistance =
        distanceRef.current < 1000 ||
        currentTime - lastDistanceUpdateRef.current >= 1000;

      if (shouldUpdateDistance) {
        lastDistanceUpdateRef.current = currentTime;
        lastDistanceValueRef.current = distanceRef.current;
      }

      function formatDistance(km) {
        km = Number(km);

        const units = [
          { value: 1e3, symbol: "K" },
          { value: 1e6, symbol: "M" },
          { value: 1e9, symbol: "B" },
          { value: 1e12, symbol: "T" },
          { value: 1e15, symbol: "Q" },
          { value: 1e18, symbol: "Qi" },
          { value: 1e21, symbol: "Sx" },
          { value: 1e24, symbol: "Sp" },
        ];

        if (km < 1000) {
          return km.toLocaleString() + " km";
        }

        for (let i = units.length - 1; i >= 0; i--) {
          if (km >= units[i].value) {
            return (
              (km / units[i].value).toFixed(1) + " " + units[i].symbol + " km"
            );
          }
        }

        return km.toLocaleString() + " km";
      }

      function formatAU(au) {
        au = Number(au);

        const units = [
          { value: 1e3, symbol: "K" },
          { value: 1e6, symbol: "M" },
          { value: 1e9, symbol: "B" },
          { value: 1e12, symbol: "T" },
          { value: 1e15, symbol: "Q" },
          { value: 1e18, symbol: "Qi" },
          { value: 1e21, symbol: "Sx" },
          { value: 1e24, symbol: "Sp" },
        ];

        if (au < 0.001) {
          return au.toFixed(4);
        }

        if (au < 1000) {
          return au.toFixed(3);
        }

        for (let i = units.length - 1; i >= 0; i--) {
          if (au >= units[i].value) {
            return (au / units[i].value).toFixed(3) + " " + units[i].symbol;
          }
        }

        return au.toFixed(3);
      }

      const regionName =
        macroRegions[getMacroRegionIndex(distanceRef.current)]?.name;
      onUpdate?.({
        distanceKm: Math.floor(lastDistanceValueRef.current),
        distanceKmFormatted: formatDistance(lastDistanceValueRef.current),
        distanceAU: formatAU(lastDistanceValueRef.current / 1.496e8),
        layer: layerInfo.name,
        place: layerInfo.place,
        region: regionName,
      });

      if (gameOver) {
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

    return () => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      window.removeEventListener("resize", resize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resize);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleRestartKey);
      window.removeEventListener("click", handleRestartClick);

      gameCanvas.removeEventListener("touchstart", handleTouchStart);
      gameCanvas.removeEventListener("touchmove", handleTouchMove);
      gameCanvas.removeEventListener("touchend", handleTouchEnd);
      gameCanvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onUpdate, gameOver]);

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
