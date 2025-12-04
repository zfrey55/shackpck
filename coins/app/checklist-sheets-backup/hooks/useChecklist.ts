import { useEffect, useState } from "react";
import type { ChecklistResponse, CaseType, SeriesData } from "../types";
import { fetchChecklist } from "../api";

interface UseChecklistReturn {
  data: ChecklistResponse | null;
  loading: boolean;
  error: string | null;
  warning: string | null;
  refresh: () => void;
}

export function useChecklist(
  selectedCase: CaseType,
  selectedSeries: SeriesData
): UseChecklistReturn {
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setWarning(null);
      try {
        const result = await fetchChecklist({
          caseType: selectedCase.id,
          startDate: selectedSeries.startDate,
          endDate: selectedSeries.endDate
        });
        if (cancelled) return;
        setData(result);
        if (result.warning) {
          setWarning(result.warning);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCase, selectedSeries, refreshIndex]);

  return {
    data,
    loading,
    error,
    warning,
    refresh: () => setRefreshIndex((idx) => idx + 1)
  };
}

