import type { CaseType, CaseTypeDisplay } from "./types";

export const CASE_TYPE_META: Record<string, CaseTypeDisplay> = {
  base: { id: "base", label: "ShackPack", helper: "1× 1/10 oz gold + 9 varied silver coins" },
  deluxe: { id: "deluxe", label: "ShackPack Deluxe", helper: "2× 1/10 oz gold + 8 varied silver coins" },
  xtreme: { id: "xtreme", label: "ShackPack Xtreme", helper: "1× 1/4 oz gold + 9 varied silver coins" },
  unleashed: { id: "unleashed", label: "ShackPack Unleashed", helper: "2× 1/4 oz gold + 8 varied silver coins" },
  resurgence: { id: "resurgence", label: "ShackPack Resurgence", helper: "1× 1/2 oz gold + 9 varied silver coins" },
  transcendent: { id: "transcendent", label: "ShackPack Transcendent", helper: "1× 1 oz gold + 9 varied silver coins" },
  ignite: { id: "ignite", label: "ShackPack Ignite", helper: "1× 1/4 oz platinum + 9 varied silver coins" },
  eclipse: { id: "eclipse", label: "ShackPack Eclipse", helper: "1× 1 oz platinum + 9 varied silver coins" }
};

export const SERIES_CONFIG = {
  weeksAhead: 4, // Number of future weeks to show
  archiveWeeks: 52, // Number of historical weeks to show
  defaultCases: [
    {
      id: "base",
      name: "ShackPack",
      description: "Contains one 1/10 oz gold coin and 9 varied silver coins",
      goldContent: "1/10 oz Gold"
    },
    {
      id: "deluxe",
      name: "ShackPack Deluxe",
      description: "Contains two 1/10 oz gold coins and 8 varied silver coins",
      goldContent: "2× 1/10 oz Gold"
    },
    {
      id: "xtreme",
      name: "ShackPack Xtreme",
      description: "Contains one 1/4 oz gold coin and 9 varied silver coins",
      goldContent: "1/4 oz Gold"
    },
    {
      id: "unleashed",
      name: "ShackPack Unleashed",
      description: "Contains two 1/4 oz gold coins and 8 varied silver coins",
      goldContent: "2× 1/4 oz Gold"
    },
    {
      id: "resurgence",
      name: "ShackPack Resurgence",
      description: "Contains one 1/2 oz gold coin and 9 varied silver coins",
      goldContent: "1/2 oz Gold"
    },
    {
      id: "transcendent",
      name: "ShackPack Transcendent",
      description: "Contains one 1 oz gold coin and 9 varied silver coins",
      goldContent: "1 oz Gold"
    },
    {
      id: "ignite",
      name: "ShackPack Ignite",
      description: "Contains one 1/4 oz platinum coin and 9 varied silver coins",
      goldContent: "1/4 oz Platinum"
    },
    {
      id: "eclipse",
      name: "ShackPack Eclipse",
      description: "Contains one 1 oz platinum coin and 9 varied silver coins",
      goldContent: "1 oz Platinum"
    }
  ] satisfies CaseType[]
};

