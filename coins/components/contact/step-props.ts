import type { Errors, FormState } from './inquiry-state';

/** Every step edits the one form state through this setter, which also clears that field's error. */
export type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

export type StepProps = {
  form: FormState;
  errors: Errors;
  set: SetField;
};
