"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type OrganismHighlightKind =
  | "evidence"
  | "theme"
  | "contradiction"
  | "causal"
  | "understanding"
  | null;

type ParticleKind = Exclude<OrganismHighlightKind, null>;

type Props = {
  evidenceCount?: number;
  themeCount?: number;
  contradictionCount?: number;
  causalPathCount?: number;
  understandingCount?: number;
  highlightKind?: OrganismHighlightKind;
  className?: string;
  height?: number;
  compact?: boolean;
};

type Particle = {
  id: string;
  kind: ParticleKind;
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  wobble: number;
  wobbleSpeed: number;
  phase: number;
  eccentricity: number;
};

const COLORS: Record<ParticleKind, string> = {
  evidence: "rgba(245, 190, 88, 1)",
  theme: "rgba(92, 220, 150, 1)",
  contradiction: "rgba(255, 139, 76, 1)",
  causal: "rgba(95, 170, 255, 1)",
  understanding: "rgba(255, 255, 255, 1)",
};

const MAX_COUNTS: Record<ParticleKind, number> = {
  evidence: 14,
  theme: 8,
  contradiction: 6,
  causal: 7,
  understanding: 1,
};

function seededRandom(seed: string) {
  let h = 2166136261;

  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }

  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return Math.abs(h >>> 0) / 4294967295;
  };
}

function buildParticles(props: Props): Particle[] {
  const {
    evidenceCount = 0,
    themeCount = 0,
    contradictionCount = 0,
    causalPathCount = 0,
    understandingCount = 1,
    compact = false,
  } = props;

  const particles: Particle[] = [];
  const scale = compact ? 0.68 : 1;

  const addGroup = (
    kind: ParticleKind,
    count: number,
    baseRadius: number,
    spread: number,
    baseSize: number,
    baseSpeed: number
  ) => {
    const cappedCount = Math.min(count, MAX_COUNTS[kind]);

    for (let index = 0; index < cappedCount; index++) {
      const id = `${kind}-${index}-${count}`;
      const rand = seededRandom(id);

      particles.push({
        id,
        kind,
        orbitRadius: baseRadius + (rand() - 0.5) * spread,
        angle: rand() * Math.PI * 2,
        speed: baseSpeed * (0.75 + rand() * 0.7) * (rand() > 0.5 ? 1 : -1),
        size: baseSize * (0.75 + rand() * 0.55),
        wobble: 5 + rand() * 16,
        wobbleSpeed: 0.45 + rand() * 0.9,
        phase: rand() * Math.PI * 2,
        eccentricity:
          kind === "contradiction" ? 0.72 + rand() * 0.18 : 0.88 + rand() * 0.1,
      });
    }
  };

  addGroup("understanding", understandingCount, 0, 0, 8 * scale, 0);
  addGroup("theme", themeCount, 48 * scale, 18 * scale, 4.2 * scale, 0.00055);
  addGroup("causal", causalPathCount, 78 * scale, 26 * scale, 3.6 * scale, 0.00042);
  addGroup(
    "contradiction",
    contradictionCount,
    98 * scale,
    36 * scale,
    4.4 * scale,
    0.0027
  );
  addGroup("evidence", evidenceCount, 124 * scale, 42 * scale, 3.3 * scale, 0.00036);

  return particles;
}

export default function LivingOrganismCanvas(props: Props) {
  const {
    className,
    height = 360,
    highlightKind = null,
    compact = false,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [hoveredParticle, setHoveredParticle] = useState<Particle | null>(null);

  const particles = useMemo(() => buildParticles(props), [props]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;
    let pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = rect.width;
      heightPx = rect.height;

      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color.replace("1)", `${alpha})`));
      gradient.addColorStop(1, color.replace("1)", "0)"));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const getPosition = (p: Particle, t: number) => {
      const centerX = width / 2;
      const centerY = heightPx / 2;

      if (p.kind === "understanding") {
        return {
          x: centerX + Math.cos(t * 0.001 + p.phase) * 1.8,
          y: centerY + Math.sin(t * 0.0013 + p.phase) * 1.8,
        };
      }

      const angle = p.angle + t * p.speed;
      const wobble = Math.sin(t * 0.001 * p.wobbleSpeed + p.phase) * p.wobble;
      const radius = p.orbitRadius + wobble;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * p.eccentricity,
      };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, heightPx);

      const centerX = width / 2;
      const centerY = heightPx / 2;

      const pulse = 1 + Math.sin(t * 0.0007) * 0.035;
const membraneRadius = (compact ? 96 : 150) * pulse;

ctx.strokeStyle = "rgba(255,255,255,0.055)";
ctx.lineWidth = 1;

ctx.beginPath();
ctx.ellipse(
  centerX,
  centerY,
  membraneRadius,
  membraneRadius * 0.82,
  Math.sin(t * 0.00018) * 0.12,
  0,
  Math.PI * 2
);
ctx.stroke();

drawGlow(
  centerX,
  centerY,
  compact ? 92 : 145,
  "rgba(245, 190, 88, 1)",
  0.055
);

drawGlow(centerX, centerY, compact ? 74 : 104, COLORS.understanding, 0.11);
drawGlow(centerX, centerY, compact ? 34 : 48, COLORS.understanding, 0.18);

      const positions = particles.map((particle) => ({
        particle,
        ...getPosition(particle, t),
      }));

      const causalPositions = positions.filter((p) => p.particle.kind === "causal");
      const themePositions = positions.filter((p) => p.particle.kind === "theme");

      causalPositions.forEach((causal, index) => {
        const target = themePositions[index % Math.max(themePositions.length, 1)];
        if (!target) return;

        const active =
          !highlightKind ||
          highlightKind === "causal" ||
          highlightKind === "theme";

        ctx.strokeStyle = active
          ? "rgba(120, 180, 255, 0.18)"
          : "rgba(255,255,255,0.035)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(causal.x, causal.y);
        ctx.quadraticCurveTo(
          centerX + Math.sin(t * 0.001 + index) * 20,
          centerY + Math.cos(t * 0.0012 + index) * 20,
          target.x,
          target.y
        );
        ctx.stroke();
      });

      let nearest: Particle | null = null;
      let nearestDistance = Infinity;

      positions.forEach(({ particle, x, y }) => {
        const distance = Math.hypot(pointer.x - x, pointer.y - y);
        if (distance < particle.size + 18 && distance < nearestDistance) {
          nearest = particle;
          nearestDistance = distance;
        }

        const externallyHighlighted = highlightKind === particle.kind;
        const dimmed = highlightKind && highlightKind !== particle.kind;
        const alpha = dimmed ? 0.22 : externallyHighlighted ? 1 : 0.78;
        const color = COLORS[particle.kind];

        drawGlow(
          x,
          y,
          particle.size * (externallyHighlighted ? 7 : 5),
          color,
          externallyHighlighted ? 0.26 : 0.16
        );

        ctx.fillStyle = color.replace("1)", `${alpha})`);
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (nearest !== hoveredParticle) {
        setHoveredParticle(nearest);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();

    const handleMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleLeave = () => {
      pointer = { x: -9999, y: -9999 };
      setHoveredParticle(null);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, highlightKind, compact, hoveredParticle]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: compact ? 18 : 28,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Discovery living understanding organism"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}