# Eventify: Code Review Findings and Roadmap

Result of a code review of the backend (controllers, middleware, routes,
Docker/CI setup) done on 2026-09-27. The frontend was not reviewed in depth.
There are no automated tests yet.

**Verdict:** good as a portfolio / learning project. Not ready for real public
use until the High items are fixed and the operations basics exist.

Tick a box when the item is merged. Suggested workflow: one branch and one pull
request per item (or per small group).

## Suggested order

1. H1 `deleteReview` authorization
2. H2 safe stock decrement in `createOrder`
3. H4 + M2 input validation and consistent login errors
4. O1 + O2 better `/health` and graceful shutdown
5. O3 automated tests, added to CI
6. Deployment (cloud, HTTPS, `secure` cookie) and backups (O4)

## High priority (fix before anyone else uses the app)

- [ ] **H1. Any logged-in user can delete any review.**
  `backend/controllers/reviewController.js`, `deleteReview`: `isAdmin` and
  `isOwner` are computed but never checked before `prisma.review.delete`.
  Fix: return 403 unless `isAdmin || isOwner`.
- [ ] **H2. Tickets can be oversold.**
  `backend/controllers/orderController.js`, `createOrder`: the stock check runs
  before the transaction, so two simultaneous orders for the last ticket can
  both succeed and stock goes negative.
  Fix: inside the transaction, decrement conditionally
  (`updateMany` where `quantity >= requested`) and abort if no row changed.
  Also handle the same `ticketId` listed twice in `orderItems` (currently
  reported wrongly as "ticket does not exist").
- [ ] **H3. No real payment.**
  Orders stay `PENDING` and an admin changes the status by hand. Decide: mock
  payment step, or a real provider (in test mode) before selling anything.
- [ ] **H4. Weak login security.**
  - No rate limiting on `/api/auth/login` (brute force). Add
    `express-rate-limit`.
  - Different messages for wrong email vs wrong password (account
    enumeration). Use one message for both.
  - No validation of email format or password length in `register`.
  - Auth cookie uses `secure: false`. Must be `true` behind HTTPS (make it
    depend on `NODE_ENV`).

## Medium priority

- [ ] **M1. Deleting an event or ticket that has related rows returns a
  generic 500.** The schema has no delete rules (foreign keys restrict).
  Fix: friendly error, or cascade rules via a new Prisma migration.
- [ ] **M2. Missing input validation** on events and tickets: negative price,
  quantity or capacity; an invalid date becomes `Invalid Date` and gives a 500;
  total ticket quantity is not capped by event capacity.
  Frontend: `CreateEventPage.jsx` shows a validation error but does not
  `return`, so the request is still sent.
- [ ] **M3. `updateTicket` copy-paste bug:** the second check is
  `if (!ticket)` but should be `if (!event)`; a missing event crashes the
  handler.
- [ ] **M4. `updateOrderStatus`:** validate `status` against the `OrderStatus`
  enum (bad value gives a 500) and return the updated order, not just the
  status string.
- [ ] **M5. No pagination:** `listEvents` (and other lists) return every row.

## Operations / SRE

- [ ] **O1. Better `/health`.** It reports ok even when Postgres is down. Add a
  DB check (for example `SELECT 1`), and consider separate liveness and
  readiness endpoints.
- [ ] **O2. Graceful shutdown.** Handle `SIGTERM`: stop accepting requests,
  close the HTTP server and disconnect Prisma. Add `helmet` for security
  headers and structured (JSON) request logging.
- [ ] **O3. Automated tests.** None exist, so CI only proves the code compiles
  and lints. Start with API tests for auth, orders and permissions; run them in
  the `ci.yml` workflow.
- [ ] **O4. Backups and reliability.** Scheduled `pg_dump`, a tested restore,
  container resource limits, and do not publish the database port outside
  local development.
- [ ] **O5. Secrets hygiene.** The old `JWT_SECRET` and DB password are in the
  public git history of `main`. Always use new values in `.env` and in any cloud
  secret store; rotate if in doubt.
- [ ] **O6. Deployment.** Cloud host, HTTPS, domain, environment secrets, and a
  deploy step in CI.
- [ ] **O7. Observability.** Metrics (for example Prometheus + Grafana),
  dashboards and alerts, then a deliberate failure drill with a short
  postmortem.

## Small cleanups (low priority)

- [ ] Rename `backend/controllers/eventCrontroller.js` (typo) and update the
  import in `eventRoutes.js`.
- [ ] Remove unused imports: `PrismaClientKnownRequestError` and
  `warnEnvConflicts` in `eventCrontroller.js`, `{ hash }` in
  `authController.js`.
- [ ] Unused endpoints: `GET /api/reviews/all` and `GET /api/tickets/all`
  (kept on purpose for now).
- [ ] `Review.ticketId` is never set (needs a migration to remove).
- [ ] `backend/package.json`: `"main": "index.js"` does not exist; `dev` and
  `start` are identical.
- [ ] Docker: drop the redundant `npm ci --omit=dev` in the backend Dockerfile
  runtime stage (its `node_modules` is overwritten by the copy from the build
  stage anyway).
- [ ] Leftover: an old nested `backend/.git` folder (rename or delete it so
  editors stop showing a second repository).
- [ ] Mixed Romanian/English code comments (cosmetic).

## Done so far

- Removed the unused Cloudinary upload feature and dead files.
- Docker: migrations on startup, secrets in `.env`, DB healthcheck, frontend
  nginx container, `"type": "module"` in the backend.
- CI with GitHub Actions and branch protection on `main`.
- README and `.env.example` files.
- Fixed the `EVENT_PLANENR` role typo on the delete-event route.
