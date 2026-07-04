# eHatyai.com — Requirements Traceability Matrix

This file tracks the status of implementation for each Functional Requirement (FR) and Hard Business Rule (BR) defined in App Specification v1.0.

## Functional Requirements (FR)

| Requirement ID | Module | Description | Implementation File(s) | Status |
| --- | --- | --- | --- | --- |
| **FR-1.1** | Search | Search form with destination autocomplete, date range picker, guest/room selector | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/page.tsx), [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/properties/route.ts) | Implemented |
| **FR-1.2** | Search | Results list with sorting (price, rating) and iterative filters (price, type, amenities) | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/results/page.tsx) | Implemented |
| **FR-1.3** | Search | Empty-state handling: no results screen with suggestions | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/results/page.tsx) | Implemented |
| **FR-2.1** | Selection | Property detail page: photos, description, room types, prices, reviews, map location | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/properties/[id]/page.tsx) | Implemented |
| **FR-2.2** | Selection | Room availability shown in real time for the searched dates before "จองเลย" is enabled | [PropertyDetailClient.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/properties/[id]/PropertyDetailClient.tsx), [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/properties/[id]/availability/route.ts) | Implemented |
| **FR-3.1** | Auth | Login by email/phone + password; "forgot password" recovery | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx), [auth.ts](file:///c:/Sandbox/Projects/ehatyai/src/lib/auth.ts) | Implemented |
| **FR-3.2** | Auth | Registration with OTP verification (email/SMS); auto-login on success | [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/auth/register/route.ts), [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/auth/otp/verify/route.ts), [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-3.3** | Auth | Session persistence: pending booking context restored after auth | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-4.1** | Booking | Booker details form pre-filled from profile; special-request free text | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-4.2** | Booking | Review screen with full price breakdown and cancellation policy | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-4.3** | Booking | Promo code entry with instant recalculation of net amount | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-5.1** | Payment | Methods: credit/debit card, PromptPay QR, e-Wallet | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **FR-5.2** | Payment | Failure handling per BR-5: retry or change method (max 3 attempts) | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx), [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/bookings/hold-release/route.ts) | Implemented |
| **FR-6.1** | Confirm | Booking ID generation; status transition to Confirmed | [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/bookings/route.ts), [domain.ts](file:///c:/Sandbox/Projects/ehatyai/src/lib/domain.ts) | Implemented |
| **FR-6.2** | Confirm | Email + SMS confirmation with booking summary and QR code; delivery logged | [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/bookings/route.ts) | Implemented |
| **FR-6.3** | Confirm | Success screen with Booking ID and link to "My bookings" | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |

## Hard Business Rules (BR)

| Rule ID | Statement | Implementation File(s) | Status |
| --- | --- | --- | --- |
| **BR-1** | Search-first: steps 1–4 fully usable without authentication | [search.spec.ts](file:///c:/Sandbox/Projects/ehatyai/tests/search.spec.ts), pages/components | Implemented |
| **BR-2** | Login wall placement: auth required exactly once at step 5; context survives | [auth.spec.ts](file:///c:/Sandbox/Projects/ehatyai/tests/auth.spec.ts), [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **BR-3** | Single login point: no other step may request auth | pages/components | Implemented |
| **BR-4** | Zero-amount bypass: if net amount = 0, payment is skipped automatically | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **BR-5** | Payment retry: max 3 attempts; then Pending-Payment + timed hold release | [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx), [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/bookings/hold-release/route.ts) | Implemented |
| **BR-6** | Availability re-check: checked at step 4 and re-verified at step 7 | [PropertyDetailClient.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/properties/[id]/PropertyDetailClient.tsx), [page.tsx](file:///c:/Sandbox/Projects/ehatyai/src/app/booking/page.tsx) | Implemented |
| **BR-7** | Confirmation guarantee: Booking ID after success/zero-bypass; idempotent; writes notifications | [route.ts](file:///c:/Sandbox/Projects/ehatyai/src/app/api/bookings/route.ts) | Implemented |
