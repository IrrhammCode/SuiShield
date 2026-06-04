"use client";

import { useEffect, useRef, useState } from "react";

// ─── Animated Glow Lines — Connect elements with glowing lines ───

interface GlowLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  speed: number;
  color: string;
}

export function GlowLines({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<GlowLine[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Generate random lines
      linesRef.current = Array.from({ length: 8 }, () => ({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        color: Math.random() > 0.5 ? "#00E5FF" : "#FF007A",
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const line of linesRef.current) {
        line.progress += line.speed;
        if (line.progress > 1) line.progress = 0;

        const x = line.x1 + (line.x2 - line.x1) * line.progress;
        const y = line.y1 + (line.y2 - line.y1) * line.progress;

        // Draw glow dot
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, line.color + "60");
        gradient.addColorStop(1, line.color + "00");
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw dot center
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = line.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
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
      style={{ opacity: 0.4 }}
    />
  );
}

// ─── 3D Depth Layers — Multiple glass layers at different depths ───

export function DepthLayers({ className = "" }: { className?: string }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Layer 1 — far */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          top: "10%",
          left: "20%",
          background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)",
          transform: `translate(${mouse.x * 5}px, ${mouse.y * 5}px)`,
          transition: "transform 0.5s ease-out",
          filter: "blur(80px)",
        }}
      />

      {/* Layer 2 — mid */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: "40%",
          right: "15%",
          background: "radial-gradient(circle, rgba(255,0,122,0.03) 0%, transparent 70%)",
          transform: `translate(${mouse.x * 10}px, ${mouse.y * 10}px)`,
          transition: "transform 0.4s ease-out",
          filter: "blur(60px)",
        }}
      />

      {/* Layer 3 — near */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          bottom: "20%",
          left: "30%",
          background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)",
          transform: `translate(${mouse.x * 15}px, ${mouse.y * 15}px)`,
          transition: "transform 0.3s ease-out",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

// ─── Animated Gradient Border ────────────────────────────

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export function GradientBorder({ children, className = "", colors = ["#00E5FF", "#FF007A", "#FFD700", "#00FF9D"] }: GradientBorderProps) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setAngle((prev) => (prev + 0.5) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`relative p-[1px] rounded-2xl ${className}`} style={{
      background: `conic-gradient(from ${angle}deg, ${colors.join(", ")})`,
    }}>
      <div className="rounded-2xl bg-[#080A14]">
        {children}
      </div>
    </div>
  );
}

// ─── Interactive Mesh Background ─────────────────────────

export function InteractiveMesh({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 20;
    const rows = 15;
    const points: Array<{ x: number; y: number; ox: number; oy: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      points.length = 0;
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const px = (x / cols) * canvas.width;
          const py = (y / rows) * canvas.height;
          points.push({ x: px, y: py, ox: px, oy: py });
        }
      }
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

      // Update points — push away from mouse
      for (const p of points) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          p.x = p.ox + (dx / dist) * force * 30;
          p.y = p.oy + (dy / dist) * force * 30;
        } else {
          p.x += (p.ox - p.x) * 0.05;
          p.y += (p.oy - p.y) * 0.05;
        }
      }

      // Draw connections
      ctx.strokeStyle = "rgba(0,229,255,0.04)";
      ctx.lineWidth = 0.5;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * (cols + 1) + x;
          const p1 = points[i];
          const p2 = points[i + 1]; // right
          const p3 = points[i + cols + 1]; // below

          if (p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          if (p3) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
          }
        }
      }

      // Draw points near mouse
      for (const p of points) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,229,255,${alpha})`;
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
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      style={{ opacity: 0.5 }}
    />
  );
}

// ─── Floating 3D Ring ────────────────────────────────────

interface FloatingRingProps {
  size?: number;
  color?: string;
  className?: string;
  thickness?: number;
}

export function FloatingRing({ size = 300, color = "#00E5FF", className = "", thickness = 2 }: FloatingRingProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let angle = 0;
    let frame: number;
    const animate = () => {
      angle += 0.008;
      setRotate({
        x: Math.sin(angle) * 30,
        y: Math.cos(angle) * 45,
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "800px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `${thickness}px solid ${color}20`,
            boxShadow: `0 0 40px ${color}10, inset 0 0 40px ${color}05`,
          }}
        />
      </div>
    </div>
  );
}

// ─── 3D Isometric Grid ───────────────────────────────────

export function IsometricGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
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

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      const cellSize = 40;
      const cols = Math.ceil(canvas.width / cellSize) + 2;
      const rows = Math.ceil(canvas.height / cellSize) + 2;

      for (let y = -1; y < rows; y++) {
        for (let x = -1; x < cols; x++) {
          const px = x * cellSize + Math.sin(time + y * 0.3) * 5;
          const py = y * cellSize + Math.cos(time + x * 0.3) * 5;

          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.fillStyle = `rgba(0,229,255,${alpha})`;
            ctx.fillRect(px - 1, py - 1, 3, 3);
          }
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
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      style={{ opacity: 0.3 }}
    />
  );
}
