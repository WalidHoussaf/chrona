import React, { useEffect, useRef, useCallback, CSSProperties, ReactNode, useSyncExternalStore } from 'react';

let electricBorderActiveCount = 0;
const electricBorderCountListeners = new Set<() => void>();

function emitElectricBorderCount() {
  for (const l of electricBorderCountListeners) l();
}

function subscribeElectricBorderCount(listener: () => void) {
  electricBorderCountListeners.add(listener);
  return () => electricBorderCountListeners.delete(listener);
}

function getElectricBorderCountSnapshot() {
  return electricBorderActiveCount;
}

function resolveCssColor(input: string, element?: Element | null): string {
  const trimmed = input.trim();
  const match = trimmed.match(/var\(\s*(--[^,\s)]+)\s*(?:,[^)]+)?\)/);
  if (!match) return trimmed;
  const varName = match[1];
  const base = element ?? document.documentElement;
  const value = getComputedStyle(base as Element).getPropertyValue(varName).trim();
  return value || trimmed;
}

interface ElectricBorderProps {
  children?: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  mode?: 'rect' | 'svg';
  svgDisplacement?: number;
  strokeWidth?: number;
  thickness?: number;
  fuzziness?: number;
  glow?: number;
  showOutline?: boolean;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  maxFps?: number;
  dprCap?: number;
  renderScale?: number;
  pauseWhenOffscreen?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = '#5227FF',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  mode = 'rect',
  svgDisplacement = 8,
  strokeWidth = 1,
  thickness,
  fuzziness = 1,
  glow = 1,
  showOutline = true,
  quality = 'auto',
  maxFps,
  dprCap,
  renderScale,
  pauseWhenOffscreen = true,
  className,
  style
}) => {
  const activeCount = useSyncExternalStore(
    subscribeElectricBorderCount,
    getElectricBorderCountSnapshot,
    getElectricBorderCountSnapshot
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const lastDrawTimeRef = useRef(0);
  const isRunningRef = useRef(false);
  const isVisibleRef = useRef(true);
  const resolvedColorRef = useRef<string>(color);
  const lastColorResolveRef = useRef(0);

  useEffect(() => {
    electricBorderActiveCount += 1;
    emitElectricBorderCount();

    return () => {
      electricBorderActiveCount = Math.max(0, electricBorderActiveCount - 1);
      emitElectricBorderCount();
    };
  }, []);

  const random = useCallback((x: number): number => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x: number, y: number): number => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;

      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    },
    [random]
  );

  const octavedNoise = useCallback(
    (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseAmplitude: number,
      baseFrequency: number,
      time: number,
      seed: number,
      baseFlatness: number
    ): number => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude;
        if (i === 0) {
          octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return y;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback(
    (
      centerX: number,
      centerY: number,
      radius: number,
      startAngle: number,
      arcLength: number,
      progress: number
    ): { x: number; y: number } => {
      const angle = startAngle + progress * arcLength;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    },
    []
  );

  const getRoundedRectPoint = useCallback(
    (t: number, left: number, top: number, width: number, height: number, radius: number): { x: number; y: number } => {
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;

      let accumulated = 0;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + radius + progress * straightWidth, y: top };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left + width, y: top + radius + progress * straightHeight };
      }
      accumulated += straightHeight;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + width - radius - progress * straightWidth, y: top + height };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left, y: top + height - radius - progress * straightHeight };
      }
      accumulated += straightHeight;

      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
    },
    [getCornerPoint]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    const effectiveQuality: 'low' | 'medium' | 'high' = (() => {
      if (quality !== 'auto') return quality;
      if (prefersReducedMotion) return 'low';
      if (activeCount >= 18) return 'low';
      if (activeCount >= 8) return 'medium';
      return 'high';
    })();

    const effectiveMaxFps =
      maxFps ??
      (prefersReducedMotion
        ? 15
        : activeCount >= 18
          ? 20
          : effectiveQuality === 'high'
            ? 60
            : effectiveQuality === 'low'
              ? 24
              : 30);

    const minFrameIntervalMs = 1000 / Math.max(1, effectiveMaxFps);
    const effectiveDprCap = dprCap ?? (effectiveQuality === 'high' ? 2 : 1.5);
    const effectiveRenderScale = Math.max(
      0.5,
      Math.min(1, renderScale ?? (activeCount >= 18 ? 0.7 : effectiveQuality === 'low' ? 0.75 : 1))
    );

    const octaves = effectiveQuality === 'high' ? 7 : effectiveQuality === 'low' ? 3 : 5;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = chaos;
    const frequency = 10;
    const baseFlatness = 0;
    const displacement = svgDisplacement;
    const borderOffset = mode === 'svg' ? Math.max(16, svgDisplacement * 6) : Math.max(10, svgDisplacement * 3);

    const effectiveThickness = thickness ?? strokeWidth;

    const MAX_POINTS = activeCount >= 18 ? 420 : 700;

    let svgPaths: SVGPathElement[] = [];
    let svgPathLengths: number[] = [];
    let svgCumulativeLengths: number[] = [];
    let svgTotalLength = 0;

    let rectBasePoints: Array<{ x: number; y: number; progress: number }> = [];
    let svgBasePoints: Array<{ x: number; y: number; nx: number; ny: number; progress: number }> = [];

    const updateResolvedColor = (force = false) => {
      const now = performance.now();
      if (!force && now - lastColorResolveRef.current < 500) return;
      lastColorResolveRef.current = now;
      resolvedColorRef.current = resolveCssColor(color, container);
    };

    const getSvgViewBox = (svg: SVGSVGElement): { x: number; y: number; width: number; height: number } | null => {
      const vb = svg.viewBox?.baseVal;
      if (vb && vb.width > 0 && vb.height > 0) {
        return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
      }
      const vbAttr = svg.getAttribute('viewBox');
      if (!vbAttr) return null;
      const parts = vbAttr.split(/[ ,]+/).map((n) => Number(n));
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
      return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    };

    const refreshSvgData = () => {
      if (mode !== 'svg') return;
      const svg = container.querySelector('svg') as SVGSVGElement | null;
      if (!svg) {
        svgPaths = [];
        svgPathLengths = [];
        svgCumulativeLengths = [];
        svgTotalLength = 0;
        return;
      }

      svgPaths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[];
      svgPathLengths = svgPaths.map((p) => {
        try {
          return p.getTotalLength();
        } catch {
          return 0;
        }
      });

      svgCumulativeLengths = [];
      let acc = 0;
      for (const len of svgPathLengths) {
        acc += len;
        svgCumulativeLengths.push(acc);
      }

      svgTotalLength = acc;
    };

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width + borderOffset * 2;
      const height = rect.height + borderOffset * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, effectiveDprCap);
      const pixelScale = dpr * effectiveRenderScale;

      canvas.width = Math.max(1, Math.floor(width * pixelScale));
      canvas.height = Math.max(1, Math.floor(height * pixelScale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(pixelScale, pixelScale);

      return { width, height, pixelScale };
    };

    let { width, height, pixelScale } = updateSize();

    const rebuildRectGeometry = () => {
      rectBasePoints = [];
      if (mode !== 'rect') return;

      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = width - 2 * borderOffset;
      const borderHeight = height - 2 * borderOffset;
      if (borderWidth <= 0 || borderHeight <= 0) return;

      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.min(MAX_POINTS, Math.max(120, Math.floor(approximatePerimeter / 4)));

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);
        rectBasePoints.push({ x: point.x, y: point.y, progress });
      }
    };

    const findSvgPathAtDistance = (distance: number): { path: SVGPathElement; localDistance: number; pathLen: number } | null => {
      if (!svgPaths.length || svgTotalLength <= 0) return null;
      let lo = 0;
      let hi = svgCumulativeLengths.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (distance <= svgCumulativeLengths[mid]) hi = mid;
        else lo = mid + 1;
      }
      const pathIndex = lo;
      const prevCum = pathIndex > 0 ? svgCumulativeLengths[pathIndex - 1] : 0;
      const localDistance = distance - prevCum;
      const path = svgPaths[Math.min(pathIndex, svgPaths.length - 1)];
      const pathLen = svgPathLengths[pathIndex] ?? 0;
      if (!path || pathLen <= 0) return null;
      return { path, localDistance, pathLen };
    };

    const rebuildSvgGeometry = () => {
      svgBasePoints = [];
      if (mode !== 'svg') return;
      if (!svgPaths.length || svgTotalLength <= 0) refreshSvgData();

      const svg = container.querySelector('svg') as SVGSVGElement | null;
      if (!svg || !svgPaths.length || svgTotalLength <= 0) return;

      const containerRect = container.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const vb = getSvgViewBox(svg);
      if (!vb || vb.width === 0 || vb.height === 0) return;

      const toScreen = (p: { x: number; y: number }) => {
        const x = svgRect.left + ((p.x - vb.x) / vb.width) * svgRect.width;
        const y = svgRect.top + ((p.y - vb.y) / vb.height) * svgRect.height;
        return { x, y };
      };

      const toCanvas = (screen: { x: number; y: number }) => {
        return {
          x: screen.x - containerRect.left + borderOffset,
          y: screen.y - containerRect.top + borderOffset
        };
      };

      const sampleCount = Math.min(MAX_POINTS, Math.max(180, Math.floor(svgTotalLength * 0.35)));
      const eps = 0.75;

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const distance = progress * svgTotalLength;
        const info = findSvgPathAtDistance(distance);
        if (!info) continue;

        const len = Math.min(Math.max(info.localDistance, 0), info.pathLen);

        let p0: { x: number; y: number };
        let p1: { x: number; y: number };
        let p2: { x: number; y: number };
        try {
          p0 = info.path.getPointAtLength(len);
          p1 = info.path.getPointAtLength(Math.max(0, len - eps));
          p2 = info.path.getPointAtLength(Math.min(info.pathLen, len + eps));
        } catch {
          continue;
        }

        const s0 = toScreen(p0);
        const s1 = toScreen(p1);
        const s2 = toScreen(p2);

        const tdx = s2.x - s1.x;
        const tdy = s2.y - s1.y;
        const tLen = Math.hypot(tdx, tdy) || 1;
        const nx = -tdy / tLen;
        const ny = tdx / tLen;

        const c0 = toCanvas(s0);
        svgBasePoints.push({ x: c0.x, y: c0.y, nx, ny, progress });
      }
    };

    const rebuildGeometry = () => {
      updateResolvedColor(true);
      rebuildRectGeometry();
      rebuildSvgGeometry();
    };

    rebuildGeometry();

    const drawElectricBorder = (currentTime: number) => {
      if (!canvas || !ctx) return;

      if (!isVisibleRef.current || document.visibilityState === 'hidden') {
        animationRef.current = requestAnimationFrame(drawElectricBorder);
        return;
      }

      if (currentTime - lastDrawTimeRef.current < minFrameIntervalMs) {
        animationRef.current = requestAnimationFrame(drawElectricBorder);
        return;
      }
      lastDrawTimeRef.current = currentTime;

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(pixelScale, pixelScale);

      updateResolvedColor(false);
      const resolvedColor = resolvedColorRef.current;

      ctx.strokeStyle = resolvedColor;
      ctx.lineWidth = effectiveThickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const scale = displacement;

      if (mode === 'svg') {
        if (!svgBasePoints.length) {
          rebuildSvgGeometry();
        }
        if (svgBasePoints.length < 2) {
          animationRef.current = requestAnimationFrame(drawElectricBorder);
          return;
        }

        const fuzz = Math.max(0, fuzziness);
        const glowStrength = Math.max(0, glow);

        const drawFromBasePoints = (opts: { alpha: number; width: number }) => {
          ctx.save();
          ctx.globalAlpha = opts.alpha;
          ctx.lineWidth = opts.width;
          ctx.globalCompositeOperation = glowStrength > 0 ? 'lighter' : 'source-over';

          ctx.beginPath();
          for (let i = 0; i < svgBasePoints.length; i++) {
            const p = svgBasePoints[i];
            const n = octavedNoise(
              p.progress * 10,
              octaves,
              lacunarity,
              gain,
              amplitude,
              frequency,
              timeRef.current,
              0,
              baseFlatness
            );
            const x = p.x + p.nx * n * scale;
            const y = p.y + p.ny * n * scale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        };

        if (glowStrength > 0) {
          drawFromBasePoints({ alpha: 0.10 * glowStrength, width: effectiveThickness * (5 + 2 * fuzz) });
          drawFromBasePoints({ alpha: 0.22 * glowStrength, width: effectiveThickness * (2.6 + 1.2 * fuzz) });
        }
        drawFromBasePoints({ alpha: 1, width: effectiveThickness * (1 + 0.25 * fuzz) });
      } else {
        if (!rectBasePoints.length) {
          rebuildRectGeometry();
        }
        if (rectBasePoints.length < 2) {
          animationRef.current = requestAnimationFrame(drawElectricBorder);
          return;
        }

        ctx.beginPath();

        for (let i = 0; i < rectBasePoints.length; i++) {
          const p = rectBasePoints[i];
          const xNoise = octavedNoise(
            p.progress * 8,
            octaves,
            lacunarity,
            gain,
            amplitude,
            frequency,
            timeRef.current,
            0,
            baseFlatness
          );
          const yNoise = octavedNoise(
            p.progress * 8,
            octaves,
            lacunarity,
            gain,
            amplitude,
            frequency,
            timeRef.current,
            1,
            baseFlatness
          );

          const x = p.x + xNoise * scale;
          const y = p.y + yNoise * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(drawElectricBorder);
    };

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize();
      width = newSize.width;
      height = newSize.height;
      pixelScale = newSize.pixelScale;
      refreshSvgData();
      rebuildGeometry();
    });
    resizeObserver.observe(container);

    refreshSvgData();
    rebuildGeometry();

    let intersectionObserver: IntersectionObserver | null = null;
    if (pauseWhenOffscreen && typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisibleRef.current = !!entry?.isIntersecting;
        },
        { root: null, threshold: 0 }
      );
      intersectionObserver.observe(container);
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastFrameTimeRef.current = performance.now();
        lastDrawTimeRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    lastFrameTimeRef.current = performance.now();
    isRunningRef.current = true;
    animationRef.current = requestAnimationFrame(drawElectricBorder);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      isRunningRef.current = false;
      resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  },
  [
    color,
    speed,
    chaos,
    borderRadius,
    mode,
    svgDisplacement,
    strokeWidth,
    thickness,
    fuzziness,
    glow,
    quality,
    maxFps,
    dprCap,
    renderScale,
    pauseWhenOffscreen,
    activeCount,
    octavedNoise,
    getRoundedRectPoint
  ]
);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible isolate ${className ?? ''}`}
      style={{ '--electric-border-color': color, borderRadius, contain: 'layout style', ...style } as CSSProperties}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-2"
        style={{ willChange: 'transform' }}
      >
        <canvas ref={canvasRef} className="block" style={{ transform: 'translateZ(0)' }} />
      </div>
      {mode === 'rect' && showOutline && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{ border: `2px solid color-mix(in srgb, ${color} 60%, transparent)`, filter: 'blur(1px)' }}
          />
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{ border: `2px solid ${color}`, filter: 'blur(4px)' }}
          />
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none -z-1 scale-110 opacity-30"
            style={{
              filter: 'blur(32px)',
              background: `linear-gradient(-30deg, ${color}, transparent, ${color})`
            }}
          />
        </div>
      )}
      <div className="relative rounded-[inherit] z-1 h-full w-full pointer-events-auto">{children}</div>
    </div>
  );
};

export default ElectricBorder;