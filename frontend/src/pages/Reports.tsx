import { ShieldAlert, Table, Code2, ArrowDownToLine } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function Reports() {
  const handleExportCSV = () => {
    window.open(`${API_URL}/reports/mission/1/csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`${API_URL}/reports/mission/1/json`, '_blank');
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn select-none">
      
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] font-mono tracking-ultra text-marineText-muted uppercase">
              DATA EXPORT ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-marineText-primary font-sans">
            MISSION INTELLIGENCE <span className="font-semibold text-cyan-300">PACKAGES</span>
          </h1>
          <p className="text-xs text-marineText-secondary mt-1 font-sans font-light">
            Generate standardized acoustic detection datasets, georeferenced telemetry, and structured evidence matrices.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-cyan-muted bg-surface-900/60 px-3 py-1.5 rounded-sm border border-white/[0.08]">
          <span>MISSION: OPN-TRITON-26</span>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSV Tabular Package */}
        <div className="marine-card p-6 flex flex-col justify-between border border-white/[0.08] space-y-6 relative group hover:border-cyan-400/30 transition-all duration-200">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-900 rounded-sm text-cyan-400 border border-white/[0.06]">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-marineText-primary font-mono uppercase">
                    Tabular Anomaly Manifest (CSV)
                  </h2>
                  <div className="text-[10px] font-mono text-cyan-muted/80">
                    MIME: text/csv · GIS & ArcGIS COMPATIBLE
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                READY
              </span>
            </div>

            <p className="text-xs text-marineText-secondary leading-relaxed font-light">
              Full tabular export containing isolated anomaly coordinates (WGS-84), AI model confidence base, physics heuristic weights (shadow, shape, terrain), estimated swath dimensions, and operator review states.
            </p>

            <div className="space-y-1.5 text-[11px] font-mono text-marineText-dim pt-2 border-t border-white/[0.05]">
              <div className="flex justify-between">
                <span>FORMAT SPEC:</span>
                <span className="text-marineText-secondary">RFC 4180 Standard</span>
              </div>
              <div className="flex justify-between">
                <span>COORDINATES:</span>
                <span className="text-marineText-secondary">Decimal Degrees (EPSG:4326)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExportCSV}
            className="marine-btn-primary w-full py-2.5 text-xs font-mono font-medium shadow-md"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>DOWNLOAD CSV MANIFEST</span>
          </button>
        </div>

        {/* JSON Graph Package */}
        <div className="marine-card p-6 flex flex-col justify-between border border-white/[0.08] space-y-6 relative group hover:border-cyan-400/30 transition-all duration-200">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-900 rounded-sm text-cyan-400 border border-white/[0.06]">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-marineText-primary font-mono uppercase">
                    Hierarchical Intelligence (JSON)
                  </h2>
                  <div className="text-[10px] font-mono text-cyan-muted/80">
                    MIME: application/json · API PAYLOAD SPEC
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                READY
              </span>
            </div>

            <p className="text-xs text-marineText-secondary leading-relaxed font-light">
              Structured object graph containing full acoustic mission metadata, frame-by-frame transducer parameters, multi-source evidence fusion breakdowns, bounding box normalized coordinates, and risk indices.
            </p>

            <div className="space-y-1.5 text-[11px] font-mono text-marineText-dim pt-2 border-t border-white/[0.05]">
              <div className="flex justify-between">
                <span>SCHEMA:</span>
                <span className="text-marineText-secondary">Poseidon-Graph v1.2</span>
              </div>
              <div className="flex justify-between">
                <span>INTEGRATION:</span>
                <span className="text-marineText-secondary">Direct REST API Compatible</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExportJSON}
            className="marine-btn-primary w-full py-2.5 text-xs font-mono font-medium shadow-md"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>DOWNLOAD JSON GRAPH</span>
          </button>
        </div>

      </div>

      {/* Operational Security Classification Warning */}
      <div className="marine-card p-5 border-l-2 border-l-amber-500/80 bg-amber-950/15">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-semibold tracking-wider text-amber-300 uppercase">
              Acoustic Hydrographic Data Security Protocol
            </h3>
            <p className="text-xs text-marineText-secondary leading-relaxed font-light">
              Exported hydrographic datasets may reveal sensitive bathymetric profiles, critical subsea infrastructure (cables, pipelines), or historical marine heritage coordinates. Verify clearance levels prior to unencrypted distribution.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
