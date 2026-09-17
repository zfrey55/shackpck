import {
  CUSTOM_BRANDING,
  CUSTOM_BRANDING_LABELS,
  TIMELINES,
  TIMELINE_LABELS,
  type CustomBranding,
  type Timeline,
} from '@/lib/contact-inquiry';
import { ChoiceGroup, TextAreaField, TextField } from './fields';
import type { StepProps } from './step-props';

/** Buying step 3. No label or placeholder here names a price or a range. */
export function PreferencesStep({ form, errors, set }: StepProps) {
  return (
    <div className="space-y-6">
      <ChoiceGroup
        name="customBranding"
        legend="Custom branding for your business"
        columns={3}
        options={CUSTOM_BRANDING.map((v) => ({ value: v, label: CUSTOM_BRANDING_LABELS[v] }))}
        selected={form.customBranding ? [form.customBranding] : []}
        onToggle={(v) => set('customBranding', v as CustomBranding)}
        error={errors.customBranding}
      />
      <TextField
        id="targetPricePerCase"
        label="Target price per case"
        optional
        placeholder="Tell us what you have in mind"
        value={form.targetPricePerCase}
        onChange={(v) => set('targetPricePerCase', v)}
        error={errors.targetPricePerCase}
      />
      <ChoiceGroup
        name="timeline"
        legend="Timeline"
        columns={3}
        options={TIMELINES.map((v) => ({ value: v, label: TIMELINE_LABELS[v] }))}
        selected={form.timeline ? [form.timeline] : []}
        onToggle={(v) => set('timeline', v as Timeline)}
        error={errors.timeline}
      />
      <TextAreaField
        id="message"
        label="Additional details"
        optional
        placeholder="Anything else we should know"
        value={form.message}
        onChange={(v) => set('message', v)}
        error={errors.message}
      />
    </div>
  );
}
