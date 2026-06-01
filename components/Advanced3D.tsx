"use client";

import { useEffect, useRef, useState } from "react";

// ─── 3D Rotating Shield ──────────────────────────────────

interface RotatingShieldProps {
  size?: number;
  className?: string;
}

export function RotatingShield({ size = 300, className = "" }: RotatingShieldProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let angle = 0;
    const animate = () => {
      angle += 0.3;
      setRotate({
        x: Math.sin(angle * 0.01) * 15,
        y: Math.cos(angle * 0.01) * 20,
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s linear",
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(255,0,122,0.1))",
            border: "1px solid rgba(0,229,255,0.2)",
            boxShadow: "0 0 80px rgba(0,229,255,0.15), inset 0 0 80px rgba(0,229,255,0.05)",
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="SuiShield"
            className="w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]"
          />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,0,122,0.15), rgba(0,229,255,0.1))",
            border: "1px solid rgba(255,0,122,0.2)",
            boxShadow: "0 0 80px rgba(255,0,122,0.15), inset 0 0 80px rgba(255,0,122,0.05)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center">
            <div className="font-display font-black text-3xl text-white mb-2">SuiShield</div>
            <div className="text-xs text-cyan-400">Check Before You Approve</div>
          </div>
        </div>

        {/* Glow ring */}
        <div
          className="absolute inset-[-20px] rounded-[40px]"
          style={{
            border: "1px solid rgba(0,229,255,0.1)",
            boxShadow: "0 0 100px rgba(0,229,255,0.1)",
            transform: "translateZ(-10px)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Holographic Card ────────────────────────────────────

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HolographicCard({ children, className = "" }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Holographic shimmer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(0,229,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at ${100 - pos.x}% ${100 - pos.y}%, rgba(255,0,122,0.1) 0%, transparent 50%),
            linear-gradient(${pos.x}deg, rgba(0,229,255,0.05) 0%, rgba(255,0,122,0.05) 50%, rgba(0,229,255,0.05) 100%)
          `,
        }}
      />

      {/* Rainbow border on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.6 : 0,
          background: `conic-gradient(from ${pos.x * 3.6}deg at ${pos.x}% ${pos.y}%, #00E5FF, #FF007A, #FFD700, #00FF9D, #00E5FF)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "inherit",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── 3D Parallax Layer ───────────────────────────────────

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxLayer({ children, speed = 0.5, className = "" }: ParallaxLayerProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * speed * 0.02;
      const y = (e.clientY - window.innerHeight / 2) * speed * 0.02;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [speed]);

  return (
    <div
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated Gradient Mesh ──────────────────────────────

export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute w-[800px] h-[800px] rounded-full mix-blend-screen"
        style={{
          top: "-20%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)",
          animation: "float 12s ease-in-out infinite",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full mix-blend-screen"
        style={{
          top: "30%",
          right: "-15%",
          background: "radial-gradient(circle, rgba(255,0,122,0.08) 0%, transparent 70%)",
          animation: "float 15s ease-in-out infinite reverse",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full mix-blend-screen"
        style={{
          bottom: "-10%",
          left: "20%",
          background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
          animation: "float 18s ease-in-out infinite",
          animationDelay: "-5s",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

// ─── 3D Perspective Grid ─────────────────────────────────

export function PerspectiveGrid({ className = "" }: { className?: string }) {
  const [rotate, setRotate] = useState({ x: 60, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = 60 + (e.clientY / window.innerHeight - 0.5) * 10;
      const y = (e.clientX / window.innerWidth - 0.5) * 10;
      setRotate({ x, y });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          perspective: "500px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            width: "200%",
            height: "200%",
            position: "absolute",
            top: "-50%",
            left: "-50%",
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transition: "transform 0.3s ease-out",
          }}
        />
      </div>
    </div>
  );
}

// ─── Glowing Orb ─────────────────────────────────────────

interface GlowOrbProps {
  size?: number;
  color?: string;
  className?: string;
  delay?: number;
}

export function GlowOrb({ size = 200, color = "#00E5FF", className = "", delay = 0 }: GlowOrbProps) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${color}30, ${color}10, transparent 70%)`,
        filter: "blur(40px)",
        animation: `float ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ─── 3D Card Stack ───────────────────────────────────────

interface CardStackProps {
  cards: React.ReactNode[];
  className?: string;
}

export function CardStack({ cards, className = "" }: CardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className={`relative h-[300px] ${className}`} style={{ perspective: "1000px" }}>
      {cards.map((card, i) => {
        const isActive = i === activeIndex;
        const offset = ((i - activeIndex + cards.length) % cards.length);
        const normalizedOffset = offset > cards.length / 2 ? offset - cards.length : offset;

        return (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-700 ease-out cursor-pointer"
            style={{
              transform: `
                translateX(${normalizedOffset * 30}px)
                translateZ(${isActive ? 0 : -100 * Math.abs(normalizedOffset)}px)
                rotateY(${normalizedOffset * 5}deg)
                scale(${isActive ? 1 : 0.9 - Math.abs(normalizedOffset) * 0.05})
              `,
              opacity: isActive ? 1 : 0.5 - Math.abs(normalizedOffset) * 0.15,
              zIndex: cards.length - Math.abs(normalizedOffset),
            }}
            onClick={() => setActiveIndex(i)}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, suffix = "", prefix = "", className = "", duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Magnetic Button (Enhanced) ──────────────────────────

interface MagneticBtnProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  href?: string;
}

export function MagneticBtn({ children, className = "", strength = 0.3, onClick, href }: MagneticBtnProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x, y });
  };

  const style = {
    transform: `translate(${pos.x}px, ${pos.y}px) scale(${isHovered ? 1.05 : 1})`,
    transition: "transform 0.2s ease-out",
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setPos({ x: 0, y: 0 }); setIsHovered(false); }}
        onMouseEnter={() => setIsHovered(true)}
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
