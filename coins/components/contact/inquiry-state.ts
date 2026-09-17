/**
 * Contact form state, step validation, URL pre-fill and payload building.
 * Plain functions with no React, so the wizard stays about rendering.
 */

import type { ProductLine } from '@/lib/product-lines';
import {
  CUSTOM_PRODUCT,
  INQUIRY_LINES,
  isInquiryLine,
  type CustomBranding,
  type InquiryReason,
  type LineDetail,
  type ProductsByLine,
  type Timeline,
} from '@/lib/contact-inquiry';

export type Step = 'reason' | 'about' | 'lines' | 'preferences' | 'simple';

/** The three BUYING steps, in order, for the "Step N of 3" indicator. */
export const BUYING_STEPS: Step[] = ['about', 'lines', 'preferences'];

export type FormState = {
  reason: InquiryReason | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  whatnotHandle: string;
  state: string;
  productLines: ProductLine[];
  lineDetails: Partial<Record<ProductLine, LineDetail>>;
  customBranding: CustomBranding | '';
  targetPricePerCase: string;
  timeline: Timeline | '';
  message: string;
  sourcePack: string | null;
  honeypot: string;
};

/** Field key -> message. Line fields use `lines.<line>.<field>`. */
export type Errors = Record<string, string>;

export function emptyState(): FormState {
  return {
    reason: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    whatnotHandle: '',
    state: '',
    productLines: [],
    lineDetails: {},
    customBranding: '',
    targetPricePerCase: '',
    timeline: '',
    message: '',
    sourcePack: null,
    honeypot: '',
  };
}

/**
 * A fresh block for a newly selected line. A line with no purchasable products
 * offers only "Custom / not sure", so that single option starts selected.
 */
function newLineDetail(line: ProductLine, byLine: ProductsByLine): LineDetail {
  return {
    products: byLine[line].length === 0 ? [CUSTOM_PRODUCT] : [],
    packsPerSet: '',
    setsPerMonth: '',
  };
}

/** Select or deselect a line. Deselecting keeps its answers in case it comes back. */
export function toggleLine(state: FormState, line: ProductLine, byLine: ProductsByLine): FormState {
  if (state.productLines.includes(line)) {
    return { ...state, productLines: state.productLines.filter((l) => l !== line) };
  }
  return {
    ...state,
    productLines: INQUIRY_LINES.filter((l) => l === line || state.productLines.includes(l)),
    lineDetails: {
      ...state.lineDetails,
      [line]: state.lineDetails[line] ?? newLineDetail(line, byLine),
    },
  };
}

type Params = { get(name: string): string | null } | null;

/**
 * Pre-fill from the URL. Unknown values are ignored.
 *   ?line=coins|sports|pokemon  -> BUYING, that line selected
 *   ?product=<catalog id>       -> BUYING, its line and that product, sourcePack
 *   ?branding=yes               -> BUYING, custom branding = Yes
 * Any BUYING pre-fill opens on the first buying step.
 */
export function initialFromParams(params: Params, byLine: ProductsByLine): { state: FormState; step: Step } {
  let state = emptyState();

  const line = params?.get('line');
  if (isInquiryLine(line)) {
    state = toggleLine({ ...state, reason: 'BUYING' }, line, byLine);
  }

  const product = params?.get('product');
  const productLine = product
    ? INQUIRY_LINES.find((l) => byLine[l].some((p) => p.id === product)) ?? null
    : null;
  if (product && productLine) {
    if (!state.productLines.includes(productLine)) {
      state = toggleLine(state, productLine, byLine);
    }
    const detail = state.lineDetails[productLine]!;
    state = {
      ...state,
      reason: 'BUYING',
      sourcePack: product,
      lineDetails: { ...state.lineDetails, [productLine]: { ...detail, products: [product] } },
    };
  }

  if (params?.get('branding') === 'yes') {
    state = { ...state, reason: 'BUYING', customBranding: 'YES' };
  }

  return { state, step: state.reason === 'BUYING' ? 'about' : 'reason' };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function required(errors: Errors, key: string, value: string, message: string) {
  if (!value.trim()) errors[key] = message;
}

function contactErrors(errors: Errors, state: FormState, phoneRequired: boolean) {
  required(errors, 'firstName', state.firstName, 'Enter your first name.');
  required(errors, 'lastName', state.lastName, 'Enter your last name.');
  if (!EMAIL_RE.test(state.email.trim())) errors.email = 'Enter a valid email address.';
  if (phoneRequired) required(errors, 'phone', state.phone, 'Enter a phone number.');
}

export function validateStep(step: Step, state: FormState): Errors {
  const errors: Errors = {};
  switch (step) {
    case 'reason':
      if (!state.reason) errors.reason = 'Choose what you are contacting us about.';
      break;
    case 'about':
      contactErrors(errors, state, true);
      required(errors, 'businessName', state.businessName, 'Enter your business name.');
      required(errors, 'state', state.state, 'Choose your state.');
      if (state.productLines.length === 0) errors.productLines = 'Choose at least one product line.';
      break;
    case 'lines':
      for (const line of state.productLines) {
        const d = state.lineDetails[line];
        if (!d || d.products.length === 0) errors[`lines.${line}.products`] = 'Choose at least one product.';
        if (!d?.packsPerSet) errors[`lines.${line}.packsPerSet`] = 'Choose packs per set.';
        if (!d?.setsPerMonth) errors[`lines.${line}.setsPerMonth`] = 'Choose sets per month.';
      }
      break;
    case 'preferences':
      if (!state.customBranding) errors.customBranding = 'Choose an option.';
      if (!state.timeline) errors.timeline = 'Choose a timeline.';
      break;
    case 'simple':
      contactErrors(errors, state, false);
      required(errors, 'message', state.message, 'Enter a message.');
      break;
  }
  return errors;
}

/** The POST body for /api/contact. Only selected lines are sent. */
export function buildPayload(state: FormState, elapsedMs: number) {
  const common = {
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    honeypot: state.honeypot,
    elapsedMs,
  };
  if (state.reason !== 'BUYING') {
    return { reason: state.reason, ...common, phone: state.phone, message: state.message };
  }
  const lineDetails: Partial<Record<ProductLine, LineDetail>> = {};
  for (const line of state.productLines) lineDetails[line] = state.lineDetails[line];
  return {
    reason: 'BUYING' as const,
    ...common,
    phone: state.phone,
    businessName: state.businessName,
    whatnotHandle: state.whatnotHandle,
    state: state.state,
    productLines: state.productLines,
    lineDetails,
    customBranding: state.customBranding,
    targetPricePerCase: state.targetPricePerCase,
    timeline: state.timeline,
    message: state.message,
    ...(state.sourcePack ? { sourcePack: state.sourcePack } : {}),
  };
}
