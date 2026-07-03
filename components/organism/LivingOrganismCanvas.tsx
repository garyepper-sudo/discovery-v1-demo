"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type OrganismHighlightKind =
  | "evidence"
  | "theme"
  | "contradiction"
  | "causal"
  | "understanding"
  | "belief"
  | null;

type ParticleKind = Exclude<OrganismHighlightKind, null>;

type Props = {
  organismState?: any;
  evidenceCount?: number;
  themeCount?: number;
  contradictionCount?: number;
  causalPathCount?: number;
  understandingCount?: number;
  highlightKind?: OrganismHighlightKind;
  className?: string;
  height?: number;
  compact?: boolean;
  selectedParticleId?: string | null;
  onParticleSelected?: (particle: any) => void;
};

type Particle = {
  id: string;
  kind: ParticleKind;
  label: string;
  confidence: number;
  strength: number;
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  wobble: number;
  wobbleSpeed: number;
  phase: number;
  eccentricity: number;
  connections: string[];
  anchorThemeIndex?: number;
  localOrbitRadius?: number;
  localOrbitSpeed?: number;
};

type PositionedParticle = {
  particle: Particle;
  x: number;
  y: number;
};

type RenderState = {
  alpha: number;
  glow: number;
  sizeMultiplier: number;
  highlighted: boolean;
  selected: boolean;
  dimmed: boolean;
};

const COLORS: Record<ParticleKind, string> = {
  evidence: "rgba(245, 190, 88, 1)",
  theme: "rgba(92, 220, 150, 1)",
  contradiction: "rgba(255, 139, 76, 1)",
  causal: "rgba(95, 170, 255, 1)",
  understanding: "rgba(255, 255, 255, 1)",
  belief: "rgba(255, 220, 120, 1)",
};

