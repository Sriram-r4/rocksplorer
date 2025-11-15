// src/utils/CloudField.js

export class CloudField {
  constructor(ctx, width, height, cloudCount = 25) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.cloudCount = cloudCount;
    this.clouds = this.createClouds();
    this.fadeProgress = 0; // controls how visible clouds are
  }

  createClouds() {
    return Array.from({ length: this.cloudCount }, () => {
      const depth = Math.random() * 1.5 + 0.5; // parallax depth
      const scaleVariation = Math.random() * 0.6 + 0.7;
      const width = (80 + Math.random() * 120) * scaleVariation;
      const height = (30 + Math.random() * 50) * scaleVariation;
      
      // More variation in cloud puffiness
      const puffCount = 3 + Math.floor(Math.random() * 4);
      const puffs = Array.from({ length: puffCount }, (_, i) => ({
        offsetX: (i / (puffCount - 1) - 0.5) * width * 0.8,
        offsetY: (Math.random() - 0.5) * height * 0.3,
        radius: width * (0.25 + Math.random() * 0.2),
      }));

      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: depth,
        width,
        height,
        alpha: 0.6 + Math.random() * 0.3,
        driftSpeed: (0.01 + Math.random() * 0.02) / depth,
        puffs,
        baseAlpha: 0.6 + Math.random() * 0.3,
      };
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.clouds = this.createClouds();
  }

  /**
   * Fade clouds based on altitude - visible at low altitudes, fade out as you climb
   */
  setFade(distanceKm) {
    const fadeOutStart = 8000; // start fading around 8 km (troposphere)
    const fadeOutEnd = 20000; // fully invisible by 20 km (stratosphere)
    
    // Inverse fade - visible at low altitude, fade out at high altitude
    const t = Math.max(0, Math.min((distanceKm - fadeOutStart) / (fadeOutEnd - fadeOutStart), 1));
    // Smooth ease-out curve
    this.fadeProgress = 1 - (t * t * (3 - 2 * t));
  }

  update(isMoving = false, speedFactor = 1, horizontalDrift = 0) {
    const now = Date.now();

    this.clouds.forEach((cloud) => {
      // Gentle alpha variation for atmosphere feel
      const breathe = Math.sin(now * 0.0008 + cloud.x * 0.01) * 0.05;
      cloud.alpha = Math.max(0.5, Math.min(0.95, cloud.baseAlpha + breathe));

      // Natural horizontal drift
      cloud.x += cloud.driftSpeed * 60;
      
      if (isMoving) {
        const moveY = (speedFactor / cloud.z) * 0.8;
        cloud.y += moveY;
        cloud.x += horizontalDrift * (1 / cloud.z) * 0.5;

        // Wrap clouds around screen
        if (cloud.y > this.height + cloud.height) {
          cloud.y = -cloud.height;
          cloud.x = Math.random() * this.width;
        }
      }

      // Wrap horizontal drift
      if (cloud.x < -cloud.width) cloud.x = this.width + cloud.width;
      if (cloud.x > this.width + cloud.width) cloud.x = -cloud.width;
    });
  }

  draw(isMoving = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    // Sort by depth for proper layering
    const sortedClouds = [...this.clouds].sort((a, b) => b.z - a.z);

    sortedClouds.forEach((cloud) => {
      ctx.save();
      ctx.globalAlpha = this.fadeProgress * cloud.alpha;

      // Draw each puff that makes up the cloud
      cloud.puffs.forEach((puff) => {
        const px = cloud.x + puff.offsetX;
        const py = cloud.y + puff.offsetY;

        // Soft gradient for cloud puffs
        const gradient = ctx.createRadialGradient(
          px,
          py,
          0,
          px,
          py,
          puff.radius
        );
        
        // White clouds with soft edges
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(250, 250, 250, 0.6)');
        gradient.addColorStop(1, 'rgba(245, 245, 245, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(px, py, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });

    ctx.restore();
  }
}