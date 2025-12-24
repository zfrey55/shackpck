export interface CaseData {
  caseId: string;
  caseSKU?: string;
  displayName: string;
  caseType: string;
  caseTypeName: string;
  seriesNumber: number;
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
}

