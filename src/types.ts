export interface HomeInfo {
  areaSize: number; // in 'pyeong'
  roomStructure: string;
  insulationStatus: string;
  sunlightLevel: string;
}

export interface UsagePattern {
  dailyUsageHours: number;
  timeOfDay: string;
  userPreference: string;
}

export interface InstallConditions {
  outdoorUnitPos?: string;
  pipeLength?: number;
  perforations?: number;
  drainExists?: boolean;
  manifoldCount?: number;
  moveFrequency?: string;
  noiseSensitivity?: string;
}

export interface DeviceSpec {
  name: string;
  type: string;
  capacity: string;
  efficiency: string;
  smartFeatures: string;
  noiseLevel: string;
  installSuitability: string;
}

export interface ComparisonMatrixItem {
  category: string;
  modelAValue: string;
  modelBValue: string;
  winner: string;
  analysisText: string;
}

export interface EnergyAnalysis {
  modelAEstCost: number;
  modelBEstCost: number;
  costDifference: number;
  annualSaving: number;
  calculationBasis: string;
}

export interface FinalReasoning {
  economy: string;
  comfort: string;
  installation: string;
}

export interface ComparisonResult {
  winnerModel: string;
  winnerType: '모델 A' | '모델 B' | string;
  summaryVerdict: string;
  specs: {
    modelA: DeviceSpec;
    modelB: DeviceSpec;
  };
  comparisonMatrix: ComparisonMatrixItem[];
  energyAnalysis: EnergyAnalysis;
  finalReasoning: FinalReasoning;
  efficiencyTips: string[];
  generalDisclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  deviceType: string;
  modelA: string;
  modelB: string;
  homeInfo: HomeInfo;
  usagePattern: UsagePattern;
  installConditions: InstallConditions;
  result: ComparisonResult;
}
