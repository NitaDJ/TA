'use client';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
  )},
  { id: 'analytics', label: 'Analitik Data', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
  )},
  { id: 'fan', label: 'Kontrol Kipas', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 11.5A2.5 2.5 0 0 1 9.5 9 2.5 2.5 0 0 1 12 6.5 2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"/></svg>
  )},
  { id: 'notif', label: 'Notifikasi', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
  )},
  { id: 'education', label: 'Edukasi', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
  )},
];

export default function Sidebar({ activePage, onNavigate, connected }) {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all">
      
      {/* Logo Area */}
      <div className="px-6 py-7 border-b border-slate-100/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 border border-blue-400/20">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 drop-shadow-sm"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
          </div>
          <div>
            <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">AirSense Pro</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5 tracking-wide">IoT Monitor v2.0</div>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        
        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">Monitoring</div>
        {navItems.slice(0,2).map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold mb-1.5 transition-all duration-300 relative group
              ${activePage === item.id 
                ? 'text-blue-700 bg-blue-50/80 border border-blue-100/50 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:translate-x-1 border border-transparent'}`}>
            {activePage === item.id && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-3/5 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            )}
            <span className={`transition-colors duration-300 ${activePage === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2 mt-4 mb-1">Kontrol</div>
        {navItems.slice(2,3).map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold mb-1.5 transition-all duration-300 relative group
              ${activePage === item.id 
                ? 'text-blue-700 bg-blue-50/80 border border-blue-100/50 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:translate-x-1 border border-transparent'}`}>
            {activePage === item.id && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-3/5 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            )}
            <span className={`transition-colors duration-300 ${activePage === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2 mt-4 mb-1">Lainnya</div>
        {navItems.slice(3).map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold mb-1.5 transition-all duration-300 relative group
              ${activePage === item.id 
                ? 'text-blue-700 bg-blue-50/80 border border-blue-100/50 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:translate-x-1 border border-transparent'}`}>
            {activePage === item.id && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-3/5 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            )}
            <span className={`transition-colors duration-300 ${activePage === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Device Status Footer */}
      <div className="px-5 py-6 border-t border-slate-100/80 bg-slate-50/30">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition-colors duration-500
          ${connected ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-700' : 'bg-red-50/50 border-red-200/60 text-red-700'}`}>
          
          <div className="relative flex h-3 w-3 flex-shrink-0">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wide text-slate-800">ESP32-ROOM-1</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${connected ? 'text-emerald-600' : 'text-red-500'}`}>
              {connected ? 'Sistem Online' : 'Sistem Offline'}
            </span>
          </div>
          
        </div>
      </div>

    </aside>
  );
}