# Sales Reimbursement — Delivery Roadmap

A build plan for the remaining work, **split by the tool best suited to each job**:
**Google AI Studio** (fast visual/UI generation) vs **Claude Code** (backend, the model
adapter, cross-file integration, and verification against the real server).

Every item below carries a **ready-to-paste prompt** and an **acceptance checklist**.
Sources: `AUDIT.md` (functional findings 1–19 + UX-1…UX-8), `PRODUCTION-PASS.md` (P0–P2).

---

## How to use this

1. Pick an item from **Track A** or **Track B**.
2. Paste its prompt into the matching tool.
3. Tick the checklist before calling it done.
4. Items marked **⇄ handoff** are two-part: AI Studio makes the *look*, Claude Code
   *wires it to the real API*. Do the AI Studio half first, then hand the component to
   Claude Code with the paired prompt.

### Which tool for which job

| | **Google AI Studio** | **Claude Code** |
|---|---|---|
| Strength | Generating and restyling UI fast from a description | Reasoning across files, backend + adapter logic, verifying behavior |
| Knows the real backend? | **No** — it works from the mock UI only | **Yes** — it owns `server.ts`, `lib/api.ts`, `AppContext` |
| Give it | Self-contained screens, components, visual/interaction/styling changes, empty/loading/error visuals, accessibility & responsive polish | Anything touching the API, the snake↔camel adapter, status mapping, data wiring, pagination, auth, currency, tests |
| Don't give it | Data wiring, API calls, status/workflow rules, pagination logic, auth | Pure visual exploration where you want lots of design options fast |

> **Golden rule:** if the task is "make it *look* like X" → **AI Studio**. If it's "make it
> *actually do* X against the server" → **Claude Code**. When both are true, it's a
> **⇄ handoff**.

### Legend

- `[ ]` not started · `[~]` in progress · `[x]` done
- **⇄ handoff** — needs both tools · **↔ ref** — source finding

---

# Track A — Google AI Studio (presentation & UX)

> AI Studio edits the React/Tailwind UI from the mock version. It does **not** know the
> real API, so keep these prompts about *appearance and interaction only*. Wiring to live
> data is Track B. Where a component needs real data, build it against props/placeholder
> data and leave a `// TODO(claude): wire to API` marker.

### A1 · Approval Queue: make actions discoverable `[ ]`  ↔ UX-5
Quick-action buttons only appear on hover (`opacity-0 group-hover:opacity-100`), so they're
invisible until you mouse over the row and unusable on touch.

**Prompt:**
> In `src/pages/approver/ApprovalQueue.tsx`, the Approve/Return/Reject buttons in each table
> row are hidden until hover (`opacity-0 group-hover:opacity-100`). Make them always visible.
> Also make the whole row read as "click to review" — add a visible affordance (a right
> chevron and a subtle hover highlight) and keep the existing row click that navigates to the
> claim detail. Keep the button styling and the current dark/light theming. Don't change any
> data or handlers.

**Checklist:**
- [ ] Approve/Return/Reject visible without hovering, on desktop and touch
- [ ] Row shows a clear "open for review" affordance (chevron + hover state)
- [ ] Existing row-click-to-detail still works; button clicks don't double-trigger it
- [ ] No handler/logic/data changes

### A2 · Minutes-of-Meeting detail screen `[ ]`  ⇄ handoff · ↔ UX-2
There is no MOM detail view; a MOM row currently jumps to the *claim*. Design the screen
(Track B wires it — see **B13**).

**Prompt:**
> Create a new `src/pages/shared/MomDetail.tsx` presentational screen for a single Minutes of
> Meeting. Use the existing card/typography components and theming. Lay out: a header
> (client/company, meeting date & time, status badge), a details grid (purpose, location,
> contact person + email, meeting type), a Discussion section, participants (internal /
> external) as chips, and an "Attached document" panel that shows a file preview when a MOM
> was uploaded (embed a PDF/image viewer area; show a "Download" button and a graceful
> "no file attached" empty state). Build it against a typed `mom` prop with placeholder data
> and add `// TODO(claude): wire to real MOM + file URL`. Make it responsive.

**Checklist:**
- [ ] New `MomDetail.tsx` renders all MOM fields from a `mom` prop
- [ ] File panel: viewer area + Download + "no file" empty state
- [ ] Responsive; matches app theming (light/dark)
- [ ] Marked `TODO(claude)` for data wiring; no API calls invented

