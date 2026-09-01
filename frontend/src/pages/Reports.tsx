import { Table, Code2, ArrowDownToLine, ShieldCheck } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function Reports() {
  const handleExportCSV = () => {
    window.open(`${API_URL}/reports/mission/1/csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`${API_URL}/reports/mission/1/json`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-ocean-border/70 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-surface border border-ocean-border text-xs text-ocean-accent font-medium mb-2">
            <span>Survey Intelligence & Reports</span>
          </div>
          <h1 className="text-3xl font-light text-ocean-dark tracking-tight">
            Export Mission <span className="font-semibold text-ocean-accent">Data Packages</span>
          </h1>
          <p className="text-sm text-ocean-muted mt-1.5 leading-relaxed max-w-xl">
            Download standardized marine anomaly catalogs, GPS coordinates, and evidence matrices for oceanographic research or cleanup planning.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-white border border-ocean-border rounded-xl text-xs font-medium text-ocean-dark shadow-soft">
          Mission OPN-TRITON-26
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSV Tabular Card */}
        <div className="ocean-card p-7 flex flex-col justify-between space-y-6 hover:border-ocean-accent/40">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ocean-soft/60 flex items-center justify-center text-ocean-accent shadow-soft">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ocean-dark">
                    Tabular Dataset (CSV)
                  </h2>
                  <div className="text-xs text-ocean-muted">
                    GIS & Spreadsheet Compatible
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-alert-success bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Ready
              </span>
            </div>

            <p className="text-xs text-ocean-muted leading-relaxed">
              Export all detected marine anomalies with WGS-84 coordinates, AI model scores, shadow & shape metrics, estimated dimensions, and verification status.
            </p>

            <div className="space-y-2 text-xs text-ocean-muted pt-3 border-t border-ocean-border/60">
              <div className="flex justify-between">
                <span>File Format:</span>
                <span className="font-medium text-ocean-dark">Standard CSV (Comma-Delimited)</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinate System:</span>
                <span className="font-medium text-ocean-dark">EPSG:4326 (WGS-84)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExportCSV}
            className="ocean-btn-primary w-full py-2.5 text-sm"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Download CSV Manifest</span>
          </button>
        </div>

        {/* JSON Graph Card */}
        <div className="ocean-card p-7 flex flex-col justify-between space-y-6 hover:border-ocean-accent/40">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ocean-soft/60 flex items-center justify-center text-ocean-accent shadow-soft">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ocean-dark">
                    Structured Intelligence (JSON)
                  </h2>
                  <div className="text-xs text-ocean-muted">
                    API & Pipeline Payload Spec
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-alert-success bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Ready
              </span>
            </div>

            <p className="text-xs text-ocean-muted leading-relaxed">
              Full hierarchical mission graph containing frame parameters, normalized bounding box coordinates, multi-source evidence breakdowns, and survey track logs.
            </p>

            <div className="space-y-2 text-xs text-ocean-muted pt-3 border-t border-ocean-border/60">
              <div className="flex justify-between">
                <span>Schema Spec:</span>
                <span className="font-medium text-ocean-dark">Poseidon-Graph v1.2</span>
              </div>
              <div className="flex justify-between">
                <span>Encoding:</span>
                <span className="font-medium text-ocean-dark">UTF-8 JSON</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExportJSON}
            className="ocean-btn-primary w-full py-2.5 text-sm"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Download JSON Dataset</span>
          </button>
        </div>

      </div>

      {/* Environmental Data Note */}
      <div className="ocean-card p-5 bg-ocean-surface/60 border border-ocean-border">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-ocean-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-ocean-dark">
              Environmental Conservation Data Sharing
            </h3>
            <p className="text-xs text-ocean-muted leading-relaxed">
              Survey data can be directly integrated into GIS software for planning coastal marine cleanup operations, reef preservation surveys, and underwater cable safety inspections.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
