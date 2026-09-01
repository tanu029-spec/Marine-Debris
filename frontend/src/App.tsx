import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Radar, 
  Activity, 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  Compass,
  Radio
} from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import SurveyView from './pages/SurveyView';
import MapView from './pages/MapView';
import Reports from './pages/Reports';

const NavItem = ({ to, icon: Icon, label, code }: { to: string; icon: any; label: string; code: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "group relative flex items-center justify-between px-4 py-3 border-l-2 transition-all duration-200 text-xs font-mono tracking-wider",
        isActive 
          ? "border-cyan-400 bg-gradient-to-r from-cyan-950/40 via-surface-900/30 to-transparent text-cyan-300 font-medium" 
          : "border-transparent text-marineText-muted hover:text-marineText-primary hover:bg-surface-900/40"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-cyan-400" : "text-marineText-dim group-hover:text-cyan-muted")} />
        <span className="tracking-wide">{label}</span>
      </div>
      <span className={cn("text-[9px] font-mono", isActive ? "text-cyan-400/80" : "text-marineText-dim/50")}>
        {code}
      </span>
      {isActive && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-cyan-400/80 rounded-l-sm" />
      )}
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-marine-950 overflow-hidden text-marineText-primary">
      {/* Sleek Subsea Sidebar */}
      <aside className="w-64 bg-marine-900/95 border-r border-white/[0.08] flex flex-col z-30 shrink-0 select-none backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="h-16 flex flex-col justify-center px-5 border-b border-white/[0.08] bg-marine-950/60">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-sm bg-surface-900 border border-cyan-500/30">
              <Radar className="w-4 h-4 text-cyan-400" />
              <div className="absolute inset-0 rounded-sm bg-cyan-400/10 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-ultra text-marineText-primary uppercase">
                Eye of Poseidon
              </div>
              <div className="text-[9px] font-mono tracking-widest text-cyan-muted/80 uppercase">
                Sonar Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Sub-header / System Status */}
        <div className="px-5 py-3 border-b border-white/[0.05] bg-marine-900/40 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-widest text-emerald-400/90 font-medium">ACOUSTIC LINK</span>
          </div>
          <span className="text-marineText-dim">NODE-01</span>
        </div>
        
        {/* Navigation */}
        <div className="px-4 pt-4 pb-2 text-[9px] font-mono tracking-ultra text-marineText-dim uppercase">
          Command Modules
        </div>
        <nav className="flex-1 flex flex-col gap-0.5">
          <NavItem to="/" icon={LayoutDashboard} label="Mission Overview" code="MOD-01" />
          <NavItem to="/survey" icon={Activity} label="Sonar Acoustic Feed" code="MOD-02" />
          <NavItem to="/map" icon={MapIcon} label="Tactical Bathymetry" code="MOD-03" />
          <NavItem to="/reports" icon={FileText} label="Intelligence Export" code="MOD-04" />
        </nav>
        
        {/* Subsea Telemetry Widget */}
        <div className="p-4 m-3 bg-surface-900/50 border border-white/[0.06] rounded-sm text-[11px] font-mono">
          <div className="flex items-center justify-between text-marineText-muted mb-2">
            <span className="text-[9px] tracking-widest uppercase">Telemetry</span>
            <Radio className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-marineText-dim text-[8px] uppercase tracking-wider">Swath Width</div>
              <div className="text-cyan-300 font-medium">100.0 m</div>
            </div>
            <div>
              <div className="text-marineText-dim text-[8px] uppercase tracking-wider">Frequency</div>
              <div className="text-marineText-secondary">450 kHz</div>
            </div>
            <div>
              <div className="text-marineText-dim text-[8px] uppercase tracking-wider">Tow Altitude</div>
              <div className="text-marineText-secondary">12.4 m</div>
            </div>
            <div>
              <div className="text-marineText-dim text-[8px] uppercase tracking-wider">Tow Speed</div>
              <div className="text-marineText-secondary">3.2 kts</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/[0.08] bg-marine-950/80 flex items-center justify-between text-[10px] font-mono text-marineText-dim">
          <span>SIH-26057 MVP</span>
          <span className="text-cyan-muted/60">v1.2.0</span>
        </div>
      </aside>

      {/* Main Command Display */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-marine-900">
        
        {/* Tactical Top Bar */}
        <header className="h-14 bg-marine-950/80 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-6 z-20 shrink-0">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-marineText-dim uppercase tracking-widest">ACTIVE SURVEY:</span>
              <span className="text-xs font-mono font-medium text-cyan-300 bg-surface-900/80 px-2.5 py-0.5 rounded-sm border border-cyan-500/20 shadow-[0_0_10px_rgba(66,215,232,0.1)]">
                OPN-TRITON-26
              </span>
            </div>
            <span className="text-white/10">|</span>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-marineText-muted">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>35°07'28.4"N 120°27'24.1"W</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-marineText-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>AI HEURISTIC ENGINE: <span className="text-marineText-primary font-medium">READY</span></span>
            </div>
            <div className="text-right font-mono">
              <div className="text-[9px] tracking-ultra text-marineText-dim uppercase">Zulu Time</div>
              <div className="text-xs text-marineText-primary font-medium tracking-wide">
                {time || 'SYNCHRONIZING...'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-marine-900 via-marine-950 to-marine-950">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/survey" element={<SurveyView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
