import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ConveyorStage } from './components/ConveyorStage';
import { EducationalSection } from './components/EducationalSection';
import { LiveControlPanel } from './components/LiveControlPanel';
import { TopBar } from './components/TopBar';
import { WasteSelectorAndControls } from './components/WasteSelectorAndControls';
import { FAULT_DEFINITIONS, WASTE_ITEMS } from './data/wasteDataset';
import { soundEngine } from './utils/soundEngine';
import {
  BinColor,
  FaultType,
  OperationMode,
  SimulationHistoryRecord,
  SimulationStage,
  SpeedPreset,
  WasteCategory,
  WasteItem,
} from './types/simulation';

const INITIAL_CATEGORY_COUNTS: Record<WasteCategory, number> = {
  [WasteCategory.Biodegradable]: 0,
  [WasteCategory.Recyclable]: 0,
  [WasteCategory.NonRecyclable]: 0,
  [WasteCategory.EWaste]: 0,
};

const INITIAL_BIN_COUNTS: Record<BinColor, number> = {
  [BinColor.Green]: 0,
  [BinColor.Blue]: 0,
  [BinColor.Red]: 0,
  [BinColor.Yellow]: 0,
};

const INITIAL_IMPACT = {
  divertedKg: 0,
  co2SavedKg: 0,
  energySavedKwh: 0,
  recycledOrCompostedItems: 0,
};

const DEMO_BATCH_IDS = ['banana-peel', 'plastic-bottle', 'plastic-wrapper', 'mobile-phone'];

// Progress per 30ms tick for smooth 33fps animation
const SPEED_STEP: Record<SpeedPreset, number> = {
  slow: 0.48,
  normal: 0.85,
  fast: 1.5,
};

const FAULT_STOP_POSITION: Record<FaultType, number> = {
  'conveyor-jam': 24,
  'sensor-failure': 40,
  'gate-failure': 66,
};

function getStageForProgress(p: number): SimulationStage {
  if (p < 20) return SimulationStage.WasteDetected;
  if (p < 46) return SimulationStage.ObjectAnalysis;
  if (p < 64) return SimulationStage.CategoryIdentified;
  if (p < 100) return SimulationStage.SortingInProgress;
  return SimulationStage.SortingCompleted;
}

