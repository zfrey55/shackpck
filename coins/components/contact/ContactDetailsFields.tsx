import { TextField } from './fields';
import type { StepProps } from './step-props';

/** Name, email and phone, shared by the buying path and the short form. */
export function ContactDetailsFields({ form, errors, set, phoneOptional }: StepProps & { phoneOptional: boolean }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField id="firstName" label="First name" autoComplete="given-name" value={form.firstName} onChange={(v) => set('firstName', v)} error={errors.firstName} />
        <TextField id="lastName" label="Last name" autoComplete="family-name" value={form.lastName} onChange={(v) => set('lastName', v)} error={errors.lastName} />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={(v) => set('email', v)} error={errors.email} />
        <TextField id="phone" label="Phone" type="tel" autoComplete="tel" optional={phoneOptional} value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} />
      </div>
    </>
  );
}
