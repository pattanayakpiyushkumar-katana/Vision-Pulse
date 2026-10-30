import React from 'react';

export default function HealthGauge({ score = 100, size = 120, strokeWidth = 10, showLabel = true }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let statusText = 'Optimal';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (clampedScore < 50) {
    colorClass = 'text-rose-500';
    statusText = 'Critical Risk';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (clampedScore < 70) {
    colorClass = 'text-amber-500';
    statusText = 'Action Needed';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (clampedScore < 85) {
    colorClass = 'text-cyan-500';
    statusText = 'Acceptable';
    badgeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white tracking-tighter">{clampedScore}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health</span>
        </div>
      </div>

      {showLabel && (
        <span className={`mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
          {statusText}
        </span>
      )}
    </div>
  );
}

