# 06 — Forms & Conversions

## Forms on the site

### 1. Contact / inquiry form — primary lead path
- **UI:** `components/contact/` (client tree, `ContactWizard`), rendered by the server page `app/contact/page.tsx`, which passes the catalog-derived product lists as props. The old single-page `components/ContactForm.tsx` is gone. See the 2026-09-16 note below.
- **Submit:** POST `/api/contact` → save a `ContactInquiry` row → `lib/contact-inquiry-email.ts` → **SendGrid** email to `ADMIN_EMAIL`.
- **Validation:** inline per step on the client; server-side **Zod** discriminated union in `lib/contact-inquiry-schema.ts`.

#### 2026-09-16 — Multi-step inquiry form and inquiry storage (`258be87`, tile buttons `811ba5f`)

**Flow.** Step 0 asks the reason: *Buying packs* / *Existing order* / *Other*.
- *Existing order* and *Other*: first name, last name, email, phone (optional), message, submit.
- *Buying packs* runs three steps (with a "Step N of 3" indicator, Back/Next, and inline validation):
  1. first/last name, email, phone, business name, Whatnot handle (optional), US state, product lines (at least one of Coins & Bullion / Sports Cards / Pokemon).
  2. one block per selected line: products (the **purchasable** catalog entries for that line, derived via `lineForCategory`, plus "Not sure, recommend one"; a line with none, Pokemon today, offers only "Custom / not sure", pre-selected), packs per set (Coins 10 / 20 / Custom, Sports and Pokemon 10 / Custom), sets per month (1 / 2-5 / 6-10 / 10+).
  3. custom branding (Yes / No / Maybe), target price per case (optional free text; no dollar figures or ranges in the label or placeholder), timeline (ASAP / Within 30 days / Just exploring), additional details (optional).
- A success screen replaces the form on submit. The hardcoded case-type list and the subject dropdown are gone, and so is the legacy `public/contact-form.html`.

**Storage.** Prisma model `ContactInquiry`: `reason` (enum BUYING / ORDER / OTHER), names, email, `phone?`, `businessName?`, `whatnotHandle?`, `state?`, `productLines String[]`, `lineDetails Json` (per selected line: `{ products[], packsPerSet, setsPerMonth }`; product values are catalog ids or `recommend` / `custom`), `customBranding?` (enum YES / NO / MAYBE), `targetPricePerCase?`, `timeline?`, `message?`, `sourcePack?` (catalog id of the tile the visitor came from), `emailSent`, `emailError?`, indexed on `createdAt`. The route saves first, then emails, then records `emailSent` / `emailError`. A failed save still sends the email, with a SAVE FAILED line and the error class/code in it, and logs server-side. Missing SendGrid config still saves the row (`emailError` names the missing variable) and returns 503. In development the rendered email is logged instead of sent (`emailError = 'dev: logged, not sent'`). The email subject is `New pack inquiry: <business or name> (<lines>)`, or `Order question: <name>` / `General inquiry: <name>`; the body groups every answer by product line using product display names, with source pack, inquiry id and timestamp; Reply-To is the customer.

**Server validation.** Products must be real purchasable catalog ids for their line (plus `recommend`, or only `custom` on an empty line); packs per set must be valid for the line; `lineDetails` must match `productLines` exactly; `sourcePack` must be a purchasable id; state must be a US state code. Invalid input returns 400 and saves nothing.

**Spam handling.** An off-screen honeypot input (`companyWebsite`: positioned off-screen, not `display:none`; `tabIndex -1`, `autocomplete off`, `aria-hidden`) and a minimum fill time: the client sends `elapsedMs`, measured with `performance.now()` from mount, and the server drops anything under 3 s. Client-measured elapsed time is used rather than a wall-clock load timestamp so a visitor whose device clock is off cannot be silently dropped. Both cases return the normal `{ ok: true }` success body and are neither saved nor emailed.

**Pre-fill params** (unknown values ignored; any BUYING pre-fill opens on buying step 1):
- `?line=coins|sports|pokemon` → Buying packs, that line selected.
- `?product=<catalog id>` → Buying packs, that product's line and the product selected, `sourcePack` set. Only purchasable ids are recognised.
- `?branding=yes` → Buying packs, custom branding = Yes.

**Tile buttons.** `lib/purchasable-brands.ts` holds `PURCHASABLE_BRANDS = ['shackpack']` and `isPurchasableBrand()`. ShackPack tiles (coin and card) keep "Contact for Price", now linking to `/contact?line=<line>&product=<id>`. Every other brand, **including Bullion Bureau**, shows a non-clickable "Not available for purchase" label and a "Want your own branded packs? Contact us" link to `/contact?branding=yes`. `RepackCard` now requires a `brand` prop so no tile can default to purchasable. The shared disclaimer is unchanged on every tile.

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

1. **Lead (wholesale/custom):** browse `/repacks` (brand tabs) → ShackPack tile "Contact for Price" (pre-fills line + product) or a customer-brand tile's "Want your own branded packs?" link (pre-fills custom branding) → `/contact` multi-step form → `ContactInquiry` row + SendGrid email to admin → manual follow-up.
2. **Lead (custom case):** `/build` designer → submit → admin email.
3. **Retail purchase:** `/series` or `/series/[slug]` → add to cart → `/checkout` (Stripe) → order + FedEx label + confirmation email.
4. **Account creation:** register → loyalty points accrue (1/$ default) → faster future checkout (free shipping for account holders vs $4.99 guest).

## Integrations these forms touch

- **SendGrid** — contact, welcome, order, admin, build emails.
- **Stripe** — checkout/payments.
- **ShackHQ Cloud Functions** — `syncUser` (CRM) on register; `recordPackSale` on order.
- **n8n / external CRM / Gmail pipeline:** none found in this repo. The audit brief mentions an n8n inquiry pipeline — if it exists it is on the **ShackHQ side or via SendGrid inbound**, not in this codebase. TBD - Griff to clarify.

## Notes
- The legacy static `public/contact-form.html` (a Netlify Forms registration with the old subject and case-type fields) was deleted on 2026-09-16 along with its `netlify.toml` note.
