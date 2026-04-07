'use client';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SensorCard from './components/SensorCard';
import FanControl from './components/FanControl';
import { useSensorData, useFanStatus } from './hooks/useApi';
import { controlFan, getHistory } from './lib/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ── Helpers ──
function getBadge(airQuality) {
  if (airQuality === 'Aman') return { badge: '● AMAN', color: 'green' };
  if (airQuality === 'Waspada') return { badge: '● WASPADA', color: 'yellow' };
  return { badge: '● BERBAHAYA', color: 'red' };
}
function getTempBadge(t) {
  if (t < 22.8) return { badge: '● SEJUK', color: 'blue' };
  if (t < 25.8) return { badge: '● NYAMAN', color: 'green' };
  return { badge: '● HANGAT', color: 'yellow' };
}
function getComfortColor(c) {
  if (c === 'Nyaman') return '#10b981';
  if (c === 'Cukup Nyaman') return '#f59e0b';
  if (c === 'Kurang Nyaman') return '#f97316';
  return '#ef4444';
}

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,.04)', borderDash: [5, 5] }, ticks: { color: '#64748b', font: { size: 11, family: "'Inter', sans-serif" }, maxTicksLimit: 8 } },
    y: { grid: { color: 'rgba(0,0,0,.04)', borderDash: [5, 5] }, ticks: { color: '#64748b', font: { size: 11, family: "'Inter', sans-serif" } } }
  },
  interaction: { mode: 'index', intersect: false },
};

