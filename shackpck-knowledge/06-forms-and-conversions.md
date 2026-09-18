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

**Spam handling.** An off-screen honeypot input and a minimum fill time: the client sends `elapsedMs`, measured with `performance.now()` from mount, and anything under 3 s is flagged. Client-measured elapsed time is used rather than a wall-clock load timestamp, so a visitor whose device clock is off is not flagged. *Superseded 2026-09-17 (see below): the honeypot was renamed, and flagged submissions are now saved instead of dropped.*

**Pre-fill params** (unknown values ignored; any BUYING pre-fill opens on buying step 1):
- `?line=coins|sports|pokemon` → Buying packs, that line selected.
- `?product=<catalog id>` → Buying packs, that product's line and the product selected, `sourcePack` set. Only purchasable ids are recognised.
- `?branding=yes` → Buying packs, custom branding = Yes.

#### 2026-09-17 — Spam handling keeps suspected rows (`ce57686`)

**What happened.** The owner submitted real inquiries on prod twice (the second signed out, in Chrome). Both showed the success screen, no email arrived, and no `ContactInquiry` row existed. Postgres logs showed no failed insert and `pg_stat_statements` no site insert, so the route never reached the save: the submissions were dropped by the spam check. The honeypot was `companyWebsite`, labelled "Company website", and Chrome address autofill filling it is the most likely cause (Netlify function logs, which name the check that tripped, were not reachable to confirm).

**Honeypot now.** `id`/`name` `hp_field_x`, label "Leave this empty", `autocomplete="off"`, `data-1p-ignore` (1Password), `data-lpignore="true"` (LastPass), `data-form-type="other"` (Dashlane). Still positioned off-screen (not `display:none`), `tabIndex -1`, inside an `aria-hidden` wrapper.

**Flagged submissions are saved, never silently dropped.** A filled honeypot or a submission under 3 s is saved with `emailSent = false` and `emailError = 'spam-suspected: honeypot'` or `'spam-suspected: too-fast'` (honeypot wins if both), no email is sent, and the visitor gets the normal `{ ok: true }` success body. The server logs `Spam-suspected (<check>): saved inquiry <id>, email skipped.`; the honeypot's value is never logged, since autofill can put a real visitor's details in it. Review suspected leads with `emailError LIKE 'spam-suspected:%'`.

#### 2026-09-17 — Contact rate limit (`fea53f3`)

`/api/contact` allows **5 requests per 10 minutes per IP** (Upstash, `lib/rate-limit.ts`). The check runs first, before validation, spam checks and the save, so invalid and spam-suspected posts count too, and a blocked request saves nothing. Over the limit: `429` with `Retry-After` and `{ error: 'Too many submissions, try again shortly.' }`, which the form shows as its error. The limiter fails open, so an Upstash outage never blocks a submission. Credentials sign-in has its own limit (10 per 10 minutes per IP and per email), and the sign-in page shows "Too many attempts, try again in a few minutes.".

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

#### 2026-09-17 — Builder save fixes (`07d442c`, `742edd1`)

Six things the builder got wrong, each verified broken on dev first and then re-verified fixed (18 checks).

- **A draft no longer dies at the sign-in gate.** Signing in is a full page navigation, so the in-memory draft was lost — while the modal promised the opposite. The draft is now stashed in `sessionStorage` under `shackpack:builder:draft:v2:<build id or "new">` when the gate opens, restored on return (with a notice), and cleared on a successful save or submit. The gate's "Create account" link went to `/auth/signin`; it now goes to `/auth/register`, and both links carry `pathname + search`, so signing in while editing `/build?id=…` returns to **that** build. `/auth/register` honors `?callbackUrl=` through `safeRedirectPath`.
- **Unsaved changes are visible and warned about.** An "Unsaved changes" chip appears next to Save, and a `beforeunload` handler asks for confirmation while dirty. Dirty is a comparison against the state a save would have written (`lib/builder/draft-state`), so re-renders and whitespace do not count as edits. Chrome only shows the native prompt after real user interaction; the dev check asserts the page cancels a `beforeunload` event instead.
- **A failed `?id=` load can no longer create a junk build.** Loading has explicit states (loading / signed-out / not-found / error). Any failure renders a card with "Start a new build" and "My builds" (plus Sign in or Try again) instead of an editable blank draft, whose Save used to create a second, unrelated build. A build belonging to someone else is indistinguishable from a missing one.
- **Save and submit are click-safe.** Three fast clicks on Save created three builds: the `disabled` attribute only applies after a re-render. Both now hold an in-flight ref checked at the top of the handler.
- **Submit is atomic and rate limited.** The route used to email first and set `SUBMITTED` second, so two concurrent submits both emailed the team. It now claims the submit with `updateMany` where `status != 'SUBMITTED'` (0 rows -> 409), sends, and releases the claim if the send fails so a genuine retry still works. It is also rate limited to **5 per hour per user id** (not per IP), returning 429 with a friendly message.
- **A failed artwork upload leaves nothing behind.** Uploading first creates a build to get an id; when the upload then failed, that build was orphaned. `ensureBuildId` now reports whether it created the build, and a failed upload deletes it again. `/build` passes the real `isArtworkStorageAvailable()` into the uploader, so an environment without Netlify Blobs says so instead of failing late.
- **Structure:** `BuilderShell` went from 533 lines to ~320 by moving state into `useBuilderDraft` / `useBuilderPersistence` and the header and failure card into their own components. Every builder file is under 500 lines. Fixture: `scripts/test-builder-draft.ts` (44 checks).

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
