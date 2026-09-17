'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ProductLine } from '@/lib/product-lines';
import type { LineDetail, ProductsByLine } from '@/lib/contact-inquiry';
import { AboutStep } from './AboutStep';
import { Honeypot } from './Honeypot';
import { LineDetailsStep } from './LineDetailsStep';
import { PreferencesStep } from './PreferencesStep';
import { ReasonStep } from './ReasonStep';
import { SimpleInquiryStep } from './SimpleInquiryStep';
import {
  BUYING_STEPS,
  buildPayload,
  initialFromParams,
  toggleLine,
  validateStep,
  type Errors,
  type Step,
} from './inquiry-state';
import type { SetField } from './step-props';

const NEXT: Partial<Record<Step, Step>> = { about: 'lines', lines: 'preferences' };
const BACK: Partial<Record<Step, Step>> = { about: 'reason', lines: 'about', preferences: 'lines', simple: 'reason' };
const GENERIC_ERROR = 'Something went wrong. Please try again or email us directly.';

/**
 * The /contact form. Step 0 picks a reason; Buying packs runs three steps,
 * Existing order and Other go straight to a short form. Rendered inside
 * <Suspense> by the page because it reads the URL for pre-fill.
 */
export function ContactWizard({ productsByLine }: { productsByLine: ProductsByLine }) {
  const searchParams = useSearchParams();
  const [initial] = useState(() => initialFromParams(searchParams, productsByLine));
  const [form, setForm] = useState(initial.state);
  const [step, setStep] = useState<Step>(initial.step);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  // Monotonic time since the form mounted; the server drops anything under 3s.
  const loadedAt = useRef<number | null>(null);
  useEffect(() => {
    loadedAt.current = performance.now();
  }, []);
  const topRef = useRef<HTMLDivElement>(null);

  const clearErrors = (...keys: string[]) =>
    setErrors((prev) => {
      if (!keys.some((k) => k in prev)) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  const set: SetField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearErrors(key);
  };

  const onToggleLine = (line: ProductLine) => {
    setForm((prev) => toggleLine(prev, line, productsByLine));
    clearErrors('productLines');
  };

  const onLineChange = (line: ProductLine, patch: Partial<LineDetail>) => {
    setForm((prev) => ({
      ...prev,
      lineDetails: { ...prev.lineDetails, [line]: { ...prev.lineDetails[line]!, ...patch } },
    }));
    clearErrors(...Object.keys(patch).map((field) => `lines.${line}.${field}`));
  };

  const goTo = (next: Step) => {
    setErrors({});
    setSubmitError('');
    setStep(next);
    topRef.current?.scrollIntoView({ block: 'start' });
  };

  const isFinal = step === 'preferences' || step === 'simple';

  const advance = () => {
    const found = validateStep(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (step === 'reason') goTo(form.reason === 'BUYING' ? 'about' : 'simple');
    else if (NEXT[step]) goTo(NEXT[step]!);
  };

  const submit = async () => {
    const found = validateStep(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const elapsedMs = loadedAt.current === null ? 0 : Math.round(performance.now() - loadedAt.current);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form, elapsedMs)),
      });
      if (response.ok) {
        setDone(true);
        topRef.current?.scrollIntoView({ block: 'start' });
        return;
      }
      const data = await response.json().catch(() => ({}));
      setSubmitError(typeof data.error === 'string' ? data.error : GENERIC_ERROR);
    } catch {
      setSubmitError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isFinal) void submit();
    else advance();
  };

  if (done) {
    return (
      <div ref={topRef} data-contact-success className="mt-8 rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-400">Thanks, we got your message</h2>
        <p className="mt-2 text-green-300">
          {form.reason === 'BUYING'
            ? 'Our team will review your inquiry and reach out by email.'
            : "We'll get back to you by email as soon as we can."}
        </p>
      </div>
    );
  }

  const buyingIndex = BUYING_STEPS.indexOf(step);

  return (
    <div ref={topRef} className="mt-8 scroll-mt-24">
      {buyingIndex >= 0 && (
        <p className="mb-4 text-sm text-slate-400" data-step-indicator>
          Step {buyingIndex + 1} of {BUYING_STEPS.length}
        </p>
      )}
      <form onSubmit={onSubmit} noValidate className="relative space-y-6" data-step={step}>
        <Honeypot value={form.honeypot} onChange={(v) => set('honeypot', v)} />

        {step === 'reason' && <ReasonStep form={form} errors={errors} set={set} />}
        {step === 'about' && <AboutStep form={form} errors={errors} set={set} onToggleLine={onToggleLine} />}
        {step === 'lines' && (
          <LineDetailsStep form={form} errors={errors} productsByLine={productsByLine} onLineChange={onLineChange} />
        )}
        {step === 'preferences' && <PreferencesStep form={form} errors={errors} set={set} />}
        {step === 'simple' && <SimpleInquiryStep form={form} errors={errors} set={set} />}

        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-300" role="alert">
            Please fix the highlighted fields.
          </p>
        )}
        {submitError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4" role="alert">
            <p className="text-sm text-red-300">{submitError}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {BACK[step] && (
            <button
              type="button"
              onClick={() => goTo(BACK[step]!)}
              className="rounded-md border border-slate-600 px-6 py-3 font-medium text-slate-200 hover:border-slate-400"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-md bg-gold px-6 py-3 font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            {isFinal ? (submitting ? 'Sending…' : 'Submit') : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}