const MAX_COUNTS: Record<ParticleKind, number> = {
  evidence: 18,
  theme: 8,
  contradiction: 6,
  causal: 7,
  understanding: 1,
  belief: 6,
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

function normalizeKind(kind: string): ParticleKind {
  if (kind === "causal") return "causal";
  if (kind === "contradiction") return "contradiction";
  if (kind === "theme") return "theme";
  if (kind === "belief") return "belief";
  if (kind === "understanding") return "understanding";
  return "evidence";
}

function buildParticles(props: Props): Particle[] {
  const { organismState, compact = false } = props;
  const scale = compact ? 0.68 : 1;
  const coherence = organismState?.coherence ?? 0.55;
  const tension = organismState?.tension ?? 0.25;
  const uncertainty = organismState?.uncertainty ?? 0.35;

  if (organismState?.particles?.length) {
    const sourceParticles = organismState.particles.slice(0, 48);
    const themeCount = Math.max(
      1,
      sourceParticles.filter((p: any) => normalizeKind(p.kind) === "theme")
        .length
    );

    return sourceParticles.map((source: any, index: number) => {
      const kind = normalizeKind(source.kind);
      const rand = seededRandom(`${source.id}-${kind}-${index}`);

      const baseRadius =
        kind === "understanding"
          ? 0
          : kind === "belief"
          ? 52
          : kind === "theme"
          ? 96
          : kind === "causal"
          ? 128
          : kind === "contradiction"
          ? 168
          : 136;

      const spread =
        kind === "evidence"
          ? 24
          : kind === "contradiction"
          ? 38 + tension * 28
          : 16 + uncertainty * 18;

      const coherencePull = 1 - coherence * 0.12;

      return {
        id: source.id ?? `${kind}-${index}`,
        kind,
        label: source.label ?? kind,
        confidence: source.confidence ?? 0.5,
        strength: source.strength ?? source.confidence ?? 0.5,
        connections: Array.isArray(source.connections)
          ? source.connections
          : [],
        orbitRadius:
          (baseRadius + (rand() - 0.5) * spread) * scale * coherencePull,
        angle:
          kind === "theme"
            ? (Math.PI * 2 * index) / Math.max(1, themeCount)
            : rand() * Math.PI * 2,
        speed:
          kind === "contradiction"
            ? 0.0024 * (0.8 + tension)
            : kind === "belief"
            ? 0.00016
            : kind === "theme"
            ? 0.00012
            : kind === "evidence"
            ? 0.0012
            : 0.00035,
        size:
          (kind === "understanding"
            ? 10
            : kind === "belief"
            ? 8.6
            : kind === "theme"
            ? 6.6
            : kind === "contradiction"
            ? 5.4
            : kind === "causal"
            ? 4.4
            : 3.4) *
          scale *
          (0.86 + (source.strength ?? 0.5) * 0.4),
        wobble:
          (kind === "contradiction"
            ? 11 + tension * 16
            : kind === "belief"
            ? 2
            : 4 + uncertainty * 8) * scale,
        wobbleSpeed:
          kind === "contradiction" ? 1.4 + rand() * 1.4 : 0.35 + rand() * 0.65,
        phase: rand() * Math.PI * 2,
        eccentricity:
          kind === "contradiction"
            ? 0.78 + tension * 0.18
            : kind === "theme"
            ? 0.72
            : 0.9,
        anchorThemeIndex: kind === "evidence" ? index % themeCount : undefined,
        localOrbitRadius:
          kind === "evidence" ? (22 + rand() * 28) * scale : undefined,
        localOrbitSpeed:
          kind === "evidence"
            ? (0.0011 + rand() * 0.0011) * (rand() > 0.5 ? 1 : -1)
            : undefined,
      };
    });
  }

  return buildFallbackParticles(props, scale);
}

function buildFallbackParticles(props: Props, scale: number): Particle[] {
  const {
    evidenceCount = 0,
    themeCount = 0,
    contradictionCount = 0,
    causalPathCount = 0,
    understandingCount = 1,
  } = props;

  const particles: Particle[] = [];

  const addGroup = (
    kind: ParticleKind,
    count: number,
    baseRadius: number,
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
        label: kind,
        confidence: 0.65,
        strength: 0.65,
        connections: [],
        orbitRadius: baseRadius * scale,
        angle: rand() * Math.PI * 2,
        speed: baseSpeed * (0.75 + rand() * 0.7) * (rand() > 0.5 ? 1 : -1),
        size: baseSize * scale * (0.85 + rand() * 0.35),
        wobble: kind === "contradiction" ? 14 * scale : 5 * scale,
        wobbleSpeed: kind === "contradiction" ? 1.8 : 0.65,
        phase: rand() * Math.PI * 2,
        eccentricity: kind === "theme" ? 0.72 : 0.9,
        anchorThemeIndex:
          kind === "evidence" ? index % Math.max(1, themeCount) : undefined,
        localOrbitRadius:
          kind === "evidence" ? (24 + rand() * 28) * scale : undefined,
        localOrbitSpeed:
          kind === "evidence"
            ? (0.0011 + rand() * 0.0011) * (rand() > 0.5 ? 1 : -1)
            : undefined,
      });
    }
  };

  addGroup("understanding", understandingCount, 0, 10, 0);
  addGroup("belief", 3, 52, 8.4, 0.00016);
  addGroup("theme", themeCount, 96, 6.4, 0.00012);
  addGroup("causal", causalPathCount, 124, 4.2, 0.00035);
  addGroup("contradiction", contradictionCount, 168, 5.4, 0.0024);
  addGroup("evidence", evidenceCount, 136, 3.4, 0.0012);

  return particles;
}

function buildActiveParticleIds(
  particles: Particle[],
  selectedParticleId?: string | null
) {
  if (!selectedParticleId) return new Set<string>();

  const selected = particles.find((particle) => particle.id === selectedParticleId);
  if (!selected) return new Set<string>();

  const activeIds = new Set<string>();
  activeIds.add(selected.id);

  selected.connections.forEach((connectionId) => activeIds.add(connectionId));

  particles.forEach((particle) => {
    if (particle.connections.includes(selected.id)) {
      activeIds.add(particle.id);
    }
  });

  const selectedKind = selected.kind;

  if (selectedKind === "belief") {
    particles
      .filter((particle) => particle.kind === "understanding")
      .forEach((particle) => activeIds.add(particle.id));
  }

  if (selectedKind === "theme") {
    particles
      .filter(
        (particle) =>
          particle.kind === "evidence" &&
          particle.anchorThemeIndex ===
            particles
              .filter((candidate) => candidate.kind === "theme")
              .findIndex((candidate) => candidate.id === selected.id)
      )
      .forEach((particle) => activeIds.add(particle.id));
  }

  return activeIds;
}

