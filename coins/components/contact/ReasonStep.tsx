import { INQUIRY_REASONS, REASON_LABELS } from '@/lib/contact-inquiry';
import { ChoiceGroup } from './fields';
import type { StepProps } from './step-props';

export function ReasonStep({ form, errors, set }: StepProps) {
  return (
    <ChoiceGroup
      name="reason"
      legend="What can we help with?"
      options={INQUIRY_REASONS.map((r) => ({ value: r, label: REASON_LABELS[r] }))}
      selected={form.reason ? [form.reason] : []}
      onToggle={(v) => set('reason', v as (typeof INQUIRY_REASONS)[number])}
      error={errors.reason}
      columns={3}
    />
  );
}
