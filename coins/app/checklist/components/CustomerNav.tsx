"use client";

import { BucketedTabs, type BucketTab } from "@/components/BucketedTabs";
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

/**
 * The two named buckets, derived from CUSTOMER_BUCKET_LABELS rather than
 * spelled out here, so adding a featured customer is a one-line edit there.
 * Their slugs are the labels' own slugs — 'shackpack' and 'bullion-bureau'.
 */
const NAMED_BUCKETS = (
  Object.keys(CUSTOMER_BUCKET_LABELS) as Exclude<CustomerBucket, 'other'>[]
).map((bucket) => ({
  bucket,
  label: CUSTOMER_BUCKET_LABELS[bucket],
  slug: bucket === 'shackpack' ? SHACKPACK_SLUG : bucket,
}));

/**
 * TIER 2 on the coin line: ShackPack / Bullion Bureau / Other.
 *
 * "Other" expands to the outside customers actually present in the fetched
 * data, so a newly onboarded customer appears with no code change. The rows
 * themselves are rendered by the shared BucketedTabs, which /repacks uses for
 * its coin brands too — one implementation of the pattern, two pages.
 *
 * The "Open shareable customer page" link that used to sit under this nav is
 * gone. Every tab is in the URL, so the address bar IS the shareable link and
 * a second one only invited confusion about which to send.
 */
export function CustomerNav({
  otherCustomers,
  bucket,
  slug,
  onSelect,
  loading = false,
}: CustomerNavProps) {
  const primary: BucketTab[] = [
    ...NAMED_BUCKETS.map((b) => ({ id: b.bucket, label: b.label })),
    { id: 'other', label: 'Other' },
  ];

  const secondary: BucketTab[] = otherCustomers.map((c) => ({
    id: c.slug,
    label: c.name,
    badge: c.totalCases,
  }));

  return (
    <BucketedTabs
      ariaLabel="Customer"
      primary={primary}
      activePrimary={bucket}
      onPrimary={(id) => {
        const named = NAMED_BUCKETS.find((b) => b.bucket === id);
        if (named) onSelect(named.bucket, named.slug);
        else onSelect('other', null);
      }}
      bucketId="other"
      secondary={secondary}
      activeSecondary={slug}
      onSecondary={(nextSlug) => onSelect('other', nextSlug)}
      emptyLabel="No other customers found."
      loading={loading}
      loadingLabel="Loading customers…"
    />
  );
}
