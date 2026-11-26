import React from 'react';
import {
  Cpu,
  Hand,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BINS, WASTE_ITEMS } from '../data/wasteDataset';
import {
  BinColor,
  FaultType,
  OperationMode,
  SimulationStage,
  SpeedPreset,
  WasteItem,
} from '../types/simulation';
import { WasteArtwork } from './WasteArtwork';

interface WasteSelectorAndControlsProps {
  selectedItem: WasteItem;
  onSelectItem: (item: WasteItem) => void;
  mode: OperationMode;
  onChangeMode: (mode: OperationMode) => void;
  manualTargetBin: BinColor;
  onSelectManualBin: (bin: BinColor) => void;
  stage: SimulationStage;
  isRunning: boolean;
  isPaused: boolean;
  speed: SpeedPreset;
  onChangeSpeed: (speed: SpeedPreset) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeFault: FaultType | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onRunAgain: () => void;
  isBatchRunning: boolean;
}

export const WasteSelectorAndControls: React.FC<WasteSelectorAndControlsProps> = ({
  selectedItem,
  onSelectItem,
  mode,
  onChangeMode,
  manualTargetBin,
  onSelectManualBin,
  stage,
  isRunning,
  isPaused,
  speed,
  onChangeSpeed,
  soundEnabled,
  onToggleSound,
  activeFault,
  onStart,
  onPause,
  onResume,
  onReset,
  onRunAgain,
  isBatchRunning,
}) => {
  const isCompleted = stage === SimulationStage.SortingCompleted;
  const isIdle = stage === SimulationStage.Idle;
  const isFaulted = activeFault !== null;

  return (
    <section
      aria-label="Operation Mode, Waste Item Selection, and Playback Controls"
      className="rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6"
    >
      {/* Header + Automatic / Manual Mode Switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Operation Mode &amp; Waste Item Selection
          </h2>
          <p className="text-sm text-slate-400">
            Switch between Automatic AI classification or Manual operator bin routing, then select an item to run on the conveyor below.
          </p>
        </div>

        <div
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0D1218] p-1 shrink-0"
          role="group"
          aria-label="Sorting operation mode"
        >
          <button
            type="button"
            onClick={() => onChangeMode('automatic')}
            disabled={isBatchRunning || isRunning}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
              mode === 'automatic'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 shrink-0" />
            Automatic Mode
          </button>
          <button
            type="button"
            onClick={() => onChangeMode('manual')}
            disabled={isBatchRunning || isRunning}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
              mode === 'manual'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Hand className="h-3.5 w-3.5 shrink-0" />
            Manual Mode
          </button>
        </div>
      </div>

      {/* Manual Mode Bin Selector */}
      {mode === 'manual' && (
        <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-950/25 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-emerald-300">
              Manual Mode Active — Choose Destination Bin for &ldquo;{selectedItem.name}&rdquo;
            </p>
            <span className="text-xs text-slate-400">
              System will verify your choice at the sorting gate
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {BINS.map((bin) => {
              const isChosen = manualTargetBin === bin.id;
              return (
                <button
                  key={bin.id}
                  type="button"
                  onClick={() => onSelectManualBin(bin.id)}
                  disabled={isRunning || isBatchRunning}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isChosen
                      ? `${bin.bgClass} ${bin.borderClass} text-white ring-1 ${bin.ringClass}`
                      : 'border-slate-700 bg-[#0D1218] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-xs shrink-0"
                    style={{ backgroundColor: bin.accentHex }}
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {bin.title} ({bin.shortLabel})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 10 Waste Item Cards (Single crisp row on desktop) */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5 lg:grid-cols-10">
        {WASTE_ITEMS.map((item) => {
          const isSelected = item.id === selectedItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              disabled={isBatchRunning}
              className={`group flex flex-col items-center rounded-lg border p-2.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/50 ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-[#0E1319] hover:border-slate-600 hover:bg-[#161E27]'
              } ${isBatchRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <WasteArtwork
                itemId={item.id}
                className="h-10 w-10 transition-transform duration-150 group-hover:scale-105"
              />
              <span
                className={`mt-2 text-xs font-semibold leading-tight ${
                  isSelected ? 'text-emerald-200' : 'text-slate-200'
                }`}
              >
                {item.name}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">
                {mode === 'manual' ? 'Verify bin' : item.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Playback Controls + Settings Row */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-800 pt-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onStart}
            disabled={(isRunning && !isCompleted) || isFaulted || isBatchRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Play className="h-4 w-4 shrink-0" />
            Start Simulation
          </button>

          <button
            type="button"
            onClick={onPause}
            disabled={!isRunning || isPaused || isCompleted || isFaulted}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1A222C] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Pause className="h-4 w-4 shrink-0 text-amber-400" />
            Pause Simulation
          </button>

          <button
            type="button"
            onClick={onResume}
            disabled={!isRunning || !isPaused || isFaulted || isCompleted}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1A222C] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Play className="h-4 w-4 shrink-0 text-emerald-400" />
            Resume Simulation
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isIdle && !isBatchRunning && !isFaulted}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1A222C] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            Reset Simulation
          </button>

          <button
            type="button"
            onClick={onRunAgain}
            disabled={isBatchRunning || isFaulted}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-700/60 bg-emerald-950/50 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/60 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            Run Again
          </button>
        </div>

        {/* Speed & Industrial Audio Settings */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0D1218] p-1">
            {(
              [
                { id: 'slow', label: '0.6x Viva' },
                { id: 'normal', label: '1x Normal' },
                { id: 'fast', label: '1.6x Fast' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeSpeed(opt.id)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  speed === opt.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              soundEnabled
                ? 'border-emerald-700/70 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'border-slate-700 bg-[#0D1218] text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500 shrink-0" />
            )}
            <span>{soundEnabled ? 'Audio: ON' : 'Audio: OFF'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
