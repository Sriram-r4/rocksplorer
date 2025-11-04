export default function drawRocket(ctx, rocket) {
  ctx.save();

  const canvas = ctx.canvas;
  const baseWidth = 40;
  const baseHeight = 80;

  // ✅ Base scale responsive to canvas size
  let scaleFactor = Math.min(canvas.width / 1200, canvas.height / 800);

  // ✅ Make rocket a bit bigger for smaller screens
  if (canvas.width <=375 ) {
    scaleFactor *= 1.8; // Boost size on mobile
  }else if(canvas.width < 768){
    scaleFactor *= 1.6; // Bigger on small screens
  } else if (canvas.width < 1024) {
    scaleFactor *= 1.1; // Slightly bigger on tablets
  }

  rocket.w = baseWidth * scaleFactor;
  rocket.h = baseHeight * scaleFactor;

  const tilt = Math.max(-0.28, Math.min(0.28, rocket.vx * 0.022));
  ctx.translate(rocket.x + rocket.w / 2, rocket.y + rocket.h / 2);
  ctx.rotate(tilt);

  const w = rocket.w;
  const h = rocket.h;
  const scale = Math.min(w / 30, h / 60);

  // ---------------------------------------------------------
  // 🚀 ROCKET BODY (same as before)
  // ---------------------------------------------------------
  const noseGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, -h / 2);
  noseGrad.addColorStop(0, "#8b0000");
  noseGrad.addColorStop(0.3, "#ff1a1a");
  noseGrad.addColorStop(0.5, "#ff4444");
  noseGrad.addColorStop(0.7, "#ff1a1a");
  noseGrad.addColorStop(1, "#8b0000");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2, -h / 2 + h * 0.22);
  ctx.lineTo(w / 2, -h / 2 + h * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, -h / 2 + h * 0.22);
  ctx.lineTo(w / 2 - w * 0.15, -h / 2 + h * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#cc0000";
  ctx.fillRect(-w / 2, -h / 2 + h * 0.22, w, h * 0.06);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(w / 2 - w * 0.2, -h / 2 + h * 0.22, w * 0.2, h * 0.06);

  const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  bodyGrad.addColorStop(0, "#a8a8a8");
  bodyGrad.addColorStop(0.15, "#e0e0e0");
  bodyGrad.addColorStop(0.35, "#ffffff");
  bodyGrad.addColorStop(0.5, "#f5f5f5");
  bodyGrad.addColorStop(0.65, "#e8e8e8");
  bodyGrad.addColorStop(0.85, "#d0d0d0");
  bodyGrad.addColorStop(1, "#909090");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-w / 2, -h / 2 + h * 0.28, w, h * 0.52);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = Math.max(0.5, scale * 0.5);
  for (let i = 0; i < 3; i++) {
    const x = -w / 2 + (w / 3) * (i + 0.5);
    ctx.beginPath();
    ctx.moveTo(x, -h / 2 + h * 0.28);
    ctx.lineTo(x, h / 2 - h * 0.15);
    ctx.stroke();
  }

  // Window
  const windowY = -h / 2 + h * 0.42;
  const windowRadius = w * 0.22;
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.arc(0, windowY, windowRadius + scale * 1.5, 0, Math.PI * 2);
  ctx.fill();

  const windowGrad = ctx.createRadialGradient(
    -windowRadius * 0.3,
    windowY - windowRadius * 0.3,
    0,
    0,
    windowY,
    windowRadius
  );
  windowGrad.addColorStop(0, "#2a3a5a");
  windowGrad.addColorStop(0.7, "#1a1a3a");
  windowGrad.addColorStop(1, "#0a0a1a");
  ctx.fillStyle = windowGrad;
  ctx.beginPath();
  ctx.arc(0, windowY, windowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(120, 180, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(-windowRadius * 0.35, windowY - windowRadius * 0.35, windowRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(200, 220, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(-windowRadius * 0.25, windowY - windowRadius * 0.25, windowRadius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e60000";
  ctx.fillRect(-w / 2, -h / 2 + h * 0.58, w, h * 0.08);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(w / 2 - w * 0.25, -h / 2 + h * 0.58, w * 0.25, h * 0.08);

  ctx.fillStyle = "#003399";
  ctx.font = `bold ${Math.max(8, h * 0.08)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("IND", 0, -h / 2 + h * 0.7);

  const engineGrad = ctx.createLinearGradient(-w / 2, h / 2 - h * 0.2, w / 2, h / 2 - h * 0.2);
  engineGrad.addColorStop(0, "#606060");
  engineGrad.addColorStop(0.5, "#808080");
  engineGrad.addColorStop(1, "#505050");
  ctx.fillStyle = engineGrad;
  ctx.fillRect(-w / 2, h / 2 - h * 0.2, w, h * 0.12);

  // Fins
  const finGrad = ctx.createLinearGradient(0, h / 2 - h * 0.35, 0, h / 2);
  finGrad.addColorStop(0, "#707070");
  finGrad.addColorStop(0.5, "#909090");
  finGrad.addColorStop(1, "#404040");

  ctx.fillStyle = finGrad;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2 - h * 0.35);
  ctx.lineTo(-w / 2 - w * 0.5, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2 - h * 0.35);
  ctx.lineTo(-w / 2 - w * 0.45, h / 2 - h * 0.05);
  ctx.lineTo(-w / 2, h / 2 - h * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = finGrad;
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2 - h * 0.35);
  ctx.lineTo(w / 2 + w * 0.5, h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2 - h * 0.35);
  ctx.lineTo(w / 2 + w * 0.5, h / 2);
  ctx.lineTo(w / 2 + w * 0.35, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-w * 0.38, h / 2 - h * 0.08, w * 0.76, h * 0.08);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-w * 0.32, h / 2 - h * 0.06, w * 0.64, h * 0.06);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(-w * 0.25, h / 2 - h * 0.04, w * 0.5, h * 0.04);

  // ---------------------------------------------------------
  // 🔥 RESPONSIVE THRUSTER / FLAME (ADJUSTED)
  // ---------------------------------------------------------
  const thrustPower = Math.min(1, Math.abs(rocket.vy) / Math.abs(rocket.boostSpeed));

  // Flames now scale better with screen size
  const flameScale =
    canvas.width < 768 ? 1.4 : canvas.width < 1024 ? 1.2 : 1.0;

  const flameHeight =
    (25 + Math.random() * 10 + 60 * thrustPower) *
    scaleFactor *
    flameScale;
  const flameWidth =
    (15 + Math.random() * 5 + 12 * thrustPower) *
    scaleFactor *
    flameScale;

  // Glow
  const glowGrad = ctx.createRadialGradient(
    0,
    h / 2 + flameHeight * 0.3,
    0,
    0,
    h / 2 + flameHeight * 0.5,
    flameHeight * 0.8
  );
  glowGrad.addColorStop(0, `rgba(255, 100, 0, ${0.4 * thrustPower})`);
  glowGrad.addColorStop(1, "rgba(255, 60, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, h / 2 + flameHeight * 0.3, flameHeight * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Outer flame
  const outerFlameGrad = ctx.createRadialGradient(
    0,
    h / 2,
    flameWidth * 0.2,
    0,
    h / 2 + flameHeight * 0.7,
    flameHeight
  );
  outerFlameGrad.addColorStop(0, `rgba(255, 200, 80, ${0.95 * (0.7 + thrustPower * 0.3)})`);
  outerFlameGrad.addColorStop(0.3, `rgba(255, 150, 40, ${0.85 * (0.6 + thrustPower * 0.4)})`);
  outerFlameGrad.addColorStop(0.7, `rgba(255, 100, 20, ${0.6 * (0.5 + thrustPower * 0.5)})`);
  outerFlameGrad.addColorStop(1, "rgba(255, 60, 0, 0)");

  ctx.fillStyle = outerFlameGrad;
  ctx.beginPath();
  ctx.moveTo(-flameWidth * 0.7, h / 2);
  ctx.quadraticCurveTo(
    -flameWidth * 0.9,
    h / 2 + flameHeight * 0.4,
    -flameWidth * 0.5 + Math.random() * 4,
    h / 2 + flameHeight * 0.9
  );
  ctx.quadraticCurveTo(
    0,
    h / 2 + flameHeight + Math.random() * 8,
    flameWidth * 0.5 + Math.random() * 4,
    h / 2 + flameHeight * 0.9
  );
  ctx.quadraticCurveTo(
    flameWidth * 0.9,
    h / 2 + flameHeight * 0.4,
    flameWidth * 0.7,
    h / 2
  );
  ctx.closePath();
  ctx.fill();

  // Middle flame
  const midFlameGrad = ctx.createRadialGradient(
    0,
    h / 2,
    0,
    0,
    h / 2 + flameHeight * 0.6,
    flameHeight * 0.7
  );
  midFlameGrad.addColorStop(0, `rgba(255, 240, 150, ${0.95 * (0.8 + thrustPower * 0.2)})`);
  midFlameGrad.addColorStop(0.5, `rgba(255, 200, 80, ${0.8 * (0.7 + thrustPower * 0.3)})`);
  midFlameGrad.addColorStop(1, "rgba(255, 150, 40, 0)");
  ctx.fillStyle = midFlameGrad;
  ctx.beginPath();
  ctx.moveTo(-flameWidth * 0.45, h / 2);
  ctx.quadraticCurveTo(
    -flameWidth * 0.55,
    h / 2 + flameHeight * 0.4,
    -flameWidth * 0.25,
    h / 2 + flameHeight * 0.7
  );
  ctx.quadraticCurveTo(
    0,
    h / 2 + flameHeight * 0.75 + Math.random() * 6,
    flameWidth * 0.25,
    h / 2 + flameHeight * 0.7
  );
  ctx.quadraticCurveTo(
    flameWidth * 0.55,
    h / 2 + flameHeight * 0.4,
    flameWidth * 0.45,
    h / 2
  );
  ctx.closePath();
  ctx.fill();

  // Inner flame
  const coreGrad = ctx.createRadialGradient(
    0,
    h / 2,
    0,
    0,
    h / 2 + flameHeight * 0.4,
    flameHeight * 0.5
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * (0.85 + thrustPower * 0.15)})`);
  coreGrad.addColorStop(0.3, `rgba(255, 255, 220, ${0.9 * (0.8 + thrustPower * 0.2)})`);
  coreGrad.addColorStop(0.7, `rgba(255, 240, 150, ${0.7 * (0.7 + thrustPower * 0.3)})`);
  coreGrad.addColorStop(1, "rgba(255, 200, 80, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(-flameWidth * 0.25, h / 2);
  ctx.quadraticCurveTo(
    -flameWidth * 0.3,
    h / 2 + flameHeight * 0.3,
    0,
    h / 2 + flameHeight * 0.5 + Math.random() * 5
  );
  ctx.quadraticCurveTo(
    flameWidth * 0.3,
    h / 2 + flameHeight * 0.3,
    flameWidth * 0.25,
    h / 2
  );
  ctx.closePath();
  ctx.fill();

  // Body highlight
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = Math.max(1, scale * 0.8);
  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h / 2 + h * 0.3);
  ctx.lineTo(-w * 0.35, h / 2 - h * 0.25);
  ctx.stroke();

  ctx.restore();
}
