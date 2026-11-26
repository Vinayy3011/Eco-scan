export enum WasteCategory {
  Biodegradable = 'Biodegradable',
  Recyclable = 'Recyclable',
  NonRecyclable = 'Non-Recyclable',
  EWaste = 'E-Waste',
}

export enum BinColor {
  Green = 'Green Bin',
  Blue = 'Blue Bin',
  Red = 'Red Bin',
  Yellow = 'Yellow Bin',
}

export enum SimulationStage {
  Idle = 'Idle',
  WasteDetected = 'Waste detected',
  ObjectAnalysis = 'Image/object analysis',
  CategoryIdentified = 'Waste category identified',
  SortingInProgress = 'Sorting in progress',
  SortingCompleted = 'Sorting completed',
  SortingFailed = 'Fault halted',
}

export type OperationMode = 'automatic' | 'manual';

export type SpeedPreset = 'slow' | 'normal' | 'fast';

export type FaultType = 'conveyor-jam' | 'sensor-failure' | 'gate-failure';

export interface FaultInfo {
  id: FaultType;
  label: string;
  faultyComponent: string;
  warningMessage: string;
  recoveryActionLabel: string;
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  bin: BinColor;
  materialSignature: string;
  opticalCue: string;
  simulatedConfidence: number;
  moistureIndex: string;
  moisturePercent: number;
  metallicReading: string;
  metalDetected: boolean;
  estimatedWeightKg: number;
  estimatedCo2SavedKg: number;
  estimatedEnergySavedKwh: number;
  disposalGuidance: string;
  recyclingRecommendation: string;
  decompositionEstimate: string;
}

export interface BinConfig {
  id: BinColor;
  category: WasteCategory;
  title: string;
  shortLabel: string;
  accentHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
  barClass: string;
  description: string;
}

export interface SimulationHistoryRecord {
  id: string;
  timestamp: string;
  mode: OperationMode;
  itemId: string;
  itemName: string;
  detectedCategory: WasteCategory;
  targetBin: BinColor;
  expectedBin: BinColor;
  outcome: 'Correct' | 'Incorrect' | 'Fault Recovered';
  confidence: number;
  durationMs: number;
  faultLabel?: string;
}
