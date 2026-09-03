# 06 — Forms & Conversions

## Forms on the site

### 1. Contact / inquiry form — primary lead path
- **UI:** `components/ContactForm.tsx` (rendered on `/contact`).
- **Fields:** firstName, lastName, email, phone, subject (select: general / order / coin-info / shipping / other), message, **caseTypes** (multi-checkbox of pack/series interest, list hardcoded in the component).
- **Submit:** POST `/api/contact` → `lib/email.ts` `sendContactInquiryEmail` → **SendGrid** email to `ADMIN_EMAIL`.
- **Validation:** client `required` attrs; server-side **Zod** (`contactSchema`) in `app/api/contact/route.ts`. Returns 503 if SendGrid env vars missing, 400 on invalid input.
- No CAPTCHA/spam protection observed (TBD).

### 2. Checkout (Stripe) — retail purchase path
- **UI:** `app/checkout/page.tsx` (936 lines) — shipping address + Stripe Payment Element. Gated by `isCheckoutEnabled()`.
- **Flow:** `/api/cart/validate` (limits/inventory) → `/api/checkout/create-intent` (Stripe PaymentIntent + shadow user) → payment → `/api/webhooks/stripe` (`payment_intent.succeeded`) and/or `/api/orders` create order → FedEx label + emails → `/checkout/success`.
- **Validation:** Zod + server-side cart validation; pack limit max 5/user/series.

### 3. Account registration
- **UI:** `app/auth/register/page.tsx` → POST `/api/auth/register` → Prisma user (bcrypt), welcome email (SendGrid), `syncUser` push to inventory CRM.

### 4. Sign in
- **UI:** `app/auth/signin/page.tsx` → NextAuth credentials provider. Gated by `isAccountsEnabled()`.

### 5. ShackPack Builder submission
- **UI:** `app/build/` (Builder) → POST `/api/build/[id]/submit` → marks build SUBMITTED + admin notification email. A B2B/custom-order lead path.

### 6. Account sub-forms
- Address create/edit (`/api/user/addresses`), shipping/payment within checkout.

## Conversion paths (visitor → customer/lead)

1. **Lead (wholesale/custom):** browse `/repacks` (brand tabs) → "Contact for Price" → `/contact` form → SendGrid email to admin → manual follow-up.
2. **Lead (custom case):** `/build` designer → submit → admin email.
3. **Retail purchase:** `/series` or `/series/[slug]` → add to cart → `/checkout` (Stripe) → order + FedEx label + confirmation email.
4. **Account creation:** register → loyalty points accrue (1/$ default) → faster future checkout (free shipping for account holders vs $4.99 guest).

## Integrations these forms touch

- **SendGrid** — contact, welcome, order, admin, build emails.
- **Stripe** — checkout/payments.
- **ShackHQ Cloud Functions** — `syncUser` (CRM) on register; `recordPackSale` on order.
- **n8n / external CRM / Gmail pipeline:** none found in this repo. The audit brief mentions an n8n inquiry pipeline — if it exists it is on the **ShackHQ side or via SendGrid inbound**, not in this codebase. TBD - Griff to clarify.

## Notes
- Legacy static `public/contact-form.html` exists but is **unused at runtime** (noted in `netlify.toml`).
