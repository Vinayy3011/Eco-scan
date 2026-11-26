import React from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  Droplets,
  Magnet,
  PauseCircle,
  Radar,
  ScanLine,
  Settings2,
  Wrench,
  XCircle,
} from 'lucide-react';
import { BINS, FAULT_DEFINITIONS, ORDERED_SIMULATION_STAGES } from '../data/wasteDataset';
import {
  BinColor,
  FaultType,
  OperationMode,
  SimulationStage,
  WasteItem,
} from '../types/simulation';
import { WasteArtwork } from './WasteArtwork';

interface ConveyorStageProps {
  selectedItem: WasteItem;
  mode: OperationMode;
  manualTargetBin: BinColor;
  stage: SimulationStage;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  activeFault: FaultType | null;
  binCounts: Record<BinColor, number>;
  recentLandedBin: BinColor | null;
  lastSortingOutcome: 'Correct' | 'Incorrect' | null;
  onRecoverMachine: () => void;
}

const BIN_X_PERCENT: Record<BinColor, number> = {
  [BinColor.Green]: 12.5,
  [BinColor.Blue]: 37.5,
  [BinColor.Red]: 62.5,
  [BinColor.Yellow]: 87.5,
};

export const ConveyorStage: React.FC<ConveyorStageProps> = ({
  selectedItem,
  mode,
  manualTargetBin,
  stage,
  progress,
  isRunning,
  isPaused,
  activeFault,
  binCounts,
  recentLandedBin,
  lastSortingOutcome,
  onRecoverMachine,
}) => {
  const isActive = stage !== SimulationStage.Idle;
  const isCompleted = stage === SimulationStage.SortingCompleted;
  const isFaulted = activeFault !== null;
  const beltMoving =
    isRunning && !isPaused && !isCompleted && !isFaulted && progress < 78;
  const isScanning =
    stage === SimulationStage.ObjectAnalysis && isRunning && !isPaused && !isFaulted;
  const categoryLocked =
    stage === SimulationStage.CategoryIdentified ||
    stage === SimulationStage.SortingInProgress ||
    stage === SimulationStage.SortingCompleted;

  // Target bin depends on mode: Automatic uses item's classified bin, Manual uses user's chosen bin
  const effectiveDestinationBin =
    mode === 'manual' ? manualTargetBin : selectedItem.bin;
  const targetBinX = BIN_X_PERCENT[effectiveDestinationBin];

  // Linear belt position in meters (4.00 m plant conveyor)
  const beltPositionMeters = ((Math.min(progress, 84) / 84) * 4.0).toFixed(2);
  const currentZoneLabel =
    progress < 15
      ? 'Infeed Bay'
      : progress < 48
      ? 'Multi-Sensor Arch'
      : progress < 68
      ? 'Diverter Gate'
      : progress < 100
      ? `Chute → ${effectiveDestinationBin}`
      : `Sorted in ${effectiveDestinationBin}`;

  // Item X (%) and Y drop (px)
  let itemXPercent = 8;
  let itemYOffset = 0;
  let itemOpacity = isActive ? 1 : 0.94;
  let itemScale = 1;

  if (stage === SimulationStage.Idle) {
    itemXPercent = 8;
    itemYOffset = 0;
  } else if (progress <= 20) {
    itemXPercent = 8 + (progress / 20) * 26; // 8% -> 34%
  } else if (progress <= 46) {
    itemXPercent = 34 + ((progress - 20) / 26) * 7; // 34% -> 41% under Sensor Arch
  } else if (progress <= 64) {
    itemXPercent = 41 + ((progress - 46) / 18) * 19; // 41% -> 60% Diverter Gate
  } else if (progress <= 84) {
    const t = (progress - 64) / 20;
    itemXPercent = 60 + t * (targetBinX - 60);
    itemYOffset = t * 18;
  } else {
    const t = Math.min(1, (progress - 84) / 16);
    itemXPercent = targetBinX;
    itemYOffset = 18 + t * 108;
    itemScale = 1 - t * 0.16;
    itemOpacity = t > 0.85 ? 1 - (t - 0.85) * 4 : 1;
  }

  // Diverter angle based on effectiveDestinationBin once sorting begins
  let diverterAngleDeg = 0;
  if (categoryLocked) {
    if (effectiveDestinationBin === BinColor.Green) diverterAngleDeg = -34;
    else if (effectiveDestinationBin === BinColor.Blue) diverterAngleDeg = -14;
    else if (effectiveDestinationBin === BinColor.Red) diverterAngleDeg = 14;
    else if (effectiveDestinationBin === BinColor.Yellow) diverterAngleDeg = 34;
  }

  const activeStageIndex = ORDERED_SIMULATION_STAGES.indexOf(stage);
  const totalBinItems = Object.values(binCounts).reduce((a, b) => a + b, 0);

  // Sensor activation thresholds for Multi-Sensor Panel
  const objectDetected = isActive && progress >= 10;
  const opticalActive = isActive && progress >= 22;
  const opticalLocked = isActive && progress >= 44;
  const metalActive = isActive && progress >= 26;
  const moistureActive = isActive && progress >= 30;
  const sensorsFailed = activeFault === 'sensor-failure';
  const faultInfo = activeFault ? FAULT_DEFINITIONS[activeFault] : null;

  return (
    <section
      aria-label="Virtual Smart Waste Segregation Plant"
      className="rounded-xl border border-slate-800 bg-[#131920] p-4 sm:p-6 shadow-sm"
    >
      {/* Top Header & Live Position Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-medium text-emerald-400">
            Smart Waste Sorting Plant · {mode === 'automatic' ? 'Automatic AI Simulation Mode' : 'Manual Operator Sorting Mode'}
          </p>
          <h2 className="mt-0.5 text-lg sm:text-xl font-semibold text-white">
            Virtual Conveyor Line, Multi-Sensor Arch &amp; Sorting Bay
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1A222C] px-3 py-1.5">
            {isFaulted ? (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : isCompleted ? (
              lastSortingOutcome === 'Incorrect' ? (
                <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )
            ) : isPaused ? (
              <PauseCircle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : isRunning ? (
              <ScanLine className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Settings2 className="h-4 w-4 text-slate-400 shrink-0" />
            )}
            <span className="font-medium text-slate-100 whitespace-nowrap">
              {isFaulted
                ? `Fault: ${faultInfo?.label}`
                : isPaused && isRunning
                ? `${stage} (Paused)`
                : stage}
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0D1218] px-3 py-1.5 font-mono text-xs text-slate-300 tabular-nums whitespace-nowrap">
            Pos: <span className="font-semibold text-emerald-400">{beltPositionMeters} m</span>
            <span className="mx-1.5 text-slate-600">/</span>
            <span>4.00 m</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-slate-200">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 5-Stage Progress Stepper */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-100 ${
              isFaulted
                ? 'bg-rose-500'
                : lastSortingOutcome === 'Incorrect' && isCompleted
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ORDERED_SIMULATION_STAGES.map((stepName, index) => {
            const isCurrent = stage === stepName && !isFaulted;
            const isDone =
              !isFaulted &&
              (isCompleted || (activeStageIndex > index && activeStageIndex !== -1));

            return (
              <li
                key={stepName}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-semibold'
                    : isDone
                    ? 'border-emerald-800/70 bg-[#17222B] text-emerald-300'
                    : 'border-slate-800 bg-[#0E1319] text-slate-400'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] tabular-nums ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isDone
                      ? 'bg-emerald-900 text-emerald-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                <span className="truncate">{stepName}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Industrial Plant Conveyor Bay */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-[#0B0F14] p-4 sm:p-5 overflow-hidden">
        {/* Linear Position Ruler & Active Zone Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 pb-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="text-slate-400">Item Location:</span>
            <span className="font-semibold text-emerald-400">{currentZoneLabel}</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 font-mono text-[11px] text-slate-500 tabular-nums">
            <span>0.00m Infeed</span>
            <span>1.50m Sensor Arch</span>
            <span>2.80m Diverter</span>
            <span>4.00m Bins</span>
          </div>
        </div>

        {/* Conveyor Belt + Sensor Arch + Rollers + Diverter */}
        <div className="relative mt-4 h-60 sm:h-64 w-full select-none">
          {/* Overhead Multi-Sensor Arch spanning around x=38% */}
          <div
            className="absolute top-0 bottom-16 z-20 flex flex-col items-center pointer-events-none"
            style={{ left: '38%', transform: 'translateX(-50%)' }}
          >
            {/* Arch Top Bridge */}
            <div
              className={`rounded-md border px-3 py-1 text-center shadow-sm transition-colors ${
                sensorsFailed
                  ? 'border-rose-500 bg-rose-950 text-rose-200'
                  : isScanning
                  ? 'border-emerald-400 bg-emerald-950 text-emerald-200'
                  : 'border-slate-700 bg-[#18202A] text-slate-300'
              }`}
            >
              <span className="block font-mono text-[10px] tracking-wide font-semibold">
                MULTI-SENSOR ARCH
              </span>
            </div>

            {/* Arch Scan Tunnel */}
            <div
              className={`relative h-32 w-28 border-x-2 transition-colors ${
                sensorsFailed
                  ? 'border-rose-500/80 bg-rose-500/10'
                  : isScanning
                  ? 'border-emerald-500/80 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/10'
              }`}
            >
              {/* Camera Lens & Moisture Emitter on Arch Ceiling */}
              <div className="mx-auto mt-1 flex w-16 items-center justify-between px-1">
                <span className="h-1.5 w-3 rounded-full bg-sky-400/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                <span className="h-1.5 w-3 rounded-full bg-amber-400/80" />
              </div>

              {isScanning && !sensorsFailed && (
                <div className="animate-laser absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
              )}
              {sensorsFailed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded bg-rose-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    SENSOR FAULT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Diverter Gate / Robotic Arm at x=60% */}
          <div
            className="absolute top-3 z-20 flex flex-col items-center pointer-events-none"
            style={{ left: '60%', transform: 'translateX(-50%)' }}
          >
            <div
              className={`rounded-md border px-2.5 py-1 text-center transition-colors ${
                activeFault === 'gate-failure'
                  ? 'border-rose-500 bg-rose-950 text-rose-200'
                  : 'border-slate-700 bg-[#18202A] text-amber-300'
              }`}
            >
              <span className="block font-mono text-[10px] font-semibold">
                {activeFault === 'gate-failure' ? 'GATE FAULT' : 'SORTING GATE'}
              </span>
            </div>
            <div className="mt-1 flex h-14 w-14 items-center justify-center">
              <div
                className={`h-12 w-2.5 origin-top rounded-full transition-transform duration-300 ${
                  activeFault === 'gate-failure'
                    ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                    : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                }`}
                style={{ transform: `rotate(${diverterAngleDeg}deg)` }}
              />
            </div>
          </div>

          {/* Realistic Conveyor Belt Chassis + 5 Moving Rollers */}
          <div className="absolute inset-x-2 top-26 z-10">
            {/* Belt Track */}
            <div
              className={`relative h-12 overflow-hidden rounded-full border-2 bg-[#1A212B] shadow-inner transition-colors ${
                activeFault === 'conveyor-jam'
                  ? 'border-rose-500'
                  : 'border-slate-600'
              }`}
            >
              {/* Moving Ribbed Belt */}
              <div
                className={`animate-conveyor flex h-full w-[200%] items-center ${
                  beltMoving ? '' : 'animation-paused'
                }`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 34px, rgba(16, 185, 129, 0.16) 34px, rgba(16, 185, 129, 0.16) 48px)',
                }}
              />

              {/* 5 Drive & Idler Rollers */}
              {[4, 27, 50, 73, 96].map((leftPos) => (
                <div
                  key={leftPos}
                  className="pointer-events-none absolute inset-y-0 flex items-center -translate-x-1/2"
                  style={{ left: `${leftPos}%` }}
                >
                  <div
                    className={`animate-roller h-7 w-7 rounded-full border-2 border-dashed border-slate-400 bg-slate-700/90 ${
                      beltMoving ? '' : 'animation-paused'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Inductive Metal Coil Plate directly under Sensor Arch */}
            <div
              className="mx-auto mt-1 h-1.5 w-24 rounded-b bg-amber-500/40 border-x border-b border-amber-400/40"
              style={{ marginLeft: 'calc(38% - 3rem)' }}
              title="Simulated Inductive Metal Detection Coil"
            />

            {/* Belt Graduated Distance Labels */}
            <div className="mt-1 flex justify-between px-4 font-mono text-[10px] text-slate-500 tabular-nums">
              <span>0.0m</span>
              <span>1.0m</span>
              <span>2.0m (ARCH)</span>
              <span>3.0m (GATE)</span>
              <span>4.0m</span>
            </div>
          </div>

          {/* Animated Waste Item Riding Belt -> Chute -> Bin */}
          <div
            className="absolute top-12 z-30 transition-all duration-75 ease-linear pointer-events-none"
            style={{
              left: `${itemXPercent}%`,
              transform: `translate(-50%, ${itemYOffset}px) scale(${itemScale})`,
              opacity: itemOpacity,
            }}
          >
            <div
              className={`relative flex flex-col items-center rounded-xl p-1.5 transition-colors ${
                isFaulted
                  ? 'ring-2 ring-rose-500 bg-rose-950/80'
                  : isScanning
                  ? 'ring-2 ring-emerald-400 bg-emerald-950/70'
                  : categoryLocked
                  ? 'ring-2 ring-sky-400 bg-slate-900/90'
                  : 'bg-[#161D26]/90 ring-1 ring-slate-600'
              }`}
            >
              <WasteArtwork itemId={selectedItem.id} className="h-12 w-12 sm:h-14 sm:w-14" />
              <span className="mt-0.5 rounded bg-slate-950/95 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-100 whitespace-nowrap">
                {selectedItem.name}
              </span>
            </div>
          </div>

          {/* Chute Routing Indicators to the 4 Bins */}
          <div className="absolute inset-x-0 bottom-0 h-14 grid grid-cols-4 gap-3 pointer-events-none">
            {BINS.map((bin) => {
              const isTargetChute =
                (categoryLocked || recentLandedBin === bin.id) &&
                effectiveDestinationBin === bin.id &&
                !isFaulted;
              return (
                <div key={bin.id} className="flex flex-col items-center justify-end">
                  <div
                    className={`h-10 w-1 rounded-full transition-all duration-200 ${
                      isTargetChute ? bin.barClass : 'bg-slate-800'
                    }`}
                  />
                  <div
                    className={`h-0 w-0 border-x-[6px] border-x-transparent border-t-[7px] transition-colors ${
                      isTargetChute
                        ? bin.id === BinColor.Green
                          ? 'border-t-emerald-500'
                          : bin.id === BinColor.Blue
                          ? 'border-t-sky-500'
                          : bin.id === BinColor.Red
                          ? 'border-t-rose-500'
                          : 'border-t-amber-500'
                        : 'border-t-slate-800'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Four Destination Collection Bins */}
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {BINS.map((bin) => {
            const count = binCounts[bin.id] || 0;
            const isHighlighted =
              !isFaulted &&
              ((categoryLocked && effectiveDestinationBin === bin.id) ||
                recentLandedBin === bin.id);
            const isManualSelected =
              mode === 'manual' && manualTargetBin === bin.id && !isFaulted;
            const fillRatio =
              totalBinItems > 0
                ? Math.min(100, Math.round((count / Math.max(4, totalBinItems)) * 100))
                : 0;

            return (
              <div
                key={bin.id}
                className={`relative rounded-xl border-2 p-3.5 transition-all duration-200 ${
                  isHighlighted
                    ? `${bin.bgClass} ${bin.borderClass} ring-2 ${bin.ringClass} -translate-y-0.5`
                    : isManualSelected
                    ? 'border-slate-500 bg-[#1A222C]'
                    : 'border-slate-800 bg-[#131920]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-sm shrink-0"
                      style={{ backgroundColor: bin.accentHex }}
                      aria-hidden="true"
                    />
                    <span className="font-display text-sm font-bold text-white">
                      {bin.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <p
                  className={`mt-1 text-xs font-semibold ${
                    isHighlighted ? bin.textClass : 'text-slate-300'
                  }`}
                >
                  {bin.shortLabel}
                </p>

                <p className="mt-1 text-[11px] leading-snug text-slate-400">
                  {bin.description}
                </p>

                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${bin.barClass}`}
                      style={{ width: `${fillRatio}%` }}
                    />
                  </div>
                </div>

                {isHighlighted && isCompleted && (
                  <p
                    className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${
                      lastSortingOutcome === 'Incorrect'
                        ? 'text-amber-300'
                        : bin.textClass
                    }`}
                  >
                    {lastSortingOutcome === 'Incorrect' ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        Wrong bin! Expected {selectedItem.bin}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Correctly sorted into {bin.title}
                      </>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Fault Warning Banner with Machine Recovery CTA */}
        {faultInfo && (
          <div
            role="alert"
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-rose-500/70 bg-rose-950/60 px-4 py-3.5 text-sm text-rose-100"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">
                  Machine Halted — {faultInfo.label}
                </p>
                <p className="mt-0.5 text-xs text-rose-200">
                  <span className="font-semibold">Faulty Component:</span> {faultInfo.faultyComponent}
                </p>
                <p className="mt-0.5 text-xs text-rose-200/90">
                  {faultInfo.warningMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRecoverMachine}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Wrench className="h-4 w-4 shrink-0" />
              {faultInfo.recoveryActionLabel}
            </button>
          </div>
        )}

        {/* Multi-Sensor Simulation Panel (4 Virtual Sensors) */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-white">
              Multi-Sensor Array Telemetry
            </h3>
            <span className="text-xs text-slate-400">
              Virtual sensor values from predefined simulation logic — not real hardware readings
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Object Detection Sensor */}
            <div className="rounded-lg border border-slate-800 bg-[#121820] p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-100">
                  <Radar className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Object Detection</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    sensorsFailed
                      ? 'text-rose-400'
                      : objectDetected
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {sensorsFailed ? 'FAULT' : objectDetected ? 'TRIGGERED' : 'STANDBY'}
                </span>
              </div>
              <dl className="mt-2.5 space-y-1 text-slate-400">
                <div className="flex justify-between gap-2">
                  <dt>Virtual Reading:</dt>
                  <dd className="font-mono text-slate-200 tabular-nums">
                    {sensorsFailed ? 'ERR_NO_SIG' : objectDetected ? `${beltPositionMeters} m` : '0.00 m'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Result:</dt>
                  <dd className="text-slate-200 font-medium">
                    {sensorsFailed
                      ? 'Signal Lost'
                      : objectDetected
                      ? 'Item Present'
                      : 'Belt Clear'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Processing:</dt>
                  <dd className="text-slate-300">
                    {sensorsFailed ? 'Halted' : objectDetected ? 'Tracked' : 'Awaiting'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 2. Camera / Optical Sensor */}
            <div className="rounded-lg border border-slate-800 bg-[#121820] p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-100">
                  <Camera className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Camera / Optical</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    sensorsFailed
                      ? 'text-rose-400'
                      : opticalLocked
                      ? 'text-emerald-400'
                      : opticalActive
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  }`}
                >
                  {sensorsFailed
                    ? 'FAULT'
                    : opticalLocked
                    ? 'LOCKED'
                    : opticalActive
                    ? 'ANALYZING'
                    : 'STANDBY'}
                </span>
              </div>
              <dl className="mt-2.5 space-y-1 text-slate-400">
                <div className="flex justify-between gap-2">
                  <dt>Virtual Conf.:</dt>
                  <dd className="font-mono text-slate-200 tabular-nums">
                    {sensorsFailed
                      ? '0.0%'
                      : opticalLocked
                      ? `${selectedItem.simulatedConfidence.toFixed(1)}%`
                      : opticalActive
                      ? 'Sampling...'
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Result:</dt>
                  <dd className="text-slate-200 font-medium truncate">
                    {sensorsFailed
                      ? 'Frame Timeout'
                      : opticalLocked
                      ? selectedItem.name
                      : opticalActive
                      ? 'Edge Match'
                      : 'Idle'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Processing:</dt>
                  <dd className="text-slate-300">
                    {sensorsFailed
                      ? 'Halted'
                      : opticalLocked
                      ? 'Classified'
                      : opticalActive
                      ? 'Vision Sim'
                      : 'Awaiting'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 3. Metal Detection Sensor */}
            <div className="rounded-lg border border-slate-800 bg-[#121820] p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-100">
                  <Magnet className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Metal Detection</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    sensorsFailed
                      ? 'text-rose-400'
                      : metalActive
                      ? selectedItem.metalDetected
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {sensorsFailed
                    ? 'FAULT'
                    : metalActive
                    ? selectedItem.metalDetected
                      ? 'METAL'
                      : 'CLEAR'
                    : 'STANDBY'}
                </span>
              </div>
              <dl className="mt-2.5 space-y-1 text-slate-400">
                <div className="flex justify-between gap-2">
                  <dt>Virtual Coil:</dt>
                  <dd className="font-mono text-slate-200 tabular-nums truncate">
                    {sensorsFailed
                      ? 'ERR_COIL'
                      : metalActive
                      ? selectedItem.metallicReading
                      : '0.00 mV'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Result:</dt>
                  <dd className="text-slate-200 font-medium">
                    {sensorsFailed
                      ? 'Offline'
                      : metalActive
                      ? selectedItem.metalDetected
                        ? 'Metal Detected'
                        : 'Non-Metallic'
                      : 'No Target'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Processing:</dt>
                  <dd className="text-slate-300">
                    {sensorsFailed ? 'Halted' : metalActive ? 'Complete' : 'Awaiting'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 4. Moisture Sensor */}
            <div className="rounded-lg border border-slate-800 bg-[#121820] p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-100">
                  <Droplets className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Moisture Sensor</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    sensorsFailed
                      ? 'text-rose-400'
                      : moistureActive
                      ? selectedItem.moisturePercent >= 50
                        ? 'text-cyan-300'
                        : 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {sensorsFailed
                    ? 'FAULT'
                    : moistureActive
                    ? selectedItem.moisturePercent >= 50
                      ? 'ORGANIC WET'
                      : 'DRY'
                    : 'STANDBY'}
                </span>
              </div>
              <dl className="mt-2.5 space-y-1 text-slate-400">
                <div className="flex justify-between gap-2">
                  <dt>Virtual Reading:</dt>
                  <dd className="font-mono text-slate-200 tabular-nums">
                    {sensorsFailed
                      ? 'ERR_NIR'
                      : moistureActive
                      ? selectedItem.moistureIndex
                      : '0%'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Result:</dt>
                  <dd className="text-slate-200 font-medium">
                    {sensorsFailed
                      ? 'Offline'
                      : moistureActive
                      ? selectedItem.moisturePercent >= 50
                        ? 'High Moisture'
                        : 'Low Moisture'
                      : 'No Target'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Processing:</dt>
                  <dd className="text-slate-300">
                    {sensorsFailed ? 'Halted' : moistureActive ? 'Complete' : 'Awaiting'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
