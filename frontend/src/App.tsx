import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Anchor, Activity, LayoutDashboard, Map as MapIcon, FileText, Settings } from 'lucide-react';
import { cn } from './lib/utils';

// Stub pages for routing setup
import Dashboard from './pages/Dashboard';
import SurveyView from './pages/SurveyView';
import MapView from './pages/MapView';
import Reports from './pages/Reports';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-200",
        isActive 
          ? "border-cyan-400 bg-cyan-900/10 text-cyan-400" 
          : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-navy-800/50"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium tracking-wide">{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col z-20">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-navy-800 bg-navy-900">
          <Anchor className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg tracking-wider text-gray-100 uppercase">Eye of Poseidon</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-1">
          <NavItem to="/" icon={LayoutDashboard} label="Mission Overview" />
          <NavItem to="/survey" icon={Activity} label="Active Survey" />
          <NavItem to="/map" icon={MapIcon} label="Tactical Map" />
          <NavItem to="/reports" icon={FileText} label="Reports" />
        </nav>
        
        {/* System Status */}
        <div className="p-4 border-t border-navy-800">
          <div className="flex items-center gap-3 px-2 py-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400 uppercase tracking-wider">System Online</span>
          </div>
          <Link to="/settings" className="flex items-center gap-3 px-2 py-2 mt-2 text-gray-500 hover:text-gray-300 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configuration</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[url('/grid-bg.svg')] bg-repeat">
        {/* Topbar */}
        <header className="h-16 bg-navy-900/80 backdrop-blur-sm border-b border-navy-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-cyan-500 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-900">
              MISSION: OPN-TRITON-26
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Local Time</div>
              <div className="text-sm font-mono text-gray-300">
                {new Date().toISOString().replace('T', ' ').substring(0, 19)}Z
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
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
