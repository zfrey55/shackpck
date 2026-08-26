'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  STATIC_CARD_SERIES,
  adaptApiSeriesList,
  mergeCardSeries,
  type CardEntry,
  type CardSeries,
} from '@/lib/card-checklist-model';
import { fetchCardChecklistDates, fetchCardChecklistSeries } from './api';

/**
 * Loads the live card checklist and merges it onto the static base.
 *
 * Two-phase on purpose. getCardChecklistDates returns every series with its
 * grouping fields but no cards, which is all the nav needs; the cards for one
 * series are fetched only when its group and date are actually selected. That
 * keeps first paint to a single request no matter how many series exist.
 *
 * DEGRADES TO STATIC. `series` starts as STATIC_CARD_SERIES and API content is
 * merged on top, so a failed or empty API response leaves the Cards tab
 * showing exactly the archive and examples rather than blanking.
 *
 * The gate lives in adaptApiSeriesList: until ShackHQ sends seriesType and
 * customerName, every API series is dropped and this hook is a no-op.
 */
export function useCardApiSeries() {
  /** Gated + numbered API series, cards not yet loaded. */
  const [apiSeries, setApiSeries] = useState<CardSeries[]>([]);
  /** seriesId -> cards, filled on demand. */
  const [cardsById, setCardsById] = useState<Record<string, CardEntry[]>>({});
  /**
   * seriesIds that 404'd. A series can be hard-deleted between the dates call
   * listing it and our asking for it; that race is routine, so the series is
   * dropped silently - not thrown, not logged.
   */
  const [droppedIds, setDroppedIds] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetchCardChecklistDates();
        if (cancelled) return;
        setApiSeries(adaptApiSeriesList(response.series ?? []));
      } catch (err) {
        if (cancelled) return;
        // Surfaced as a banner above the static content, never in place of it.
        setError(err instanceof Error ? err.message : 'Failed to load card series');
      } finally {
        if (!cancelled) setLoadingDates(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dropped = useMemo(() => new Set(droppedIds), [droppedIds]);

  /** Static base plus every API series that survived the gate and the 404s. */
  const series = useMemo(() => {
    const live = apiSeries
      .filter((s) => !dropped.has(s.id))
      .map((s) => ({ ...s, cards: cardsById[s.id] ?? s.cards }));
    return mergeCardSeries(STATIC_CARD_SERIES, live);
  }, [apiSeries, cardsById, dropped]);

  const apiIds = useMemo(() => new Set(apiSeries.map((s) => s.id)), [apiSeries]);

  /**
   * Load cards for the given series, skipping static ones and anything already
   * loaded or dropped. Safe to call on every selection change.
   */
  const loadCardsFor = useCallback(
    async (ids: string[]) => {
      const wanted = ids.filter(
        (id) => apiIds.has(id) && cardsById[id] === undefined && !dropped.has(id)
      );
      if (wanted.length === 0) return;

      setLoadingCards(true);
      try {
        const results = await Promise.all(
          wanted.map(async (id) => ({ id, series: await fetchCardChecklistSeries(id) }))
        );

        const loaded: Record<string, CardEntry[]> = {};
        const gone: string[] = [];
        for (const { id, series: found } of results) {
          // null is the documented 404 case: drop it and carry on.
          if (found === null) gone.push(id);
          else loaded[id] = found.cards ?? [];
        }

        if (Object.keys(loaded).length > 0) {
          setCardsById((prev) => ({ ...prev, ...loaded }));
        }
        if (gone.length > 0) {
          setDroppedIds((prev) => [...prev, ...gone]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load a card series');
      } finally {
        setLoadingCards(false);
      }
    },
    [apiIds, cardsById, dropped]
  );

  return { series, loadCardsFor, loadingDates, loadingCards, error };
}
