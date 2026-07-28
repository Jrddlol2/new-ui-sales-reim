# Sales Reimbursement System

A sales-expense reimbursement app — reimbursements, cash advances, liquidations,
minutes-of-meeting, approvals, and disbursement. A polished React UI on a ported Express
backend that holds all state in memory and auto-seeds a year of demo data on startup.

> **Prototype status:** the backend is in-memory and auth is a mock `X-User-Id` header.
> This is a working demo, not production. See [`docs/PRODUCTION-PASS.md`](docs/PRODUCTION-PASS.md).

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev        # Express + Vite on http://localhost:3000, auto-seeds on startup
npm run lint       # tsc --noEmit (note: not strict mode)
```

Switch roles with the top-bar dropdown, or in the browser console:
`localStorage.setItem('mockUserId','u4'); location.reload()` (u4 = Admin, u13 = Requestor,
u3 = Custodian, u2/u14/u16/u18 = Approvers).

## Deploy to Vercel

This repo is configured for Vercel via [`vercel.json`](vercel.json):

- The Vite frontend is built by `npm run vercel-build` and served as static assets.
- `/api/*` and `/uploads/*` are routed to a single serverless function
  ([`api/index.ts`](api/index.ts)) that runs the full Express app from `server.ts`.

```bash
# with the Vercel CLI
vercel            # preview
vercel --prod     # production
```
Or import the GitHub repo at vercel.com and deploy — no build config needed.

> **⚠️ Demo-deploy caveats (by design, not bugs):**
> - **State does not persist.** The backend is in-memory; every serverless cold start
>   re-seeds fresh and concurrent instances don't share state. Fix = a real database
>   (`docs/PRODUCTION-PASS.md` #3).
> - **Uploads don't persist.** Serverless filesystems are read-only outside `/tmp`
>   (`docs/PRODUCTION-PASS.md` #4).
> - **Auth is mock.** Anyone can switch roles (#1, #2).
>
> Good enough to click through the flows; not for real data.

## Architecture

The old backend and the new UI model the domain differently; `src/lib/api.ts` is the
adapter that bridges them (snake↔camel, three claim entities → one unified `Claim`, three
status enums → one). Start with [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md).

```
app/
├─ server.ts                 ← ported Express backend (in-memory, auto-seeds); exports createApp()
├─ api/index.ts              ← Vercel serverless entry (drives createApp)
├─ vercel.json               ← build + routing for Vercel
├─ src/
│  ├─ lib/api.ts             ← THE ADAPTER: transport + model + status mapping + mutations
│  ├─ components/AppContext.tsx  ← server-backed global state
│  └─ pages/                 ← requestor/ approver/ custodian/ admin/ shared/
└─ docs/
   ├─ PROJECT-CONTEXT.md     ← orientation & gotchas — read first
   ├─ AUDIT.md               ← functional findings (4 Broken items fixed) + UX review
   ├─ PRODUCTION-PASS.md     ← production-readiness items (P0/P1/P2)
   └─ ROADMAP.md             ← delivery plan split across Google AI Studio / Claude Code
```

## Roadmap

Remaining work is planned in [`docs/ROADMAP.md`](docs/ROADMAP.md), split by the tool best
suited to each job (Google AI Studio for UI, Claude Code for backend/integration), with a
copy-paste prompt and acceptance checklist per item.
