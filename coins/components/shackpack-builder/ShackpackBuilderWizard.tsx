'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ShackpackBuilderSpec } from '@/lib/shackpack-builder-schema';
import {
  BUDGET_LABELS,
  INSPIRATION_LABELS,
  PRODUCT_LINE_LABELS,
  TIMELINE_LABELS,
} from '@/lib/shackpack-builder-schema';

const inputClass =
  'mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';
const labelClass = 'block text-sm font-medium text-slate-200';

const STEPS = [
  'Product & inspiration',
  'Scale',
  'Budget & highlights',
  'Design direction',
  'Contact & send',
] as const;

type Draft = {
  productLine: ShackpackBuilderSpec['productLine'] | '';
  inspiration: NonNullable<ShackpackBuilderSpec['inspiration']> | '';
  packCount: string;
  caseCount: string;
  spotlightNotes: string;
  budgetRange: ShackpackBuilderSpec['budgetRange'] | '';
  designNotes: string;
  timeline: NonNullable<ShackpackBuilderSpec['timeline']> | '';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalNotes: string;
};

const emptyDraft = (): Draft => ({
  productLine: '',
  inspiration: '',
  packCount: '',
  caseCount: '',
  spotlightNotes: '',
  budgetRange: '',
  designNotes: '',
  timeline: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  additionalNotes: '',
});

