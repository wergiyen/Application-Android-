import React, { useEffect, useRef } from 'react';

interface Props {
  redWave: number[];
  irWave: number[];
  height?: number;
}

export const PpgWaveform: React.FC<Props> = ({ redWave, irWave, height = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const canvasHeight = height;
    canvas.width = width;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, width, canvasHeight);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvasHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const drawLine = (data: number[], strokeColor: string, shadowColor: string) => {
      if (!data || data.length < 2) return;
      const minVal = Math.min(...data);
      const maxVal = Math.max(...data);
      const range = (maxVal - minVal) || 1;

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 6;

      const stepX = width / (data.length - 1);
      data.forEach((val, i) => {
        const x = i * stepX;
        // Normalize val to canvas height with padding
        const normY = (val - minVal) / range;
        const y = canvasHeight - (normY * (canvasHeight - 20) + 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // Draw IR Trace (Emerald / Cyan)
    drawLine(irWave, '#10b981', 'rgba(16, 185, 129, 0.5)');

    // Draw RED Trace (Rose / Red)
    drawLine(redWave, '#f43f5e', 'rgba(244, 63, 94, 0.5)');

  }, [redWave, irWave, height]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden bg-[#000000] border border-white/10 p-2">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-2 pb-1">
        <span className="flex items-center gap-1.5 font-bold text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> RED Waveform (MAX30102)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> IR Waveform
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full block" style={{ height: `${height}px` }} />
    </div>
  );
};
