import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { ImagePositionerModel } from "../../Components/ImagePositioner";
import { playersPromise } from "../../const/players";
import { ClubLogoLight } from "../../Components/LogoModels";

interface PlayerRow {
  [key: string]: string | number;
}

interface PlayerAggregatedData {
  clubs: string[];
  name: string;
  data: PlayerRow[];
  sum: number;
}

interface PlayerTrailPoint {
  x: number;
  y: number;
  opacity: number;
}

const PlayerTrail: React.FC<{
  name: string;
  points: PlayerTrailPoint[];
  fadeOut?: number;
}> = ({ name, points, fadeOut = 1 }) => {
  if (points.length === 0) return null;
  const last = points[points.length - 1];

  return (
    <g opacity={fadeOut}>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e90ff" opacity={p.opacity} />
      ))}
      <circle cx={last.x} cy={last.y} r={10} fill="#1e90ff" />
      <foreignObject
        x={last.x + 15}
        y={last.y}
        width={400}
        height={150}
        style={{ pointerEvents: "none", overflow: "visible" }}
      >
        <div style={{ transform: "translateY(-50%)", position: "relative", display: "inline-flex", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              left: "-7px",
              top: "50%",
              marginTop: "-7px",
              width: "14px",
              height: "14px",
              backgroundColor: "rgba(255, 255, 255, 1)",
              transform: "rotate(45deg)",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 1)",
              padding: "6px 6px",
              borderRadius: "4px",
              color: "#000",
              fontFamily: "Oswald",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "0.95", fontSize: "30px" }}>
              <span>{name}</span>
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

type DynamicXYProps = {
  parsedPlayers: PlayerAggregatedData[];
};

