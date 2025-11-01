export class StarField {
  constructor(ctx, width, height, starCount = 120) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.starCount = starCount;
    this.stars = this.createStars();
    this.fadeProgress = 0; // controls how visible stars are
  }

  createStars() {
    return Array.from({ length: this.starCount }, () => {
      const depth = Math.random() * 2.5 + 0.3;
      const size = Math.random() * 1.6 + 0.4;
      const hue =
        Math.random() > 0.75
          ? 40 + Math.random() * 20 // some warm yellow-white stars
          : 190 + Math.random() * 50; // mostly bluish-white stars

      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: depth,
        radius: size,
        alpha: Math.random() * 0.4 + 0.5,
        twinkleSpeed: Math.random() * 0.008 + 0.003,
        hue,
        trailLength: Math.random() * 8 + 4,
        baseRadius: size,
      };
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.stars = this.createStars();
  }

  /**
   * Smoothly fade stars in based on distance (e.g., start visible after ~80km)
   */
  setFade(distanceKm) {
    const minFadeStart = 80000;  // start fading around 80 km
    const fullFadeAt = 250000;   // fully visible by 250 km
    const t = Math.max(0, Math.min((distanceKm - minFadeStart) / (fullFadeAt - minFadeStart), 1));
    // Ease-in curve for smoother transition
    this.fadeProgress = t * t * (3 - 2 * t);
  }

  update(isMoving = false, speedFactor = 1) {
    this.stars.forEach((star) => {
      // Subtle twinkling & breathing
      const flicker = Math.sin(Date.now() * star.twinkleSpeed) * 0.05;
      star.alpha = Math.max(
        0.3,
        Math.min(1, star.alpha + flicker * (Math.random() - 0.5))
      );

      // Pulsating glow (dynamic sizing)
      const sizeBoost = isMoving ? 1.25 : 1; // slightly bigger while moving
      star.radius =
        star.baseRadius *
        sizeBoost *
        (1 + Math.sin(Date.now() * star.twinkleSpeed) * 0.05);

      // Parallax motion
      if (isMoving) {
        const parallaxSpeed = (3 / star.z) * speedFactor;
        star.y += parallaxSpeed * 0.8;
        if (star.y > this.height) {
          star.y = 0;
          star.x = Math.random() * this.width;
        }
      }
    });
  }

  draw(isMoving = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    this.stars.forEach((star) => {
      const hue = star.hue;

      if (isMoving) {
        // subtle trailing streak with depth variation
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y - star.trailLength * (star.z * 0.4),
          star.x,
          star.y
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 85%, 0)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 80%, ${star.alpha * 0.6})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.radius * (1.1 / star.z);
        ctx.moveTo(star.x, star.y - star.trailLength * (star.z * 0.4));
        ctx.lineTo(star.x, star.y);
        ctx.stroke();
      } else {
        // softly glowing static star
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3.5
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 90%, ${star.alpha * 0.9})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 30%, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(star.x, star.y, star.radius * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
