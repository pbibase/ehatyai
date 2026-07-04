# eHatyai.com — 3 Prompt Styles for Claude Code

All three prompts build the same product from your approved specification (v1.0):
11-step search-first flow, login wall at step 5, business rules BR-1…BR-7, and the
Booking status machine `Draft → Pending-Payment → Confirmed → (Cancelled)`.

They differ in *how they drive Claude Code*:

| | Prompt 1 — Mission Brief | Prompt 2 — CLAUDE.md Spec-Driven | Prompt 3 — TDD User-Story |
|---|---|---|---|
| Style | One-shot narrative build order | Persistent project constitution + phased tasks | Test-first, story by story |
| Best when | You want a working prototype fast in one session | Long multi-session project, resumable, auditable | You want quality gates and regression safety |
| Verification | Run and click through | `npm run check:spec` maps FR → files | Passing test suite per story |

**Tip:** if you have the spec file, drop `App_Specification_eHatyai.docx` (or export
it to `spec.md`) into the repo root before starting — every prompt tells Claude Code
to read it first and treat it as the source of truth.

---

## PROMPT 1 — Mission Brief (one-shot narrative)
*Paste directly into Claude Code in an empty folder. Fast, cinematic, single session.*

```
You are the founding engineer of eHatyai.com, an accommodation booking platform for
Hat Yai / Songkhla, built to the approved App Specification v1.0. If a file named
App_Specification_eHatyai.docx or spec.md exists in this folder, read it first and
treat it as the source of truth. Build the complete working web application now.

STACK
- Next.js 14+ (App Router) + Tailwind CSS, TypeScript.
- Prisma ORM with SQLite for development (schema portable to MySQL for Hostinger
  Node.js hosting later).
- Auth: NextAuth (credentials provider) with email+password and a simulated OTP
  step for new registrations (OTP printed to server console and stored in DB).
- Payment: a mock payment gateway module (lib/payment.ts) with a clean interface
  so a real gateway (card / PromptPay / e-Wallet) can be swapped in later.
- Thai-first UI (Leelawadee UI / Noto Sans Thai font stack) with an EN toggle.
  Prices formatted as ฿ with 2 decimals.

THE FLOW YOU MUST IMPLEMENT (11 steps, search-first)
1 Open app (no login required to browse) → 2 Search (destination, check-in/out,
guests) → 3 Results with iterative filters (price, type, amenities); empty state
suggests adjusting criteria → 4 Select property/room with real-time availability;
"จองเลย" starts a booking → 5 LOGIN WALL: login or register (OTP), and the pending
booking (property, room, dates, guests) MUST survive authentication → 6 Booker
details pre-filled from profile, editable, special requests → 7 Review: full price
breakdown, cancellation policy, promo code with instant recalculation; re-verify
availability and bounce back to step 4 with a notice if the room was taken →
8 Payment: if net amount > 0 choose method and pay via the mock gateway; failed
payments show the reason and allow retry or method change, maximum 3 attempts,
then the booking is held as Pending-Payment and the room hold is released after a
timeout; if net amount = 0 skip payment automatically → 9 Confirm: issue a unique
Booking ID, status = Confirmed → 10 Send confirmation email + SMS (simulate both:
write to a notifications table and print to console) with a check-in QR code →
11 Success page with Booking ID and a "My bookings" link.

HARD BUSINESS RULES
- BR-1 No login prompt may ever appear before "จองเลย" is pressed.
- BR-2 Authentication happens exactly once, at step 5; booking context persists.
- BR-4 Net amount 0 bypasses payment.
- BR-5 Max 3 payment attempts; then Pending-Payment + timed hold release.
- BR-6 Availability checked at step 4 AND re-checked at step 7.
- BR-7 Booking ID issued only after successful payment or zero-amount bypass;
  every confirmation writes email + SMS notification records. Booking ID
  generation must be idempotent per payment.

DATA MODEL (Prisma)
User, Property, RoomType (inventory per date), Booking (status machine:
Draft → Pending-Payment → Confirmed → Cancelled), Payment (attempts counter,
gateway ref), Notification (channel, delivery status), OtpCode.

SEED DATA
12+ properties around Hat Yai and Songkhla (Lee Gardens area, Klong Hae,
Samila Beach, Ton Nga Chang direction), 2–4 room types each, realistic THB
prices, photos as placeholder images, 90 days of inventory. Include one promo
code HATYAI100 (฿100 off) and one FREESTAY100 (100% off) so the zero-amount
bypass is demonstrable.

WORKFLOW
Initialize git. Work in this order, committing after each milestone with clear
messages: scaffold + schema + seed → search & results → property/room selection →
auth with booking persistence → booking review + promo → payment + status machine →
confirmation + notifications + my-bookings → polish (empty states, loading, mobile).
Write a concise README with run instructions and a demo script (happy path + the
three failure paths). Finish by starting the dev server and telling me the demo
credentials and the exact click-path to see all 11 steps.
```

