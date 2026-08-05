export interface CaseData {
  caseId: string;
  caseSKU?: string;
  displayName: string;
  caseType: string;
  caseTypeName: string;
  /**
   * Series number from the inventory API. Rendered directly by CaseCard; the
   * per-date display ordinal is only a fallback when this is absent.
   */
  seriesNumber?: number;
  /**
   * Attribution fields from the getDailyChecklist payload. Typed now so the
   * data is carried through; no customer page or filtering consumes them yet.
   */
  customerName?: string | null;
  buyerCode?: string | null;
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

