import React from 'react';
import { Download, FileText, Database, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://localhost:8000/api';

export default function Reports() {
  const handleExportCSV = () => {
    window.open(`${API_URL}/reports/mission/1/csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`${API_URL}/reports/mission/1/json`, '_blank');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-navy-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <FileText className="text-cyan-400" />
            REPORTS & DATA EXPORT
          </h1>
          <p className="text-gray-400 mt-1">Generate mission intelligence packages and structured data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <div className="console-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-navy-900 rounded text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-200">Tabular Report (CSV)</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Complete tabular export of all detected anomalies including coordinates, 
              confidence scores (AI base + shadow/shape/terrain heuristics), 
              and review status. Suitable for import into GIS software.
            </p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-2 py-3 bg-navy-700 hover:bg-navy-600 text-cyan-400 border border-navy-600 rounded transition-colors font-medium"
          >
            <Download className="w-4 h-4" /> EXPORT CSV
          </button>
        </div>

        {/* JSON Export */}
        <div className="console-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-navy-900 rounded text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-200">Structured Data (JSON)</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Hierarchical JSON export containing the complete mission graph. 
              Includes nested confidence breakdowns and metadata. Ideal for API 
              integrations or automated downstream processing.
            </p>
          </div>
          <button 
            onClick={handleExportJSON}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/50 rounded transition-colors font-medium"
          >
            <Download className="w-4 h-4" /> EXPORT JSON
          </button>
        </div>
      </div>

      <div className="console-card p-6 border-l-4 border-l-amber-500 bg-amber-500/5 mt-8">
        <div className="flex gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-gray-200 mb-1">DATA CLASSIFICATION WARNING</h3>
            <p className="text-sm text-gray-400">
              Exported data may contain sensitive geographical coordinates of underwater infrastructure 
              or maritime heritage sites. Ensure appropriate handling according to operational security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