### A3 · Per-role Notifications / Inbox screen `[ ]`  ⇄ handoff · ↔ UX-4
Every role should have its own inbox of the mail the system already generates. Design the
shell (Track B wires it to the outbox — see **B15**).

**Prompt:**
> Create `src/pages/shared/Notifications.tsx` — an in-app inbox. Left: a scrollable list of
> messages (subject, snippet, timestamp, unread dot). Right: the selected message's full body
> in a reading pane. Include unread styling, a "mark all read" button, a search box, and empty
> state. Build against a `messages` prop (id, subject, body, timestamp, read) with placeholder
> data; add `// TODO(claude): wire to /api/outbox for the current user`. Match theming; make it
> responsive (list collapses above the reading pane on mobile).

**Checklist:**
- [ ] List + reading-pane layout, unread indicators, search, mark-all-read, empty state
- [ ] Driven by a `messages` prop; no invented endpoints
- [ ] Responsive + themed
- [ ] `TODO(claude)` marker present

### A4 · Settings: Notifications & Security tab content `[ ]`  ↔ #17
Both tabs are placeholders ("Settings for … can be configured here").

**Prompt:**
> In `src/pages/shared/Settings.tsx`, replace the placeholder Notifications and Security tabs
> with real form UI. Notifications: toggles for email/in-app per event type (submitted,
> approved, returned, ready-for-claim, delegation). Security: change-password fields (UI only)
> and a sessions/"sign out everywhere" section. Use existing inputs/toggles and theming. UI
> only — add `// TODO(claude): persist settings` where a save would call the API.

**Checklist:**
- [ ] Notifications tab: grouped, labeled toggles
- [ ] Security tab: password fields + sessions section (UI only)
- [ ] Consistent with Profile/Delegation tabs; themed
- [ ] `TODO(claude)` where persistence belongs

### A5 · Error boundary fallback UI `[ ]`  ↔ P1 #9
One thrown error white-screens the whole app. Design the recoverable fallback (Track B adds
the boundary itself — see **B23-group**).

**Prompt:**
> Create `src/components/shared/ErrorFallback.tsx` — a friendly, centered card shown when a
> route errors: icon, "Something went wrong" heading, short reassurance, a "Try again" button
> (calls an `onReset` prop) and a collapsible technical detail (`error.message`). Themed and
> responsive. Presentational only.

