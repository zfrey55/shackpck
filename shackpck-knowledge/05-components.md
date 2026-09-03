# 05 — Components

## Design system / UI library

- **Tailwind CSS 3.4** (utility-first), `darkMode: 'class'`. Global styles in `app/globals.css`.
- **Headless UI** (`@headlessui/react`) for accessible interactive primitives; **Heroicons** for icons. `clsx` for conditional classes.
- No shadcn/Mantine/Chakra. Components are hand-built with Tailwind.

## Design tokens (`tailwind.config.ts`)

- Colors: `gold #eab308`, `silver #c0c0c0`, `charcoal #0b1220` (page background).
- Box shadow: `glow` = `0 0 24px rgba(234,179,8,0.2)` (gold glow on hover).
- Base body: `bg-charcoal text-slate-200` (dark theme); accent is `gold`.

## Layout components

- `components/NavBar.tsx` — top nav: Home, Packs (`/repacks`), Build, Series, Checklists, Policy, Contact; conditional Cart dropdown + auth/account (feature-flag gated).
- `components/Footer.tsx` — footer links (incl. Packs).
- `app/layout.tsx` — root layout; provider stack: `Providers` (NextAuth `SessionProvider`, `app/providers.tsx`) → `CartProvider` → `ToastProvider` → NavBar/Footer.

## Reusable components (`components/`)

- **Packs/products:** `RepackCard.tsx` (4×6 / `aspect-[2/3]` pack tile, "Contact for Price"), `PackImagePlaceholder.tsx` (branded fallback using `/coin-icon.svg`), `ProductCard.tsx`, `ProductGallery.tsx`, `SeriesCard.tsx`, `FeaturedSeriesSection.tsx` (fetches `/api/series?featured=true`).
- **Brand UI (new):** `BrandTabs.tsx` — exports `BrandTabs` (customer-brand tab bar) and `BrandHeader` (logo/wordmark + tagline). Driven by `lib/brands.ts`.
- **Toggles:** `CoinsCardsToggle.tsx` — Coins/Cards switch (used within ShackPack brand).
- **Cart:** `CartProvider.tsx` (context/state), `CartDropdown.tsx` (nav dropdown).
- **Notifications:** `ToastProvider.tsx` + `Toast.tsx`.
- **Forms:** `ContactForm.tsx` (see `06`). `ChecklistUpload.tsx` — **orphan/unused** (see `11`).

## Builder components (`components/builder/`)

- Custom-case designer UI (drag-and-drop via `@dnd-kit`). Includes `BuilderShell.tsx` (533 lines). Logic/catalog in `lib/builder/`.

## Checklist components (`app/checklist/components/`)

- `CaseCard`, `CaseTypeSelector`, `DateButtons`, `DateButtonsForCaseType`, `EmptyState`, `LoadingState`, `ErrorState`, `GradePill`, `CardChecklistView` — exported via `app/checklist/components/index.ts`.

## Patterns

- Server components by default; interactive trees marked `"use client"` and often split into `*Client.tsx` (e.g. `RepacksClient`, `MyBuildsClient`, `AdminBuildsClient`).
- See `10-conventions.md`.

## Notes / debt (see `11`)

- `components/SeriesCard.tsx` exists but `app/series/page.tsx` defines a local SeriesCard — duplication.
- `FeaturedSeriesSection.tsx` contains many debug `console.log`s.
