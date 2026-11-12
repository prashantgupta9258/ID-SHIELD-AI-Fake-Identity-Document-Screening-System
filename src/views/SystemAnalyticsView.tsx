import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  FileSearch,
  Activity,
  Zap
} from 'lucide-react';

export const SystemAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          System Analytics & AI Performance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Border checkpoint throughput, detection accuracy rates, and forensic trend distributions
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Analyzed Today</span>
          <div className="text-2xl font-black text-slate-900 font-mono">1,482</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.4% vs yesterday
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">AI Model Precision</span>
          <div className="text-2xl font-black text-blue-600 font-mono">99.3%</div>
          <div className="text-xs text-slate-500">False positive rate &lt; 0.4%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Forensic Processing</span>
          <div className="text-2xl font-black text-slate-900 font-mono">18.4s</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" /> 2.1s faster with GPU inference
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Threat Intercept Rate</span>
          <div className="text-2xl font-black text-amber-600 font-mono">11.4%</div>
          <div className="text-xs text-slate-500">142 suspicious + 70 rejected</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anomaly Category Distribution */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Primary Detection Anomaly Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Document Tampering & Stamp Alteration', count: 68, pct: 42, color: 'bg-red-500' },
              { label: 'Photo Manipulation / Synthetic Face', count: 39, pct: 24, color: 'bg-amber-500' },
              { label: 'MRZ Check Digit Calculation Failure', count: 28, pct: 17, color: 'bg-blue-600' },
              { label: 'Font Splicing & Layout Misalignment', count: 18, pct: 11, color: 'bg-indigo-500' },
              { label: 'Post-Expiry Chronology Anomaly', count: 10, pct: 6, color: 'bg-slate-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-mono font-bold text-slate-900">{item.count} cases ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${item.pct}%` }} className={`${item.color} h-full rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkpoint Throughput Comparison */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Terminal Checkpoint Verification Volumes
          </h3>
          <div className="space-y-3">
            {[
              { station: 'Terminal 3 - E-Gates (Air Suvidha Fast Track)', verified: 620, flagged: 45, total: 665 },
              { station: 'Terminal 3 - International Arrivals Bay A', verified: 340, flagged: 32, total: 372 },
              { station: 'Terminal 1 - Domestic Transit & Transfer', verified: 185, flagged: 8, total: 193 },
              { station: 'Cargo & Crew Clearance Gate 4', verified: 92, flagged: 4, total: 96 },
            ].map((st) => (
              <div key={st.station} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{st.station}</span>
                  <span className="font-mono font-semibold text-slate-600">{st.total} Scans</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-700 font-semibold">{st.verified} Cleared</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-semibold">{st.flagged} Flagged for Review</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
