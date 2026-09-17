/**
 * Small form controls for the contact form: labelled inputs with an inline
 * error slot, and checkbox / radio groups.
 */

import clsx from 'clsx';

export const inputClass =
  'mt-1 block w-full rounded-md border bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';

function borderFor(error?: string) {
  return error ? 'border-red-500/70' : 'border-slate-700';
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-300" data-field-error={id}>
      {message}
    </p>
  );
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200">
      {label}
      {optional ? <span className="ml-1 font-normal text-slate-400">(optional)</span> : null}
    </label>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  placeholder?: string;
};

export function TextField({ id, label, value, onChange, error, optional, type = 'text', autoComplete, placeholder }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, borderFor(error))}
      />
      <FieldError id={id} message={error} />
    </div>
  );
}

export function TextAreaField({ id, label, value, onChange, error, optional, placeholder }: Omit<TextFieldProps, 'type' | 'autoComplete'>) {
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <textarea
        id={id}
        name={id}
        rows={5}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, borderFor(error))}
      />
      <FieldError id={id} message={error} />
    </div>
  );
}

type Option = { value: string; label: string };

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: Omit<TextFieldProps, 'type' | 'autoComplete' | 'optional'> & { options: readonly Option[] }) {
  return (
    <div>
      <Label htmlFor={id} label={label} />
      <select
        id={id}
        name={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, borderFor(error))}
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={id} message={error} />
    </div>
  );
}

type ChoiceGroupProps = {
  /** Used as the input name and the error id. */
  name: string;
  legend: string;
  options: readonly Option[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  multiple?: boolean;
  error?: string;
  columns?: 1 | 2 | 3;
};

export function ChoiceGroup({ name, legend, options, selected, onToggle, multiple, error, columns = 2 }: ChoiceGroupProps) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} data-group={name}>
      <legend className="block text-sm font-medium text-slate-200">{legend}</legend>
      <div
        className={clsx(
          'mt-2 grid gap-2',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-3'
        )}
      >
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className={clsx(
                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                checked ? 'border-gold/60 bg-gold/10 text-slate-100' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onToggle(o.value)}
                className="h-4 w-4 border-slate-600 bg-slate-800 text-gold focus:ring-gold"
              />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
      <FieldError id={name} message={error} />
    </fieldset>
  );
}
