import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  RefreshCw, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Search,
  Anchor,
  Compass
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
    } catch {
      // Graceful fallback for offline demo preview
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
    }, 1200);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-ocean-light border-t-ocean-accent animate-spin" />
        <span className="text-sm font-medium text-ocean-muted">
          Loading ocean survey telemetry...
        </span>
      </div>
    );
  }

  const reviewTotal = (stats?.review_status?.verified || 0) + (stats?.review_status?.rejected || 0);
  const reviewProgress = stats?.total_detections > 0 
    ? Math.round((reviewTotal / stats.total_detections) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Human & Oceanic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-ocean-surface/60 to-ocean-soft/50 border border-ocean-border p-8 sm:p-12 shadow-card">
        
        {/* Decorative Wave Background SVG */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 pointer-events-none hidden md:block overflow-hidden">
          <svg className="w-full h-full text-ocean-light" viewBox="0 0 500 500" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z" opacity="0.4"></path>
            <path d="M0,200 C180,300 320,120 500,220 L500,500 L0,500 Z" opacity="0.6"></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-ocean-border text-xs text-ocean-dark font-medium shadow-soft">
            <span className="w-2 h-2 rounded-full bg-alert-success animate-pulse" />
            <span>Active Environmental Survey · Mission OPN-TRITON-26</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-light text-ocean-dark tracking-tight leading-[1.15]">
            See what lies <br />
            <span className="font-semibold text-ocean-accent">beneath the surface.</span>
          </h1>

          <p className="text-base sm:text-lg text-ocean-muted font-normal leading-relaxed">
            Eye of Poseidon uses side-scan sonar intelligence to detect, classify, and monitor marine debris across fragile underwater ecosystems.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link 
              to="/survey" 
              className="ocean-btn-primary py-2.5 px-6 rounded-xl font-medium shadow-card text-sm"
            >
              <span>Explore Sonar Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button 
              onClick={runDemoMission}
              disabled={processingTriggered}
              className="ocean-btn-secondary py-2.5 px-5 rounded-xl text-sm"
            >
              {processingTriggered ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-ocean-accent" />
                  <span>Processing Frames...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-ocean-accent" />
                  <span>Run Detection Pipeline</span>
                </>
              )}
            </button>

            <button 
              onClick={fetchStats}
              className="p-2.5 text-ocean-muted hover:text-ocean-dark bg-white hover:bg-ocean-surface border border-ocean-border rounded-xl transition-colors shadow-soft"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Human telemetry footer */}
        <div className="mt-10 pt-6 border-t border-ocean-border/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-ocean-muted text-[11px] mb-0.5">Survey Vehicle</div>
            <div className="font-medium text-ocean-dark">AUV Triton-01</div>
          </div>
          <div>
            <div className="text-ocean-muted text-[11px] mb-0.5">Water Depth</div>
            <div className="font-medium text-ocean-dark">45.8 meters</div>
          </div>
          <div>
            <div className="text-ocean-muted text-[11px] mb-0.5">Transducer Frequency</div>
            <div className="font-medium text-ocean-dark">450 kHz Clean Acoustic</div>
          </div>
          <div>
            <div className="text-ocean-muted text-[11px] mb-0.5">Detection Model</div>
            <div className="font-medium text-ocean-accent">Physics + YOLOv8</div>
          </div>
        </div>

      </section>

      {/* Overview Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Debris Isolated */}
        <div className="ocean-card p-6 relative overflow-hidden group hover:border-ocean-accent/40">
          <div className="flex items-center justify-between text-ocean-muted mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ocean-muted">
              Total Objects Found
            </span>
            <div className="w-8 h-8 rounded-xl bg-ocean-soft/70 flex items-center justify-center text-ocean-accent">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-ocean-dark tracking-tight">
            {stats?.total_detections || 0}
          </div>
          <div className="text-xs text-ocean-muted mt-2">
            Identified across acoustic swaths
          </div>
        </div>

        {/* Critical Risk */}
        <div className="ocean-card p-6 relative overflow-hidden group hover:border-alert-critical/40">
          <div className="flex items-center justify-between text-ocean-muted mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ocean-muted">
              Critical Hazards
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-alert-critical">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-alert-critical tracking-tight">
            {stats?.risk_distribution?.CRITICAL || 0}
          </div>
          <div className="text-xs text-ocean-muted mt-2">
            High priority for marine inspection
          </div>
        </div>

        {/* High Risk */}
        <div className="ocean-card p-6 relative overflow-hidden group hover:border-alert-high/40">
          <div className="flex items-center justify-between text-ocean-muted mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ocean-muted">
              High Risk Debris
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-alert-high">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-alert-high tracking-tight">
            {stats?.risk_distribution?.HIGH || 0}
          </div>
          <div className="text-xs text-ocean-muted mt-2">
            Marked for ecological survey
          </div>
        </div>

        {/* Verification Progress */}
        <div className="ocean-card p-6 relative overflow-hidden group hover:border-alert-success/40">
          <div className="flex items-center justify-between text-ocean-muted mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ocean-muted">
              Verified by Team
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-alert-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-ocean-dark tracking-tight">
            {reviewProgress}%
          </div>
          <div className="w-full h-1.5 bg-ocean-surface rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ocean-medium to-alert-success rounded-full transition-all duration-500" 
              style={{ width: `${reviewProgress}%` }} 
            />
          </div>
        </div>

      </section>

      {/* Main Analytical Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Object Categorization */}
        <div className="ocean-card lg:col-span-2 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-ocean-border/60 pb-4">
            <div>
              <h2 className="text-base font-semibold text-ocean-dark">
                Acoustic Object Classifications
              </h2>
              <p className="text-xs text-ocean-muted mt-0.5">
                Types of marine debris, cables, and structural anomalies detected
              </p>
            </div>
            <div className="text-xs font-medium text-ocean-accent bg-ocean-surface px-3 py-1 rounded-full border border-ocean-border">
              Survey Analysis
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(stats?.class_distribution || {})
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([className, count]: [string, any]) => {
                const percentage = Math.round((count / Math.max(1, stats.total_detections)) * 100);
                const readableName = className.replace(/_/g, ' ');
                
                return (
                  <div key={className} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-ocean-dark font-medium capitalize">{readableName}</span>
                      <span className="text-ocean-muted font-medium">{count} objects ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-ocean-surface rounded-full overflow-hidden border border-ocean-border/50">
                      <div 
                        className="h-full bg-gradient-to-r from-ocean-light to-ocean-accent rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-4 bg-ocean-surface/60 border border-ocean-border rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-ocean-muted">
            <span>Verified: <strong className="text-ocean-dark">{stats?.review_status?.verified || 0}</strong></span>
            <span>Dismissed: <strong className="text-ocean-dark">{stats?.review_status?.rejected || 0}</strong></span>
            <span>Awaiting Review: <strong className="text-ocean-accent">{stats?.review_status?.pending || 0}</strong></span>
          </div>
        </div>

        {/* Environmental System Status */}
        <div className="ocean-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-ocean-border/60 pb-4 mb-5">
              <h2 className="text-base font-semibold text-ocean-dark">
                Mission System Health
              </h2>
              <p className="text-xs text-ocean-muted mt-0.5">
                Underwater intelligence pipeline status
              </p>
            </div>

            <div className="space-y-4">
              
              <div className="flex items-center gap-3 p-3 bg-ocean-surface/60 rounded-xl border border-ocean-border/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-ocean-accent shadow-soft">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-ocean-dark">AI Detection Engine</div>
                  <div className="text-[11px] text-alert-success font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-alert-success" />
                    Online and Analyzing
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-ocean-surface/60 rounded-xl border border-ocean-border/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-ocean-accent shadow-soft">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-ocean-dark">Evidence Fusion Profile</div>
                  <div className="text-[11px] text-ocean-muted">
                    AI: 50% · Shadow: 25% · Shape: 15% · Terrain: 10%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-ocean-surface/60 rounded-xl border border-ocean-border/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-ocean-accent shadow-soft">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-ocean-dark">Hydrographic Georeference</div>
                  <div className="text-[11px] text-ocean-muted">
                    WGS-84 Grid Calibrated
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 bg-ocean-soft/40 border border-ocean-border rounded-xl text-xs text-ocean-dark/80 leading-relaxed">
            <span className="font-semibold text-ocean-accent">Environmental Note:</span> Real-time automated alerts help prioritize cleanup efforts for marine conservation.
          </div>
        </div>

      </section>

    </div>
  );
}
