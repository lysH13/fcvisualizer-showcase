import React from "react";
import { useCurrentFrame } from "remotion";

type MaskPoint = readonly [number, number];

type MaskIntensityProps = {
  clipId: string;
  imageSrc: string;
  maskPoints: readonly MaskPoint[];
  values: readonly number[];
  maxValue: number;
  width: number;
  height: number;
  durationInFrames?: number;
};

const valueAtFrame = (
  frame: number,
  values: readonly number[],
  durationInFrames: number,
): number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
  const position = progress * (values.length - 1);
  const startIndex = Math.floor(position);
  const fraction = position - startIndex;
  const start = values[startIndex];
  const end = values[Math.min(startIndex + 1, values.length - 1)];

  return start + (end - start) * fraction;
};

const createMaskPath = (
  points: readonly MaskPoint[],
  frame: number,
  intensity: number,
): string => {
  if (points.length < 3) return "";

  const center = points.reduce(
    (sum, [x, y]) => ({ x: sum.x + x / points.length, y: sum.y + y / points.length }),
    { x: 0, y: 0 },
  );
  const amplitude = intensity * 5;
  const contour = points.map(([x, y], index) => {
    const angle = Math.atan2(y - center.y, x - center.x);
    const wave = Math.sin(frame * 0.12 + index * 2.37) * amplitude;
    const offset = Math.max(0, wave);
    return `${x + Math.cos(angle) * offset},${y + Math.sin(angle) * offset}`;
  });

  return `M ${contour.join(" L ")} Z`;
};

export const MaskIntensityShowcase: React.FC<MaskIntensityProps> = ({
  clipId,
  imageSrc,
  maskPoints,
  values,
  maxValue,
  width,
  height,
  durationInFrames = 900,
}) => {
  const frame = useCurrentFrame();
  const safeClipId = clipId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const value = valueAtFrame(frame, values, durationInFrames);
  const intensity = Math.min(1, Math.max(0, value / Math.max(1, maxValue)));
  const basePath = createMaskPath(maskPoints, 0, 0);
  const animatedPath = createMaskPath(maskPoints, frame, intensity);

  if (!basePath) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Intensité statistique : ${value.toFixed(1)}`}
    >
      <defs>
        <clipPath id={`mask-${safeClipId}`}>
          <path d={basePath} />
        </clipPath>
        <filter id={`glow-${safeClipId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <image
        href={imageSrc}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#mask-${safeClipId})`}
      />
      <path
        d={animatedPath}
        fill="none"
        stroke="#00d9ff"
        strokeWidth={2 + intensity * 8}
        opacity={0.35 + intensity * 0.65}
        strokeLinejoin="round"
        filter={`url(#glow-${safeClipId})`}
      />
    </svg>
  );
};