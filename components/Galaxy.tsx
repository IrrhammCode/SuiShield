"use client";

import { useEffect, useRef, useState } from "react";

// ─── Star Field — Canvas stars with parallax ─────────────

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
    }

    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        brightness: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      for (const star of stars) {
        // Parallax effect based on mouse
        const parallaxX = (mouse.x - canvas.width / 2) * star.speed * 0.01;
        const parallaxY = (mouse.y - canvas.height / 2) * star.speed * 0.01;

        const x = star.x + parallaxX;
        const y = star.y + parallaxY;

        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Glow for brighter stars
        if (star.size > 1) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, star.size * 4);
          glow.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.3})`);
          glow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(x, y, star.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
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

// ─── Nebula — Colored cloud effects ──────────────────────

export function Nebula({ className = "" }: { className?: string }) {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Deep blue nebula */}
      <div
        className="absolute"
        style={{
          width: "80vw",
          height: "60vh",
          top: "-10%",
          left: "-20%",
          background: "radial-gradient(ellipse at center, rgba(10, 20, 80, 0.4) 0%, rgba(5, 10, 40, 0.2) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float 25s ease-in-out infinite",
        }}
      />

      {/* Purple nebula */}
      <div
        className="absolute"
        style={{
          width: "60vw",
          height: "50vh",
          top: "30%",
          right: "-15%",
          background: "radial-gradient(ellipse at center, rgba(80, 10, 120, 0.25) 0%, rgba(40, 5, 60, 0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float 30s ease-in-out infinite reverse",
        }}
      />

      {/* Teal nebula */}
      <div
        className="absolute"
        style={{
          width: "50vw",
          height: "40vh",
          bottom: "-5%",
          left: "10%",
          background: "radial-gradient(ellipse at center, rgba(0, 80, 100, 0.2) 0%, rgba(0, 40, 50, 0.1) 40%, transparent 70%)",
          filter: "blur(70px)",
          animation: "float 20s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />
    </div>
  );
}

// ─── Aurora — Northern lights effect ─────────────────────

export function Aurora({ className = "" }: { className?: string }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    let angle = 0;
    const animate = () => {
      angle += 0.003;
      setOffset(Math.sin(angle) * 20);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Aurora band 1 — cyan */}
      <div
        className="absolute w-[120%]"
        style={{
          height: "200px",
          top: "15%",
          left: "-10%",
          background: `linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.06) 20%, rgba(0,229,255,0.12) 40%, rgba(0,229,255,0.06) 60%, transparent 100%)`,
          filter: "blur(40px)",
          transform: `translateY(${offset}px) skewX(-5deg)`,
          transition: "transform 0.5s ease-out",
          opacity: 0.6,
        }}
      />

      {/* Aurora band 2 — magenta */}
      <div
        className="absolute w-[120%]"
        style={{
          height: "150px",
          top: "20%",
          left: "-10%",
          background: `linear-gradient(90deg, transparent 0%, rgba(255,0,122,0.04) 30%, rgba(255,0,122,0.08) 50%, rgba(255,0,122,0.04) 70%, transparent 100%)`,
          filter: "blur(50px)",
          transform: `translateY(${offset * 0.7}px) skewX(3deg)`,
          transition: "transform 0.5s ease-out",
          opacity: 0.4,
        }}
      />

      {/* Aurora band 3 — green/teal */}
      <div
        className="absolute w-[120%]"
        style={{
          height: "120px",
          top: "25%",
          left: "-10%",
          background: `linear-gradient(90deg, transparent 0%, rgba(0,255,157,0.03) 25%, rgba(0,255,157,0.06) 45%, rgba(0,229,255,0.04) 65%, transparent 100%)`,
          filter: "blur(45px)",
          transform: `translateY(${offset * 1.2}px) skewX(-2deg)`,
          transition: "transform 0.5s ease-out",
          opacity: 0.3,
        }}
      />
    </div>
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

      // Spawn new star occasionally
      if (time - lastSpawn > 3000 + Math.random() * 5000) {
        lastSpawn = time;
        stars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.3,
          vx: 3 + Math.random() * 4,
          vy: 1 + Math.random() * 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 1 + Math.random() * 1.5,
        });
      }

      // Update and draw
      stars = stars.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1;

        // Draw streak
        const gradient = ctx.createLinearGradient(
          s.x - s.vx * 8, s.y - s.vy * 8,
          s.x, s.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(200, 220, 255, ${alpha * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.size;
        ctx.stroke();

        // Head glow
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
        glow.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.6})`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
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

// ─── Cosmic Dust — subtle floating particles ─────────────

export function CosmicDust({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Dust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    let dusts: Dust[] = [];
    const colors = [
      "rgba(0, 229, 255, ",
      "rgba(255, 0, 122, ",
      "rgba(100, 200, 255, ",
      "rgba(255, 200, 100, ",
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dusts = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.3 + 0.1,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      for (const d of dusts) {
        // Mouse repel
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          d.vx += (dx / dist) * force * 0.1;
          d.vy += (dy / dist) * force * 0.1;
        }

        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.98;
        d.vy *= 0.98;

        // Wrap
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.color + d.alpha + ")";
        ctx.fill();
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
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}

// ─── Galaxy Center — bright core glow ────────────────────

export function GalaxyCenter({ className = "" }: { className?: string }) {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Central glow */}
      <div
        className="absolute"
        style={{
          width: "100vw",
          height: "100vh",
          top: "0",
          left: "0",
          background: "radial-gradient(ellipse at 50% 30%, rgba(10, 20, 60, 0.3) 0%, rgba(5, 10, 30, 0.15) 30%, transparent 60%)",
        }}
      />

      {/* Core bright spot */}
      <div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(150, 180, 255, 0.08) 0%, rgba(100, 140, 220, 0.04) 30%, transparent 60%)",
          filter: "blur(40px)",
          animation: "pulse-glow 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}
