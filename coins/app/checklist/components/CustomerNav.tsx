"use client";

import Link from "next/link";
import type { CustomerIndexEntry } from "../useCustomerIndex";
import {
  CUSTOMER_BUCKET_LABELS,
  SHACKPACK_SLUG,
  type CustomerBucket,
} from "@/lib/customer-attribution";

type CustomerNavProps = {
  /** Outside customers, derived live from the fetched days. Never hardcoded. */
  otherCustomers: CustomerIndexEntry[];
  bucket: CustomerBucket;
  /** Active customer slug; null while 'other' is open but none picked yet. */
  slug: string | null;
  onSelect: (bucket: CustomerBucket, slug: string | null) => void;
  /** True until the date sweep has returned at least one batch. */
  loading?: boolean;
};

const TABS: { bucket: CustomerBucket; label: string; slug: string | null }[] = [
  { bucket: 'shackpack', label: CUSTOMER_BUCKET_LABELS.shackpack, slug: SHACKPACK_SLUG },
  {
    bucket: 'bullion-bureau',
    label: CUSTOMER_BUCKET_LABELS['bullion-bureau'],
    slug: 'bullion-bureau',
  },
  { bucket: 'other', label: 'Other', slug: null },
];

/**
 * Customer attribution nav: ShackPack / Bullion Bureau / Other.
 *
 * Replaces the brand tab bar on the checklist. "Other" expands to the outside
 * customers actually present in the fetched data, so a newly onboarded customer
 * appears without a code change.
 */
export function CustomerNav({
  otherCustomers,
  bucket,
  slug,
  onSelect,
  loading = false,
}: CustomerNavProps) {
  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Customer"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {TABS.map((tab) => {
          const active = tab.bucket === bucket;
          return (
            <button
              key={tab.bucket}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tab.bucket, tab.slug)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-gold text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {bucket === 'other' && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {otherCustomers.length === 0 ? (
            <p className="text-sm text-slate-400">
              {loading ? 'Loading customers…' : 'No other customers found.'}
            </p>
          ) : (
            otherCustomers.map((customer) => {
              const active = customer.slug === slug;
              return (
                <button
                  key={customer.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect('other', customer.slug)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-gold/90 text-black'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {customer.name}
                  <span className="ml-2 opacity-60">{customer.totalCases}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {slug && (
        <div className="text-center">
          <Link
            href={`/checklist/customer/${slug}`}
            className="text-xs text-gold/80 underline-offset-4 hover:text-gold hover:underline"
          >
            Open shareable customer page →
          </Link>
        </div>
      )}
    </div>
  );
}
