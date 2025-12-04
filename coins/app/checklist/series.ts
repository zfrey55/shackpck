import type { SeriesData, CaseType } from "./types";
import { SERIES_CONFIG } from "./constants";
import { getCurrentWeekMonday, formatDisplayDateRange } from "./utils";

export function generateSeries(): SeriesData[] {
  const series: SeriesData[] = [];
  const { archiveWeeks, defaultCases } = SERIES_CONFIG;
  
  // Get the current week's Monday (most recent series)
  const currentWeekMonday = getCurrentWeekMonday();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate series from current week going backwards (historical only - no future weeks)
  // Start from current week (weekOffset = 0) and go backwards for archiveWeeks
  // Do NOT generate future weeks
  const startWeek = -archiveWeeks; // Go back archiveWeeks from current
  const endWeek = 0; // Only up to current week, no future weeks

  for (let weekOffset = startWeek; weekOffset <= endWeek; weekOffset++) {
    const weekStart = new Date(currentWeekMonday);
    weekStart.setDate(currentWeekMonday.getDate() + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Skip any future weeks (weeks that start after today)
    if (weekStart > today) {
      continue;
    }

    const monthName = weekStart.toLocaleDateString("en-US", { month: "long" });
    const monthAbbr = weekStart.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const year = weekStart.getFullYear();
    const weekNumberInMonth = Math.floor((weekStart.getDate() - 1) / 7) + 1;
    
    // Determine if this is the current week
    const isCurrentWeek = weekStart <= today && weekEnd >= today;
    
    // Create series name - label current week clearly
    const seriesName = isCurrentWeek 
      ? `Current Week – ${monthName} ${year}`
      : `Series ${weekNumberInMonth} – ${monthName} ${year}`;

    series.push({
      id: `series-${weekStart.toISOString().split("T")[0]}`,
      name: seriesName,
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
      description: `Week of ${formatDisplayDateRange(
        weekStart.toISOString().split("T")[0],
        weekEnd.toISOString().split("T")[0]
      )}`,
      cases: [...defaultCases] as CaseType[]
    });
  }

  // Sort by date descending (most recent first) - current week should be first
  const sorted = series.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  // Ensure current week is first by finding it and moving it to the front
  // Fix: Parse dates consistently in local timezone to avoid UTC/local mismatch
  const currentWeekIndex = sorted.findIndex(s => {
    // Parse ISO date strings as local dates (not UTC)
    const startParts = s.startDate.split('-').map(Number);
    const endParts = s.endDate.split('-').map(Number);
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]); // Year, Month (0-indexed), Day
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return start <= today && end >= today;
  });
  
  if (currentWeekIndex > 0) {
    // Move current week to the front
    const currentWeek = sorted.splice(currentWeekIndex, 1)[0];
    sorted.unshift(currentWeek);
  }
  
  return sorted;
}