---

## PROMPT 2 — CLAUDE.md Spec-Driven (persistent, phased, auditable)
*Two parts: first create CLAUDE.md (the project constitution Claude Code re-reads
every session), then run phases one at a time. Best for multi-day development.*

**Step A — paste this first:**

```
Create a file named CLAUDE.md in the project root with exactly this content, then
initialize git and commit it. Do not build anything else yet.

--- CLAUDE.md content start ---
# eHatyai.com — Project Constitution

## What this is
Accommodation booking platform for Hat Yai / Songkhla implementing App
Specification v1.0 (spec.md if present). Search-first flow: browsing never
requires login; authentication happens exactly once at the booking step.

## Stack (do not change without asking)
Next.js App Router + TypeScript + Tailwind. Prisma + SQLite (dev), schema must
stay MySQL-compatible for Hostinger Node.js deployment. NextAuth credentials +
simulated OTP. Mock payment gateway behind lib/payment.ts interface.

## The 11-step flow (source of truth)
1 open → 2 search → 3 results+filters(loop) → 4 select room ("จองเลย") →
5 LOGIN WALL (context persists) → 6 booker details → 7 review+promo
(availability re-check) → 8 payment (skip if net=0; max 3 attempts) →
9 Booking ID issued → 10 email+SMS simulated → 11 success page.

## Invariants (never violate)
- BR-1 no auth prompt before step 5.
- BR-2 pending booking survives login/registration.
- BR-4 net=0 ⇒ skip payment automatically.
- BR-5 3 payment attempts max ⇒ Pending-Payment + timed hold release.
- BR-6 availability checked at step 4 and re-checked at step 7.
- BR-7 Booking ID only after payment success or zero-bypass; idempotent per
  payment; every confirmation writes Notification rows (email + SMS).
- Status machine: Draft → Pending-Payment → Confirmed → Cancelled. One central
  transition function; no direct status writes elsewhere.
- Thai-first UI, EN toggle, ฿ prices with 2 decimals, mobile-first.

## Conventions
- Conventional commits (feat:, fix:, chore:), one commit per completed task.
- Every FR implemented gets a line in TRACEABILITY.md: FR-id → file(s) → status.
- Run `npm run lint` and `npm run build` before declaring any phase done.
- Never fabricate data in reports/UI; all totals computed from DB.

## Phase plan
P1 scaffold+schema+seed · P2 search/results (FR-1.x) · P3 selection (FR-2.x) ·
P4 auth+persistence (FR-3.x) · P5 booking+review+promo (FR-4.x) ·
P6 payment+status machine (FR-5.x) · P7 confirmation+notifications+my-bookings
(FR-6.x) · P8 exception flows+polish.
--- CLAUDE.md content end ---
```

**Step B — then run phases with prompts like these (one message per phase):**

```
Execute Phase P1 from CLAUDE.md: scaffold the Next.js project, write the full
Prisma schema (User, Property, RoomType with per-date inventory, Booking,
Payment, Notification, OtpCode), and a seed script with 12+ Hat Yai / Songkhla
properties, 90 days of inventory, and promo codes HATYAI100 (฿100 off) and
FREESTAY100 (100% off). Create TRACEABILITY.md. Verify with `npm run build`,
run the seed, then show me the row counts per table and commit.
```

```
Execute Phase P4 from CLAUDE.md: implement the login wall (FR-3.1..3.3).
Critical acceptance check before you commit: start a booking as an anonymous
user, register a NEW account mid-flow with OTP, and prove (by walking the
session data) that the selected property, room, dates and guest count survived
authentication and land pre-filled on the booker-details page. Update
TRACEABILITY.md and commit.
```

