import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  ExternalLink,
  X
} from 'lucide-react';
import { SecurityAlert } from '../types';

interface HeaderProps {
  pageTitle: string;
  breadcrumb: string;
  onToggleMobileMenu: () => void;
  onSearchCase?: (query: string) => void;
  alerts: SecurityAlert[];
  onOpenAlertCase?: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  breadcrumb,
  onToggleMobileMenu,
  onSearchCase,
  alerts = [],
  onOpenAlertCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const safeAlerts = alerts || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchCase) {
      onSearchCase(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
            {breadcrumb}
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Middle Search Bar (Hidden on very small screens) */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-sm w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Case ID, Document No., or Subject..."
          className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Online Status Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AI Screening System Online</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Recent Security Alerts"
          >
            <Bell className="w-4 h-4" />
            {safeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Border Security Alerts ({safeAlerts.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {safeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (onOpenAlertCase) onOpenAlertCase(alert.caseId);
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.caseId}</span>
                    </div>
                    <div className="font-semibold text-slate-800 leading-snug">{alert.title}</div>
                    <div className="text-[11px] text-slate-500">{alert.flagReason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Officer Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs border border-blue-200">
            VS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">V. Sharma</div>
            <div className="text-[10px] text-slate-500">Immigration BOI</div>
          </div>
        </div>
      </div>
    </header>
  );
};
