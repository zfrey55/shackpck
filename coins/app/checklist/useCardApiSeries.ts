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
 * The gate lives in adaptApiSeriesList: a series missing seriesType or
 * customerName is dropped there and never reaches this hook.
 *
 * GROUPED DAYS. adaptApiSeriesList returns only top-level series, with each
 * umbrella's cabinets nested on `cabinets`. This hook is where that tree meets
 * on-demand loading, so it owns both halves of the grouping policy: which ids
 * a selection has to fetch, and what a 404 takes down with it. Neither belongs
 * in the render layer — see loadCardsFor.
 */
export function useCardApiSeries() {
  /** Gated + numbered top-level API series, cards not yet loaded. */
  const [apiSeries, setApiSeries] = useState<CardSeries[]>([]);
  /** seriesId -> cards, filled on demand. Umbrellas and cabinets alike. */
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

  /**
   * Every API series by id, umbrellas AND cabinets. Cabinets are absent from
   * the top-level list by design, so this is the only place their ids are
   * resolvable — which is why both the fetch expansion and the 404 policy
   * below live here rather than in the browser.
   */
  const apiById = useMemo(() => {
    const map = new Map<string, CardSeries>();
    for (const s of apiSeries) {
      map.set(s.id, s);
      for (const cabinet of s.cabinets) map.set(cabinet.id, cabinet);
    }
    return map;
  }, [apiSeries]);

  /** Static base plus every API series that survived the gate and the 404s. */
  const series = useMemo(() => {
    const live = apiSeries
      .filter((s) => !dropped.has(s.id))
      .map((s) => ({
        ...s,
        cards: cardsById[s.id] ?? s.cards,
        // A 404'd cabinet drops its section and leaves the rest of the group
        // standing. A 404'd umbrella is filtered out above, cabinets and all.
        cabinets: s.cabinets
          .filter((cabinet) => !dropped.has(cabinet.id))
          .map((cabinet) => ({
            ...cabinet,
            cards: cardsById[cabinet.id] ?? cabinet.cards,
          })),
      }));
    return mergeCardSeries(STATIC_CARD_SERIES, live);
  }, [apiSeries, cardsById, dropped]);

  /**
   * Load cards for the given series, skipping static ones and anything already
   * loaded or dropped. Safe to call on every selection change.
   *
   * SELECTING AN UMBRELLA FETCHES ITS CABINETS TOO. A grouped day renders the
   * umbrella's full list and every cabinet section in one pass, so the caller
   * passes only what it selected and this expands to what will actually be on
   * screen. Doing it here rather than in the browser keeps the tree's shape a
   * concern of the data layer, and means the existing call site needs no
   * change at all.
   */
  const loadCardsFor = useCallback(
    async (ids: string[]) => {
      const requested = new Set<string>();
      for (const id of ids) {
        requested.add(id);
        const found = apiById.get(id);
        if (found) for (const cabinet of found.cabinets) requested.add(cabinet.id);
      }

      const wanted = Array.from(requested).filter(
        (id) => apiById.has(id) && cardsById[id] === undefined && !dropped.has(id)
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
          if (found === null) {
            gone.push(id);
            // An umbrella takes its whole group with it - a group is never
            // shown half-deleted. A cabinet drops alone. Cabinets have no
            // cabinets of their own, so this never needs to recurse.
            const dropping = apiById.get(id);
            if (dropping) for (const cabinet of dropping.cabinets) gone.push(cabinet.id);
          } else {
            loaded[id] = found.cards ?? [];
          }
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
    [apiById, cardsById, dropped]
  );

  return { series, loadCardsFor, loadingDates, loadingCards, error };
}
