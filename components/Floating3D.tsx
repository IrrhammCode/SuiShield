"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface Floating3DCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  rotateIntensity?: number;
}

export default function Floating3DCard({
  children,
  className = "",
  glowColor = "rgba(0,229,255,0.15)",
  rotateIntensity = 15,
}: Floating3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    setRotate({
      x: -(y / (rect.height / 2)) * rotateIntensity,
      y: (x / (rect.width / 2)) * rotateIntensity,
    });

    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow effect that follows cursor */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Floating 3D Orb ──────────────────────────────────────

interface FloatingOrbProps {
  size?: number;
  color?: string;
  className?: string;
}

export function FloatingOrb({ size = 200, color = "#00E5FF", className = "" }: FloatingOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let angle = 0;
    const speed = 0.005;
    const radius = 20;

    const animate = () => {
      angle += speed;
      setPos({
        x: Math.sin(angle) * radius,
        y: Math.cos(angle * 0.7) * radius * 0.5,
      });
      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={orbRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(40px)",
        animation: "float 8s ease-in-out infinite",
      }}
    />
  );
}

// ── 3D Tilt Text ─────────────────────────────────────────

interface TiltTextProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltText({ children, className = "", intensity = 5 }: TiltTextProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    setRotate({
      x: -(y / (rect.height / 2)) * intensity,
      y: (x / (rect.width / 2)) * intensity,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      className={className}
      style={{
        transform: `perspective(500px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.1s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
