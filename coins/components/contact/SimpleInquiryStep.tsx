import { ContactDetailsFields } from './ContactDetailsFields';
import { TextAreaField } from './fields';
import type { StepProps } from './step-props';

/** Existing order and Other: contact details and a message. */
export function SimpleInquiryStep({ form, errors, set }: StepProps) {
  return (
    <div className="space-y-6">
      <ContactDetailsFields form={form} errors={errors} set={set} phoneOptional />
      <TextAreaField
        id="message"
        label="Message"
        placeholder={form.reason === 'ORDER' ? 'Your order details and question' : 'How can we help?'}
        value={form.message}
        onChange={(v) => set('message', v)}
        error={errors.message}
      />
    </div>
  );
}