// ── Pages ──
function Dashboard({ data, fan, onNavigateFan }) {
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 font-medium animate-pulse">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p>Menghubungkan ke sensor ruang kelas...</p>
    </div>
  );

  const pmBadge = getBadge(data.air_quality);
  const tBadge = getTempBadge(data.temperature);
  const comfortColor = getComfortColor(data.thermal_comfort);
  const t = new Date(data.timestamp);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Dashboard Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">📍 Ruang Kelas TM <span className="mx-2">•</span> Update: {t.toLocaleTimeString('id-ID')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30"></span>REAL-TIME
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <SensorCard label="Kualitas Udara · PM2.5" value={data.pm25.toFixed(1)} unit="µg/m³"
          badge={pmBadge.badge} badgeColor={pmBadge.color}
          barWidth={Math.min(data.pm25/35*100, 100)} barColor={pmBadge.color==='green'?'#10b981':pmBadge.color==='yellow'?'#f59e0b':'#ef4444'}
          glowColor="#10b981"
          icon={<svg viewBox="0 0 24 24" fill="#10b981" className="w-6 h-6 drop-shadow-sm"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 0 16A8 8 0 0 1 12 4zm-1 3v2h2V7h-2zm0 4v6h2v-6h-2z"/></svg>}/>

        <SensorCard label="Suhu Udara" value={data.temperature.toFixed(1)} unit="°C"
          badge={tBadge.badge} badgeColor={tBadge.color}
          barWidth={(data.temperature-18)/16*100} barColor="#f97316"
          glowColor="#f97316"
          icon={<svg viewBox="0 0 24 24" fill="#f97316" className="w-6 h-6 drop-shadow-sm"><path d="M15 13V5a3 3 0 0 0-6 0v8a5 5 0 1 0 6 0zm-3 7a3 3 0 0 1 0-6V5a1 1 0 0 1 2 0v9a3 3 0 0 1 0 6z"/></svg>}/>

        <SensorCard label="Kelembapan" value={Math.round(data.humidity)} unit="%"
          badge="● NORMAL" badgeColor="blue"
          barWidth={data.humidity} barColor="#3b82f6"
          glowColor="#3b82f6"
          icon={<svg viewBox="0 0 24 24" fill="#3b82f6" className="w-6 h-6 drop-shadow-sm"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>}/>

        <SensorCard label="Kenyamanan Termal" value={data.thermal_comfort} unit=""
          badge="● SISTEM AKTIF" badgeColor={data.thermal_comfort==='Nyaman'?'green':data.thermal_comfort==='Cukup Nyaman'?'yellow':'red'}
          trend={`TE: ${data.temperature.toFixed(1)}°C`}
          barWidth={data.thermal_comfort==='Nyaman'?80:data.thermal_comfort==='Cukup Nyaman'?55:25}
          barColor={comfortColor} glowColor={comfortColor}
          icon={<svg viewBox="0 0 24 24" fill={comfortColor} className="w-6 h-6 drop-shadow-sm"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>}/>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Fan Mini */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group" onClick={onNavigateFan}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Kipas</div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors duration-500 ${fan?.fan_on ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-inner' : 'bg-slate-100 border border-slate-200'}`}>
              <svg viewBox="0 0 100 100" width="40" height="40" className="drop-shadow-sm">
                <g style={{ transformOrigin: '50px 50px' }} className={fan?.fan_on ? 'animate-spin' : ''}>
                  <path d="M50 50 Q38 22 50 5 Q66 22 50 50Z" fill={fan?.fan_on ? "#60a5fa" : "#cbd5e1"}/>
                  <path d="M50 50 Q38 22 50 5 Q66 22 50 50Z" fill={fan?.fan_on ? "#3b82f6" : "#94a3b8"} style={{ transform: 'rotate(120deg)', transformOrigin: '50px 50px' }}/>
                  <path d="M50 50 Q38 22 50 5 Q66 22 50 50Z" fill={fan?.fan_on ? "#93c5fd" : "#e2e8f0"} style={{ transform: 'rotate(240deg)', transformOrigin: '50px 50px' }}/>
                  <circle cx="50" cy="50" r="8" fill={fan?.fan_on ? "#1e3a8a" : "#64748b"}/>
                </g>
              </svg>
            </div>
            <div>
              <div className={`text-xl font-extrabold tracking-tight ${fan?.fan_on ? 'text-blue-600' : 'text-slate-400'}`}>
                {fan?.fan_on ? 'AKTIF' : 'MATI'}
              </div>
              <div className="text-sm text-slate-500 font-medium mt-1">
                Mode {fan?.fan_mode === 'auto' ? 'Otomatis' : 'Manual'} <span className="mx-1.5 text-slate-300">|</span> {fan?.fan_speed === 'low' ? 'Rendah' : fan?.fan_speed === 'high' ? 'Tinggi' : 'Sedang'}
              </div>
            </div>
          </div>
        </div>

        {/* Rekomendasi */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Rekomendasi Sistem</div>
          <div className="space-y-3">
            {data.thermal_comfort !== 'Nyaman' && (
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">💨</div>
                <div><p className="text-sm font-bold text-slate-800">Nyalakan kipas angin</p><span className="text-xs text-slate-500 mt-0.5 block">Kondisi termal memerlukan sirkulasi</span></div>
              </div>
            )}
            {data.humidity > 65 && (
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">🪟</div>
                <div><p className="text-sm font-bold text-slate-800">Buka ventilasi jendela</p><span className="text-xs text-slate-500 mt-0.5 block">Sirkulasi alami efektif saat ini</span></div>
              </div>
            )}
            {data.pm25 > 25 && (
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-red-50/50 transition-colors border border-transparent hover:border-red-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">😷</div>
                <div><p className="text-sm font-bold text-slate-800 text-red-700">Gunakan masker</p><span className="text-xs text-red-500 mt-0.5 block">PM2.5 melebihi ambang batas SNI</span></div>
              </div>
            )}
            {data.pm25 <= 25 && data.thermal_comfort === 'Nyaman' && (
              <div className="flex items-start gap-4 p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300/50 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">✨</div>
                <div><p className="text-sm font-bold text-emerald-800">Kondisi ruangan optimal</p><span className="text-xs text-emerald-600 mt-0.5 block">Udara bersih dan nyaman secara termal</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FanPage({ fan }) {
  const [localFan, setLocalFan] = useState(fan || { fan_on: false, fan_mode: 'auto', fan_speed: 'med' });

  useEffect(() => { if (fan) setLocalFan(fan); }, [fan]);

  const send = async (body) => {
    try {
      const res = await controlFan(body);
      if (res.success) setLocalFan(res.device);
    } catch (e) { console.error(e); }
  };

  const setMode = (mode) => send({ fan_mode: mode, fan_on: localFan.fan_on, fan_speed: localFan.fan_speed });
  const togglePower = () => { if (localFan.fan_mode !== 'manual') return; send({ fan_mode: localFan.fan_mode, fan_on: !localFan.fan_on, fan_speed: localFan.fan_speed }); };
  const setSpeed = (spd) => { if (localFan.fan_mode !== 'manual') return; send({ fan_mode: localFan.fan_mode, fan_on: localFan.fan_on, fan_speed: spd }); };

  const spdMap = { off: 'Mati', low: 'Rendah', med: 'Sedang', high: 'Tinggi' };
  const animMap = { low: 'animate-[spin_1.5s_linear_infinite]', med: 'animate-[spin_0.65s_linear_infinite]', high: 'animate-[spin_0.3s_linear_infinite]' };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Kontrol Kipas Pintar</h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">Kendali otomatis & manual dengan animasi status langsung</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { val: localFan.fan_mode === 'auto' ? 'Auto' : 'Manual', label: 'Mode Operasi', icon: localFan.fan_mode === 'auto' ? '⚡' : '🖐' },
          { val: localFan.fan_on ? 'Nyala' : 'Mati', label: 'Status Daya', icon: localFan.fan_on ? '🟢' : '⚫' },
          { val: spdMap[localFan.fan_speed] || 'Mati', label: 'Kecepatan', icon: '💨' },
        ].map((s, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner border border-slate-100">{s.icon}</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className="text-xl font-extrabold text-slate-800 mt-0.5">{s.val ?? '--'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fan Visualizer */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden">
          {/* Background Glow */}
          {localFan.fan_on && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 blur-3xl rounded-full pointer-events-none"></div>}
          
          <div className="relative w-56 h-56 flex items-center justify-center mb-8 mt-4 z-10">
            {localFan.fan_on && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-20"></div>
                <div className="absolute -inset-6 rounded-full border border-blue-200 animate-pulse opacity-40"></div>
              </>
            )}
            <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 border-[3px] shadow-2xl
              ${localFan.fan_on ? 'bg-gradient-to-br from-slate-50 to-blue-50 border-blue-300 shadow-blue-200/50' : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-slate-200/30'}`}>
              <svg viewBox="0 0 170 170" width="160" height="160" className="drop-shadow-lg">
                <g style={{ transformOrigin: '85px 85px' }} className={localFan.fan_on ? animMap[localFan.fan_speed] : 'transition-transform duration-1000'}>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#93c5fd' : '#cbd5e1'}/>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#3b82f6' : '#94a3b8'} opacity=".85"/>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#bfdbfe' : '#e2e8f0'} style={{ transform: 'rotate(120deg)', transformOrigin: '85px 85px' }}/>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#2563eb' : '#94a3b8'} opacity=".85" style={{ transform: 'rotate(120deg)', transformOrigin: '85px 85px' }}/>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#dbeafe' : '#f1f5f9'} style={{ transform: 'rotate(240deg)', transformOrigin: '85px 85px' }}/>
                  <path d="M85 85 Q70 48 85 18 Q104 42 85 85Z" fill={localFan.fan_on ? '#1d4ed8' : '#94a3b8'} opacity=".85" style={{ transform: 'rotate(240deg)', transformOrigin: '85px 85px' }}/>
                </g>
                <circle cx="85" cy="85" r="16" fill={localFan.fan_on ? '#1e3a8a' : '#64748b'} className="shadow-inner"/>
                <circle cx="85" cy="85" r="6" fill="#f8fafc"/>
              </svg>
            </div>
          </div>

          <div className={`text-3xl font-extrabold tracking-tight mb-2 z-10 transition-colors duration-300 ${localFan.fan_on ? 'text-blue-600' : 'text-slate-400'}`}>
            {localFan.fan_on ? 'KIPAS AKTIF' : 'KIPAS MATI'}
          </div>
          <div className={`text-xs font-bold px-5 py-2 rounded-full border mb-6 z-10 shadow-sm transition-all
            ${localFan.fan_mode === 'auto' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {localFan.fan_mode === 'auto' ? '⚡ Mode Otomatis Aktif' : '🖐 Mode Manual Aktif'}
          </div>

          {/* Speed Indicator */}
          <div className="flex gap-2 mb-2 z-10" style={{ opacity: localFan.fan_mode === 'auto' ? 0.5 : 1, pointerEvents: localFan.fan_mode === 'auto' ? 'none' : 'auto' }}>
            {['low', 'med', 'high'].map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95
                  ${localFan.fan_speed === s ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                {spdMap[s]}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-2 z-10">
            {localFan.fan_mode === 'auto' ? 'Kecepatan dikontrol secara otomatis oleh sensor' : 'Pilih tingkat kecepatan secara manual'}
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-7 shadow-sm">
            {/* Mode Toggle */}
            <div className="mb-8">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mode Operasi</div>
              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl shadow-inner gap-1">
                {['auto', 'manual'].map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300
                      ${localFan.fan_mode === m ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                    {m === 'auto' ? '⚡ Otomatis' : '🖐 Manual'}
                  </button>
                ))}
              </div>
              {localFan.fan_mode === 'auto' ? (
                <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 font-medium flex gap-3 items-start">
                  <span className="text-xl">🤖</span>
                  <p>Sistem cerdas sedang mengambil alih. Kipas akan menyesuaikan dengan suhu dan kelembapan ruangan secara real-time.</p>
                </div>
              ) : (
                <div className="mt-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-700 font-medium flex gap-3 items-start">
                  <span className="text-xl">🎛️</span>
                  <p>Mode manual diaktifkan. Kamu memiliki kontrol penuh atas daya dan kecepatan kipas angin.</p>
                </div>
              )}
            </div>

            {/* Power Button */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Kontrol Daya Utama</div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div>
                  <div className={`text-lg font-bold ${localFan.fan_on ? 'text-blue-600' : 'text-slate-700'}`}>
                    {localFan.fan_on ? 'Sistem Menyala' : 'Sistem Dimatikan'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {localFan.fan_mode === 'auto' ? 'Hanya tersedia di mode Manual' : 'Klik tombol untuk mengubah'}
                  </div>
                </div>
                <button onClick={togglePower}
                  style={{ opacity: localFan.fan_mode === 'auto' ? 0.4 : 1, pointerEvents: localFan.fan_mode === 'auto' ? 'none' : 'auto' }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] active:scale-90
                    ${localFan.fan_on ? 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill={localFan.fan_on ? 'white' : '#94a3b8'}>
                    <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0 1 19 12c0 3.87-3.13 7-7 7A7 7 0 0 1 5 12c0-2.28 1.09-4.3 2.58-5.42L6.17 5.17A8.932 8.932 0 0 0 3 12a9 9 0 0 0 18 0c0-2.74-1.23-5.18-3.17-6.83z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Triggers Info */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-7 shadow-sm flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Parameter Pemicu Mode Auto</div>
            <div className="space-y-1">
              {[
                { dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', text: 'Suhu ≥ 25.8°C (Zona Hangat)', tag: 'Aktif', tagStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', text: 'Kelembapan ≥ 80%', tag: 'Aktif', tagStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', text: 'PM2.5 ≥ 20 µg/m³', tag: 'Waspada', tagStyle: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.dot}`}></div>
                  <span className="text-sm font-semibold text-slate-700 flex-1">{t.text}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${t.tagStyle}`}>{t.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [histData, setHistData] = useState([]);
  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHistory(range).then(d => { setHistData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [range]);

  const labels = histData.map(d => new Date(d.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const avg = key => histData.length ? (histData.filter(d=>d[key]).reduce((a,b)=>a+b[key],0)/histData.filter(d=>d[key]).length).toFixed(1) : '--';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Analitik Data Sensor</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Tren historis dan insight otomatis ruangan</p>
        </div>
        <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl shadow-inner border border-slate-200/50">
          {['1h','24h','7d'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300
                ${range===r ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
              {r === '1h' ? '1 Jam' : r === '24h' ? '24 Jam' : '7 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Rata-rata PM2.5', val: avg('pm25'), unit: 'µg/m³', color: '#10b981', bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-100' },
          { label: 'Rata-rata Suhu', val: avg('temperature'), unit: '°C', color: '#f97316', bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-100' },
          { label: 'Rata-rata RH', val: avg('humidity'), unit: '%', color: '#3b82f6', bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-100' },
          { label: 'Total Titik Data', val: histData.length, unit: 'rekam', color: '#6366f1', bg: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-100' },
        ].map((s,i) => (
          <div key={i} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/40 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">{s.label}</div>
            <div className="font-sans text-3xl font-extrabold mt-2 relative z-10" style={{ color: s.color }}>
              {s.val} <span className="text-sm font-semibold opacity-70 ml-1">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 font-medium">
           <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
           <p>Menarik data historis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kualitas Udara — PM2.5</div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            </div>
            <div className="h-64">
              <Line options={chartOptions} data={{ labels, datasets: [{ label: 'PM2.5', data: histData.map(d=>d.pm25), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', borderWidth: 3, pointRadius: 0, tension: .4, fill: true }] }}/>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-6">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kondisi Termal</div>
               <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></span>
                 <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
               </div>
            </div>
            <div className="h-64">
              <Line options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, color: '#64748b', font: { size: 12, family: "'Inter', sans-serif", weight: 'bold' }, padding: 20 } } } }} data={{ labels, datasets: [
                { label: 'Suhu (°C)', data: histData.map(d=>d.temperature), borderColor: '#f97316', backgroundColor: 'transparent', borderWidth: 3, pointRadius: 0, tension: .4 },
                { label: 'Kelembapan (%)', data: histData.map(d=>d.humidity), borderColor: '#3b82f6', backgroundColor: 'transparent', borderWidth: 3, pointRadius: 0, tension: .4 }
              ]}}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Notifikasi & Peringatan</h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">Konfigurasi Gateway WhatsApp (Fonnte) dan manajemen peringatan dini</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.8 3.08 1.22 4.79 1.22 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.24-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.89 2.38 1.01 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.13.16 1.56.1.48-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.28z"/></svg></div>
             <div className="text-sm font-bold text-slate-700 uppercase tracking-widest">Konfigurasi Fonnte</div>
          </div>
          
          <div className="space-y-5 mb-8">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Token API Pribadi</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-inner" placeholder="Masukkan token Fonnte..."/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Nomor WhatsApp Tujuan</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-inner" placeholder="Contoh: 6281234567890"/>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Otomatisasi Pengiriman</div>
          <div className="space-y-1 mb-8">
            {[
              { label: 'PM2.5 Melebihi 25 µg/m³', sub: 'Peringatan dini risiko ISPA & polusi buruk', def: true },
              { label: 'Kenyamanan Termal Memburuk', sub: 'Pemberitahuan saat suhu/RH di luar batas nyaman', def: true },
              { label: 'Suhu Kritis (>30°C)', sub: 'Alert saat ruangan terlalu panas', def: false },
              { label: 'Laporan Rekap Pagi (07:00)', sub: 'Ringkasan kondisi siap pakai kelas', def: false },
            ].map((n,i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                <div>
                  <p className="text-sm font-bold text-slate-800">{n.label}</p>
                  <span className="text-xs text-slate-500 mt-0.5 block">{n.sub}</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 shadow-inner ${n.def ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${n.def ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
              💾 Simpan Pengaturan
            </button>
            <button className="flex-1 bg-white border border-slate-200 text-emerald-600 py-3.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 transition-all">
              📱 Uji Kirim Pesan
            </button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 w-full text-left">📱 Preview Perangkat</div>
          
          {/* Mockup Container */}
          <div className="w-[320px] bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl relative border-4 border-slate-800">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
             
             {/* Screen */}
             <div className="bg-[#efeae2] w-full h-[550px] rounded-[2rem] overflow-hidden flex flex-col relative">
                {/* WA Header */}
                <div className="bg-[#075e54] px-5 py-4 flex items-center gap-3 text-white z-10 shadow-md pt-8">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">🤖</div>
                  <div>
                    <div className="font-bold text-[15px] leading-tight">AirSense Bot</div>
                    <div className="text-[11px] text-white/80">online</div>
                  </div>
                </div>

                {/* WA Chat BG */}
                <div className="flex-1 p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover relative overflow-y-auto">
                  
                  {/* Chat Bubble */}
                  <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm p-4 text-[14px] leading-relaxed text-gray-800 shadow-sm relative max-w-[95%] mb-4">
                    <span className="text-xl mb-1 block">🌿</span>
                    <strong>AirSense Pro — Laporan Peringatan</strong><br/><br/>
                    📍 Ruang Kelas TM, Lantai 2<br/>
                    🕐 {new Date().toLocaleDateString('id-ID')} | {new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})} WIB<br/>
                    <div className="my-2 border-t border-black/10"></div>
                    🌫️ PM2.5: <strong className="text-red-600">28.4 µg/m³ ⚠️</strong><br/>
                    🌡️ Suhu: <strong>26.1°C</strong><br/>
                    💧 Kelembapan: <strong>72%</strong><br/>
                    🍃 Kenyamanan: <strong className="text-orange-600">Kurang Nyaman</strong><br/>
                    <div className="my-2 border-t border-black/10"></div>
                    💨 Status Kipas: <strong>Menyala Otomatis (Sedang)</strong><br/><br/>
                    <i className="text-xs text-gray-500">Pesan otomatis dari sistem AirSense. Mohon nyalakan exhaust fan ruangan.</i>
                    
                    <div className="text-right text-[10px] text-gray-500 mt-2 flex justify-end items-center gap-1">
                      {new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                      <svg viewBox="0 0 16 15" width="16" height="15"><path fill="#53bdeb" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>
                    </div>
                  </div>

                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationPage() {
  const cards = [
    { icon: '🫁', color: 'text-red-600', bg: 'bg-red-50 border-red-100', title: 'Apa itu ISPA & Bahaya PM2.5?', content: 'Infeksi Saluran Pernafasan Akut (ISPA) dipicu oleh partikel sangat halus PM2.5 yang mampu menembus jauh ke dalam paru-paru dan aliran darah. Pemantauan rutin mutlak diperlukan di ruang tertutup.' },
    { icon: '🌡️', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', title: 'Kenyamanan Termal (SNI 03-6572)', content: 'Standar nasional menetapkan batas kenyamanan berdasarkan Temperatur Efektif (TE) dan kelembapan relatif bangunan. Kondisi yang tidak ideal dapat menurunkan konsentrasi belajar.' },
    { icon: '💡', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Tips Udara Sehat & Bersih', content: 'Buka jendela pagi hari untuk ventilasi silang, letakkan tanaman hias pembersih udara (seperti Sansiviera), bersihkan filter kipas/AC tiap bulan, dan pertimbangkan air purifier HEPA.' },
    { icon: '⚡', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', title: 'Mekanisme Otomatis AirSense', content: 'Sistem membaca data sensor tiap 5 detik secara persisten. Jika suhu ≥ 25.8°C atau kelembapan ≥ 80%, kipas otomatis mengintervensi sirkulasi. Mode manual tersedia kapan saja.' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Edukasi & Basis Pengetahuan</h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">Panduan singkat memahami metrik kualitas lingkungan dalam ruangan</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border group-hover:scale-110 transition-transform duration-300 ${c.bg}`}>
              {c.icon}
            </div>
            <h3 className={`text-lg font-extrabold mb-3 tracking-tight ${c.color}`}>{c.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{c.content}</p>
          </div>
        ))}
      </div>
      
      {/* Footer Banner */}
      <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
           <h4 className="text-lg font-bold mb-1">AirSense Pro Documentation</h4>
           <p className="text-sm text-slate-300 font-medium">Pelajari lebih dalam tentang kalibrasi sensor dan API endpoints.</p>
        </div>
        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 active:scale-95 transition-all shadow-sm">
          Baca Dokumentasi ↗
        </button>
      </div>
    </div>
  );
}

// ── Main App ──
export default function Home() {
  const [page, setPage] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const { data, connected } = useSensorData();
  const { fan } = useFanStatus();

  // Prevent hydration mismatch for basic fade-ins if needed
  useEffect(() => setIsMounted(true), []);

  const pages = {
    dashboard: <Dashboard data={data} fan={fan} onNavigateFan={() => setPage('fan')} />,
    fan: <FanPage fan={fan} />,
    analytics: <AnalyticsPage />,
    notif: <NotifPage />,
    education: <EducationPage />,
  };

  if(!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <Sidebar activePage={page} onNavigate={setPage} connected={connected} />
      <main className="ml-64 p-10 min-h-screen max-w-7xl">
        {pages[page]}
      </main>
    </div>
  );
}