export default function App() {
  const [selectedItem, setSelectedItem] = useState<WasteItem>(WASTE_ITEMS[0]);
  const [mode, setMode] = useState<OperationMode>('automatic');
  const [manualTargetBin, setManualTargetBin] = useState<BinColor>(BinColor.Blue);
  const [stage, setStage] = useState<SimulationStage>(SimulationStage.Idle);
  const [progress, setProgress] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<SpeedPreset>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('ecoscan-sound-enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [activeFault, setActiveFault] = useState<FaultType | null>(null);
  const [recentLandedBin, setRecentLandedBin] = useState<BinColor | null>(null);
  const [lastSortingOutcome, setLastSortingOutcome] = useState<'Correct' | 'Incorrect' | null>(
    null
  );

  // Analytics & Environmental Impact State (Derived strictly from actual simulation runs)
  const [categoryCounts, setCategoryCounts] = useState<Record<WasteCategory, number>>(
    INITIAL_CATEGORY_COUNTS
  );
  const [binCounts, setBinCounts] = useState<Record<BinColor, number>>(INITIAL_BIN_COUNTS);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [failedSimulationsCount, setFailedSimulationsCount] = useState<number>(0);
  const [simulatedImpact, setSimulatedImpact] = useState(INITIAL_IMPACT);
  const [history, setHistory] = useState<SimulationHistoryRecord[]>([]);

  // 4-Bin Automated Demo Batch State
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchQueue, setBatchQueue] = useState<string[]>([]);

  const runLoggedRef = useRef<boolean>(false);
  const runStartTimeRef = useRef<number>(Date.now());
  const prevStageRef = useRef<SimulationStage>(SimulationStage.Idle);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('ecoscan-sound-enabled', String(next));
      } catch {
        // Ignore storage restrictions
      }
      if (next) {
        soundEngine.unlock();
      } else {
        soundEngine.stopConveyor();
      }
      return next;
    });
  }, []);

  const startRunForItem = useCallback((item: WasteItem) => {
    if (soundEnabled) {
      soundEngine.unlock();
    }
    runLoggedRef.current = false;
    runStartTimeRef.current = Date.now();
    prevStageRef.current = SimulationStage.Idle;
    setSelectedItem(item);
    setActiveFault(null);
    setRecentLandedBin(null);
    setLastSortingOutcome(null);
    setProgress(1);
    setStage(SimulationStage.WasteDetected);
    setIsPaused(false);
    setIsRunning(true);
  }, [soundEnabled]);

  const handleSelectItem = useCallback(
    (item: WasteItem) => {
      if (isBatchRunning) return;
      setSelectedItem(item);
      setIsRunning(false);
      setIsPaused(false);
      setActiveFault(null);
      setProgress(0);
      setStage(SimulationStage.Idle);
      setRecentLandedBin(null);
      setLastSortingOutcome(null);
    },
    [isBatchRunning]
  );

  const handleChangeMode = useCallback(
    (nextMode: OperationMode) => {
      if (isBatchRunning || isRunning) return;
      setMode(nextMode);
      setActiveFault(null);
      setProgress(0);
      setStage(SimulationStage.Idle);
      setRecentLandedBin(null);
      setLastSortingOutcome(null);
    },
    [isBatchRunning, isRunning]
  );

  const handleStart = useCallback(() => {
    if (isBatchRunning || activeFault) return;
    startRunForItem(selectedItem);
  }, [isBatchRunning, activeFault, selectedItem, startRunForItem]);

  const handlePause = useCallback(() => {
    if (!isRunning || isPaused || activeFault) return;
    setIsPaused(true);
  }, [isRunning, isPaused, activeFault]);

  const handleResume = useCallback(() => {
    if (!isRunning || !isPaused || activeFault) return;
    setIsPaused(false);
  }, [isRunning, isPaused, activeFault]);

  const handleReset = useCallback(() => {
    setIsBatchRunning(false);
    setBatchQueue([]);
    setIsRunning(false);
    setIsPaused(false);
    setActiveFault(null);
    setProgress(0);
    setStage(SimulationStage.Idle);
    setRecentLandedBin(null);
    setLastSortingOutcome(null);
  }, []);

  const handleRunAgain = useCallback(() => {
    if (isBatchRunning || activeFault) return;
    startRunForItem(selectedItem);
  }, [isBatchRunning, activeFault, selectedItem, startRunForItem]);

  const handleTriggerFault = useCallback(
    (faultType: FaultType) => {
      if (isBatchRunning || activeFault) return;

      const faultDef = FAULT_DEFINITIONS[faultType];
      // If idle or already completed, position item at the faulty zone so recovery can resume naturally
      const nextProgress =
        isRunning && progress > 2 && progress < 96
          ? progress
          : FAULT_STOP_POSITION[faultType];

      if (!isRunning || progress >= 96 || progress <= 2) {
        runLoggedRef.current = false;
        runStartTimeRef.current = Date.now();
      }

      setProgress(nextProgress);
      setActiveFault(faultType);
      setIsRunning(true);
      setIsPaused(true);
      setStage(SimulationStage.SortingFailed);

      const faultRecord: SimulationHistoryRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        mode,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        detectedCategory: selectedItem.category,
        targetBin: mode === 'manual' ? manualTargetBin : selectedItem.bin,
        expectedBin: selectedItem.bin,
        outcome: 'Fault Recovered',
        confidence: selectedItem.simulatedConfidence,
        durationMs: Date.now() - runStartTimeRef.current,
        faultLabel: faultDef.label,
      };

      setFailedSimulationsCount((c) => c + 1);
      setHistory((prev) => [faultRecord, ...prev]);

      if (soundEnabled) {
        soundEngine.stopConveyor();
        soundEngine.playFaultAlert();
      }
    },
    [
      isBatchRunning,
      activeFault,
      isRunning,
      progress,
      mode,
      selectedItem,
      manualTargetBin,
      soundEnabled,
    ]
  );

  const handleRecoverMachine = useCallback(() => {
    if (!activeFault) return;
    if (soundEnabled) {
      soundEngine.unlock();
    }
    setActiveFault(null);
    setIsRunning(true);
    setIsPaused(false);
    setStage(getStageForProgress(progress));
  }, [activeFault, progress, soundEnabled]);

  const handleResetStats = useCallback(() => {
    setCategoryCounts(INITIAL_CATEGORY_COUNTS);
    setBinCounts(INITIAL_BIN_COUNTS);
    setCorrectCount(0);
    setIncorrectCount(0);
    setFailedSimulationsCount(0);
    setSimulatedImpact(INITIAL_IMPACT);
    setHistory([]);
    setRecentLandedBin(null);
    setLastSortingOutcome(null);
  }, []);

  const handleToggleBatchDemo = useCallback(() => {
    if (isBatchRunning) {
      setIsBatchRunning(false);
      setBatchQueue([]);
      setIsRunning(false);
      setIsPaused(false);
      setActiveFault(null);
      setProgress(0);
      setStage(SimulationStage.Idle);
      return;
    }

    setMode('automatic');
    const firstItem =
      WASTE_ITEMS.find((w) => w.id === DEMO_BATCH_IDS[0]) || WASTE_ITEMS[0];
    setIsBatchRunning(true);
    setBatchQueue(DEMO_BATCH_IDS.slice(1));
    startRunForItem(firstItem);
  }, [isBatchRunning, startRunForItem]);

  // Smooth 30ms simulation animation loop
  useEffect(() => {
    if (!isRunning || isPaused || activeFault !== null) return;

    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(100, prev + SPEED_STEP[speed]));
    }, 30);

    return () => window.clearInterval(timer);
  }, [isRunning, isPaused, speed, activeFault]);

  // Sync stages and finalize sorting statistics when progress reaches 100%
  useEffect(() => {
    if (!isRunning || activeFault !== null) return;

    const derivedStage = getStageForProgress(progress);
    setStage(derivedStage);

    if (progress >= 100) {
      setIsRunning(false);
      setIsPaused(false);

      if (!runLoggedRef.current) {
        runLoggedRef.current = true;
        const durationMs = Date.now() - runStartTimeRef.current;
        const targetBin = mode === 'manual' ? manualTargetBin : selectedItem.bin;
        const isCorrect = targetBin === selectedItem.bin;
        const outcome: 'Correct' | 'Incorrect' = isCorrect ? 'Correct' : 'Incorrect';

        const record: SimulationHistoryRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          mode,
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          detectedCategory: selectedItem.category,
          targetBin,
          expectedBin: selectedItem.bin,
          outcome,
          confidence: selectedItem.simulatedConfidence,
          durationMs,
        };

        if (isCorrect) {
          setCorrectCount((c) => c + 1);
          // Count diverted materials (Recyclable, Biodegradable, E-Waste) into simulated impact estimates
          if (selectedItem.category !== WasteCategory.NonRecyclable) {
            setSimulatedImpact((prev) => ({
              divertedKg: prev.divertedKg + selectedItem.estimatedWeightKg,
              co2SavedKg: prev.co2SavedKg + selectedItem.estimatedCo2SavedKg,
              energySavedKwh: prev.energySavedKwh + selectedItem.estimatedEnergySavedKwh,
              recycledOrCompostedItems: prev.recycledOrCompostedItems + 1,
            }));
          }
        } else {
          setIncorrectCount((c) => c + 1);
        }

        setCategoryCounts((prev) => ({
          ...prev,
          [selectedItem.category]: (prev[selectedItem.category] || 0) + 1,
        }));
        setBinCounts((prev) => ({
          ...prev,
          [targetBin]: (prev[targetBin] || 0) + 1,
        }));
        setRecentLandedBin(targetBin);
        setLastSortingOutcome(outcome);
        setHistory((prev) => [record, ...prev]);

        if (soundEnabled) {
          soundEngine.playCycleComplete(isCorrect);
        }
      }
    }
  }, [progress, isRunning, activeFault, mode, manualTargetBin, selectedItem, soundEnabled]);

  // Conveyor loop audio & stage-transition sound cues (sensor scan + sorting gate)
  useEffect(() => {
    const beltActuallyMoving =
      soundEnabled &&
      isRunning &&
      !isPaused &&
      activeFault === null &&
      stage !== SimulationStage.SortingCompleted &&
      progress < 78;

    if (beltActuallyMoving) {
      soundEngine.startConveyor();
    } else {
      soundEngine.stopConveyor();
    }
  }, [soundEnabled, isRunning, isPaused, activeFault, stage, progress]);

  useEffect(() => {
    const prevStage = prevStageRef.current;
    if (stage === prevStage) return;
    prevStageRef.current = stage;

    if (!soundEnabled || activeFault !== null) return;

    if (stage === SimulationStage.ObjectAnalysis) {
      soundEngine.playSensorScan();
    } else if (stage === SimulationStage.CategoryIdentified) {
      soundEngine.playSortingGate();
    }
  }, [stage, soundEnabled, activeFault]);

  useEffect(() => {
    return () => {
      soundEngine.stopConveyor();
    };
  }, []);

  // Advance 4-Bin Demo Batch automatically
  useEffect(() => {
    if (!isBatchRunning) return;
    if (stage !== SimulationStage.SortingCompleted || activeFault !== null) return;

    if (batchQueue.length === 0) {
      const doneTimer = window.setTimeout(() => {
        setIsBatchRunning(false);
      }, 650);
      return () => window.clearTimeout(doneTimer);
    }

    const nextTimer = window.setTimeout(() => {
      const [nextId, ...rest] = batchQueue;
      const nextItem = WASTE_ITEMS.find((w) => w.id === nextId);
      setBatchQueue(rest);
      if (nextItem) {
        startRunForItem(nextItem);
      } else {
        setIsBatchRunning(false);
      }
    }, 750);

    return () => window.clearTimeout(nextTimer);
  }, [isBatchRunning, stage, activeFault, batchQueue, startRunForItem]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F13] text-slate-100">
      <TopBar
        isBatchRunning={isBatchRunning}
        onToggleBatchDemo={handleToggleBatchDemo}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Compact Header */}
        <div
          id="simulation"
          className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-xs font-medium text-emerald-400">
              IT Engineering Virtual Plant · Simulated Multi-Sensor &amp; AI Classification
            </p>
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              EcoScan – AI Smart Waste Segregation Simulation
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Operate a virtual waste sorting line with multi-sensor telemetry, Automatic and Manual modes, fault recovery, and live environmental estimates.
          </p>
        </div>

        {/* Operation Mode, Waste Item Selection & Playback Controls (moved above Conveyor Stage) */}
        <WasteSelectorAndControls
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
          mode={mode}
          onChangeMode={handleChangeMode}
          manualTargetBin={manualTargetBin}
          onSelectManualBin={setManualTargetBin}
          stage={stage}
          isRunning={isRunning}
          isPaused={isPaused}
          speed={speed}
          onChangeSpeed={setSpeed}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          activeFault={activeFault}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
          onRunAgain={handleRunAgain}
          isBatchRunning={isBatchRunning}
        />

        {/* Virtual Conveyor Line, Multi-Sensor Arch, 4 Bins & Sensor Telemetry */}
        <ConveyorStage
          selectedItem={selectedItem}
          mode={mode}
          manualTargetBin={manualTargetBin}
          stage={stage}
          progress={progress}
          isRunning={isRunning}
          isPaused={isPaused}
          activeFault={activeFault}
          binCounts={binCounts}
          recentLandedBin={recentLandedBin}
          lastSortingOutcome={lastSortingOutcome}
          onRecoverMachine={handleRecoverMachine}
        />

        {/* Fault Simulation & Industrial Live Control Panel */}
        <LiveControlPanel
          selectedItem={selectedItem}
          mode={mode}
          manualTargetBin={manualTargetBin}
          stage={stage}
          progress={progress}
          isRunning={isRunning}
          isPaused={isPaused}
          activeFault={activeFault}
          onTriggerFault={handleTriggerFault}
          onRecoverMachine={handleRecoverMachine}
          correctCount={correctCount}
          lastSortingOutcome={lastSortingOutcome}
          isBatchRunning={isBatchRunning}
        />

        {/* Analytics, Chart.js Distribution & Simulated Environmental Impact */}
        <AnalyticsDashboard
          history={history}
          categoryCounts={categoryCounts}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          failedSimulationsCount={failedSimulationsCount}
          simulatedImpact={simulatedImpact}
          onResetStats={handleResetStats}
        />

        {/* Educational Guide & Predefined Dataset Reference */}
        <EducationalSection />
      </main>

      <footer className="mt-10 border-t border-slate-800 bg-[#11161C]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            EcoScan – AI Smart Waste Segregation Simulation · Educational Software Simulation (Virtual Sensors &amp; Predefined Dataset)
          </p>
          <div className="flex items-center gap-5">
            <a href="#simulation" className="hover:text-emerald-400 transition-colors">
              Plant Stage
            </a>
            <a href="#controls" className="hover:text-emerald-400 transition-colors">
              Control Panel
            </a>
            <a href="#analytics" className="hover:text-emerald-400 transition-colors">
              Analytics
            </a>
            <a href="#education" className="hover:text-emerald-400 transition-colors">
              Waste Guide
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
