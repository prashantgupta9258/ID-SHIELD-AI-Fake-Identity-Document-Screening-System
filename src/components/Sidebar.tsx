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
  Shield, 
  X,
  Database,
  ShieldCheck,
  BookOpen,
  FileCheck2,
  ShieldCheck as ShieldCheckIcon
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
  | 'system_analytics';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
  suspiciousCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onToggleMobile,
}) => {
  const operationsNav: Array<{ id: NavItem; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_screening', label: 'New Screening', icon: PlusCircle },
    { id: 'document_analysis', label: 'Document Analysis', icon: FileSearch },
    { id: 'identity_verification', label: 'Identity Verification', icon: UserCheck },
    { id: 'reference_database', label: 'Reference Documents', icon: Database },
  ];

  const complianceNav: Array<{ id: NavItem; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'screening_history', label: 'Screening History', icon: History },
    { id: 'suspicious_cases', label: 'Suspicious Cases', icon: ShieldAlert },
    { id: 'reports', label: 'Official Reports', icon: FileText },
    { id: 'audit_logs', label: 'Audit & Security Logs', icon: ShieldCheck },
  ];

  const analyticsNav: Array<{ id: NavItem; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'system_analytics', label: 'System Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id: NavItem) => {
    onSelectTab(id);
    if (isOpenMobile) {
      onToggleMobile();
    }
  };

  const renderNavGroup = (items: Array<{ id: NavItem; label: string; icon: React.FC<{ className?: string }> }>) => (
    <div className="space-y-1">
      {items.map((item) => {
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
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onToggleMobile} 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-2xs"
        />
      )}

      <aside 
        id="app-sidebar"
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-40
          w-64 bg-white border-r border-slate-200
          flex flex-col h-full max-h-screen min-h-0
          overflow-y-auto overscroll-contain scroll-smooth
          transition-transform duration-200 ease-in-out
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Logo & Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
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

        {/* Scrollable Navigation Body */}
        <div className="p-3 space-y-5 flex-1">
          {/* Group 1: Operations */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            {renderNavGroup(operationsNav)}
          </div>

          {/* Group 2: Compliance & Audit */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Records & Compliance
            </div>
            {renderNavGroup(complianceNav)}
          </div>

          {/* Group 3: Analytics */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System & Analytics
            </div>
            {renderNavGroup(analyticsNav)}
          </div>

          {/* Standards & Guidelines Reference Block */}
          <div className="pt-2 border-t border-slate-100">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Reference Standards</span>
            </div>
            <div className="space-y-1.5 px-2 text-[11px] text-slate-500">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  ICAO Doc 9303 TD3
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Machine Readable Travel Documents security standards.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Biometric Level-2/3
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Strict matching against verified institutional records.
                </p>
              </div>
            </div>
          </div>

          {/* Active Enforcement Clearance Note */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-600 font-semibold text-[10px]">
              <span>Enforcement Protocol</span>
              <span className="font-mono text-blue-700 font-bold">ACTIVE</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Authorized credentials matched in the canonical registry pass inspection.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
