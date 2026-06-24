"use client";

import React from "react";

interface SkillData {
  name: string;
  score: number;
}

interface RadarChartProps {
  data: SkillData[];
  size?: number;
}

export default function RadarChart({ data, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.32; // Reduced radius for more label padding
  const angleStep = (Math.PI * 2) / data.length;

  // Calculate points for the axes and web
  const webLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const webPaths = webLevels.map(level => {
    const points = data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")} Z`;
  });

  // Calculate points for the data polygon
  const hasData = data && data.length > 0;
  const dataPoints = hasData ? data.map((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const scoreLevel = Math.max(0.05, skill.score / 100); // Min score for visibility
    const x = center + radius * scoreLevel * Math.cos(angle);
    const y = center + radius * scoreLevel * Math.sin(angle);
    return `${x},${y}`;
  }) : [];
  
  const dataPath = hasData ? `M ${dataPoints.join(" L ")} Z` : "";

  return (
    <div className="flex justify-center items-center">
      <svg width={size} height={size} className="overflow-visible drop-shadow-sm">
        {/* Web Background Levels */}
        {webPaths.map((path, i) => (
          <path 
            key={i} 
            d={path} 
            fill={i % 2 === 0 ? "var(--color-chart-surface)" : "none"} 
            stroke="var(--color-chart-grid)" 
            strokeWidth="1.5" 
          />
        ))}

        {/* Axes */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={i} 
              x1={center} y1={center} 
              x2={x} y2={y} 
              stroke="var(--color-chart-grid)" 
              strokeWidth="1.5" 
            />
          );
        })}

        {/* Data Polygon */}
        <path 
          d={dataPath} 
          fill="var(--color-chart-fill)" 
          stroke="var(--color-accent-gradient)" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
          className="fade-in duration-1000 animate-in zoom-in"
        />

        {/* Data Points (Dots) */}
        {dataPoints.map((point, i) => {
          const [x, y] = point.split(",").map(Number);
          return (
            <g key={i} className="fade-in animate-in duration-1000 delay-300 zoom-in">
               <circle 
                  cx={x} cy={y} 
                  r="4.5" 
                  fill="var(--color-surface)" 
                  className="shadow-sm"
                  stroke="var(--color-accent-gradient)"
                  strokeWidth="2"
               />
            </g>
          );
        })}

        {/* Labels */}
        {data.map((skill, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 35; // More distance for labels
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle);
          
          return (
            <text 
              key={i} 
              x={x} y={y} 
              textAnchor="middle" 
              className="uppercase text-xs fill-muted tracking-widest"
              dominantBaseline="middle"
            >
              {skill.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
