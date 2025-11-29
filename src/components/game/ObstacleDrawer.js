export class ObstacleDrawer {
  static draw(ctx, obs) {
    const { x, y, size, type, rotation = 0 } = obs;

   
    let scaleFactor = 1;
    const w = window.innerWidth;

    if (w <= 400) scaleFactor = 1.8;
    else if (w <= 600) scaleFactor = 1.6;
    else if (w <= 900) scaleFactor = 1.3;
    else if (w <= 1200) scaleFactor = 1.1;
    else scaleFactor = 1;

    const responsiveSize = size * scaleFactor;

    ctx.save();
    ctx.translate(x + responsiveSize / 2, y + responsiveSize / 2);
    ctx.rotate(rotation || 0);
    ctx.translate(-(x + responsiveSize / 2), -(y + responsiveSize / 2));

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
      case "moon":
        ObstacleDrawer.drawMoon(ctx, x, y, responsiveSize);
        break;
      case "nebula":
        ObstacleDrawer.drawNebula(ctx, x, y, responsiveSize);
        break;
      case "blackhole":
        ObstacleDrawer.drawBlackHole(ctx, x, y, responsiveSize);
        break;
      case "pulsar":
        ObstacleDrawer.drawPulsar(ctx, x, y, responsiveSize);
        break;
      default:
        ctx.fillStyle = "rgba(255,100,100,0.95)";
        ctx.beginPath();
        ctx.rect(x, y, responsiveSize, responsiveSize);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  
  
  static drawSatellite(ctx, x, y, size) {
    
    const bodyGrad = ctx.createLinearGradient(x, y, x + size, y + size * 0.6);
    bodyGrad.addColorStop(0, "rgba(220,230,255,0.95)");
    bodyGrad.addColorStop(0.5, "rgba(180,200,240,0.95)");
    bodyGrad.addColorStop(1, "rgba(140,160,200,0.9)");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, y, size, size * 0.6);

  
    const panelGrad = ctx.createLinearGradient(x - size * 0.4, y, x - size * 0.05, y);
    panelGrad.addColorStop(0, "rgba(40,80,150,0.9)");
    panelGrad.addColorStop(0.5, "rgba(60,110,190,0.9)");
    panelGrad.addColorStop(1, "rgba(40,80,150,0.9)");
    
    ctx.fillStyle = panelGrad;
    ctx.fillRect(x - size * 0.5, y + size * 0.05, size * 0.45, size * 0.5);
    ctx.fillRect(x + size + size * 0.05, y + size * 0.05, size * 0.45, size * 0.5);

   
    ctx.strokeStyle = "rgba(20,40,80,0.6)";
    ctx.lineWidth = Math.max(0.5, size * 0.02);
    for (let i = 0; i < 3; i++) {
      const offset = size * 0.15 * i;
      ctx.strokeRect(x - size * 0.5, y + size * 0.05 + offset, size * 0.45, size * 0.15);
      ctx.strokeRect(x + size + size * 0.05, y + size * 0.05 + offset, size * 0.45, size * 0.15);
    }

    
    ctx.strokeStyle = "rgba(180,200,255,0.9)";
    ctx.lineWidth = Math.max(1.5, size * 0.06);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.5, y - size * 0.5);
    ctx.stroke();

    
    ctx.fillStyle = "rgba(255,100,100,0.9)";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y - size * 0.5, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawDebris(ctx, x, y, size) {
   
    ctx.fillStyle = "rgba(160,150,140,0.9)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * 0.8, y + size * 0.15);
    ctx.lineTo(x + size * 0.9, y + size * 0.5);
    ctx.lineTo(x + size * 0.6, y + size * 0.9);
    ctx.lineTo(x + size * 0.2, y + size * 0.8);
    ctx.lineTo(x - size * 0.1, y + size * 0.4);
    ctx.closePath();
    ctx.fill();

   
    ctx.strokeStyle = "rgba(80,75,70,0.8)";
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.stroke();

    
    ctx.fillStyle = "rgba(100,90,80,0.7)";
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawJunk(ctx, x, y, size) {
   
    ctx.fillStyle = "rgba(180,180,190,0.9)";
    ctx.fillRect(x, y, size * 0.7, size * 0.5);
    
    ctx.fillStyle = "rgba(140,140,150,0.8)";
    ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.25, size * 0.3);
    
    ctx.strokeStyle = "rgba(100,100,110,0.7)";
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.strokeRect(x, y, size * 0.7, size * 0.5);

    
    ctx.strokeStyle = "rgba(120,120,130,0.6)";
    ctx.lineWidth = Math.max(0.5, size * 0.03);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.7, y + size * 0.25);
    ctx.lineTo(x + size * 0.9, y + size * 0.1);
    ctx.stroke();
  }

 
  
  static drawAsteroid(ctx, x, y, size) {
   
    const rockGrad = ctx.createRadialGradient(
      x + size * 0.4, y + size * 0.4, size * 0.1,
      x + size * 0.5, y + size * 0.5, size * 0.6
    );
    rockGrad.addColorStop(0, "rgba(140,120,100,0.95)");
    rockGrad.addColorStop(0.6, "rgba(110,90,75,0.95)");
    rockGrad.addColorStop(1, "rgba(80,65,55,0.9)");
    
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

   
    ctx.fillStyle = "rgba(60,50,45,0.8)";
    const craters = [
      {cx: 0.3, cy: 0.3, r: 0.12},
      {cx: 0.6, cy: 0.5, r: 0.08},
      {cx: 0.4, cy: 0.7, r: 0.1}
    ];
    
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(x + size * c.cx, y + size * c.cy, size * c.r, 0, Math.PI * 2);
      ctx.fill();
    });

   
    ctx.strokeStyle = "rgba(160,140,120,0.4)";
    ctx.lineWidth = Math.max(0.5, size * 0.02);
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.48, 0, Math.PI * 2);
    ctx.stroke();
  }

  static drawComet(ctx, x, y, size) {
   
    const tailGrad = ctx.createLinearGradient(x - size * 2.5, y, x + size, y);
    tailGrad.addColorStop(0, "rgba(100,150,255,0)");
    tailGrad.addColorStop(0.3, "rgba(150,200,255,0.3)");
    tailGrad.addColorStop(0.7, "rgba(200,220,255,0.6)");
    tailGrad.addColorStop(1, "rgba(255,240,200,0.9)");
    
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.2, size * 2.5, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

  
    const tail2Grad = ctx.createLinearGradient(x - size * 2, y - size * 0.3, x + size, y);
    tail2Grad.addColorStop(0, "rgba(200,150,255,0)");
    tail2Grad.addColorStop(0.5, "rgba(220,180,255,0.4)");
    tail2Grad.addColorStop(1, "rgba(255,220,200,0.7)");
    
    ctx.fillStyle = tail2Grad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 2, size * 0.4, -0.2, 0, Math.PI * 2);
    ctx.fill();

   
    const nucleusGrad = ctx.createRadialGradient(
      x + size * 0.5, y + size * 0.2, size * 0.1,
      x + size * 0.5, y + size * 0.2, size * 0.5
    );
    nucleusGrad.addColorStop(0, "rgba(255,255,255,0.95)");
    nucleusGrad.addColorStop(0.4, "rgba(255,240,180,0.9)");
    nucleusGrad.addColorStop(1, "rgba(255,200,100,0.8)");
    
    ctx.fillStyle = nucleusGrad;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.2, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawMoon(ctx, x, y, size) {
   
    const moonGrad = ctx.createRadialGradient(
      x + size * 0.35, y + size * 0.35, size * 0.1,
      x + size * 0.5, y + size * 0.5, size * 0.6
    );
    moonGrad.addColorStop(0, "rgba(230,230,235,0.95)");
    moonGrad.addColorStop(0.5, "rgba(200,200,210,0.95)");
    moonGrad.addColorStop(1, "rgba(160,160,170,0.9)");
    
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

   
    ctx.fillStyle = "rgba(130,130,140,0.8)";
    const craters = [
      {cx: 0.25, cy: 0.3, r: 0.15},
      {cx: 0.65, cy: 0.45, r: 0.12},
      {cx: 0.4, cy: 0.65, r: 0.1},
      {cx: 0.7, cy: 0.7, r: 0.08}
    ];
    
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(x + size * c.cx, y + size * c.cy, size * c.r, 0, Math.PI * 2);
      ctx.fill();
      
      
      ctx.strokeStyle = "rgba(240,240,245,0.4)";
      ctx.lineWidth = Math.max(0.5, size * 0.015);
      ctx.beginPath();
      ctx.arc(x + size * c.cx, y + size * c.cy, size * c.r, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    });
  }

  
  
  static drawNebula(ctx, x, y, size) {
   
    const colorSchemes = [
      ["rgba(255,100,150,0.7)", "rgba(200,50,100,0.4)", "rgba(150,30,80,0)"],
      ["rgba(100,150,255,0.7)", "rgba(50,100,200,0.4)", "rgba(30,80,150,0)"],
      ["rgba(150,255,150,0.7)", "rgba(100,200,100,0.4)", "rgba(80,150,80,0)"],
      ["rgba(255,150,100,0.7)", "rgba(200,100,50,0.4)", "rgba(150,80,30,0)"]
    ];
    
    const colorSet = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    
   
    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * size * 0.4;
      const offsetY = (Math.random() - 0.5) * size * 0.4;
      const grad = ctx.createRadialGradient(
        x + size * 0.5 + offsetX, y + size * 0.5 + offsetY, size * 0.05,
        x + size * 0.5 + offsetX, y + size * 0.5 + offsetY, size * 0.7
      );
      grad.addColorStop(0, colorSet[0]);
      grad.addColorStop(0.5, colorSet[1]);
      grad.addColorStop(1, colorSet[2]);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + size * 0.5 + offsetX, y + size * 0.5 + offsetY, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 8; i++) {
      const sx = x + Math.random() * size;
      const sy = y + Math.random() * size;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

 
  
  static drawPulsar(ctx, x, y, size) {
    
    const coreGrad = ctx.createRadialGradient(
      x + size * 0.5, y + size * 0.5, size * 0.05,
      x + size * 0.5, y + size * 0.5, size * 0.35
    );
    coreGrad.addColorStop(0, "rgba(255,255,255,1)");
    coreGrad.addColorStop(0.3, "rgba(200,220,255,0.95)");
    coreGrad.addColorStop(0.7, "rgba(150,180,255,0.8)");
    coreGrad.addColorStop(1, "rgba(100,140,255,0.5)");
    
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.strokeStyle = "rgba(150,200,255,0.7)";
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y - size * 0.1);
    ctx.lineTo(x + size * 0.5, y - size * 0.6);
    ctx.moveTo(x + size * 0.5, y + size * 1.1);
    ctx.lineTo(x + size * 0.5, y + size * 1.6);
    ctx.stroke();

    
    ctx.strokeStyle = "rgba(100,150,255,0.4)";
    ctx.lineWidth = Math.max(1, size * 0.03);
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(x + size * 0.5, y + size * 0.5, size * (0.5 + i * 0.15), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static drawBlackHole(ctx, x, y, size) {
    
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

   
    for (let i = 3; i > 0; i--) {
      const diskGrad = ctx.createRadialGradient(
        x + size * 0.5, y + size * 0.5, size * 0.25,
        x + size * 0.5, y + size * 0.5, size * (0.3 + i * 0.18)
      );
      diskGrad.addColorStop(0, "rgba(255,150,50,0.9)");
      diskGrad.addColorStop(0.4, "rgba(255,100,0,0.7)");
      diskGrad.addColorStop(0.7, "rgba(200,50,0,0.4)");
      diskGrad.addColorStop(1, "rgba(150,30,0,0.1)");
      
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.5, y + size * 0.5, size * (0.3 + i * 0.18), size * (0.12 + i * 0.06), 0, 0, Math.PI * 2);
      ctx.fill();
    }

   
    ctx.strokeStyle = "rgba(100,150,255,0.3)";
    ctx.lineWidth = Math.max(1, size * 0.02);
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(x + size * 0.5, y + size * 0.5, size * (0.35 + i * 0.12), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}


export function getResponsiveScale() {
  const w = window.innerWidth;
  if (w <= 400) return 1.8;
  else if (w <= 600) return 1.6;
  else if (w <= 900) return 1.3;
  else if (w <= 1200) return 1.1;
  else return 1;
}