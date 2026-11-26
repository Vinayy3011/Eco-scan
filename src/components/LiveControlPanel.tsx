import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Wrench,
  XCircle,
} from 'lucide-react';
import { FAULT_DEFINITIONS } from '../data/wasteDataset';
import {
  BinColor,
  FaultType,
  OperationMode,
  SimulationStage,
  WasteItem,
} from '../types/simulation';

interface LiveControlPanelProps {
  selectedItem: WasteItem;
  mode: OperationMode;
  manualTargetBin: BinColor;
  stage: SimulationStage;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  activeFault: FaultType | null;
  onTriggerFault: (fault: FaultType) => void;
  onRecoverMachine: () => void;
  correctCount: number;
  lastSortingOutcome: 'Correct' | 'Incorrect' | null;
  isBatchRunning: boolean;
}

export const LiveControlPanel: React.FC<LiveControlPanelProps> = ({
  selectedItem,
  mode,
  manualTargetBin,
  stage,
  progress,
  isRunning,
  isPaused,
  activeFault,
  onTriggerFault,
  onRecoverMachine,
  correctCount,
  lastSortingOutcome,
  isBatchRunning,
}) => {
  const isCompleted = stage === SimulationStage.SortingCompleted;
  const isFaulted = activeFault !== null;
  const categoryIdentified =
    stage === SimulationStage.CategoryIdentified ||
    stage === SimulationStage.SortingInProgress ||
    stage === SimulationStage.SortingCompleted;

  const machineStatus = isFaulted
    ? 'Fault Halted'
    : isPaused && isRunning
    ? 'Paused'
    : isRunning
    ? 'Running'
    : isCompleted
    ? 'Cycle Complete'
    : 'Idle / Ready';

  const sensorStatus =
    activeFault === 'sensor-failure'
      ? 'Sensor Failure (Offline)'
      : isFaulted
      ? 'Paused on Fault'
      : isRunning && progress >= 44
      ? 'Readings Locked'
      : isRunning && progress >= 10
      ? 'Active Scanning'
      : 'Standby';

  const effectiveBin = mode === 'manual' ? manualTargetBin : selectedItem.bin;
  const sortingMechStatus =
    activeFault === 'gate-failure'
      ? 'Gate Failure (Actuator Stalled)'
      : isFaulted
      ? 'Halted'
      : isCompleted
      ? `Sorted → ${effectiveBin}`
      : categoryIdentified
      ? `Diverting → ${effectiveBin}`
      : 'Neutral (0°)';

  const faultInfo = activeFault ? FAULT_DEFINITIONS[activeFault] : null;

  return (
    <section
      id="controls"
      aria-label="Fault Simulation and Industrial Live Control Panel"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
    >
      {/* Left 5 Columns: Fault Simulation & Machine Recovery Panel */}
      <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-white">
              Fault Simulation &amp; Machine Recovery
            </h2>
            <p className="text-xs text-slate-400">
              Normal operation never injects random faults. Activate a specific fault below to test emergency stop &amp; recovery.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 whitespace-nowrap">
            {isFaulted ? 'FAULT ACTIVE' : 'SYSTEM NOMINAL'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {(
            [
              'conveyor-jam',
              'sensor-failure',
              'gate-failure',
            ] as FaultType[]
          ).map((fType) => {
            const def = FAULT_DEFINITIONS[fType];
            const isThisFault = activeFault === fType;
            return (
              <button
                key={fType}
                type="button"
                onClick={() => onTriggerFault(fType)}
                disabled={isFaulted || isBatchRunning}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isThisFault
                    ? 'border-rose-500 bg-rose-950/60 text-rose-100'
                    : 'border-slate-700 bg-[#0E1319] text-slate-200 hover:border-rose-500/70 hover:bg-rose-950/20 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {def.label}
                </span>
                <span className="mt-1 text-[11px] text-slate-400 leading-snug">
                  {def.faultyComponent}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400">
            {faultInfo
              ? `Halted: ${faultInfo.faultyComponent}. Click Recover Machine to clear fault and resume.`
              : 'Triggering a fault mid-run or from standby stops the conveyor immediately.'}
          </p>
          <button
            type="button"
            onClick={onRecoverMachine}
            disabled={!isFaulted}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Wrench className="h-4 w-4 shrink-0" />
            Recover Machine
          </button>
        </div>
      </div>

      {/* Right 7 Columns: Industrial Live Control Panel & Result Guidance */}
      <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Industrial Live Control Panel
            </h2>
            <p className="text-xs text-slate-400">
              Real-time PLC state, actuator feedback, and sorting verdict.
            </p>
          </div>
          <span
            className={`font-mono text-xs font-semibold whitespace-nowrap ${
              isFaulted
                ? 'text-rose-400'
                : isRunning && !isPaused
                ? 'text-emerald-400'
                : isPaused
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {machineStatus}
          </span>
        </div>

        {/* 8 Required Live Control Panel Readouts */}
        <dl className="mt-3 divide-y divide-slate-800/80 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Machine Status</dt>
            <dd
              className={`font-mono font-semibold text-right ${
                isFaulted
                  ? 'text-rose-400'
                  : isRunning && !isPaused
                  ? 'text-emerald-400'
                  : isPaused
                  ? 'text-amber-300'
                  : 'text-slate-100'
              }`}
            >
              {machineStatus}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Sensor Status</dt>
            <dd
              className={`font-mono font-medium text-right ${
                activeFault === 'sensor-failure' ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {sensorStatus}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Current Waste Item</dt>
            <dd className="font-semibold text-white text-right">
              {selectedItem.name}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Detected Category</dt>
            <dd className="font-semibold text-emerald-300 text-right">
              {mode === 'manual'
                ? isCompleted
                  ? `${selectedItem.category} (Verified)`
                  : `Manual → ${manualTargetBin}`
                : categoryIdentified
                ? selectedItem.category
                : isRunning
                ? 'Classifying...'
                : 'Pending run'}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Current Processing Stage</dt>
            <dd className="font-medium text-slate-200 text-right">
              {isPaused && isRunning ? `${stage} (Paused)` : stage}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Sorting Mechanism Status</dt>
            <dd
              className={`font-mono text-xs font-medium text-right ${
                activeFault === 'gate-failure' ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {sortingMechStatus}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Successful Sorting Count</dt>
            <dd className="font-mono font-bold text-emerald-400 tabular-nums text-right">
              {correctCount}
            </dd>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-400">Fault Status</dt>
            <dd
              className={`font-medium text-right ${
                isFaulted ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {faultInfo ? `${faultInfo.label}` : 'Nominal — No Active Faults'}
            </dd>
          </div>
        </dl>

        {/* Manual vs Automatic Outcome Verdict Banner */}
        {isCompleted && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
              lastSortingOutcome === 'Incorrect'
                ? 'border-amber-500/60 bg-amber-950/40 text-amber-200'
                : 'border-emerald-600/60 bg-emerald-950/40 text-emerald-200'
            }`}
          >
            {lastSortingOutcome === 'Incorrect' ? (
              <XCircle className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {lastSortingOutcome === 'Incorrect'
                  ? `Incorrect Sorting in Manual Mode`
                  : `Correctly Sorted into ${effectiveBin}`}
              </p>
              <p className="mt-0.5 text-slate-300">
                {lastSortingOutcome === 'Incorrect'
                  ? `You routed "${selectedItem.name}" to ${manualTargetBin}, but it belongs in ${selectedItem.bin} (${selectedItem.category}).`
                  : `"${selectedItem.name}" was classified as ${selectedItem.category} and routed into ${effectiveBin}.`}
              </p>
            </div>
          </div>
        )}

        {/* Disposal & Recycling Guidance */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 text-xs sm:grid-cols-2 sm:text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Disposal Guidance
            </h3>
            <p className="mt-1 text-slate-400 leading-relaxed">
              {selectedItem.disposalGuidance}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Recycling / Reuse Recommendation
            </h3>
            <p className="mt-1 text-slate-400 leading-relaxed">
              {selectedItem.recyclingRecommendation}
            </p>
          </div>
        </div>

        {/* Clear Virtual Simulation Disclaimer */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-800 bg-[#0D1218] p-3 text-xs text-slate-400">
          <Info className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
          <p>
            <span className="font-semibold text-slate-200">
              Simulated Classification &amp; Sensors:
            </span>{' '}
            Sensor readings and AI categories are simulated from a predefined engineering dataset—not real physical sensors or live camera inference.
          </p>
        </div>
      </div>
    </section>
  );
};