**Checklist:**
- [ ] Reusable `ErrorFallback` with `error` + `onReset` props
- [ ] "Try again" + collapsible detail; themed/responsive
- [ ] No routing/boundary logic (that's Track B)

### A6 · Shared empty / loading / error states `[ ]`  ↔ P2 #17
Dashboards and a few pages handle these ad hoc.

**Prompt:**
> Create a small set of presentational state components in `src/components/shared/states/`:
> `Skeleton` (table + card variants), `EmptyState` (icon, title, description, optional action),
> `ErrorState` (retry). Match theming. Then show, in a comment block, how a page would swap its
> ad-hoc skeleton for these. Presentational only.

**Checklist:**
- [ ] `Skeleton`, `EmptyState`, `ErrorState` components, themed
- [ ] Usage example included; no data logic

### A7 · Accessibility & responsive pass `[ ]`  ↔ P2 #16, #22
**Prompt:**
> Do an accessibility + responsive pass on the shared layout and dense tables. Add
> `aria-label`s to icon-only buttons (filter, more-options, notification bell, sidebar toggle),
> ensure visible `:focus-visible` states, check status-chip color contrast (WCAG AA), and make
> wide tables scroll inside their own container so the page body never scrolls horizontally on
> mobile. Visual/markup only — no behavior changes.

**Checklist:**
- [ ] Icon-only buttons have accessible labels
- [ ] Visible focus states; AA contrast on status chips
- [ ] Tables scroll in-container on mobile; no body horizontal scroll
- [ ] No behavior/data changes

---

# Track B — Claude Code (backend, adapter & integration)

> These touch `server.ts`, `src/lib/api.ts` (the snake↔camel + status adapter), and
> `AppContext`, and are verified live against the running server. Prompts are written to be
> pasted into Claude Code in this repo.

### B1 · Deep-link the submit wizard by `?type=` `[ ]`  ↔ UX-7
`RequestorDashboard` links to `/claims/new?type=advance`, but `SubmitClaim` ignores the param
and always opens the type picker.

**Prompt:**
> In `src/pages/shared/SubmitClaim.tsx`, read a `?type=` query param on mount
> (`advance`→Cash Advance, `liquidation`→Liquidation, `reimbursement`/absent→Reimbursement).
> When present, preselect `claimType` and skip step 0 straight to step 1. Update the dashboard
> links if needed so the labels match. Verify each entry point lands on the right flow.

**Checklist:**
- [ ] `?type=advance` and `?type=liquidation` skip the picker into the right flow
- [ ] No param → unchanged (type picker)
- [ ] Verified from RequestorDashboard buttons
- [ ] `tsc` clean

### B2 · Wire My Requests search + status filter `[ ]`  ↔ #12
Search box and status dropdown are decorative (no `onChange`).

**Prompt:**
> In `src/pages/shared/ClaimsList.tsx`, wire the search box and status dropdown to actually
> filter the list (mirror the working pattern in `MOMs.tsx`). Search matches ref/purpose;
> status filters by `ClaimStatus`. Keep it client-side for now. Verify with an account that
> has many claims.

**Checklist:**
- [ ] Search filters by ref + purpose
- [ ] Status dropdown filters live
- [ ] Empty-result state shown
- [ ] `tsc` clean; verified in browser

### B3 · Server-side pagination + filtering + clickable rows `[ ]`  ↔ UX-1, P1 #8
Every long list renders all rows (reads as infinite scroll), most rows aren't clickable, and
filters are missing. Do the biggest offenders first.

**Prompt:**
> Add pagination + filtering to the heaviest lists, server-side. Start with Audit Log
> (`/api/history`), System Emails (`/api/outbox`), and Claims. For each: add `page`, `pageSize`,
> and filter/search query params to the server route; update `lib/api.ts` to pass them; replace
> the client-side `.slice()` with real paging controls; and make each row clickable to a detail
> view (Audit Log → entry detail or highlight; System Emails → the message; Transaction History
> → the claim). Also add missing type/status filters. Verify counts and paging against the
> server at demo volumes.

**Checklist:**
- [ ] Audit Log, System Emails, Claims paginate + filter server-side
- [ ] Rows clickable to the right detail
- [ ] `lib/api.ts` passes paging/filter params; no client-side full-list slicing
- [ ] Verified against live server (page boundaries, filter results)

### B4 · Real dashboard KPIs (all four roles) `[ ]`  ↔ #5, #6, #7, #8
Admin dashboard is 100% static; the others mix real counts with hardcoded fiction.

**Prompt:**
> Replace hardcoded dashboard numbers with values computed from `useAppContext()`:
> - **Admin** (`admin/AdminDashboard.tsx`): user count, claim counts by status, recent
>   `/api/history`. Remove the fake System Health panel and invented audit rows.
> - **Approver** (`approver/ApproverDashboard.tsx`): scope "Awaiting Approval"/"Total Managed"
>   to this approver's queue; drop or compute the invented metrics; wire the type-filter pills
>   (#14).
> - **Custodian** (`custodian/CustodianDashboard.tsx`): compute Missing Receipts and Oldest
>   Item from claims; delete the "FinFlow AI" card; make Export a real CSV or remove it.
> - **Requestor** (`requestor/RequestorDashboard.tsx`): derive Unliquidated Float and
>   Liquidation Progress from the user's cash advances; remove dead trends.
> Verify each figure against API state by role-switching.

**Checklist:**
- [ ] No hardcoded KPI literals remain on any dashboard
- [ ] Approver counts scoped to their queue; type pills work (#14)
- [ ] Fake cards/health/AI removed; exports real or gone
- [ ] Each number cross-checked against `/api/*` per role

### B5 · Review-meeting response loop `[ ]`  ↔ #9
Calendar is read-only; server exposes confirm/decline/reschedule + an approver schedule feed.

**Prompt:**
> Wire the review-meeting scheduling loop. In `shared/Calendar.tsx` (and pending-claim views),
> add confirm / decline / propose-new-time actions calling the server's review-meeting routes,
> and surface the approver schedule feed. Map statuses through `lib/api.ts`
> (`REVIEW_MEETING_STATUS` already exists). Verify an approver can confirm/decline/reschedule
> and the requestor sees the result.

**Checklist:**
- [ ] Confirm / decline / reschedule wired to real routes
- [ ] Approver schedule feed surfaced
- [ ] Status mapping via the adapter; verified both sides

### B6 · Resubmit a returned claim `[ ]`  ↔ #10
`PUT /api/claims/:id/resubmit` exists and is unused; a Returned claim is a dead end.

**Prompt:**
> On a Returned claim the current user owns, add "Revise & Resubmit" in `shared/ClaimDetail.tsx`
> that lets them edit and call `PUT /api/claims/:id/resubmit`, then refresh. Verify a returned
> claim can be corrected and re-enters the approver queue.

**Checklist:**
- [ ] "Revise & Resubmit" shown only to owner on Returned claims
- [ ] Calls resubmit route; claim re-enters approval
- [ ] Verified end-to-end

### B7 · Stale-approver / transfer / reassign `[ ]`  ↔ #11
The "Stale Approvals" banner is a mock filter; backend has transfer/reassign/fallback.

**Prompt:**
> Wire the org-change system in `approver/ApprovalQueue.tsx`: replace the mock "Review Stale
> Claims" with real transfer-approver and admin-reassign actions, and add the admin
> fallback-escalation trigger. Use the existing server routes. Verify a stale claim can be
> transferred/reassigned and leaves the stale set.

**Checklist:**
- [ ] Transfer + reassign wired; admin fallback trigger present
- [ ] Stale banner reflects real state
- [ ] Verified with a stale claim

### B8 · Receipt Archive real upload `[ ]`  ↔ #13
"Upload to Archive" creates an in-memory object URL that vanishes on reload.

**Prompt:**
> In `shared/Receipts.tsx`, make "Upload to Archive" send the file to `POST /api/upload` and
> persist a real reference (or remove the standalone upload if there's no home for it). No more
> object-URL-only uploads. Verify the uploaded receipt survives a reload.

**Checklist:**
- [ ] Upload hits `/api/upload`; reference persists
- [ ] Survives reload; or standalone upload cleanly removed
- [ ] Verified

### B9 · Transaction History real dates & columns `[ ]`  ↔ #15
Completion Date renders `new Date()` for every row; release code / payment ref hidden.

**Prompt:**
> In `custodian/TransactionHistory.tsx`, use each claim's real processing/completion date
> instead of `new Date()`, and surface the release code and payment reference the custodian
> recorded. Verify against claim data.

**Checklist:**
- [ ] Real per-row completion date
- [ ] Release code + payment reference shown
- [ ] Verified

### B10 · Kill toast-only "mock action" buttons `[ ]`  ↔ #16, UX-6
Filter, more-options, "Generate Weekly Report", "Submit Reports Now", "Export Report" fire a
success toast and do nothing.

**Prompt:**
> Audit the dashboards and queues for buttons that only fire a success toast (Generate Weekly
> Report, Submit Reports Now, Export Report, filter/more-options icons). For each: implement it
> for real (e.g. Export → real CSV) or remove it. A control that fakes success must not ship.

**Checklist:**
- [ ] Every toast-only control implemented or removed
- [ ] Exports produce real files
- [ ] No "success" without a real effect

### B11 · Gate the fake dashboard skeleton `[ ]`  ↔ #18
`pages/Dashboard.tsx` runs an 800 ms `setTimeout` skeleton on every mount though data is in
memory.

**Prompt:**
> In `pages/Dashboard.tsx`, remove the artificial 800 ms `setTimeout` skeleton and gate the
> skeleton on the context's real loading flag instead.

**Checklist:**
- [ ] No artificial delay; skeleton tied to real loading
- [ ] Dashboards render immediately when data is present

### B12 · Remove non-persisting context setters `[ ]`  ↔ #19
`setClaims`/`setMoms`/`setLineItems` mutate local state the next refresh overwrites — a trap.

**Prompt:**
> In `components/AppContext.tsx`, remove the leftover mock-era setters (`setClaims`, `setMoms`,
> `setLineItems`, etc.) or funnel them through server calls + `refresh()`. Update callers.
> Verify nothing relies on optimistic local mutation that the refresh silently reverts.

**Checklist:**
- [ ] Dead setters removed or routed through the server
- [ ] Callers updated; `tsc` clean
- [ ] No silent local-only mutations remain

### B13 · Wire MomDetail (integrate A2) `[ ]`  ⇄ handoff · ↔ UX-2
**Prompt:**
> Integrate the `MomDetail.tsx` screen from AI Studio (A2): add a `/moms/:id` route, wire it to
> real MOM data from context, and make the attached-file panel show the real uploaded document
> via `uploadUrl()` (image/PDF inline, download otherwise). Change the MOMs list so a row opens
> the MOM detail (not the claim). Verify with MOMs that have and lack a file.

**Checklist:**
- [ ] `/moms/:id` renders real MOM data
- [ ] Uploaded file viewable/downloadable via `uploadUrl()`
- [ ] MOMs list row → MOM detail
- [ ] Verified both with/without a file

### B14 · Merge approver Dashboard + My Requests `[ ]`  ↔ UX-3
**Prompt:**
> For the approver role, consolidate the requestor-style Dashboard and My Requests into a single
> "My Requests" module (so an approver who also submits sees one place). Keep the Approval Queue
> separate. Adjust routing/sidebar for the approver role only. Verify other roles are unchanged.

**Checklist:**
- [ ] Approver sees one merged "My Requests"; Approval Queue intact
- [ ] Other roles unaffected
- [ ] Sidebar/routes updated; verified per role

### B15 · Wire per-role Notifications (integrate A3) `[ ]`  ⇄ handoff · ↔ UX-4
**Prompt:**
> Integrate the `Notifications.tsx` inbox from AI Studio (A3): wire it to `/api/outbox` scoped
> to the current user, mark-read via the existing outbox read endpoint, add it to each role's
> sidebar, and hook the top-bar bell to the unread count. Verify each role sees only its own mail
> and unread state persists.

**Checklist:**
- [ ] Inbox shows the current user's mail; mark-read persists
- [ ] In every role's nav; bell reflects unread count
- [ ] Verified per role

### B16 · Custodian action wording / step `[ ]`  ↔ UX-8 · **needs decision**
Product owner asked whether "Generate Release Code" should be a "Review" step.

**Prompt:**
> Decision needed first: should the custodian's "Generate Release Code" action stay as-is, be
> relabeled "Review", or become a distinct review step before code generation? Once decided,
> align the button label and the underlying step name in `custodian/CustodianDashboard.tsx` /
> `ProcessingQueue.tsx` accordingly, keeping the release-code anti-fraud flow intact.

**Checklist:**
- [ ] Decision recorded (relabel vs new step)
- [ ] Label + step name aligned; release-code flow intact
- [ ] Verified

### B17 · Currency → Philippine Pesos everywhere `[ ]`  ↔ P1 #6, UX ("change to PHP")
UI formats money as `$` while the backend runs in PHP.

**Prompt:**
> The UI shows `$` but the backend is in PHP. Introduce one money formatter
> (`Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`) and replace every
> hardcoded `$`/`.toFixed(2)` money render across the app with it. Store currency explicitly.
> Verify amounts read as PHP everywhere (dashboards, lists, detail, wizard, receipts).

**Checklist:**
- [ ] Single formatter used app-wide; no hardcoded `$`
- [ ] All money surfaces show PHP
- [ ] `tsc` clean; spot-checked across pages

### B-PROD · Production hardening (P0 → P1) `[ ]`  ↔ PRODUCTION-PASS
The load-bearing backend work, in dependency order. Each is its own Claude Code session.

**Prompts (one per line item):**
- **P0-1 Auth:** "Replace `X-User-Id` header trust with real sessions behind SSO (OIDC/SAML,
  Entra ID per the old design). Derive the user server-side from the session in every route's
  `getUser`; never trust a client header."
- **P0-2 Role switcher:** "Remove the dev role-switcher from `components/layout/Topbar.tsx`;
  role comes from the authenticated account. Optionally keep it behind an env flag for local dev."
- **P0-3 Database:** "Introduce a persistent datastore (schema + migrations + data-access layer)
  and swap the module-level in-memory arrays for repository calls behind the existing route
  handlers, keeping the API surface unchanged."
- **P0-4 File storage:** "Move uploads to object storage (S3/Azure Blob) with private ACLs and
  short-lived signed URLs; enforce that the requester is authorized for the claim a receipt
  belongs to."
- **P0-5 Secrets/config:** "Move all secrets to env/secret manager, add per-environment config,
  document required vars, and fail fast on startup if one is missing."
- **P1-7 HTTP security:** "Add `helmet`, a locked-down CORS allow-list, rate limiting on auth +
  mutation routes, a JSON body-size limit, and server-side validation on every write route."
- **P1-9 Error boundaries:** "Wrap routes in an error boundary using the `ErrorFallback` from A5
  so one bad page can't white-screen the app; report the error."
- **P1-10 Real email:** "Replace the mock console email transport with SMTP or Microsoft Graph,
  with retry/queueing; keep the in-app outbox as the audit copy."
- **P1-11 Strict mode:** "Enable TypeScript `strict` (at least `strictNullChecks` +
  `noImplicitAny`), fix the fallout, keep `tsc --noEmit` green."
- **P1-12 Tests + CI:** "Add unit tests for the `lib/api.ts` adapter (snake↔camel + status
  mapping) and an e2e smoke of the core loop (submit→approve→disburse); run both in CI."
- **P1-13 Validation/concurrency:** "Once on a DB, wrap multi-step writes in transactions and add
  optimistic-concurrency (`updated_at`/version) checks so stale edits are rejected."

**Checklist (per item):**
- [ ] Behavior verified against a running instance
- [ ] API surface unchanged unless intended
- [ ] `tsc` clean; no secret committed
- [ ] Doc/README updated where deploy steps change

> **P2 tail** (do after launch, see `PRODUCTION-PASS.md` #14–#23): optimistic refetch, live
> queue counts (SSE/poll), bulk actions, observability (logging/Sentry/`/healthz`), prune
> unused deps + self-host fonts, real PDF/CSV export, mobile QA, centralized date formatting.

---

# Suggested sequence (interleaved milestones)

Each milestone mixes a little Track A and Track B so the app improves visibly each round.

### M1 — Quick wins (½–1 day)  `[ ]`
- [ ] A1 Approval actions visible
- [ ] B1 `?type=` deep-link
- [ ] B2 My Requests filter
- [ ] B11 Kill fake dashboard delay
- [ ] B16 Custodian wording (get the decision)

### M2 — Truthful dashboards & lists  `[ ]`
- [ ] B4 Real dashboard KPIs (all four)
- [ ] B10 Remove toast-only buttons
- [ ] B3 Server-side pagination + clickable rows
- [ ] A6/A7 Shared states + a11y/responsive pass

### M3 — Close the workflow gaps  `[ ]`
- [ ] A2 → B13 MOM detail + viewable file
- [ ] A3 → B15 Per-role notifications
- [ ] B5 Review-meeting loop
- [ ] B6 Resubmit returned claim
- [ ] B7 Stale-approver/transfer
- [ ] B8 Receipt archive upload · B9 Transaction history · B14 Approver module merge

### M4 — Correctness & polish  `[ ]`
- [ ] B17 Currency → PHP
- [ ] A4 Settings tabs · A5 → error boundary (P1-9)
- [ ] B12 Remove dead context setters

### M5 — Production hardening (launch-blocking)  `[ ]`
- [ ] P0-1 Auth → P0-2 Role switcher → P0-3 DB
- [ ] P0-4 Storage · P0-5 Secrets · P1-7 Security middleware
- [ ] P1-11 Strict · P1-12 Tests+CI · P1-13 Validation/concurrency · P1-10 Real email
- [ ] P2 tail

---

## Cross-reference

| Roadmap | Source finding |
|---|---|
| A1 / B... | UX-5 |
| A2, B13 | UX-2 |
| A3, B15 | UX-4 |
| A4 | AUDIT #17 |
| A5, P1-9 | PRODUCTION-PASS #9 |
| A6 | AUDIT #17 / PP #17 |
| A7 | PP #16, #22 |
| B1 | UX-7 |
| B2 | AUDIT #12 |
| B3 | UX-1, PP #8 |
| B4 | AUDIT #5–#8, #14 |
| B5 | AUDIT #9 |
| B6 | AUDIT #10 |
| B7 | AUDIT #11 |
| B8 | AUDIT #13 |
| B9 | AUDIT #15 |
| B10 | AUDIT #16, UX-6 |
| B11 | AUDIT #18 |
| B12 | AUDIT #19 |
| B14 | UX-3 |
| B16 | UX-8 |
| B17 | PP #6 |
| B-PROD | PP P0 #1–#5, P1 #7,#9–#13 |

_The four 🔴 Broken items from AUDIT.md are already fixed (2026-07-28) and are not in this
roadmap._
