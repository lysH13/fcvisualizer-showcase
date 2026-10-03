import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as d3 from "d3";

type MatchStats = Record<string, number | string | null | undefined>;

type PlayerSeason = {
  name: string;
  matches: readonly MatchStats[];
  color?: string;
};

type DynamicXYProps = {
  players: readonly PlayerSeason[];
  xMetric: string;
  yMetric: string;
  durationInFrames?: number;
};

type Point = { x: number; y: number };

const readMetric = (match: MatchStats, metric: string): number => {
  const value = Number(match[metric]);
  return Number.isFinite(value) ? value : 0;
};

export const DynamicXYShowcase: React.FC<DynamicXYProps> = ({
  players,
  xMetric,
  yMetric,
  durationInFrames = 900,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const margin = { top: 48, right: 72, bottom: 88, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxMatches = Math.max(0, ...players.map((player) => player.matches.length));
  const visibleMatchCount = Math.floor(
    interpolate(frame, [0, durationInFrames], [0, maxMatches], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }),
  );

  const totals = useMemo(
    () =>
      players.map((player) =>
        player.matches.reduce(
          (sum, match) => ({
            x: sum.x + readMetric(match, xMetric),
            y: sum.y + readMetric(match, yMetric),
          }),
          { x: 0, y: 0 },
        ),
      ),
    [players, xMetric, yMetric],
  );
  const xMax = Math.max(1, ...totals.map((total) => total.x));
  const yMax = Math.max(1, ...totals.map((total) => total.y));
  const xScale = d3
    .scaleLinear()
    .domain([0, xMax * 1.08])
    .range([margin.left, width - margin.right]);
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax * 1.08])
    .range([height - margin.bottom, margin.top]);

  const xTicks = xScale.ticks(5);
  const yTicks = yScale.ticks(5);
  const line = d3
    .line<Point>()
    .x((point) => point.x)
    .y((point) => point.y);

  return (
    <AbsoluteFill style={{ backgroundColor: "#101719", color: "white" }}>
      <svg width={width} height={height} role="img" aria-label={`${yMetric} par ${xMetric}`}>
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="#344246"
            />
            <text x={xScale(tick)} y={height - margin.bottom + 30} fill="#d5dfdf" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#344246"
            />
            <text x={margin.left - 16} y={yScale(tick) + 5} fill="#d5dfdf" textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        {players.map((player, playerIndex) => {
          let totalX = 0;
          let totalY = 0;
          const points = player.matches
            .slice(0, visibleMatchCount)
            .map((match) => {
              totalX += readMetric(match, xMetric);
              totalY += readMetric(match, yMetric);
              return { x: xScale(totalX), y: yScale(totalY) };
            });
          const currentPoint = points.at(-1);
          const color = player.color ?? d3.schemeTableau10[playerIndex % 10];

          if (!currentPoint) return null;

          return (
            <g key={player.name}>
              <path
                d={line(points) ?? ""}
                fill="none"
                stroke={color}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <circle cx={currentPoint.x} cy={currentPoint.y} r={9} fill={color} />
              <text x={currentPoint.x + 14} y={currentPoint.y - 10} fill="white" fontSize={22}>
                {player.name}
              </text>
            </g>
          );
        })}

        <text x={width / 2} y={height - 24} fill="white" textAnchor="middle" fontSize={22}>
          {xMetric}
        </text>
        <text
          x={28}
          y={height / 2}
          fill="white"
          textAnchor="middle"
          fontSize={22}
          transform={`rotate(-90 28 ${height / 2})`}
        >
          {yMetric}
        </text>
      </svg>
    </AbsoluteFill>
  );
};