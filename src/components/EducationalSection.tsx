import React, { useState } from 'react';
import { WASTE_ITEMS } from '../data/wasteDataset';

const EDUCATION_TOPICS = [
  {
    id: 'how-it-works',
    number: '01',
    title: 'How Smart Waste Segregation Works',
    summary:
      'Automated Materials Recovery Facilities (MRFs) combine conveyor singulation, optical cameras, inductive metal coils, moisture sensors, and pneumatic diverter gates.',
    points: [
      'Object Detection: Break-beam sensors detect an item entering the conveyor and log its position along the belt.',
      'Multi-Sensor Fusion: Optical vision evaluates shape and polymer cues while inductive coils and moisture sensors confirm metal or organic water content.',
      'Classification: Decision logic assigns the object to Biodegradable, Recyclable, Non-Recyclable, or E-Waste.',
      'Actuation & Recovery: A sorting gate routes the item to its bin, while fault monitors halt the belt if jams or sensor dropouts occur.',
    ],
  },
  {
    id: 'importance',
    number: '02',
    title: 'Importance of Waste Segregation',
    summary:
      'Mixing wet organics with dry paper or hazardous batteries ruins entire recycling batches and accelerates methane emissions in open landfills.',
    points: [
      'Prevents cross-contamination: One food-soaked container can render bales of clean cardboard or paper unmarketable.',
      'Reduces landfill volume: Over 60% of municipal solid waste is either compostable or recyclable when separated early.',
      'Protects sanitation workers: Isolating sharp glass, chemical residues, and lithium batteries lowers facility injury and fire risk.',
    ],
  },
  {
    id: 'recycling-benefits',
    number: '03',
    title: 'Environmental & Energy Benefits of Recycling',
    summary:
      'Processing recovered feedstock requires a fraction of the water, electricity, and raw mining needed for virgin materials.',
    points: [
      'Aluminium recovery saves up to 95% of the energy required to smelt virgin bauxite ore.',
      'Recycled paper reduces water consumption by roughly 50% and preserves forest carbon sinks.',
      'Cullet glass recycling lowers furnace melting temperatures and cuts industrial CO2 emissions.',
    ],
  },
  {
    id: 'ewaste',
    number: '04',
    title: 'Proper E-Waste & Battery Disposal',
    summary:
      'Discarded electronics contain both toxic heavy metals (lead, mercury, cadmium) and scarce precious metals (gold, copper, cobalt, lithium).',
    points: [
      'Never crush or puncture lithium-ion batteries in compacting trucks—thermal runaway sparks severe facility fires.',
      'Wipe personal data from mobile phones and route devices to certified e-waste recyclers (Yellow Bin).',
      'Urban mining recovers critical rare-earth elements cleanly instead of leaching toxins into groundwater.',
    ],
  },
  {
    id: 'three-rs',
    number: '05',
    title: 'Reduce, Reuse, and Recycle (The 3Rs Hierarchy)',
    summary:
      'Recycling is the third line of defense; prioritizing reduction and reuse delivers the highest environmental return.',
    points: [
      'Reduce: Avoid multi-layer plastic wrappers and single-use packaging that cannot be economically recycled.',
      'Reuse: Refill durable glass bottles, repair electronics, and repurpose cardboard cartons before discarding.',
      'Recycle: Clean, dry, and sort remaining recoverable materials accurately into designated collection streams.',
    ],
  },
];

export const EducationalSection: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>(EDUCATION_TOPICS[0].id);
  const activeTopic =
    EDUCATION_TOPICS.find((t) => t.id === activeTopicId) || EDUCATION_TOPICS[0];

  return (
    <div className="space-y-6">
      <section
        id="education"
        aria-label="Waste Segregation Educational Guide"
        className="rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6"
      >
        <div className="border-b border-slate-800 pb-4">
          <p className="text-xs font-medium text-emerald-400">
            Student &amp; Classroom Reference
          </p>
          <h2 className="mt-0.5 text-lg sm:text-xl font-semibold text-white">
            Engineering &amp; Environmental Waste Segregation Guide
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div
            className="lg:col-span-5 flex flex-col gap-1.5"
            role="tablist"
            aria-label="Educational topics"
          >
            {EDUCATION_TOPICS.map((topic) => {
              const isSelected = topic.id === activeTopic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-100'
                      : 'border-slate-800 bg-[#0E1319] text-slate-300 hover:bg-[#19222C]'
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-semibold pt-0.5 tabular-nums ${
                      isSelected ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {topic.number}.
                  </span>
                  <span className="text-sm font-semibold leading-snug">
                    {topic.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0D1218] p-5"
          >
            <p className="font-mono text-xs font-medium text-emerald-400">
              Topic {activeTopic.number} of 05
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {activeTopic.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
              {activeTopic.summary}
            </p>

            <ul className="mt-4 space-y-2.5 border-t border-slate-800 pt-4 text-sm text-slate-300">
              {activeTopic.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="font-mono text-xs font-semibold text-emerald-400 pt-1 tabular-nums">
                    0{idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="dataset"
        aria-label="Predefined AI Simulation Classification Dataset"
        className="rounded-xl border border-slate-800 bg-[#131920] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              Transparent Rule &amp; Feature Lookup Table
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-semibold text-white">
              Predefined Simulation Dataset (10 Reference Items)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Simulated classification logic — not real camera inference
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#0D1218] text-slate-400">
              <tr>
                <th className="px-3.5 py-2.5 font-semibold">Waste Item</th>
                <th className="px-3.5 py-2.5 font-semibold">Assigned Category</th>
                <th className="px-3.5 py-2.5 font-semibold">Target Bin</th>
                <th className="px-3.5 py-2.5 font-semibold">Material Signature</th>
                <th className="px-3.5 py-2.5 font-semibold">Moisture / Metal Cue</th>
                <th className="px-3.5 py-2.5 font-semibold text-right">Sim. Conf.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {WASTE_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-[#19222C]">
                  <td className="px-3.5 py-2.5 font-semibold text-white whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-300 whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-emerald-300 whitespace-nowrap">
                    {item.bin}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-400">
                    {item.materialSignature}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                    {item.moistureIndex} · {item.metallicReading}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-medium text-white tabular-nums text-right whitespace-nowrap">
                    {item.simulatedConfidence.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