export const DynamicXY: React.FC<DynamicXYProps> = ({ parsedPlayers }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const [allPlayersData, setAllPlayersData] = useState<PlayerAggregatedData[]>([]);
  const [xColumn] = useState("goals");
  const [yColumn] = useState("assists");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchPromises = parsedPlayers.map((player: PlayerAggregatedData) => {
          const sum = player.data.reduce(
            (acc, row) => acc + Number(row[xColumn] || 0) + Number(row[yColumn] || 0),
            0
          );
          const totalFouls = player.data.reduce((sum, row) => sum + (Number(row[xColumn]) || 0), 0);
          const totalFouled = player.data.reduce((sum, row) => sum + (Number(row[yColumn]) || 0), 0);

          const clubs: string[] = Array.from(
            new Set(
              player.data.map((row: any) => {
                const url = row.team_url;
                const comp = row.comp;
                if (!url || comp !== "La Liga") return null;
                const match = url.match(/\/squads\/([a-zA-Z0-9]+)/);
                return match ? match[1] : url;
              }).filter(Boolean)
            )
          ) as string[];

          return { name: player.name, data: player.data, sum, totalFouls, totalFouled, clubs };
        });

        const results = await Promise.all(fetchPromises);
        const maxFouls = results.reduce((max, p) => Math.max(max, p.totalFouls), 1);
        const maxFouled = results.reduce((max, p) => Math.max(max, p.totalFouled), 1);

        const sortedPlayers = results.sort((a, b) => {
          const normFoulsA = a.totalFouls / maxFouls;
          const normFouledA = a.totalFouled / maxFouled;
          const distanceA = normFoulsA ** 2 + normFouledA ** 2;

          const normFoulsB = b.totalFouls / maxFouls;
          const normFouledB = b.totalFouled / maxFouled;
          const distanceB = normFoulsB ** 2 + normFouledB ** 2;

          return distanceA - distanceB;
        });

        setAllPlayersData(sortedPlayers.filter((p) => p.sum > 0));
      } catch (err) {
        console.error("Erreur chargement joueurs:", err);
      }
    };
    fetchData();
  }, [xColumn, yColumn, parsedPlayers]);

  const margin = { top: 0, right: 0, bottom: 110, left: 110 };
  const svgWidth = width * 0.8;
  const svgHeight = height * 0.65;
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;
  const showLabels = true;
  const tickCount = 9;

  const allCumX = allPlayersData.map((p) => d3.sum(p.data, (d) => Number(d[xColumn]) || 0));
  const allCumY = allPlayersData.map((p) => d3.sum(p.data, (d) => Number(d[yColumn]) || 0));

  const xMax = Math.max(...allCumX, 1);
  const yMax = Math.max(...allCumY, 1);

  const xScale = d3.scaleLinear().domain([0, xMax * 1.4]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerHeight, 0]);

  const matchFrameStep = 0.01;
  const trailLength = 50;
  const fadeOutDuration = 1;
  const totalDurations: number[] = [];

  let cumulative = 0;
  allPlayersData.forEach((p) => {
    const matchDuration = p.data.length * matchFrameStep + fadeOutDuration;
    totalDurations.push(cumulative);
    cumulative += matchDuration;
  });

  const xTicks = xScale.ticks(tickCount).filter((t) => t !== 0);
  const yTicks = yScale.ticks(tickCount).filter((t) => t !== 0);
  const [players, setPlayers] = useState<PlayerAggregatedData[]>([]);

  useEffect(() => {
    playersPromise.then((data: any) => setPlayers(data));
  }, []);

  if (!allPlayersData[0]) return null;

  const scaleZoom = interpolate(frame, [0, 1000], [2.2, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.1, 0.5, 0.7, 1),
  });

  return (
    <AbsoluteFill
      style={{
        background: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ position: "absolute", width, height }}>
        {players && <ImagePositionerModel id={"Kylian Mbappé"} imgPath={"playersImgClean/img/mbappe6.jpg"} />}
      </div>
      
      <div style={{ position: "absolute", top: `${300 - 80}px`, width: "100%", display: "flex", justifyContent: "center" }}>
        {allPlayersData.map((player, playerIndex) => {
          const startFrame = totalDurations[playerIndex];
          const endFrame = totalDurations[playerIndex + 1] !== undefined ? totalDurations[playerIndex + 1] : Infinity;

          if (frame < startFrame || frame >= endFrame) return null;

          return (
            <div key={`player-${playerIndex}`} style={{ opacity: 1, position: "absolute", width: width * 0.8 }}>
              <div style={{ width: "100%", height: 80, display: "inline-flex", alignItems: "center", backgroundColor: "#1e90ff", color: "#fff", fontSize: "48px", fontFamily: "Oswald", whiteSpace: "nowrap", justifyContent: "space-between" }}>
                <span style={{ marginLeft: 20 }}>Joueur {playerIndex + 1} / {allPlayersData.length} : {player.name}</span>
                <div style={{ height: "100%", backgroundColor: "#1e90ff", display: "flex" }}>
                  {player.clubs?.map((club: string, idx: React.Key) => (
                    <ClubLogoLight key={idx} clubSrc={club} size={80} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ zIndex: "1", background: "rgba(0, 0, 0, 0.61)", width: width * 0.8, borderRadius: 20 }}>
        <svg width={svgWidth} height={svgHeight}>
          <g
            transform={`translate(${margin.left},${margin.top}) scale(${scaleZoom})`}
            style={{ transformOrigin: `-140px ${innerHeight + 100}px` }}
          >
            <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="white" strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={innerHeight + 2} stroke="white" strokeWidth={4} />

            <text x={-20} y={innerHeight + 40} fill="white" fontSize={26} textAnchor="end" fontFamily="Oswald">0</text>
            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)},${innerHeight - 5})`}>
                <text dy="1.8em" fill="white" fontSize={26} textAnchor="middle" fontFamily="Oswald">{tick}</text>
              </g>
            ))}

            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(-10,${yScale(tick) + 2})`}>
                <text x={-12} dy="0.35em" fill="white" fontSize={26} textAnchor="end" fontFamily="Oswald">{tick}</text>
              </g>
            ))}

            {allPlayersData.map((player, playerIndex) => {
              const startFrame = totalDurations[playerIndex];
              const localFrame = frame - startFrame;
              if (frame < startFrame) return null;

              const matches = player.data.length;
              const visibleMatches = Math.min(matches, Math.floor(localFrame / matchFrameStep));
              const fadeOutStart = matches * matchFrameStep;
              const fadeProgress = localFrame > fadeOutStart
                ? interpolate(localFrame - fadeOutStart, [0, fadeOutDuration], [1, 0.4], { extrapolateRight: "clamp" })
                : 1;

              const trail: PlayerTrailPoint[] = [];
              for (let i = Math.max(0, visibleMatches - trailLength); i < visibleMatches; i++) {
                const subset = player.data.slice(0, i + 1);
                const sumX = d3.sum(subset, (d) => Number(d[xColumn]) || 0);
                const sumY = d3.sum(subset, (d) => Number(d[yColumn]) || 0);
                trail.push({
                  x: xScale(sumX),
                  y: yScale(sumY),
                  opacity: i === visibleMatches - 1 ? 1 : (i - (visibleMatches - trailLength)) / trailLength,
                });
              }

              return <PlayerTrail key={`${playerIndex}+${player.name}`} name={player.name} points={trail} fadeOut={fadeProgress} />;
            })}
          </g>

          {showLabels && (
            <>
              <foreignObject x={svgWidth / 2 - 75} y={svgHeight - 60} width={270} height={60} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.8)", borderRadius: "8px 8px 0 0", color: "#1e90ff", fontFamily: "Oswald", fontSize: "36px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)", height: "100%", width: "100%" }}>
                  Buts
                </div>
              </foreignObject>
              <g transform={`translate(20, ${svgHeight / 2}) rotate(-90)`}>
                <foreignObject x={-75} y={-20} width={240} height={60} style={{ overflow: "visible" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.8)", borderRadius: "0 0 8px 8px", color: "#1e90ff", fontFamily: "Oswald", fontSize: "36px", height: "100%", width: "100%", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
                    Passes D.
                  </div>
                </foreignObject>
              </g>
            </>
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};