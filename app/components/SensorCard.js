'use client';

export default function SensorCard({ label, value, unit, badge, badgeColor, trend, barWidth, barColor, glowColor, icon }) {
  const badgeStyles = {
    green: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/80',
    yellow: 'bg-amber-50/80 text-amber-700 border border-amber-200/80',
    red: 'bg-red-50/80 text-red-700 border border-red-200/80',
    blue: 'bg-blue-50/80 text-blue-700 border border-blue-200/80',
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300/60 group">
      
      {/* Ambient Background Glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-500" 
        style={{ background: glowColor }}
      ></div>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</div>
          <div className="flex items-baseline">
            <span className="font-sans text-4xl font-extrabold tracking-tight drop-shadow-sm" style={{ color: barColor }}>
              {value ?? '--'}
            </span>
            <span className="text-sm font-semibold text-slate-400 ml-1.5">{unit}</span>
          </div>
        </div>
        
        {/* Icon Container with interactive scale */}
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50 transition-transform duration-300 group-hover:scale-110" 
          style={{ background: glowColor + '15' }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 relative z-10">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm ${badgeStyles[badgeColor] || badgeStyles.blue}`}>
          {badge}
        </span>
        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{trend}</span>
      </div>

      {/* Upgraded Progress Bar */}
      <div className="h-1.5 bg-slate-100/80 rounded-full mt-4 overflow-hidden shadow-inner relative z-10">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out relative" 
          style={{ width: `${barWidth}%`, background: barColor }}
        >
          {/* Subtle shine effect on the bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>
        </div>
      </div>
    </div>
  );
}