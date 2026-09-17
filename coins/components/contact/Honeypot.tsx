import { HONEYPOT_FIELD } from '@/lib/contact-inquiry';

/**
 * Spam trap. Moved off-screen rather than display:none, which some bots skip;
 * out of the tab order, autocomplete off, and hidden from assistive tech, so a
 * person never fills it. A filled value makes the server drop the submission.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label htmlFor={HONEYPOT_FIELD}>Company website</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
