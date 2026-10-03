import { useCurrentFrame, useVideoConfig } from "remotion";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { splitPlayerName, stringToColor } from "../../const/TinyFunctions";
import { StatsHeader } from "../../Utilities/CatchPhrase";
import { PlayerAggregatedData } from "./on_season_data_types";

type DateValue = {
  date: Date;
  value: number;
};

type PlayerData = {
  name: string;
  dataPoints: DateValue[];
};

type RawSignalsDatesProps = {
  parsedPlayers: PlayerAggregatedData[];
};

export const RawSignalsDates: React.FC<RawSignalsDatesProps> = ({ parsedPlayers }) => {
  const [data, setData] = useState<PlayerData[] | null>(null);
  const [globalDateRange, setGlobalDateRange] = useState<[Date, Date] | null>(null);

  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const HEIGHT = height * 0.35;
  const MARGIN = { top: 0, right: width / 2, bottom: 0, left: width / 2 };
  const VIRTUAL_WIDTH = 4000;

  const selectedPlayers = ["Lamine Yamal", "Michael Olise"];
  const fields = ["goals", "assists"];

  useEffect(() => {
    const fetchAll = async () => {
      const filteredPlayers = parsedPlayers.filter((p) => selectedPlayers.includes(p.name));
      let minDate = new Date(8640000000000000);
      let maxDate = new Date(-8640000000000000);
      const processedData: PlayerData[] = [];

      for (const player of filteredPlayers) {
        const points: DateValue[] = player.data.map((row) => {
          const d = new Date(row.date);
          if (d < minDate) minDate = d;
          if (d > maxDate) maxDate = d;

          const val = fields.reduce((acc, field) => acc + (parseFloat(String(row[field])) || 0), 0);
          return { date: d, value: val };
        });

        points.sort((a, b) => a.date.getTime() - b.date.getTime());
        processedData.push({ name: player.name, dataPoints: points });
      }

      minDate = new Date(minDate.getTime() - 86400000 * 7);
      maxDate = new Date(maxDate.getTime() + 86400000 * 7);

      setGlobalDateRange([minDate, maxDate]);
      setData(processedData);
    };

    fetchAll();
  }, [parsedPlayers]);

  if (!data || !globalDateRange) return null;

  const [minDate, maxDate] = globalDateRange;
  const xScale = d3.scaleTime().domain([minDate, maxDate]).range([MARGIN.left, VIRTUAL_WIDTH - MARGIN.right]);

  const allValues = data.flatMap((p) => p.dataPoints.map((d) => d.value));
  const maxY = Math.max(0, ...allValues) || 10;
  const yScale = d3.scaleLinear().domain([0, maxY]).nice().range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  const timeInterpolator = d3.interpolateDate(minDate, maxDate);
  const GLOBAL_DURATION = 700;
  const currentVideoDate = timeInterpolator(frame / GLOBAL_DURATION);

  const renderedPlayers = data.map((player) => {
    const points = player.dataPoints;
    const nextPointIndex = points.findIndex((p) => p.date > currentVideoDate);

    let pointsToDraw: DateValue[] = [];
    let currentTipPoint: DateValue | null = null;

    if (nextPointIndex === 0) {
      pointsToDraw = [];
    } else if (nextPointIndex === -1) {
      pointsToDraw = points;
      currentTipPoint = points[points.length - 1];
    } else {
      pointsToDraw = points.slice(0, nextPointIndex);
      const prevPoint = points[nextPointIndex - 1];
      const nextPoint = points[nextPointIndex];
      const totalTimeSpan = nextPoint.date.getTime() - prevPoint.date.getTime();
      const elapsedTime = currentVideoDate.getTime() - prevPoint.date.getTime();
      const ratio = totalTimeSpan === 0 ? 1 : elapsedTime / totalTimeSpan;
      const interpolatedValue = d3.interpolateNumber(prevPoint.value, nextPoint.value)(ratio);

      currentTipPoint = { date: currentVideoDate, value: interpolatedValue };
      pointsToDraw.push(currentTipPoint);
    }

    return { name: player.name, pointsToDraw, currentTipPoint };
  });

  const VIEWPORT_WIDTH = width;
  const cameraTargetX = xScale(currentVideoDate);
  const MIN_CAMERA_X = 0;
  const MAX_CAMERA_X = Math.max(0, VIRTUAL_WIDTH - VIEWPORT_WIDTH);
  const cameraX = Math.min(Math.max(MIN_CAMERA_X, cameraTargetX - VIEWPORT_WIDTH / 2), MAX_CAMERA_X);

  const dateToPlayersMap = new Map<string, { date: Date; playerNames: Set<string> }>();
  renderedPlayers.forEach((player) => {
    player.pointsToDraw?.forEach((point) => {
      if (!point || !point.date) return;
      const d = new Date(point.date);
      const key = d.toDateString();
      if (!dateToPlayersMap.has(key)) dateToPlayersMap.set(key, { date: d, playerNames: new Set() });
      dateToPlayersMap.get(key)!.playerNames.add(player.name);
    });
  });

  const sortedDatesInfo = Array.from(dateToPlayersMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const NEUTRAL_COLOR = "rgba(255, 255, 255, 1)";

  const xTicks = sortedDatesInfo.map(({ date, playerNames }) => {
    let tickColor = NEUTRAL_COLOR;
    if (playerNames.size === 1) tickColor = stringToColor(Array.from(playerNames)[0]);

    return (
      <g key={date.getTime()} transform={`translate(${xScale(date) - 40}, ${HEIGHT - MARGIN.bottom + 1})`}>
        <text x={0} y={35} fill={tickColor} textAnchor="end" fontSize={27} fontFamily="Josefin sans" transform="rotate(-40)">
          {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase())}
        </text>
      </g>
    );
  });

  const yTicks = yScale.ticks(5).map((val, i) => (
    <g key={i} transform={`translate(${MARGIN.left / 2}, ${yScale(val)})`}>
      <circle cx={-100} cy={0} r={30} fill="rgb(255, 255, 255)" />
      <text x={-100} y={0} fill="rgb(28, 28, 28)" textAnchor="middle" dominantBaseline="central" fontSize={38} fontFamily="Oswald" fontWeight={"bold"}>
        {val}
      </text>
    </g>
  ));

  const ticks = yScale.ticks(5);
  const yBackgroundBands = ticks.slice(0, -1).map((val, i) => (
    <rect key={`bg-${i}`} x={-50} y={Math.min(yScale(val), yScale(ticks[i + 1]))} width={VIRTUAL_WIDTH - MARGIN.right + 50} height={Math.abs(yScale(ticks[i + 1]) - yScale(val))} fill={i % 2 === 0 ? "#00000048" : "#00000039"} />
  ));

  const yLinesTicks = ticks.map((val, i) => (
    <g key={`line-${i}`} transform={`translate(${MARGIN.left / 2}, ${yScale(val)})`}>
      <line x1={-MARGIN.left} x2={VIRTUAL_WIDTH - MARGIN.right - MARGIN.left / 2} stroke="rgb(173, 173, 173)" strokeWidth={4} />
    </g>
  ));

  return (
    <div style={{ background: "radial-gradient(circle, #dcdcdc 0%, #949494 100%)", boxSizing: "border-box", fontFamily: "sans-serif", position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "40%", height: HEIGHT, background: "#000000a4" }}></div>
      <div style={{ position: "absolute", width, top: "8%", zIndex: 30 }}>
        <StatsHeader data={fields} />
      </div>

      <div style={{ position: "absolute", display: "flex", width, height, overflow: "hidden", fontFamily: "sans-serif", top: "48%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 800 }}>
        <svg height={height} width={VIRTUAL_WIDTH} style={{ position: "absolute", left: -cameraX }}>
          <g transform={`translate(10, 470)`}>
            {yBackgroundBands}
            {yLinesTicks}
            {xTicks}
            <line x1={xScale(minDate) - width} x2={xScale(maxDate)} y1={HEIGHT - MARGIN.bottom - 1} y2={HEIGHT - MARGIN.bottom - 1} stroke="#ffffff" strokeWidth={6} opacity={1} />

            {renderedPlayers.map((player) => {
              if (player.pointsToDraw.length < 2) return null;
              const color = stringToColor(player.name);
              const lineGen = d3.line<DateValue>().x((d) => xScale(d.date)).y((d) => yScale(d.value)).curve(d3.curveLinear);
              const areaGen = d3.area<DateValue>().x((d) => xScale(d.date)).y0(HEIGHT - MARGIN.bottom).y1((d) => yScale(d.value)).curve(d3.curveLinear);

              return (
                <g key={player.name} transform={`translate(-40, -1)`}>
                  <path d={areaGen(player.pointsToDraw) || ""} fill={`url(#gradient-${player.name})`} opacity={0.3} />
                  <defs>
                    <linearGradient id={`gradient-${player.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  {player.currentTipPoint && (
                    <g transform={`translate(${xScale(player.currentTipPoint.date)}, ${yScale(player.currentTipPoint.value)})`}>
                      <defs>
                        <clipPath id={`clip-${player.name}`}>
                          <circle cx="-30" cy="0" r="25" />
                        </clipPath>
                      </defs>
                      <circle r={12} fill={color} opacity={1} />
                      <text y={22} x={30} fill={color} textAnchor="left" fontSize={60} fontWeight={"400px"} style={{ textShadow: `0px 0px 14px ${color}`, fontFamily: "Anton" }}>
                        {splitPlayerName(player.name).highlight.toUpperCase()} {"  (" + player.currentTipPoint.value.toFixed(0) + ")"}
                      </text>
                    </g>
                  )}
                  <path d={lineGen(player.pointsToDraw) || ""} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div style={{ position: "absolute", display: "flex", width, height, overflow: "hidden", fontFamily: "sans-serif", top: "48%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 800 }}>
        <svg height={height} width={VIRTUAL_WIDTH} style={{ position: "absolute", top: 0 }}>
          <g transform={`translate(10, 470)`}>{yTicks}</g>
        </svg>
      </div>
    </div>
  );
};