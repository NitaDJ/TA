'use client';
import { useState, useEffect } from 'react';
import { controlFan } from '../lib/api';

export default function FanControl({ initialFan }) {
  const [fan, setFan] = useState(initialFan || { fan_on: false, fan_mode: 'auto', fan_speed: 'med' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (initialFan) setFan(initialFan); }, [initialFan]);

  const send = async (body) => {
    setLoading(true);
    try {
      const res = await controlFan(body);
      if (res.success) setFan(res.device);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setMode = (mode) => send({ fan_mode: mode, fan_on: fan.fan_on, fan_speed: fan.fan_speed });
  const setSpeed = (spd) => { if (fan.fan_mode !== 'manual') return; send({ fan_mode: fan.fan_mode, fan_on: fan.fan_on, fan_speed: spd }); };
  const togglePower = () => { if (fan.fan_mode !== 'manual') return; send({ fan_mode: fan.fan_mode, fan_on: !fan.fan_on, fan_speed: fan.fan_speed }); };

  const spdMap = { low: 'Rendah', med: 'Sedang', high: 'Tinggi' };
  const animMap = { low: 'animate-[spin_1.5s_linear_infinite]', med: 'animate-[spin_0.65s_linear_infinite]', high: 'animate-[spin_0.3s_linear_infinite]' };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      
      {/* Background Glow Effect saat Menyala */}
      {fan.fan_on && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 blur-3xl rounded-full pointer-events-none transition-opacity duration-700"></div>
      )}

      {/* Loading Overlay Spinner (opsional tapi bagus untuk UX) */}
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Fan Visualizer */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8 mt-2 z-10">
        {/* Rings */}
        {fan.fan_on && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-20"></div>
            <div className="absolute -inset-6 rounded-full border border-blue-200 animate-pulse opacity-40"></div>
          </>
        )}
        
        {/* Disc */}
        <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 border-[3px] shadow-2xl
          ${fan.fan_on ? 'bg-gradient-to-br from-slate-50 to-blue-50 border-blue-300 shadow-blue-200/50' : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-slate-200/30'}`}>
          <svg viewBox="0 0 170 170" width="160" height="160" className="drop-shadow-lg">
            <g style={{ transformOrigin: '85px 85px' }} className={fan.fan_on ? animMap[fan.fan_speed] : 'transition-transform duration-1000'}>
              {/* Blade 1 */}
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#93c5fd' : '#cbd5e1'}/>
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#3b82f6' : '#94a3b8'} opacity=".85"/>
              {/* Blade 2 */}
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#bfdbfe' : '#e2e8f0'} style={{ transform: 'rotate(120deg)', transformOrigin: '85px 85px' }}/>
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#2563eb' : '#94a3b8'} opacity=".85" style={{ transform: 'rotate(120deg)', transformOrigin: '85px 85px' }}/>
              {/* Blade 3 */}
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#dbeafe' : '#f1f5f9'} style={{ transform: 'rotate(240deg)', transformOrigin: '85px 85px' }}/>
              <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={fan.fan_on ? '#1d4ed8' : '#94a3b8'} opacity=".85" style={{ transform: 'rotate(240deg)', transformOrigin: '85px 85px' }}/>
            </g>
            {/* Hub */}
            <circle cx="85" cy="85" r="16" fill={fan.fan_on ? '#1e3a8a' : '#64748b'} className="shadow-inner"/>
            <circle cx="85" cy="85" r="6" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* Status */}
      <div className={`text-3xl font-extrabold tracking-tight mb-2 z-10 transition-colors duration-300 ${fan.fan_on ? 'text-blue-600' : 'text-slate-400'}`}>
        {fan.fan_on ? 'KIPAS AKTIF' : 'KIPAS MATI'}
      </div>
      
      <div className={`text-xs font-bold px-5 py-2 rounded-full border mb-6 z-10 shadow-sm transition-all
        ${fan.fan_mode === 'auto' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
        {fan.fan_mode === 'auto' ? '⚡ Mode Otomatis Aktif' : '🖐 Mode Manual Aktif'}
      </div>

      {/* Speed Buttons */}
      <div className="flex gap-2 mb-2 z-10" style={{ opacity: fan.fan_mode === 'auto' ? 0.5 : 1, pointerEvents: fan.fan_mode === 'auto' ? 'none' : 'auto' }}>
        {['low', 'med', 'high'].map(s => (
          <button 
            key={s} 
            onClick={() => setSpeed(s)}
            disabled={loading || fan.fan_mode === 'auto'}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 disabled:active:scale-100
              ${fan.fan_speed === s 
                ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
          >
            {spdMap[s]}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-slate-400 font-medium mt-2 z-10 text-center px-4">
        {fan.fan_mode === 'auto' ? 'Kecepatan dikontrol secara otomatis oleh sensor' : 'Pilih tingkat kecepatan secara manual'}
      </div>
    </div>
  );
}