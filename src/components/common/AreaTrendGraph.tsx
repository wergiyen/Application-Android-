import React, { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  peakText?: string;
}

interface Props {
  data: DataPoint[];
  color?: 'white' | 'mint' | 'cyan';
  height?: number;
  showDots?: boolean;
}

export const AreaTrendGraph: React.FC<Props> = ({
  data,
  color = 'white',
  height = 140,
  showDots = true
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const paddingY = 25;
  const paddingX = 20;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const maxValue = Math.max(...data.map(d => d.value), 100);
  const minValue = Math.min(...data.map(d => d.value), 0);

  // Compute smooth cubic bezier curve points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * usableWidth;
    const y = height - paddingY - ((d.value - minValue) / (maxValue - minValue || 1)) * usableHeight;
    return { x, y, value: d.value, label: d.label, peakText: d.peakText };
  });

  // Construct smooth SVG cubic bezier string
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const colorMap = {
    white: { stroke: '#FFFFFF', fillStart: 'rgba(255, 255, 255, 0.22)', fillEnd: 'rgba(255, 255, 255, 0.01)', dotGlow: '#FFFFFF' },
    mint: { stroke: '#20E098', fillStart: 'rgba(32, 224, 152, 0.25)', fillEnd: 'rgba(32, 224, 152, 0)', dotGlow: '#20E098' },
    cyan: { stroke: '#00F0FF', fillStart: 'rgba(0, 240, 255, 0.25)', fillEnd: 'rgba(0, 240, 255, 0)', dotGlow: '#00F0FF' }
  };

  const currentTheme = colorMap[color];
  const gradientId = `liftGraphGrad-${color}`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={currentTheme.fillStart} />
            <stop offset="100%" stopColor={currentTheme.fillEnd} />
          </linearGradient>

          <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dashed Grid Lines */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} className="chart-grid-line" />
        <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} className="chart-grid-line" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} className="chart-grid-line" />

        {/* Faded Area Gradient */}
        <path d={areaD} fill={`url(#${gradientId})`} className="transition-all duration-300 ease-out" />

        {/* Curved White Path */}
        <path
          d={pathD}
          fill="none"
          stroke={currentTheme.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${color})`}
          className="transition-all duration-300 ease-out"
        />

        {/* Peak Value Labels (e.g. 99.5k, 108.1k as seen in Lift AI screenshot) */}
        {points.map((p, idx) => {
          if (!p.peakText && idx !== 2 && idx !== points.length - 1) return null;
          const displayVal = p.peakText || (p.value > 1000 ? `${(p.value / 1000).toFixed(1)}k` : `${p.value}`);
          return (
            <g key={`peak-${idx}`}>
              <rect
                x={p.x - 22}
                y={p.y - 18}
                width="44"
                height="13"
                rx="6"
                fill="#000000"
                opacity="0.8"
              />
              <text
                x={p.x}
                y={p.y - 9}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="800"
                fontFamily="monospace"
              >
                {displayVal}
              </text>
            </g>
          );
        })}

        {/* Glowing White Dots */}
        {showDots && points.map((p, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? "5.5" : "3.5"}
                fill="#000000"
                stroke={currentTheme.stroke}
                strokeWidth="2.5"
                className="cursor-pointer transition-all duration-200"
              />
              {isHovered && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill="none"
                  stroke={currentTheme.stroke}
                  strokeWidth="1.5"
                  opacity="0.7"
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Axis Labels */}
      <div className="flex justify-between px-2 pt-1 font-mono text-[9px] text-slate-400">
        {data.map((d, i) => (
          <span
            key={i}
            className={`transition-colors ${
              hoveredIdx === i ? 'text-white font-extrabold' : 'text-slate-500'
            }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};
