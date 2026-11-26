import React from 'react';

interface TopBarProps {
  isBatchRunning: boolean;
  onToggleBatchDemo: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ isBatchRunning, onToggleBatchDemo }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#11161C]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#simulation"
          className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          EcoScan
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300" aria-label="Primary navigation">
          <a
            href="#simulation"
            className="hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Plant Stage
          </a>
          <a
            href="#controls"
            className="hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Control Panel
          </a>
          <a
            href="#analytics"
            className="hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Analytics
          </a>
          <a
            href="#education"
            className="hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Waste Guide
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleBatchDemo}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#11161C] ${
              isBatchRunning
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isBatchRunning ? 'Stop Demo Batch' : 'Run 4-Bin Demo'}
          </button>
        </div>
      </div>
    </header>
  );
};