function buildRenderStates({
  particles,
  selectedParticleId,
  highlightKind,
}: {
  particles: Particle[];
  selectedParticleId?: string | null;
  highlightKind: OrganismHighlightKind;
}) {
  const activeIds = buildActiveParticleIds(particles, selectedParticleId);
  const hasSelection = Boolean(selectedParticleId && activeIds.size > 0);
  const renderStates = new Map<string, RenderState>();

  particles.forEach((particle) => {
    const selected = selectedParticleId === particle.id;
    const pathHighlighted = hasSelection && activeIds.has(particle.id);
    const kindHighlighted = highlightKind === particle.kind;
    const highlighted = selected || pathHighlighted || kindHighlighted;
    const dimmed =
      (hasSelection && !pathHighlighted) ||
      Boolean(highlightKind && highlightKind !== particle.kind);

    renderStates.set(particle.id, {
      selected,
      highlighted,
      dimmed,
      alpha: dimmed ? 0.12 : highlighted ? 1 : 0.82,
      glow: selected ? 0.4 : highlighted ? 0.28 : 0.12 + particle.confidence * 0.08,
      sizeMultiplier: selected ? 1.42 : highlighted ? 1.16 : 1,
    });
  });

  return renderStates;
}

export default function LivingOrganismCanvas(props: Props) {
  const {
    organismState,
    selectedParticleId,
    onParticleSelected,
    className,
    height = 360,
    highlightKind = null,
    compact = false,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [hoveredParticle, setHoveredParticle] = useState<Particle | null>(null);
  const [animationPaused, setAnimationPaused] = useState(false);

  const particles = useMemo(() => buildParticles(props), [props]);

  const renderStates = useMemo(
    () =>
      buildRenderStates({
        particles,
        selectedParticleId,
        highlightKind,
      }),
    [particles, selectedParticleId, highlightKind]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;
    let pointer = { x: -9999, y: -9999 };

    const coherence = organismState?.coherence ?? 0.55;
    const tension = organismState?.tension ?? 0.25;
    const uncertainty = organismState?.uncertainty ?? 0.35;
    const maturity = organismState?.maturity ?? 0.5;

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

    const getCorePosition = (p: Particle, t: number) => {
      const centerX = width / 2;
      const centerY = heightPx / 2;

      if (p.kind === "understanding") {
        const breath = animationPaused ? 1 : 1 + Math.sin(t * 0.0018) * 0.035;

        return {
          x: centerX + Math.cos(t * 0.001 + p.phase) * breath,
          y: centerY + Math.sin(t * 0.0013 + p.phase) * breath,
        };
      }

      const motionScale = animationPaused
        ? 0
        : selectedParticleId || hoveredParticle
        ? 0.04
        : 0.18;

      const angle = p.angle + t * p.speed * motionScale;
      const wobble =
        animationPaused
          ? 0
          : Math.sin(t * 0.001 * p.wobbleSpeed + p.phase) * p.wobble;
      const radius = p.orbitRadius + wobble;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * p.eccentricity,
      };
    };

    const drawConnection = ({
      from,
      to,
      color,
      alpha,
      width,
      dashed = false,
      curve = false,
    }: {
      from: PositionedParticle;
      to: PositionedParticle;
      color: string;
      alpha: number;
      width: number;
      dashed?: boolean;
      curve?: boolean;
    }) => {
      if (dashed) ctx.setLineDash([5, 7]);

      ctx.strokeStyle = color.replace("1)", `${alpha})`);
      ctx.lineWidth = width;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);

      if (curve) {
        ctx.quadraticCurveTo(
          (from.x + to.x) / 2,
          (from.y + to.y) / 2 - 24,
          to.x,
          to.y
        );
      } else {
        ctx.lineTo(to.x, to.y);
      }

      ctx.stroke();

      if (dashed) ctx.setLineDash([]);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, heightPx);

      const centerX = width / 2;
      const centerY = heightPx / 2;

      const pulse =
        animationPaused
          ? 1
          : 1 + Math.sin(t * 0.0007) * (0.018 + uncertainty * 0.035);
      const membraneRadius =
        (compact ? 118 : 188) * pulse * (0.92 + maturity * 0.16);

      ctx.strokeStyle =
        tension > 0.42 ? "rgba(255,139,76,0.2)" : "rgba(255,255,255,0.06)";
      ctx.lineWidth = tension > 0.42 ? 1.4 : 1;

      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY,
        membraneRadius * (1 + tension * 0.1),
        membraneRadius * (0.72 + coherence * 0.1),
        Math.sin(t * 0.00018) * (0.08 + uncertainty * 0.1),
        0,
        Math.PI * 2
      );
      ctx.stroke();

      drawGlow(
        centerX,
        centerY,
        compact ? 104 : 152,
        "rgba(245, 190, 88, 1)",
        0.035 + coherence * 0.035
      );
      drawGlow(
        centerX,
        centerY,
        compact ? 60 : 84,
        COLORS.understanding,
        0.08 + maturity * 0.08
      );

      const basePositions = particles.map((particle) => ({
        particle,
        ...getCorePosition(particle, t),
      }));

      const themes = basePositions.filter((p) => p.particle.kind === "theme");

      const positions: PositionedParticle[] = basePositions.map((position) => {
        const { particle } = position;

        if (particle.kind !== "evidence" || themes.length === 0) {
          return position;
        }

        const anchor =
          themes[
            particle.anchorThemeIndex !== undefined
              ? particle.anchorThemeIndex % themes.length
              : 0
          ];

        const motionScale = animationPaused
          ? 0
          : selectedParticleId || hoveredParticle
          ? 0.04
          : 0.18;

        const localAngle =
          particle.angle +
          t * (particle.localOrbitSpeed ?? 0.0012) * motionScale;
        const localRadius = particle.localOrbitRadius ?? 32;

        return {
          particle,
          x: anchor.x + Math.cos(localAngle) * localRadius,
          y: anchor.y + Math.sin(localAngle) * localRadius * 0.78,
        };
      });

      const mechanisms = positions.filter((p) => p.particle.kind === "causal");
      const beliefs = positions.filter((p) => p.particle.kind === "belief");
      const contradictions = positions.filter(
        (p) => p.particle.kind === "contradiction"
      );
      const understanding = positions.find(
        (p) => p.particle.kind === "understanding"
      );

      themes.forEach((theme) => {
        const state = renderStates.get(theme.particle.id);
        const alpha = state?.dimmed ? 0.035 : state?.highlighted ? 0.18 : 0.09;

        drawGlow(theme.x, theme.y, compact ? 42 : 58, COLORS.theme, alpha);

        ctx.strokeStyle = `rgba(92, 220, 150, ${alpha})`;
        ctx.lineWidth = state?.highlighted ? 1.6 : 1;
        ctx.beginPath();
        ctx.ellipse(theme.x, theme.y, 34, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      mechanisms.forEach((mechanism, index) => {
        const theme = themes[index % Math.max(themes.length, 1)];
        const belief = beliefs[index % Math.max(beliefs.length, 1)];

        if (!theme && !belief) return;

        const mechanismState = renderStates.get(mechanism.particle.id);
        const themeState = theme ? renderStates.get(theme.particle.id) : null;
        const beliefState = belief ? renderStates.get(belief.particle.id) : null;

        const active =
          mechanismState?.highlighted ||
          themeState?.highlighted ||
          beliefState?.highlighted;

        const alpha = mechanismState?.dimmed ? 0.04 : active ? 0.55 : 0.16;

        if (theme && belief) {
          drawConnection({
            from: theme,
            to: belief,
            color: COLORS.causal,
            alpha,
            width: active ? 2.2 : 1 + mechanism.particle.strength,
            curve: true,
          });
        } else if (theme) {
          drawConnection({
            from: theme,
            to: mechanism,
            color: COLORS.causal,
            alpha,
            width: active ? 2 : 1,
          });
        } else if (belief) {
          drawConnection({
            from: mechanism,
            to: belief,
            color: COLORS.causal,
            alpha,
            width: active ? 2 : 1,
          });
        }
      });

      beliefs.forEach((belief) => {
        if (!understanding) return;

        const beliefState = renderStates.get(belief.particle.id);
        const understandingState = renderStates.get(understanding.particle.id);
        const active = beliefState?.highlighted || understandingState?.highlighted;

        drawConnection({
          from: belief,
          to: understanding,
          color: COLORS.belief,
          alpha: beliefState?.dimmed ? 0.035 : active ? 0.58 : 0.18,
          width: active ? 2.1 : 1.2,
        });
      });

      contradictions.forEach((contradiction, index) => {
        const target =
          beliefs[index % Math.max(beliefs.length, 1)] ??
          themes[index % Math.max(themes.length, 1)];

        if (!target) return;

        const contradictionState = renderStates.get(contradiction.particle.id);
        const targetState = renderStates.get(target.particle.id);
        const active =
          contradictionState?.highlighted || targetState?.highlighted;

        drawConnection({
          from: contradiction,
          to: target,
          color: COLORS.contradiction,
          alpha: contradictionState?.dimmed ? 0.035 : active ? 0.66 : 0.22 + tension * 0.28,
          width: active ? 2.4 : 1.1 + tension * 1.3,
          dashed: true,
        });
      });

      let nearest: Particle | null = null;
      let nearestDistance = Infinity;

      positions.forEach(({ particle, x, y }) => {
        const state = renderStates.get(particle.id);

        const unstableJitter =
          particle.kind === "contradiction" && !animationPaused
            ? Math.sin(t * 0.004 + particle.phase) * (0.8 + tension * 1.6)
            : 0;

        const drawX = x + unstableJitter;
        const drawY = y - unstableJitter * 0.6;

        const distance = Math.hypot(pointer.x - drawX, pointer.y - drawY);

        if (distance < particle.size + 20 && distance < nearestDistance) {
          nearest = particle;
          nearestDistance = distance;
        }

        const color = COLORS[particle.kind];

        const beliefPulse =
          particle.kind === "belief" && !animationPaused
            ? 1 + Math.sin(t * 0.003 + particle.phase) * 0.08
            : 1;

        const understandingPulse =
          particle.kind === "understanding" && !animationPaused
            ? 1 + Math.sin(t * 0.0024) * 0.08
            : 1;

        const finalSize =
          particle.size *
          beliefPulse *
          understandingPulse *
          (state?.sizeMultiplier ?? 1);

        drawGlow(
          drawX,
          drawY,
          finalSize * (state?.selected ? 10 : state?.highlighted ? 8 : 5.5),
          color,
          state?.glow ?? 0.14
        );

        ctx.fillStyle = color.replace("1)", `${state?.alpha ?? 0.82})`);
        ctx.beginPath();
        ctx.arc(drawX, drawY, finalSize, 0, Math.PI * 2);
        ctx.fill();

        if (particle.kind === "contradiction") {
          ctx.strokeStyle = `rgba(255, 139, 76, ${
            state?.dimmed ? 0.08 : 0.35 + tension * 0.25
          })`;
          ctx.lineWidth = state?.highlighted ? 1.6 : 1;
          ctx.beginPath();
          ctx.moveTo(drawX - finalSize, drawY - finalSize);
          ctx.lineTo(drawX + finalSize, drawY + finalSize);
          ctx.moveTo(drawX + finalSize, drawY - finalSize);
          ctx.lineTo(drawX - finalSize, drawY + finalSize);
          ctx.stroke();
        }

        if (state?.selected) {
          ctx.strokeStyle = "rgba(255,255,255,0.86)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(drawX, drawY, finalSize * 2.1, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (nearest !== hoveredParticle) {
        setHoveredParticle(nearest);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

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

    const handleClick = () => {
      if (hoveredParticle && onParticleSelected) {
        onParticleSelected(hoveredParticle);
      }
    };

    resize();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);
    canvas.addEventListener("click", handleClick);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
      canvas.removeEventListener("click", handleClick);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    particles,
    renderStates,
    highlightKind,
    compact,
    hoveredParticle,
    organismState,
    selectedParticleId,
    onParticleSelected,
    animationPaused,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: height,
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
          cursor: hoveredParticle ? "pointer" : "default",
        }}
      />

      <button
        type="button"
        onClick={() => setAnimationPaused((current) => !current)}
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          zIndex: 20,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(10,10,12,0.72)",
          color: "rgba(255,255,255,0.86)",
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        {animationPaused ? "Resume" : "Pause"}
      </button>

      {hoveredParticle && (
        <div className="organism-hover-card">
          <strong>{hoveredParticle.label}</strong>
          <span>
            {hoveredParticle.kind} ·{" "}
            {Math.round(hoveredParticle.confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}