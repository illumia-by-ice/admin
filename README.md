# Illumia City Empire: admin panel

Next.js 15 (App Router), shadcn/ui, React Query.

## Setup

```sh
cp .env.example .env      # NEXT_PUBLIC_API_URL = the API base URL
npm install
npm run dev               # http://localhost:3000
```

The API must allow this origin: add it to the API's `ADMIN_ORIGINS` (e.g. `http://localhost:3000` for local development).

| Script | |
|---|---|
| `npm run dev` | Development server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js rules). Errors fail the build; warnings don't |
| `npm run build` | Production build. Fails on type or lint errors |

Dependencies are managed with pnpm (`pnpm install`).

## Sign-in

Admins sign in with email and password and get a short-lived access token plus a refresh token. Expired access tokens are renewed automatically. If renewal fails, the admin is sent back to the login page. Logging out revokes the session on the server.

## Roles

The sidebar and action buttons follow the signed-in admin's role (from `GET /admin/me`). The API enforces the same rules either way.

| Role | Can |
|---|---|
| Super admin | Everything, including changing settings |
| Finance | Plans, rent top-ups, wallets, withdrawals, orders, subscription plans, run jobs. Can't change settings |
| Support | View plans and wallets, manage orders, users and content |

## Money pages

| Page | What it's for |
|---|---|
| Reports | Collections, plans started, amount financed, wallet money in/out and marketplace sales over 7 days to 12 months, plus overdue money by age and current KPIs. Every chart has a table view and CSV download |
| Installment plans | BNPL / SNBL / RNSL plans, with queues for approvals, overdue plans and cancellation requests. The detail page has the schedule, payments, history and the actions for each product (approve, reject, cancel, release, record an offline payment, waive a late fee, add a note) |
| Rent top-ups | Rent applications: documents, landlord details, approve and pay the landlord, retry a failed payout, mark as paid manually, reject |
| Orders | Marketplace orders (ship, deliver, cancel and refund) and order settings |
| Wallets | Balances, holds, cards and transactions. Freeze, credit or debit (a second admin approves large ones), reverse an entry, re-check a pending top-up. Also the ledger check, Paystack webhooks and wallet settings |
| Withdrawals | Approve, reject or mark manual payouts as paid |
| Subscription plans | Create and edit plans and their limits, archive or restore, and subscription refunds |
| Finance settings | Pricing and rules per product, late payments and limits, category and product overrides, and the settings a product actually gets |
| Scheduled jobs | Last run of each job, and "run now" |

Charts use shadcn/ui charts (Recharts) with three colour-vision-safe series colours, `--chart-1` to `--chart-3` in `app/globals.css`, set separately for light and dark.

Money from the API is in kobo; the panel shows naira. Settings changes ask for a reason, which goes into the audit log.
