import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-950/40 border-blue-800/50',
      iconBg: 'bg-blue-500/20 text-blue-400',
      text: 'text-blue-400'
    },
    emerald: {
      bg: 'bg-emerald-950/40 border-emerald-800/50',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-950/40 border-amber-800/50',
      iconBg: 'bg-amber-500/20 text-amber-400',
      text: 'text-amber-400'
    },
    rose: {
      bg: 'bg-rose-950/40 border-rose-800/50',
      iconBg: 'bg-rose-500/20 text-rose-400',
      text: 'text-rose-400'
    },
    purple: {
      bg: 'bg-purple-950/40 border-purple-800/50',
      iconBg: 'bg-purple-500/20 text-purple-400',
      text: 'text-purple-400'
    },
    cyan: {
      bg: 'bg-cyan-950/40 border-cyan-800/50',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      text: 'text-cyan-400'
    }
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-600 ${currentTheme.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

