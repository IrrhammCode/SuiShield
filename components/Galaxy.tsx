"use client";

import { useEffect, useRef } from "react";

// ─── Subtle Stars — Very few, elegant, not distracting ───

export function SubtleStars({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      brightness: number;
      twinkleSpeed: number;
      twinkleOffset: number;
      type: "dot" | "cross";
    }

    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Only 25 stars — subtle, not busy
      stars = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.3,
        brightness: Math.random() * 0.4 + 0.2,
        twinkleSpeed: Math.random() * 0.01 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
        type: Math.random() > 0.7 ? "cross" : "dot",
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const drawCross = (x: number, y: number, size: number, alpha: number) => {
      const len = size * 4;
      const grad1 = ctx.createLinearGradient(x - len, y, x + len, y);
      grad1.addColorStop(0, `rgba(255,255,255,0)`);
      grad1.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      grad1.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.moveTo(x - len, y);
      ctx.lineTo(x + len, y);
      ctx.strokeStyle = grad1;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      const grad2 = ctx.createLinearGradient(x, y - len, x, y + len);
      grad2.addColorStop(0, `rgba(255,255,255,0)`);
      grad2.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      grad2.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.moveTo(x, y - len);
      ctx.lineTo(x, y + len);
      ctx.strokeStyle = grad2;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001;

      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;

        if (star.type === "cross") {
          drawCross(star.x, star.y, star.size, alpha);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }

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
