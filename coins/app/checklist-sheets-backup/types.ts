export type CaseType = {
  id: string;
  name: string;
  description: string;
  goldContent: string;
};

export type CaseTypeDisplay = {
  id: string;
  label: string;
  helper: string;
};

export interface CoinItem {
  name: string;
  years: string[];
  gradingCompanies: string[];
  grades: Record<string, number>;
  gradesAvailable: string[];
  totalQuantity: number;
  maxObservedQuantity?: number;
  available?: boolean;
}

export interface ChecklistResponse {
  success: boolean;
  lastUpdated: string;
  caseType?: string;
  startDate?: string;
  endDate?: string;
  isHistorical?: boolean;
  weeklyAggregation?: boolean;
  casesCount?: number;
  coinsFromCasesCount?: number;
  premiumInventoryCount?: number;
  warning?: string;
  totalTypes?: number;
  totalCoins?: number;
  snapshotCount?: number;
  checklist: CoinItem[];
}

export interface SeriesData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  cases: CaseType[];
}

