# Shackpck **12/10** implementation plan

**12/10** here means: not just “shipped,” but **production-grade** — live payments and webhooks, FedEx in production when approved, correct auth and secrets, **automated CI**, clear runbooks, and a short list of operational habits (monitoring, backups, smoke tests). It is intentionally **stricter than a typical 10/10 launch list**.

This document is the single source of truth for that bar. Update checkboxes as you complete work.

---

## Scorecard (pillars)

| Pillar | Target | Status |
|--------|--------|--------|
| **Revenue** | Stripe **live** keys, live webhook + `STRIPE_WEBHOOK_SECRET`, test order | ⬜ |
| **Fulfillment** | FedEx **production** credentials + smoke label | ⬜ |
| **Auth** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`; no auth 500s in prod | ⬜ |
| **Data** | `DATABASE_URL` prod; migrations or documented `db push` process; backup tested | ⬜ |
| **CI** | PR/push: lint + build + DB schema apply (see `.github/workflows/ci.yml`) | ✅ started |
| **Secrets** | No secrets in git; Netlify prod vs preview env scoped | ⬜ |
| **Observability** | Netlify function errors reviewed; Stripe webhook failures visible | ⬜ |
| **Checklist UX** | Per-date series labels (`Series #1`, `#2`, …) | ✅ |

---

## Phase A — Repository & CI (12/10 foundation)

| # | Task | Owner |
|---|------|--------|
| A1 | **GitHub Actions** — `lint` + `prisma db push` + `build` on Postgres (`.github/workflows/ci.yml`) | ✅ |
| A2 | **ESLint** — `extends: next/core-web-vitals`; `react/no-unescaped-entities` off (copy-heavy pages); hooks as **warn** | ✅ |
| A3 | **`.gitignore`** — `.env`, `.env.*`, `coins/.env*` (never commit secrets) | ✅ |
| A4 | Optional: add `coins/.env.example` mirroring `env.production.template` for local onboarding | ⬜ |
| A5 | Gradually reduce `react-hooks/exhaustive-deps` warnings (no rush; CI stays green) | ⬜ |

---

## Phase B — Stripe live (revenue path)

Detail: `STRIPE_PRODUCTION_SETUP.md`, `VERIFY_STRIPE_LIVE.md`, vars in `env.production.template`.

| # | Task |
|---|------|
| B1 | Netlify **Production**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_…`), `STRIPE_SECRET_KEY` (`sk_live_…`) |
| B2 | Stripe **Live** webhook → `https://<primary-domain>/api/webhooks/stripe` |
| B3 | Endpoint signing secret → `STRIPE_WEBHOOK_SECRET` (`whsec_…`); redeploy |
| B4 | Small real payment → order created in DB |
| B5 | Webhook-only path: idempotent handling if the browser never returns |
| B6 | Dashboard: Radar, descriptor, refund process documented |

---

## Phase C — FedEx production (fulfillment path)

Detail: `FEDEX_PRODUCTION_SETUP.md`.

| # | Task |
|---|------|
| C1 | Sandbox: PDF + ZPL 4×6, scan/read barcodes |
| C2 | FedEx developer validation / approval |
| C3 | Production client id/secret + account (+ meter if required) |
| C4 | Netlify: all `FEDEX_*` + `FEDEX_ENVIRONMENT=production` |
| C5 | One production smoke label; confirm tracking/billing |
| C6 | Runbook: key rotation, who has portal access, what to log when label API fails |

---

## Phase D — 12/10 operations (ongoing)

| # | Task |
|---|------|
| D1 | **Contact** — `SENDGRID_API_KEY`, `FROM_EMAIL` (verified sender), `ADMIN_EMAIL` in prod |
| D2 | **Netlify** — watch Functions error rate after deploys |
| D3 | **Stripe** — webhook delivery dashboard after deploys |
| D4 | **Database** — provider backup; one restore drill per year |
| D5 | **Smoke cadence** (e.g. quarterly): checkout + webhook, `/contact`, FedEx label |
| D6 | **Cleanup** — ~~decide fate of `checklist-backup`~~ (deleted with the public test/debug surfaces); clear stale TODOs |
| D7 | **Assets** — replace placeholder pack art when ready |

---

## Phase E — Daily checklist (shackpck.com)

**Done:** User selects series type → date → cards titled **`{short label} Series #1`**, **`#2`**, … for that date; full date in the page header. Order is stable (`caseId` sort). **No inventory API change required** unless internal pack order must differ from `caseId` order (then expose a sort field and sort by it).

---

## Execution order (recommended)

1. **Phase A** — keep CI green on every PR (**in progress → maintain**).
2. **Phase B** — Stripe live (unblocks real revenue).
3. **Phase C** — FedEx prod in parallel with FedEx support where needed.
4. **Phase D** — fold in alongside B/C; do not defer secrets and auth.

---

## References in repo

- `.github/workflows/ci.yml`
- `coins/env.production.template`
- `coins/STRIPE_PRODUCTION_SETUP.md`, `coins/VERIFY_STRIPE_LIVE.md`
- `coins/FEDEX_PRODUCTION_SETUP.md`
- `netlify.toml` — security headers
- `coins/app/checklist/` — checklist UI + `api.ts` (inventory Cloud Functions)
