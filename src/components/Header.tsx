import React from 'react';
import { Menu } from 'lucide-react';
import { SecurityAlert } from '../types';

interface HeaderProps {
  pageTitle: string;
  breadcrumb: string;
  onToggleMobileMenu: () => void;
  onSearchCase?: (query: string) => void;
  alerts?: SecurityAlert[];
  onOpenAlertCase?: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  breadcrumb,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
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
    </header>
  );
};