export function ShackpackBuilderWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const validationError = useMemo(() => {
    const d = draft;
    if (step === 0) {
      if (!d.productLine) return 'Choose what you want to build.';
    }
    if (step === 1) {
      if (!d.packCount.trim()) return 'Describe how many packs (or rough quantity) you have in mind.';
    }
    if (step === 2) {
      if (!d.budgetRange) return 'Select an indicative budget range (or choose to discuss privately).';
    }
    if (step === 3) {
      if (d.designNotes.trim().length < 20) {
        return 'Add at least a few sentences about design, branding, or artwork direction (20+ characters).';
      }
    }
    if (step === 4) {
      if (!d.firstName.trim() || !d.lastName.trim()) return 'First and last name are required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Enter a valid email address.';
      if (!d.phone.trim()) return 'Phone number is required.';
    }
    return null;
  }, [draft, step]);

  const goNext = () => {
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const buildSpec = (): ShackpackBuilderSpec => {
    const inspiration = draft.inspiration ? draft.inspiration : undefined;
    return {
      productLine: draft.productLine as ShackpackBuilderSpec['productLine'],
      inspiration,
      packCount: draft.packCount.trim(),
      caseCount: draft.caseCount.trim() || undefined,
      spotlightNotes: draft.spotlightNotes.trim() || undefined,
      budgetRange: draft.budgetRange as ShackpackBuilderSpec['budgetRange'],
      designNotes: draft.designNotes.trim(),
      timeline: draft.timeline ? draft.timeline : undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const builderSpec = buildSpec();
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          subject: 'custom-build',
          message: draft.additionalNotes.trim() || '',
          caseTypes: [],
          builderSpec,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : 'Could not send your build request. Please try again or email us.'
        );
        return;
      }
      setDone(true);
    } catch {
      setError('Could not send your build request. Please try again or email us.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-green-500/30 bg-green-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold text-green-300">Request received</h2>
        <p className="mt-3 text-slate-300">
          Thanks for your custom ShackPack details. Our team will review your build and reach out
          shortly. Custom series are finalized with you directly — nothing is binding until we agree
          in writing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-gold px-5 py-2 font-medium text-black hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (i < step) setStep(i);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              i === step
                ? 'bg-gold text-black'
                : i < step
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-800 text-slate-500'
            }`}
            disabled={i > step}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass} htmlFor="productLine">
                What are you looking to create? *
              </label>
              <select
                id="productLine"
                className={inputClass}
                value={draft.productLine}
                onChange={(e) =>
                  update('productLine', e.target.value as Draft['productLine'])
                }
              >
                <option value="">Select one</option>
                {(Object.keys(PRODUCT_LINE_LABELS) as ShackpackBuilderSpec['productLine'][]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {PRODUCT_LINE_LABELS[k]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="inspiration">
                Inspiration (optional)
              </label>
              <select
                id="inspiration"
                className={inputClass}
                value={draft.inspiration}
                onChange={(e) =>
                  update('inspiration', e.target.value as Draft['inspiration'])
                }
              >
                <option value="">No preference — surprise me</option>
                {(
                  Object.keys(INSPIRATION_LABELS) as NonNullable<
                    ShackpackBuilderSpec['inspiration']
                  >[]
                ).map((k) => (
                  <option key={k} value={k}>
                    {INSPIRATION_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-slate-400">
              Custom ShackPack lines (Flex, Expo, Currency Clash, and similar) are configured with
              our team — this wizard helps us understand your goals before we follow up.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass} htmlFor="packCount">
                How many packs (or rough quantity)? *
              </label>
              <input
                id="packCount"
                className={inputClass}
                value={draft.packCount}
                onChange={(e) => update('packCount', e.target.value)}
                placeholder="e.g. 50 packs, 3 cases of 10, TBD"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="caseCount">
                Cases / production runs (optional)
              </label>
              <input
                id="caseCount"
                className={inputClass}
                value={draft.caseCount}
                onChange={(e) => update('caseCount', e.target.value)}
                placeholder="e.g. 2 sealed cases, one pilot run"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass} htmlFor="spotlightNotes">
                Featured highlights (optional)
              </label>
              <textarea
                id="spotlightNotes"
                rows={4}
                className={inputClass}
                value={draft.spotlightNotes}
                onChange={(e) => update('spotlightNotes', e.target.value)}
                placeholder="Coins or cards you want emphasized in the lineup, themes, chase-style moments, or grading mix — requests are not guarantees until confirmed by ShackPack."
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="budgetRange">
                Indicative budget range *
              </label>
              <select
                id="budgetRange"
                className={inputClass}
                value={draft.budgetRange}
                onChange={(e) =>
                  update('budgetRange', e.target.value as Draft['budgetRange'])
                }
              >
                <option value="">Select range</option>
                {(Object.keys(BUDGET_LABELS) as ShackpackBuilderSpec['budgetRange'][]).map((k) => (
                  <option key={k} value={k}>
                    {BUDGET_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="timeline">
                Timeline (optional)
              </label>
              <select
                id="timeline"
                className={inputClass}
                value={draft.timeline}
                onChange={(e) =>
                  update('timeline', e.target.value as Draft['timeline'])
                }
              >
                <option value="">Flexible</option>
                {(Object.keys(TIMELINE_LABELS) as NonNullable<ShackpackBuilderSpec['timeline']>[]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {TIMELINE_LABELS[k]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className={labelClass} htmlFor="designNotes">
              Design, branding & artwork direction *
            </label>
            <textarea
              id="designNotes"
              rows={10}
              className={inputClass}
              value={draft.designNotes}
              onChange={(e) => update('designNotes', e.target.value)}
              placeholder="Describe case art direction, logos, colors, typography, packaging finishes, co-branded elements, or reference packs you like. Minimum 20 characters."
            />
            <p className="text-sm text-slate-500">
              Uploads are not supported in this version — we can request artwork after we connect.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
              <p className="font-semibold text-gold">Review</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
                <li>Product: {draft.productLine ? PRODUCT_LINE_LABELS[draft.productLine as ShackpackBuilderSpec['productLine']] : '—'}</li>
                <li>Packs: {draft.packCount || '—'}</li>
                <li>Budget: {draft.budgetRange ? BUDGET_LABELS[draft.budgetRange as ShackpackBuilderSpec['budgetRange']] : '—'}</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First name *
                </label>
                <input
                  id="firstName"
                  className={inputClass}
                  value={draft.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Last name *
                </label>
                <input
                  id="lastName"
                  className={inputClass}
                  value={draft.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  value={draft.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone *
                </label>
                <input
                  id="phone"
                  className={inputClass}
                  value={draft.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="additionalNotes">
                Anything else? (optional)
              </label>
              <textarea
                id="additionalNotes"
                rows={4}
                className={inputClass}
                value={draft.additionalNotes}
                onChange={(e) => update('additionalNotes', e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-md border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-md bg-gold px-6 py-2 font-medium text-black hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-gold px-6 py-2 font-medium text-black hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Submit build request'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
