export interface CaseData {
  caseId: string;
  caseSKU?: string;
  displayName: string;
  caseType: string;
  caseTypeName: string;
  /** Optional field from inventory API; checklist UI numbers series per date using display order. */
  seriesNumber?: number;
  createdDate: string;
  displayDate: string;
  status: string;
  totalCoins: number;
  coins: CoinData[];
}

export interface CoinData {
  position: number;
  coinType: string;
  year: string;
  grade: string;
  gradingCompany: string;
  weight?: string | null; // Weight field (e.g., "1 oz", "1/10 oz") or null if not available
}

export interface DailyChecklistResponse {
  success: boolean;
  displayDate: string;
  totalCases: number;
  casesByType: Record<string, number>;
  cases: CaseData[];
}

export interface AvailableDatesResponse {
  success: boolean;
  totalDates: number;
  dates: {
    displayDate: string;
    totalCases: number;
    caseTypes: string[];
  }[];
}

export interface CaseTypeInfo {
  caseType: string;
  displayName: string;
  totalDates: number;
  totalCases: number;
  isLoading?: boolean;
}