```
Execute Phase P2 from CLAUDE.md: build search and results (FR-1.1..1.3).
Search form with destination autocomplete (Hat Yai / Songkhla areas from seed
data), date-range picker validating check-out > check-in, and guest/room count.
Results list with sorting (price, rating) and iterative filters — price range,
property type, amenities — that can be applied repeatedly (loop 3 ⇄ filters).
Empty state suggests adjusting dates or destination. Acceptance check before
commit: as an ANONYMOUS user, search "หาดใหญ่", apply and change filters 3 times,
confirm results update each time and that NO login prompt appeared anywhere
(BR-1). Update TRACEABILITY.md and commit.
```

```
Execute Phase P3 from CLAUDE.md: property detail and room selection (FR-2.1..2.2).
Property page with photos, description, map placeholder, reviews, and room types
showing per-date availability for the searched dates. "จองเลย" (Book now) is
enabled ONLY when the room has inventory for every night of the stay; sold-out
rooms are dimmed with a "ห้องเต็ม" badge. Pressing "จองเลย" creates a Draft
booking held in session. Acceptance check: pick a room, manually zero its
inventory for one night in the DB, reload — the button must disable (BR-6 first
check). Update TRACEABILITY.md and commit.
```

```
Execute Phase P5 from CLAUDE.md: booker details, review, and promo (FR-4.1..4.3).
Booker form pre-filled from the profile (editable, special-request free text).
Review screen shows the full breakdown — room rate × nights, taxes, fees,
discount, net total in ฿ 2 decimals — plus the cancellation policy. Promo code
field recalculates instantly: HATYAI100 subtracts ฿100, FREESTAY100 makes net = 0.
Availability is RE-verified on entering review; if the room sold out since
selection, notify and return the user to selection (BR-6 second check).
Acceptance check: apply FREESTAY100 and confirm the displayed net total is
฿0.00 and the pay button label changes to "ยืนยันการจอง" (zero-amount path
armed for P6). Update TRACEABILITY.md and commit.
```

```
Execute Phase P6 from CLAUDE.md: payment and the status machine (FR-5.1..5.2).
Implement lib/payment.ts as a mock gateway with a test toggle to force failures.
Methods: card, PromptPay QR, e-Wallet. Wire the ONE central status-transition
function: Draft → Pending-Payment → Confirmed → Cancelled; no direct status
writes anywhere else. Rules: net = 0 skips payment entirely and confirms
directly (BR-4); a failed payment shows the reason and offers retry or method
change, maximum 3 attempts, after which the booking becomes Pending-Payment and
the room hold is released after a timeout (BR-5). Payment must carry an
idempotency key so a double-submit can never confirm twice (BR-7). Acceptance
check: force 3 consecutive failures and show me the booking row in
Pending-Payment with the hold released; then run the FREESTAY100 booking and
show it confirmed with NO payment row. Update TRACEABILITY.md and commit.
```

```
Execute Phase P7 from CLAUDE.md: confirmation, notifications, my bookings
(FR-6.1..6.3). On success: generate a unique Booking ID, set status Confirmed,
write exactly one email Notification row and one SMS Notification row
(simulated: also print both to console), render the success page with Booking
ID, a check-in QR code, and a "My bookings" link. My-bookings lists the
member's bookings with status badges; Pending-Payment bookings show a "resume
payment" action that re-enters step 8. Acceptance check: complete one paid
booking and show me the Booking record, both Notification rows, and the QR
rendering; then confirm the SAME payment replayed with the same idempotency key
creates no second Booking ID (BR-7). Update TRACEABILITY.md and commit.
```

```
Execute Phase P8 from CLAUDE.md: exception flows and polish. Implement the four
exception paths end-to-end: no search results (suggest + return to search),
room unavailable at review (notify + back to selection), payment failed
(retry ≤ 3), OTP expired/not received (resend with cooldown, switch
email ⇄ SMS). Polish: loading states, mobile-first layout audit on the client
pages, EN language toggle, empty states everywhere, and a README with run
instructions plus a demo script covering the happy path and all failure paths.
Acceptance check: run `npm run lint` and `npm run build` clean, then walk me
through the demo script click-path for all 11 steps. Finalize TRACEABILITY.md —
every FR-1.1..6.3 must have a file mapping and status Done — and commit.
```

