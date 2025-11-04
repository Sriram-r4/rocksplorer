export class ObstacleDrawer {
  static draw(ctx, obs) {
    const { x, y, size, type } = obs;

    // --- Responsive scaling ---
    // Smaller screens = larger obstacles
    let scaleFactor = 1;
    const w = window.innerWidth;

    if (w <= 400) scaleFactor = 1.8;        // Very small screens
    else if (w <= 600) scaleFactor = 1.6;   // Phones
    else if (w <= 900) scaleFactor = 1.3;   // Tablets
    else if (w <= 1200) scaleFactor = 1.1;  // Small laptops
    else scaleFactor = 1;                   // Default for desktops

    // Make obstacles larger on smaller screens
    const responsiveSize = size * scaleFactor;

    switch (type) {
      case "satellite":
        ObstacleDrawer.drawSatellite(ctx, x, y, responsiveSize);
        break;
      case "debris":
        ObstacleDrawer.drawDebris(ctx, x, y, responsiveSize);
        break;
      case "asteroid":
        ObstacleDrawer.drawAsteroid(ctx, x, y, responsiveSize);
        break;
      case "comet":
        ObstacleDrawer.drawComet(ctx, x, y, responsiveSize);
        break;
      case "junk":
        ObstacleDrawer.drawJunk(ctx, x, y, responsiveSize);
        break;
      default:
        ctx.fillStyle = "rgba(255,100,100,0.95)";
        ctx.beginPath();
        ctx.rect(x, y, responsiveSize, responsiveSize);
        ctx.fill();
        break;
    }
  }

  // --- Individual Draw Methods ---
  static drawSatellite(ctx, x, y, size) {
    ctx.fillStyle = "rgba(180,200,255,0.95)";
    ctx.fillRect(x, y, size, size * 0.5);

    ctx.fillStyle = "rgba(80,130,200,0.8)";
    ctx.fillRect(x - size * 0.4, y + size * 0.05, size * 0.35, size * 0.4);
    ctx.fillRect(x + size + size * 0.05, y + size * 0.05, size * 0.35, size * 0.4);

    // antenna
    ctx.strokeStyle = "rgba(120,160,220,0.9)";
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.5, y - size * 0.4);
    ctx.stroke();
  }

  static drawDebris(ctx, x, y, size) {
    ctx.fillStyle = "rgba(180,160,130,0.9)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * 0.7, y + size * 0.2);
    ctx.lineTo(x + size * 0.5, y + size * 0.8);
    ctx.lineTo(x - size * 0.2, y + size * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  static drawAsteroid(ctx, x, y, size) {
    ctx.fillStyle = "rgba(120,100,90,0.95)";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // crater
    ctx.fillStyle = "rgba(80,70,65,0.8)";
    ctx.beginPath();
    ctx.arc(x + size * 0.35, y + size * 0.35, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawComet(ctx, x, y, size) {
    const gradient = ctx.createLinearGradient(x - size * 2, y, x + size, y);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255,255,200,0.9)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 2, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // comet head
    ctx.fillStyle = "rgba(255,230,150,0.9)";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawJunk(ctx, x, y, size) {
    ctx.fillStyle = "rgba(180,180,190,0.9)";
    ctx.fillRect(x, y, size * 0.6, size * 0.4);
    ctx.strokeStyle = "rgba(100,100,110,0.6)";
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.strokeRect(x, y, size * 0.6, size * 0.4);
  }
}
