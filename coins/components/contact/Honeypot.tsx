import { HONEYPOT_FIELD } from '@/lib/contact-inquiry';

/**
 * Spam trap. Moved off-screen rather than display:none, which some bots skip;
 * out of the tab order and hidden from assistive tech, so a person never fills
 * it. A filled value flags the submission as spam-suspected: it is still saved,
 * but no email is sent.
 *
 * Everything here exists to keep autofill out. The field used to be named
 * "companyWebsite" / "Company website", and Chrome address autofill filled it
 * for real visitors. Now it has a meaningless name and label, autocomplete off,
 * and the opt-out attributes 1Password (data-1p-ignore), LastPass
 * (data-lpignore) and Dashlane (data-form-type="other") honor.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        data-1p-ignore=""
        data-lpignore="true"
        data-form-type="other"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
