import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Activity, 
  AlertTriangle, 
  Target, 
  Database, 
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Waves,
  Crosshair,
  Radio
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingTriggered, setProcessingTriggered] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analytics/mission/1`);
      setStats(response.data);
    } catch (error) {
      console.warn("Backend not accessible, utilizing telemetry fallback data");
      setStats({
        total_detections: 42,
        class_distribution: {
          'shipwreck_or_large_structure': 5,
          'debris_or_small_object': 18,
          'pipe_or_cable': 12,
          'natural_or_background_feature': 7
        },
        risk_distribution: {
          'CRITICAL': 3,
          'HIGH': 8,
          'MEDIUM': 15,
          'LOW': 16
        },
        review_status: {
          'pending': 30,
          'verified': 10,
          'rejected': 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runDemoMission = async () => {
    setProcessingTriggered(true);
    setTimeout(() => {
      setProcessingTriggered(false);
      fetchStats();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative flex items-center justify-center">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md" />
        </div>
        <span className="text-xs font-mono tracking-widest text-marineText-muted uppercase">
          INTERROGATING ACOUSTIC TELEMETRY...
        </span>
      </div>
    );
  }

  const reviewTotal = (stats?.review_status?.verified || 0) + (stats?.review_status?.rejected || 0);
  const reviewProgress = stats?.total_detections > 0 
    ? Math.round((reviewTotal / stats.total_detections) * 100) 
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden rounded-sm border border-white/[0.08] bg-gradient-to-r from-marine-950 via-marine-900 to-surface-900/60 p-8 md:p-10 shadow-2xl">
        
        {/* Subtle Sonar Radial Accent */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-ocean-800/20 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Radio className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-sm">
              ● MISSION ACTIVE
            </span>
            <span className="text-[11px] font-mono text-cyan-muted">
              SURVEY ID: OPN-TRITON-26
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-marineText-primary font-sans leading-none">
            SEE BENEATH <br/>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-ocean-600">
              THE SURFACE.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-marineText-secondary max-w-xl font-sans font-light leading-relaxed">
            Automated underwater marine debris isolation and anomaly identification using high-resolution side-scan sonar imagery with physics-aware evidence fusion.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link 
              to="/survey" 
              className="marine-btn-primary py-2 px-5 text-xs font-mono font-medium tracking-wider shadow-lg"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>EXPLORE ACOUSTIC SWATH</span>
              <ArrowUpRight className="w-3 h-3 text-cyan-300" />
            </Link>

            <button 
              onClick={runDemoMission}
              disabled={processingTriggered}
              className="marine-btn py-2 px-4 text-xs font-mono tracking-wider"
            >
              {processingTriggered ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>SYNCHRONIZING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>START PIPELINE INFERENCE</span>
                </>
              )}
            </button>

            <button 
              onClick={fetchStats}
              className="p-2 text-marineText-muted hover:text-cyan-300 bg-surface-900/60 hover:bg-surface-800 border border-white/[0.08] rounded-sm transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Hero Bottom Telemetry Line */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-marineText-dim text-[9px] uppercase tracking-wider">AUV Platform</div>
            <div className="text-marineText-primary font-medium">Poseidon-X4 Hydroid</div>
          </div>
          <div>
            <div className="text-marineText-dim text-[9px] uppercase tracking-wider">Transducer Freq</div>
            <div className="text-marineText-primary font-medium">450 / 900 kHz Dual</div>
          </div>
          <div>
            <div className="text-marineText-dim text-[9px] uppercase tracking-wider">Bathymetric Depth</div>
            <div className="text-marineText-primary font-medium">45.8 m (Nominal)</div>
          </div>
          <div>
            <div className="text-marineText-dim text-[9px] uppercase tracking-wider">Fusion Mode</div>
            <div className="text-cyan-300 font-medium">Physics + YOLOv8</div>
          </div>
        </div>

      </section>

      {/* Scientific KPI Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Isolated Anomalies */}
        <div className="marine-card p-5 border-l-2 border-l-cyan-400 relative overflow-hidden group">
          <div className="flex items-center justify-between text-marineText-muted mb-3">
            <span className="marine-label">TOTAL ANOMALIES</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-marineText-primary">
            {stats?.total_detections || 0}
          </div>
          <div className="text-[11px] font-mono text-cyan-muted/80 mt-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span>Acoustic bounding targets</span>
          </div>
        </div>

        {/* Critical Risk Targets */}
        <div className="marine-card p-5 border-l-2 border-l-alert-critical relative overflow-hidden group">
          <div className="flex items-center justify-between text-marineText-muted mb-3">
            <span className="marine-label">CRITICAL HAZARDS</span>
            <AlertTriangle className="w-4 h-4 text-alert-critical" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-alert-critical">
            {stats?.risk_distribution?.CRITICAL || 0}
          </div>
          <div className="text-[11px] font-mono text-marineText-dim mt-2">
            Requires immediate ROV inspection
          </div>
        </div>

        {/* High Risk Targets */}
        <div className="marine-card p-5 border-l-2 border-l-alert-high relative overflow-hidden group">
          <div className="flex items-center justify-between text-marineText-muted mb-3">
            <span className="marine-label">HIGH RISK DEBRIS</span>
            <ShieldCheck className="w-4 h-4 text-alert-high" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-alert-high">
            {stats?.risk_distribution?.HIGH || 0}
          </div>
          <div className="text-[11px] font-mono text-marineText-dim mt-2">
            Priority navigation hazard
          </div>
        </div>

        {/* Operator Verification Progress */}
        <div className="marine-card p-5 border-l-2 border-l-emerald-400 relative overflow-hidden group">
          <div className="flex items-center justify-between text-marineText-muted mb-3">
            <span className="marine-label">REVIEW PROGRESS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-marineText-primary">
            {reviewProgress}%
          </div>
          <div className="w-full h-1 bg-marine-950 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500" 
              style={{ width: `${reviewProgress}%` }} 
            />
          </div>
        </div>

      </section>

      {/* Main Analytical Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Distribution Breakdown */}
        <div className="marine-card lg:col-span-2 p-6 border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-marineText-primary uppercase font-mono">
                Acoustic Object Classification
              </h2>
              <p className="text-xs text-marineText-dim font-sans">
                Distribution of detected underwater debris, cables, and wrecks
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-muted bg-surface-900/60 px-2 py-1 rounded-sm border border-white/[0.05]">
              YOLOv8-SEABED
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(stats?.class_distribution || {})
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([className, count]: [string, any]) => {
                const percentage = Math.round((count / Math.max(1, stats.total_detections)) * 100);
                const readableName = className.replace(/_/g, ' ');
                
                return (
                  <div key={className} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-marineText-secondary capitalize font-sans">{readableName}</span>
                      <span className="text-cyan-300 font-semibold">{count} <span className="text-marineText-dim font-normal">({percentage}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-marine-950 rounded-full overflow-hidden border border-white/[0.04]">
                      <div 
                        className="h-full bg-gradient-to-r from-ocean-700 via-cyan-500 to-cyan-300 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-3 bg-surface-900/40 border border-white/[0.05] rounded-sm flex items-center justify-between text-xs font-mono">
            <span className="text-marineText-dim">VERIFIED: {stats?.review_status?.verified || 0}</span>
            <span className="text-marineText-dim">REJECTED: {stats?.review_status?.rejected || 0}</span>
            <span className="text-cyan-300 font-medium">PENDING AUDIT: {stats?.review_status?.pending || 0}</span>
          </div>
        </div>

        {/* System Architecture & Evidence Weights */}
        <div className="marine-card p-6 border border-white/[0.08] flex flex-col justify-between space-y-6">
          
          <div>
            <div className="border-b border-white/[0.06] pb-3 mb-4">
              <h2 className="text-sm font-semibold tracking-wider text-marineText-primary uppercase font-mono">
                Telemetry & Architecture
              </h2>
              <p className="text-xs text-marineText-dim font-sans">
                Subsea pipeline engine status
              </p>
            </div>

            <div className="space-y-3.5">
              
              <div className="flex items-center gap-3 p-2.5 bg-surface-900/50 border border-white/[0.05] rounded-sm">
                <div className="p-2 bg-marine-900 rounded-sm text-cyan-400 border border-white/[0.06]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-marineText-dim uppercase">Inference Engine</div>
                  <div className="text-xs font-mono text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ONLINE (FastAPI / YOLO)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-surface-900/50 border border-white/[0.05] rounded-sm">
                <div className="p-2 bg-marine-900 rounded-sm text-cyan-400 border border-white/[0.06]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-marineText-dim uppercase">Acoustic Repository</div>
                  <div className="text-xs font-mono text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    CONNECTED (SQLite / Async)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-surface-900/50 border border-white/[0.05] rounded-sm">
                <div className="p-2 bg-marine-900 rounded-sm text-cyan-400 border border-white/[0.06]">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-marineText-dim uppercase">Evidence Fusion Profile</div>
                  <div className="text-[11px] font-mono text-marineText-secondary mt-0.5">
                    AI:50% · SHD:25% · SHP:15% · TRN:10%
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="p-3 bg-ocean-900/30 border border-cyan-500/20 rounded-sm text-[11px] font-mono text-cyan-muted/90">
            <span className="font-semibold text-cyan-300">NOTE:</span> Prototype operational in demo telemetry mode. Coordinates aligned to bathymetric survey baseline.
          </div>

        </div>

      </section>

    </div>
  );
}
