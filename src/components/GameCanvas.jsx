import { useRef, useEffect } from "react";
import { layersData } from "../data/layersData";

export default function GameCanvas({ onUpdate }) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const distanceRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const rocket = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 100,
      w: 40,
      h: 60,
    };

    // Key handling
    const handleKeyDown = (e) => (keys.current[e.key] = true);
    const handleKeyUp = (e) => (keys.current[e.key] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Color interpolation
    function interpolateColor(color1, color2, factor) {
      const c1 = parseInt(color1.slice(1), 16);
      const c2 = parseInt(color2.slice(1), 16);

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

    // Find current layer
    function getLayer(distance) {
      for (let i = 0; i < layersData.length - 1; i++) {
        if (distance < layersData[i + 1].distanceKm) return i;
      }
      return layersData.length - 1;
    }

    // Draw correct upward gradient (green → blue → black)
    function drawBackground(distance) {
      const index = getLayer(distance);
      const current = layersData[index];
      const next = layersData[index + 1] || current;

      const range = next.distanceKm - current.distanceKm || 1;
      const factor = Math.min(
        Math.max((distance - current.distanceKm) / range, 0),
        1
      );

      // now bottom (ground) = colorFrom, top (sky/space) = colorTo
      const bottomColor = interpolateColor(
        current.colorFrom,
        next.colorFrom,
        factor
      );
      const topColor = interpolateColor(current.colorTo, next.colorTo, factor);

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, bottomColor);
      gradient.addColorStop(1, topColor);
      


      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return current;
    }

    function drawRocket() {
      ctx.save();
      ctx.translate(rocket.x + rocket.w / 2, rocket.y + rocket.h / 2);

      // body
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(0, -rocket.h / 2);
      ctx.lineTo(-rocket.w / 2, rocket.h / 2);
      ctx.lineTo(rocket.w / 2, rocket.h / 2);
      ctx.closePath();
      ctx.fill();

      // flame
      const flameHeight = 20 + Math.random() * 10;
      const flameWidth = 10 + Math.random() * 5;
      const gradient = ctx.createLinearGradient(
        0,
        rocket.h / 2,
        0,
        rocket.h / 2 + flameHeight
      );
      gradient.addColorStop(0, "orange");
      gradient.addColorStop(1, "red");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, rocket.h / 2);
      ctx.lineTo(-flameWidth / 2, rocket.h / 2 + flameHeight);
      ctx.lineTo(flameWidth / 2, rocket.h / 2 + flameHeight);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Update logic
    function update() {
      let baseSpeed = 5;
      const isBoosting = keys.current["Shift"]; // check if Shift is pressed

      // Boost speed when Shift + Up (or W) is pressed
      if ((keys.current["ArrowUp"] || keys.current["w"]) && isBoosting) {
        baseSpeed *= 200000; // 5x speed
      }

      if (keys.current["ArrowLeft"] || keys.current["a"]) rocket.x -= baseSpeed;
      if (keys.current["ArrowRight"] || keys.current["d"])
        rocket.x += baseSpeed;

      if (keys.current["ArrowUp"] || keys.current["w"]) {
        rocket.y -= baseSpeed;
        distanceRef.current += baseSpeed * 10; // Increase per frame
      }
    //   if (keys.current["ArrowDown"] || keys.current["s"]) {
    //     rocket.y += baseSpeed;
    //     distanceRef.current = Math.max(0, distanceRef.current - baseSpeed * 10);
    //   }

      // Keep oo
      // rocket inside screen
      rocket.x = Math.max(0, Math.min(canvas.width - rocket.w, rocket.x));
      rocket.y = Math.max(0, Math.min(canvas.height - rocket.h, rocket.y));
    }

    function loop() {
      update();
      const layer = drawBackground(distanceRef.current);
      drawRocket();

      onUpdate({
        distanceKm: distanceRef.current,
        distanceAU: (distanceRef.current / 1.496e8).toFixed(6),
        layer: layer.name,
        place: layer.place,
      });

      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onUpdate]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}
