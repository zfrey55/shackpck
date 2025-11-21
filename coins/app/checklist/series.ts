import type { SeriesData, CaseType } from "./types";
import { SERIES_CONFIG } from "./constants";
import { getCurrentWeekMonday, formatDisplayDateRange } from "./utils";

export function generateSeries(): SeriesData[] {
  const series: SeriesData[] = [];
  const { weeksAhead, archiveWeeks, defaultCases } = SERIES_CONFIG;
  
  // Get the current week's Monday (most recent series)
  const currentWeekMonday = getCurrentWeekMonday();
  
  // Generate series from current week going backwards (historical) and forwards (future)
  // Start from current week (weekOffset = 0) and go backwards for archiveWeeks
  // Then go forwards for weeksAhead
  const startWeek = -archiveWeeks; // Go back archiveWeeks from current
  const endWeek = weeksAhead; // Go forward weeksAhead from current

  for (let weekOffset = startWeek; weekOffset <= endWeek; weekOffset++) {
    const weekStart = new Date(currentWeekMonday);
    weekStart.setDate(currentWeekMonday.getDate() + weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthName = weekStart.toLocaleDateString("en-US", { month: "long" });
    const monthAbbr = weekStart.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const year = weekStart.getFullYear();
    const weekNumberInMonth = Math.floor((weekStart.getDate() - 1) / 7) + 1;

    series.push({
      id: `series-${weekNumberInMonth}-${monthAbbr}-${year}`,
      name: `Series ${weekNumberInMonth} – ${monthName} ${year}`,
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
      description: `Week of ${formatDisplayDateRange(
        weekStart.toISOString().split("T")[0],
        weekEnd.toISOString().split("T")[0]
      )}`,
      cases: [...defaultCases] as CaseType[]
    });
  }

  // Sort by date descending (most recent first)
  return series.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