*(Each phase names its FR ids and one concrete acceptance check. Claude Code
re-reads CLAUDE.md automatically each session, so you can stop and resume any
day without re-explaining the project.)*

---

## PROMPT 3 — TDD User-Story Style (test-first, quality-gated)
*Paste into Claude Code in an empty folder. Slowest but safest: every business
rule is locked in by a failing test before implementation.*

```
Act as a senior product engineer practicing strict TDD. Build eHatyai.com — an
accommodation booking platform for Hat Yai / Songkhla — as a Next.js + TypeScript
+ Prisma/SQLite + Tailwind app with NextAuth (credentials + simulated OTP) and a
mock payment gateway behind an interface. Read spec.md first if it exists.

METHOD — for every story below, in order:
1. Write failing tests first (Vitest for domain logic, Playwright for the flow).
2. Implement the minimum to pass.
3. Refactor, run the FULL suite, commit with the story id in the message.
Never move to the next story with a red suite.

STORY BACKLOG

S1 — Domain core (pure logic, Vitest)
  As the system, I manage a booking status machine and money math.
  - GIVEN any booking, WHEN status changes, THEN only these transitions are
    legal: Draft→Pending-Payment, Draft→Confirmed (zero-amount), Pending-Payment→
    Confirmed, Draft/Pending-Payment→Cancelled; anything else throws.
  - GIVEN room rate, nights, taxes, fees and a promo code, WHEN net is computed,
    THEN totals are exact to 2 decimals; FREESTAY100 yields net = 0.
  - GIVEN a payment succeeds twice with the same idempotency key, THEN exactly
    one Booking ID exists.

S2 — Search without login (Playwright)
  As a guest, I search and filter freely.
  - GIVEN an anonymous visitor, WHEN browsing steps 1–4, THEN no login prompt
    ever appears (assert absence).
  - GIVEN filters applied repeatedly, THEN results update each time (loop 3⇄filters).
  - GIVEN a search with no matches, THEN an empty state suggests adjusting criteria.

S3 — Selection & availability
  - GIVEN a room with zero inventory for the chosen dates, THEN "จองเลย" is
    disabled and the room is marked unavailable.

S4 — Login wall with context persistence
  - GIVEN an anonymous user who pressed "จองเลย", WHEN they register a new
    account (OTP) or log in, THEN they land on booker details with the SAME
    property, room, dates and guests, without re-selecting anything.
  - GIVEN an expired/wrong OTP, THEN resend works with a cooldown.

S5 — Review, promo, re-verification
  - GIVEN a valid promo code, WHEN applied, THEN the breakdown recalculates
    instantly. GIVEN the room sold out between selection and review, THEN the
    user is notified and returned to selection (BR-6).

S6 — Payment gates (BR-4, BR-5)
  - GIVEN net = 0, THEN the payment step is skipped and booking confirms directly.
  - GIVEN the mock gateway is set to fail, WHEN the user retries, THEN after the
    3rd failure the booking becomes Pending-Payment and the room hold is released
    after the timeout.

S7 — Confirmation & notifications (BR-7)
  - GIVEN a successful payment, THEN a unique Booking ID is issued, status is
    Confirmed, exactly one email and one SMS Notification row are written, and
    the success page shows the Booking ID with a QR code and My-bookings link.

S8 — My bookings & polish
  - GIVEN a logged-in member, THEN past and pending bookings are listed with
    status badges; Pending-Payment bookings offer "resume payment".

FIXTURES: seed 12+ Hat Yai / Songkhla properties, 90 days inventory, promo codes
HATYAI100 and FREESTAY100, and one gateway toggle to force failures in tests.
UI: Thai-first with EN toggle, ฿ 2-decimal prices, mobile-first.
DONE = all stories green in one `npm test` run + a README demo script covering
the happy path and all three failure paths.
```

---

## Choosing between them

- Want to *see something tonight*? → **Prompt 1**, single session, commit trail included.
- Building this seriously over days/weeks on Hostinger? → **Prompt 2**; CLAUDE.md keeps every session aligned and TRACEABILITY.md maps your spec's FR ids to code.
- Worried about regressions as features stack up? → **Prompt 3**; BR-2, BR-4, BR-5 and BR-7 become permanent tests that can never silently break.

You can also combine: start with Prompt 2's CLAUDE.md, then use Prompt 3's stories as the phase prompts — that's the strongest setup for a real product.
