import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import React, { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { playersPromise } from "../../const/players";
import { Player } from "../../Utilities/types";
import { FullSoccerPitch916Light } from "../../Utilities/CatchPhrase";
import { PlayerAggregatedData, PlayerRow } from "./on_season_data_types";

interface PlayerTrailPoint {
  x: number;
  y: number;
  opacity: number;
}

interface PlayerCloudProps {
  name: string;
  contours: d3.ContourMultiPolygon[];
  reveal: number;
  color: string;
  lastPoint?: PlayerTrailPoint | null;
  centerX: number;
  centerY: number;
}

export const PlayerCloud: React.FC<PlayerCloudProps> = ({
  name,
  contours,
  reveal,
  color,
}) => {
  if (!contours || contours.length === 0) return null;

  const maxIndex = contours.length - 1;
  const visibleIndex = Math.max(0, Math.floor(reveal * maxIndex));
  const visibleContours = contours.slice(0, visibleIndex + 1);
  const path = d3.geoPath();

  return (
    <>
      {visibleContours.map((c, i) => {
        const d = path(c);
        if (!d) return null;
        const rel = (i + 1) / visibleContours.length;
        const opacity = Math.min(0.35, 0.08 + rel * 0.27);
        return <path key={i} d={d} fill={color} opacity={opacity} />;
      })}
    </>
  );
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const generateVirtualPoints = (
  data: PlayerRow[],
  xCol: string,
  yCol: string,
  virtualSteps: number,
  xScale: (n: number) => number,
  yScale: (n: number) => number
): PlayerTrailPoint[] => {
  const result: PlayerTrailPoint[] = [];
  if (!data || data.length === 0) return result;

  for (let i = 0; i < data.length - 1; i++) {
    const x1 = Number(data[i][xCol]) || 0;
    const y1 = Number(data[i][yCol]) || 0;
    const x2 = Number(data[i + 1][xCol]) || 0;
    const y2 = Number(data[i + 1][yCol]) || 0;

    result.push({ x: xScale(x1), y: yScale(y1), opacity: 1 });

    for (let v = 1; v <= virtualSteps; v++) {
      const t = v / (virtualSteps + 1);
      result.push({
        x: xScale(lerp(x1, x2, t)),
        y: yScale(lerp(y1, y2, t)),
        opacity: 1,
      });
    }
  }

  const last = data[data.length - 1];
  result.push({
    x: xScale(Number(last[xCol]) || 0),
    y: yScale(Number(last[yCol]) || 0),
    opacity: 1,
  });

  return result;
};

const textMetricsCache = new Map<string, { w: number; h: number }>();
const measureTextOnce = (text: string, font = "18px Inter") => {
  if (textMetricsCache.has(text)) return textMetricsCache.get(text)!;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const size = {
    w: metrics.width,
    h: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  };
  textMetricsCache.set(text, size);
  return size;
};

type CloudsV2Props = {
  parsedPlayers: PlayerAggregatedData[];
};

export const CloudsV2: React.FC<CloudsV2Props> = ({ parsedPlayers }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const [allPlayersData, setAllPlayersData] = useState<PlayerAggregatedData[]>([]);
  const [, setPlayers] = useState<Player[]>([]);

  const [xColumn] = useState("goals");
  const [yColumn] = useState("assists");

  const PLAYER_DURATION = 30;
  const VIRTUAL_STEPS = 20;
  const DENSITY_SIZE: [number, number] = [1000, 1000];
  const BANDWIDTH = 60;
  let cancelled = false;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const promises = parsedPlayers.map(async (fp) => {
          const sum = fp.data.reduce((acc, r) => acc + Number(r[xColumn] || 0), 0);
          return { name: fp?.name || fp, data: fp.data, sum };
        });
        const results = await Promise.all(promises);
        if (!cancelled) setAllPlayersData(results.filter((r) => (r.sum ?? 0) > 0));
      } catch (e) {
        console.error("Error loading data:", e);
      }
    };
    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, [xColumn, yColumn, parsedPlayers]);

  useEffect(() => {
    let mounted = true;
    playersPromise.then((data) => {
      if (mounted) setPlayers(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const margin = { top: 140, right: 140, bottom: 140, left: 140 };
  const svgWidth = width * 0.9;
  const svgHeight = height * 0.7;
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const allCumX = allPlayersData.map(
    (p) => d3.max(p.data, (d) => Number(d[xColumn]) || 0) ?? 0
  );
  const allCumY = allPlayersData.map(
    (p) => d3.max(p.data, (d) => Number(d[yColumn]) || 0) ?? 0
  );

  const xMax = Math.max(...allCumX, 1);
  const yMax = Math.max(...allCumY, 1);

  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, xMax]).range([0, innerWidth]),
    [xMax, innerWidth]
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]),
    [yMax, innerHeight]
  );

  const xTicks = xScale.ticks(3).filter((t) => t !== 0);
  const yTicks = yScale.ticks(4).filter((t) => t !== 0);

  const virtualPointsMap = useMemo(() => {
    const map = new Map<string, PlayerTrailPoint[]>();
    allPlayersData.forEach((p) => {
      map.set(
        p.name,
        generateVirtualPoints(p.data, xColumn, yColumn, VIRTUAL_STEPS, xScale, yScale)
      );
    });
    return map;
  }, [allPlayersData, xColumn, yColumn, xScale, yScale]);

  const centroidMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const bandwidth = 10;
    const iterations = 10;

    function meanShift(points: { x: number; y: number }[]) {
      let cx = d3.mean(points, (d) => d.x) ?? 0;
      let cy = d3.mean(points, (d) => d.y) ?? 0;

      for (let k = 0; k < iterations; k++) {
        let sumX = 0, sumY = 0, sumW = 0;
        for (const p of points) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist2 = dx * dx + dy * dy;
          const w = Math.exp(-dist2 / (2 * bandwidth * bandwidth));
          sumX += p.x * w;
          sumY += p.y * w;
          sumW += w;
        }
        cx = sumX / sumW;
        cy = sumY / sumW;
      }
      return { x: cx, y: cy };
    }

    virtualPointsMap.forEach((pts, name) => {
      if (!pts || pts.length === 0) {
        map.set(name, { x: 0, y: 0 });
      } else {
        map.set(name, meanShift(pts));
      }
    });
    return map;
  }, [virtualPointsMap]);

  const contoursMap = useMemo(() => {
    const map = new Map<string, d3.ContourMultiPolygon[]>();
    const density = d3
      .contourDensity<PlayerTrailPoint>()
      .x((d) => d.x)
      .y((d) => d.y)
      .size(DENSITY_SIZE)
      .bandwidth(BANDWIDTH);

    virtualPointsMap.forEach((pts, name) => {
      if (!pts || pts.length === 0) {
        map.set(name, []);
      } else {
        try {
          map.set(name, density(pts));
        } catch (e) {
          map.set(name, []);
        }
      }
    });
    return map;
  }, [virtualPointsMap]);

  const NameLabel: React.FC<{ x: number; y: number; text: string; color: string }> = ({
    x, y, text, color,
  }) => {
    const { w, h } = measureTextOnce(text);
    const correctedW = w * 2.1;
    const paddingX = 14;
    const paddingY = 25;
    const boxWidth = correctedW + paddingX * 2;
    const boxHeight = h + paddingY * 2;

    return (
      <g>
        <rect
          x={x - boxWidth / 2}
          y={y - boxHeight / 2 - 2}
          width={boxWidth}
          height={boxHeight}
          fill="white"
          opacity={0.8}
          rx={7}
          ry={7}
          style={{ pointerEvents: "none" }}
        />
        <text
          x={x}
          y={y}
          fill={color}
          fontSize={40}
          fontWeight="200px"
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{ pointerEvents: "none" }}
        >
          {text}
        </text>
      </g>
    );
  };

  if (!allPlayersData[0]) return null;

  return (
    <AbsoluteFill
      style={{
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Anton, cursive",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) `,
        }}
      >
        <FullSoccerPitch916Light scale={1} />
      </div>
      <div style={{ zIndex: 2, position: "absolute", background: "rgba(0,0,0,0.7)" }}>
        <svg width={svgWidth} height={svgHeight} style={{ zIndex: 2 }}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <line x1={0} y1={innerHeight - 2} x2={innerWidth} y2={innerHeight - 2} stroke="white" strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="white" strokeWidth={5} />

            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)},${innerHeight})`}>
                <text y={-10} dy="1.8em" textAnchor="middle" fontSize={30} fill="white" fontWeight={"bold"}>
                  {tick}
                </text>
              </g>
            ))}

            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0,${yScale(tick)})`}>
                <text x={-12} dy="0.35em" textAnchor="end" fontSize={30} fill="white" fontWeight={"bold"}>
                  {tick}
                </text>
              </g>
            ))}

            <text x={-20} y={innerHeight + 40} fill="white" fontSize={30} fontWeight={"bold"} textAnchor="end">
              0
            </text>

            <text x={innerWidth} y={innerHeight + 100} fill="white" fontSize={35} textAnchor="middle" fontWeight={"200px"}>
              Goals
            </text>
            <text x={0} y={-50} fill="white" fontSize={35} textAnchor="middle" fontWeight={"200px"}>
              Assists
            </text>

            {allPlayersData.map((player, playerIndex) => {
              const name = player.name;
              const color = d3.schemeTableau10[playerIndex % 10];
              const contours = contoursMap.get(name) ?? [];
              const startFrame = playerIndex * PLAYER_DURATION;
              const reveal = Math.max(0, Math.min(1, (frame - startFrame) / PLAYER_DURATION));

              if (frame < startFrame) return null;
              const centroid = centroidMap.get(name) ?? { x: 0, y: 0 };
              
              return (
                <PlayerCloud
                  key={name}
                  name={name}
                  contours={contours}
                  reveal={reveal}
                  color={color}
                  centerX={centroid.x}
                  centerY={centroid.y}
                />
              );
            })}

            <g>
              {allPlayersData.map((player, playerIndex) => {
                const name = player.name;
                const contours = contoursMap.get(name) ?? [];
                const startFrame = playerIndex * PLAYER_DURATION;
                const reveal = Math.max(0, Math.min(1, (frame - startFrame) / PLAYER_DURATION));

                if (frame < startFrame || contours.length === 0) return null;

                const path = d3.geoPath();
                const lastContour = contours[Math.floor(reveal * (contours.length - 1))];
                const centroid = lastContour ? path.centroid(lastContour) : [0, 0];

                return (
                  <NameLabel
                    key={`label-${name}`}
                    x={centroid[0]}
                    y={centroid[1]}
                    text={name}
                    color={d3.schemeTableau10[playerIndex % 10]}
                  />
                );
              })}
            </g>
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};