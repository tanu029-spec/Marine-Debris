import React, { useState, useEffect } from 'react';
import { Play, Activity, AlertTriangle, Target, Settings, Database, Server, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analytics/mission/1`);
      setStats(response.data);
    } catch (error) {
      console.warn("Using dummy dashboard data");
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
    // In a real app, this would trigger the backend processing pipeline
    alert("Triggering demo mission processing pipeline...");
  };

  if (loading) {
    return <div className="p-6 flex justify-center"><Activity className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  }

  const riskColors = {
    'CRITICAL': 'text-alert-critical',
    'HIGH': 'text-alert-high',
    'MEDIUM': 'text-alert-medium',
    'LOW': 'text-alert-low'
  };

  const riskBgs = {
    'CRITICAL': 'bg-alert-critical',
    'HIGH': 'bg-alert-high',
    'MEDIUM': 'bg-alert-medium',
    'LOW': 'bg-alert-low'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            MISSION: OPN-TRITON-26 
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded font-mono">ACTIVE</span>
          </h1>
          <p className="text-gray-400 mt-1">Autonomous Underwater Vehicle (AUV) Side-Scan Sonar Survey</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={fetchStats} className="console-btn flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> REFRESH
          </button>
          <button onClick={runDemoMission} className="console-btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" /> START PROCESSING
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="console-card p-5 border-t-4 border-t-cyan-500">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            Total Anomalies <Target className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-4xl font-mono font-bold text-gray-100">{stats?.total_detections || 0}</div>
          <div className="text-xs text-gray-500 mt-2">+12 since last sync</div>
        </div>
        
        <div className="console-card p-5 border-t-4 border-t-alert-critical">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            Critical Risk <AlertTriangle className="w-4 h-4 text-alert-critical" />
          </div>
          <div className="text-4xl font-mono font-bold text-alert-critical">{stats?.risk_distribution?.CRITICAL || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Requires immediate review</div>
        </div>
        
        <div className="console-card p-5 border-t-4 border-t-alert-high">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            High Risk <AlertTriangle className="w-4 h-4 text-alert-high" />
          </div>
          <div className="text-4xl font-mono font-bold text-alert-high">{stats?.risk_distribution?.HIGH || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Added to inspection queue</div>
        </div>

        <div className="console-card p-5 border-t-4 border-t-green-500">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            Review Progress <Activity className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-4xl font-mono font-bold text-gray-100">
            {stats?.total_detections > 0 
              ? Math.round(((stats.review_status.verified + stats.review_status.rejected) / stats.total_detections) * 100) 
              : 0}%
          </div>
          <div className="w-full h-1 bg-navy-900 mt-2 rounded">
            <div 
              className="h-full bg-green-500 rounded" 
              style={{ width: `${stats?.total_detections > 0 ? ((stats.review_status.verified + stats.review_status.rejected) / stats.total_detections) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Distribution */}
        <div className="console-card lg:col-span-2 p-5">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4 border-b border-navy-700 pb-2">Anomaly Classifications</h2>
          
          <div className="space-y-4">
            {Object.entries(stats?.class_distribution || {}).sort((a: any, b: any) => b[1] - a[1]).map(([className, count]: [string, any]) => {
              const percentage = Math.round((count / Math.max(1, stats.total_detections)) * 100);
              return (
                <div key={className}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-200 capitalize">{className.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-cyan-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-navy-900 rounded overflow-hidden">
                    <div className="h-full bg-cyan-600" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* System Status */}
        <div className="console-card p-5">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4 border-b border-navy-700 pb-2">System Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy-700 rounded text-cyan-400"><Server className="w-5 h-5" /></div>
              <div>
                <div className="text-xs text-gray-400">AI Inference Engine</div>
                <div className="text-sm text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online (CPU)</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy-700 rounded text-cyan-400"><Database className="w-5 h-5" /></div>
              <div>
                <div className="text-xs text-gray-400">Evidence Database</div>
                <div className="text-sm text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Connected</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy-700 rounded text-cyan-400"><Settings className="w-5 h-5" /></div>
              <div>
                <div className="text-xs text-gray-400">Fusion Weights</div>
                <div className="text-xs text-gray-300 font-mono mt-1">
                  AI:50% SHD:25% SHP:15% TRN:10%
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-navy-900 rounded border border-navy-700 text-xs text-gray-400">
            <strong>NOTE:</strong> System is running in demo mode. Simulated AUV GPS coordinates are being used.
          </div>
        </div>

      </div>
    </div>
  );
}
