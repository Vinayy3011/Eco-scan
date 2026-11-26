import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Leaf, Recycle, Trash2, Zap } from 'lucide-react';
import { BINS } from '../data/wasteDataset';
import { SimulationHistoryRecord, WasteCategory } from '../types/simulation';

interface AnalyticsDashboardProps {
  history: SimulationHistoryRecord[];
  categoryCounts: Record<WasteCategory, number>;
  correctCount: number;
  incorrectCount: number;
  failedSimulationsCount: number;
  simulatedImpact: {
    divertedKg: number;
    co2SavedKg: number;
    energySavedKwh: number;
    recycledOrCompostedItems: number;
  };
  onResetStats: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  history,
  categoryCounts,
  correctCount,
  incorrectCount,
  failedSimulationsCount,
  simulatedImpact,
  onResetStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<
    'all' | 'Correct' | 'Incorrect' | 'Fault Recovered'
  >('all');

  const totalItemsProcessed = correctCount + incorrectCount;
  const totalRunsLogged = totalItemsProcessed + failedSimulationsCount;
  const accuracyRate =
    totalItemsProcessed > 0
      ? ((correctCount / totalItemsProcessed) * 100).toFixed(1)
      : '0.0';

  const filteredHistory = useMemo(() => {
    if (filterOutcome === 'all') return history;
    return history.filter((item) => item.outcome === filterOutcome);
  }, [history, filterOutcome]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const counts = [
      categoryCounts[WasteCategory.Biodegradable],
      categoryCounts[WasteCategory.Recyclable],
      categoryCounts[WasteCategory.NonRecyclable],
      categoryCounts[WasteCategory.EWaste],
    ];

    const hasData = counts.some((c) => c > 0);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Biodegradable', 'Recyclable', 'Non-Recyclable', 'E-Waste'],
        datasets: [
          {
            data: hasData ? counts : [1, 1, 1, 1],
            backgroundColor: hasData
              ? ['#10B981', '#38BDF8', '#F43F5E', '#F59E0B']
              : ['#1E293B', '#1E293B', '#1E293B', '#1E293B'],
            borderColor: '#131920',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              color: '#CBD5E1',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            enabled: hasData,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [categoryCounts]);

  return (
    <div className="space-y-6">
      {/* Main Analytics & History Card */}
      <section
        id="analytics"
        aria-label="Simulation Analytics and History"
        className="rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              Live Plant Telemetry · Calculated from Actual Simulation Runs
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-semibold text-white">
              Plant Analytics, Sorting Accuracy &amp; Fault Log
            </h2>
          </div>

          <button
            type="button"
            onClick={onResetStats}
            disabled={totalRunsLogged === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1A222C] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-rose-500/60 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Reset Statistics
          </button>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 border-b border-slate-800 pb-5">
          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <p className="text-xs font-medium text-slate-400">Total Items Processed</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
              {totalItemsProcessed}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Completed sorting cycles
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <p className="text-xs font-medium text-slate-400">Correct Sorting Count</p>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {correctCount}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-400 tabular-nums">
              Accuracy: {accuracyRate}%
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <p className="text-xs font-medium text-slate-400">Incorrect Sorting Count</p>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
              {incorrectCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Manual mode mismatches
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <p className="text-xs font-medium text-slate-400">Failed Simulations (Faults)</p>
            <p className="mt-1 font-mono text-2xl font-bold text-rose-400 tabular-nums">
              {failedSimulationsCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Triggered fault events
            </p>
          </div>
        </div>

        {/* Category Chart + History Log */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left 5 cols: Category Chart + Breakdown */}
          <div className="lg:col-span-5">
            <h3 className="text-sm font-semibold text-white">
              Category Distribution (Chart.js)
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Actual item counts across all four sorting streams.
            </p>

            <div className="relative mt-4 h-60 w-full">
              <canvas ref={canvasRef} aria-label="Waste category distribution chart" />
              {totalItemsProcessed === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                  <span className="rounded border border-slate-700 bg-[#0D1218]/95 px-2.5 py-1 text-xs font-medium text-slate-400">
                    Process items to populate chart
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 divide-y divide-slate-800 border-t border-slate-800 text-sm">
              {BINS.map((bin) => {
                const count = categoryCounts[bin.category] || 0;
                const pct =
                  totalItemsProcessed > 0
                    ? Math.round((count / totalItemsProcessed) * 100)
                    : 0;
                return (
                  <div
                    key={bin.id}
                    className="flex items-center justify-between py-2 gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: bin.accentHex }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-slate-200">
                        {bin.category}
                      </span>
                      <span className="text-xs text-slate-400">({bin.title})</span>
                    </div>
                    <div className="font-mono text-xs text-slate-300 tabular-nums">
                      <span className="font-semibold text-white">{count}</span>{' '}
                      <span className="text-slate-500">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 7 cols: Recent Simulation History */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Recent Simulation History
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Chronological log of Automatic/Manual sorts and Fault recoveries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#0D1218] p-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'Correct', label: 'Correct' },
                    { id: 'Incorrect', label: 'Incorrect' },
                    { id: 'Fault Recovered', label: 'Faults' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterOutcome(tab.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      filterOutcome === tab.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#0D1218] px-4 py-12 text-center">
                <p className="text-sm font-medium text-slate-300">
                  {history.length === 0
                    ? 'No simulation events recorded yet'
                    : `No "${filterOutcome}" events match the active filter`}
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Start a simulation in Automatic or Manual mode, or trigger a fault simulation to inspect recovery logging.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-[#0D1218] text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Time</th>
                      <th className="px-3 py-2.5 font-semibold">Mode</th>
                      <th className="px-3 py-2.5 font-semibold">Waste Item</th>
                      <th className="px-3 py-2.5 font-semibold">Routed Bin</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredHistory.slice(0, 14).map((record) => (
                      <tr key={record.id} className="hover:bg-[#19222C]">
                        <td className="px-3 py-2.5 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                          {record.timestamp}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300 capitalize whitespace-nowrap">
                          {record.mode}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">
                          {record.itemName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">
                          {record.faultLabel ? record.faultLabel : record.targetBin}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              record.outcome === 'Correct'
                                ? 'text-emerald-400'
                                : record.outcome === 'Incorrect'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {record.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Environmental Impact Section (Simulated Estimates) */}
      <section
        id="impact"
        aria-label="Simulated Environmental Impact Estimates"
        className="rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              Environmental Impact Model · Simulated Estimates
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-white">
              Estimated Recycling &amp; Waste Diversion Impact
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Simulated estimates derived from actual items correctly sorted
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Recycle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Simulated Waste Diverted</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {simulatedImpact.divertedKg.toFixed(3)} kg
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Simulated estimate kept out of landfill
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Leaf className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Simulated CO₂e Avoided</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {simulatedImpact.co2SavedKg.toFixed(3)} kg
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Simulated greenhouse gas reduction
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Zap className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Simulated Energy Saved</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-sky-400 tabular-nums">
              {simulatedImpact.energySavedKwh.toFixed(2)} kWh
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Simulated recovery vs. virgin production
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0E1319] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Recycle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Recovered Material Units</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {simulatedImpact.recycledOrCompostedItems}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Recyclable, organic &amp; e-waste items sorted
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
