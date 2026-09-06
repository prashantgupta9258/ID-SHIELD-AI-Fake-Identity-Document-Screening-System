import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileSearch, 
  UserCheck, 
  History, 
  ShieldAlert, 
  FileText, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  Shield, 
  Activity, 
  CheckCircle2, 
  User, 
  ChevronRight,
  Menu,
  X,
  Database,
  ShieldCheck
} from 'lucide-react';

export type NavItem = 
  | 'dashboard'
  | 'new_screening'
  | 'document_analysis'
  | 'identity_verification'
  | 'reference_database'
  | 'screening_history'
  | 'suspicious_cases'
  | 'reports'
  | 'audit_logs'
  | 'system_analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  suspiciousCount: number;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  suspiciousCount,
  isOpenMobile,
  onToggleMobile,
}) => {
  const navItems: Array<{ id: NavItem; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_screening', label: 'New Screening', icon: PlusCircle },
    { id: 'document_analysis', label: 'Document Analysis', icon: FileSearch },
    { id: 'identity_verification', label: 'Identity Verification', icon: UserCheck },
    { id: 'reference_database', label: 'Reference Documents', icon: Database },
    { id: 'screening_history', label: 'Screening History', icon: History },
    { id: 'suspicious_cases', label: 'Alerts & Suspicious Cases', icon: ShieldAlert, badge: suspiciousCount },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit_logs', label: 'Audit & Security Logs', icon: ShieldCheck },
    { id: 'system_analytics', label: 'System Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id: NavItem) => {
    onSelectTab(id);
    if (isOpenMobile) {
      onToggleMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onToggleMobile} 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-2xs"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40
        w-64 bg-white border-r border-slate-200
        flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Logo & Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1">
                  ID-SHIELD <span className="text-blue-600 font-black">AI</span>
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 tracking-tight">
                  Identity & Document Screening
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onToggleMobile} 
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200/80 shadow-2xs' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System & Profile Section */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {/* Real-time System Status Indicator */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI Engine v3.4
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ONLINE
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 flex justify-between font-mono">
              <span>Latency: 184ms</span>
              <span>Model: Flash-Pro</span>
            </div>
          </div>

          {/* Officer Profile Badge */}
          <div className="p-2 flex items-center justify-between rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                VS
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">Officer V. Sharma</div>
                <div className="text-[10px] text-slate-500 truncate">Senior Immigration Inspector</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Bottom links */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
            <button 
              type="button" 
              onClick={() => handleNavClick('settings')}
              className="hover:text-slate-700 flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <span className="hover:text-slate-700 flex items-center gap-1 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              SOP Manual
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
