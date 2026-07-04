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
