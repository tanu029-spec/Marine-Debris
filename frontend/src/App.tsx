import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Waves, 
  Eye, 
  Map as MapIcon, 
  FileText, 
  Compass,
  Menu,
  X
} from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import SurveyView from './pages/SurveyView';
import MapView from './pages/MapView';
import Reports from './pages/Reports';

const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-ocean-soft text-ocean-dark shadow-sm border border-ocean-border/60 font-semibold" 
          : "text-ocean-muted hover:text-ocean-dark hover:bg-ocean-surface/70"
      )}
    >
      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-ocean-accent" : "text-ocean-muted")} />
      <span>{label}</span>
    </Link>
  );
};

const Header = () => {
  const [time, setTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-ocean-border/80 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean-accent to-ocean-light flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Waves className="w-5 h-5 animate-water-drift" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-ocean-dark leading-tight">
                Eye of Poseidon
              </div>
              <div className="text-[11px] text-ocean-muted font-normal tracking-normal">
                Marine Debris Intelligence
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-ocean-surface/60 border border-ocean-border/50 rounded-2xl">
          <NavLink to="/" icon={Waves} label="Overview" />
          <NavLink to="/survey" icon={Eye} label="Sonar Feed" />
          <NavLink to="/map" icon={MapIcon} label="Bathymetry Map" />
          <NavLink to="/reports" icon={FileText} label="Reports & Export" />
        </nav>

        {/* Status Pill & Time */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ocean-surface/80 border border-ocean-border rounded-xl text-xs text-ocean-dark font-medium">
            <span className="w-2 h-2 rounded-full bg-alert-success animate-pulse" />
            <span>Mission OPN-TRITON-26</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-ocean-muted font-mono">
            <Compass className="w-3.5 h-3.5 text-ocean-accent" />
            <span>{time}</span>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-ocean-dark hover:bg-ocean-surface rounded-xl transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-ocean-border bg-white/95 backdrop-blur-md space-y-1">
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavLink to="/" icon={Waves} label="Overview" />
          </div>
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavLink to="/survey" icon={Eye} label="Sonar Feed" />
          </div>
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavLink to="/map" icon={MapIcon} label="Bathymetry Map" />
          </div>
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavLink to="/reports" icon={FileText} label="Reports & Export" />
          </div>
        </div>
      )}
    </header>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-ocean-bg text-ocean-dark selection:bg-ocean-light/40 relative overflow-hidden">
        
        {/* Subtle Ambient Sunlight & Floating Marine Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-soft/40 rounded-full blur-3xl pointer-events-none -z-10 animate-sunlight" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-ocean-surface/70 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {/* Gentle Ambient Water Droplets/Bubbles */}
        <div className="absolute top-24 left-10 w-3 h-3 rounded-full bg-ocean-light/30 blur-[0.5px] pointer-events-none animate-bubble-1" />
        <div className="absolute top-48 right-32 w-2 h-2 rounded-full bg-ocean-medium/25 blur-[0.5px] pointer-events-none animate-bubble-2" />

        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/survey" element={<SurveyView />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
