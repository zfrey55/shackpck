import type { ProductLine } from '@/lib/product-lines';
import { INQUIRY_LINES, INQUIRY_LINE_LABELS } from '@/lib/contact-inquiry';
import { US_STATES } from '@/lib/us-states';
import { ContactDetailsFields } from './ContactDetailsFields';
import { ChoiceGroup, SelectField, TextField } from './fields';
import type { StepProps } from './step-props';

/** Buying step 1: who you are, and which product lines you want. */
export function AboutStep(props: StepProps & { onToggleLine: (line: ProductLine) => void }) {
  const { form, errors, set, onToggleLine } = props;
  return (
    <div className="space-y-6">
      <ContactDetailsFields form={form} errors={errors} set={set} phoneOptional={false} />
      <TextField id="businessName" label="Business name" autoComplete="organization" value={form.businessName} onChange={(v) => set('businessName', v)} error={errors.businessName} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField id="whatnotHandle" label="Whatnot handle" optional value={form.whatnotHandle} onChange={(v) => set('whatnotHandle', v)} error={errors.whatnotHandle} />
        <SelectField
          id="state"
          label="State"
          placeholder="Select a state"
          value={form.state}
          onChange={(v) => set('state', v)}
          options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
          error={errors.state}
        />
      </div>
      <ChoiceGroup
        name="productLines"
        legend="Product lines (choose at least one)"
        multiple
        columns={3}
        options={INQUIRY_LINES.map((l) => ({ value: l, label: INQUIRY_LINE_LABELS[l] }))}
        selected={form.productLines}
        onToggle={(v) => onToggleLine(v as ProductLine)}
        error={errors.productLines}
      />
    </div>
  );
}
