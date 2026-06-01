"use client";

import { useEffect, useRef } from "react";

// ─── Star Field — Beautiful star shapes with cross/diamond patterns ───

export function StarField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      brightness: number;
      twinkleSpeed: number;
      twinkleOffset: number;
      type: "dot" | "cross" | "diamond" | "glow";
      rotation: number;
      rotationSpeed: number;
      color: string;
    }

    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(200, 220, 255, ",
      "rgba(255, 230, 200, ",
      "rgba(200, 255, 255, ",
      "rgba(220, 200, 255, ",
    ];

    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 180 }, () => {
        const typeRand = Math.random();
        const type = typeRand < 0.4 ? "dot" : typeRand < 0.65 ? "cross" : typeRand < 0.85 ? "diamond" : "glow";
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === "glow" ? Math.random() * 2 + 1.5 : type === "cross" ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.2 + 0.02,
          brightness: Math.random() * 0.6 + 0.4,
          twinkleSpeed: Math.random() * 0.015 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
          type,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.002,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        };
      });
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const drawCrossStar = (x: number, y: number, size: number, alpha: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Main cross lines
      const lineLen = size * 3;

      // Horizontal line
      const hGrad = ctx.createLinearGradient(-lineLen, 0, lineLen, 0);
      hGrad.addColorStop(0, `rgba(255,255,255,0)`);
      hGrad.addColorStop(0.3, `rgba(255,255,255,${alpha * 0.5})`);
      hGrad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      hGrad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.5})`);
      hGrad.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.beginPath();
      ctx.moveTo(-lineLen, 0);
      ctx.lineTo(lineLen, 0);
      ctx.strokeStyle = hGrad;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Vertical line
      const vGrad = ctx.createLinearGradient(0, -lineLen, 0, lineLen);
      vGrad.addColorStop(0, `rgba(255,255,255,0)`);
      vGrad.addColorStop(0.3, `rgba(255,255,255,${alpha * 0.5})`);
      vGrad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      vGrad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.5})`);
      vGrad.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.beginPath();
      ctx.moveTo(0, -lineLen);
      ctx.lineTo(0, lineLen);
      ctx.strokeStyle = vGrad;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      ctx.restore();
    };

    const drawDiamondStar = (x: number, y: number, size: number, alpha: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const s = size * 2;

      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.3, 0);
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.5, `rgba(200,220,255,${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(200,220,255,0)`);

      ctx.fillStyle = grad;
      ctx.fill();

      // Center bright dot
      ctx.beginPath();
      ctx.arc(0, 0, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      ctx.restore();
    };

    const drawGlowStar = (x: number, y: number, size: number, alpha: number) => {
      // Outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 8);
      outerGlow.addColorStop(0, `rgba(200,220,255,${alpha * 0.15})`);
      outerGlow.addColorStop(0.5, `rgba(200,220,255,${alpha * 0.05})`);
      outerGlow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(x, y, size * 8, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      innerGlow.addColorStop(0, `rgba(255,255,255,${alpha * 0.6})`);
      innerGlow.addColorStop(0.3, `rgba(200,220,255,${alpha * 0.3})`);
      innerGlow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      // Cross rays
      const rayLen = size * 5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const rayGrad = ctx.createLinearGradient(
          x, y,
          x + Math.cos(angle) * rayLen,
          y + Math.sin(angle) * rayLen
        );
        rayGrad.addColorStop(0, `rgba(200,220,255,${alpha * 0.3})`);
        rayGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * rayLen, y + Math.sin(angle) * rayLen);
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      for (const star of stars) {
        // Parallax
        const parallaxX = (mouse.x - canvas.width / 2) * star.speed * 0.015;
        const parallaxY = (mouse.y - canvas.height / 2) * star.speed * 0.015;
        const x = star.x + parallaxX;
        const y = star.y + parallaxY;

        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;

        // Rotation
        star.rotation += star.rotationSpeed;

        // Draw based on type
        switch (star.type) {
          case "cross":
            drawCrossStar(x, y, star.size, alpha, star.rotation);
            break;
          case "diamond":
            drawDiamondStar(x, y, star.size, alpha, star.rotation);
            break;
          case "glow":
            drawGlowStar(x, y, star.size, alpha);
            break;
          default:
            // Simple dot
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color + alpha + ")";
            ctx.fill();
            break;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 ${className}`}
    />
  );
}

// ─── Shooting Star — occasional streak ───────────────────

export function ShootingStars({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    let stars: ShootingStar[] = [];
    let lastSpawn = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      if (time - lastSpawn > 2000 + Math.random() * 4000) {
        lastSpawn = time;
        stars.push({
          x: Math.random() * canvas.width * 0.7,
          y: Math.random() * canvas.height * 0.25,
          vx: 4 + Math.random() * 5,
          vy: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 35 + Math.random() * 25,
          size: 1 + Math.random() * 1.5,
        });
      }

      stars = stars.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.15 ? progress * 6 : progress > 0.7 ? (1 - progress) * 3 : 1;

        // Streak
        const gradient = ctx.createLinearGradient(
          s.x - s.vx * 10, s.y - s.vy * 10,
          s.x, s.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(200, 220, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.size;
        ctx.lineCap = "round";
        ctx.stroke();

        // Head
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        glow.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.3})`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        return s.life < s.maxLife;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}
