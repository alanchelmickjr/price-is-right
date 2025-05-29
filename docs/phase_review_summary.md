# 📋 Documentation Review Report: eBay Helper System

---

## 1. System Architecture, Technology Stack & Constraints

**Architecture:**  
- Modular Next.js (React) frontend + API routes (serverless, Vercel optimized)
- P2P sync and auth via Gun.js
- Supabase: PostgreSQL (DB), Auth, Storage
- AI: Google Cloud Vision API (hosted), LlamaFile+SmolVLM (for local AI, privacy-preserving)
- eBay API (Find/Sell/Trading)
- Mobile-first, offline-first, privacy-first (local compute wherever possible)

**Core Constraints:**  
- One-thing principle: point, scan, sell—zero feature creep
- 100% local photo processing; no data leaves device unless user shares with eBay
- Neumorphic, touch-optimized UI with ≤2s load
- Works offline, syncs when online  
- Open (no vendor lock-in); extensible service modules

---

## 2. Critical TDD Anchors & Must-Pass Tests

Extracted from pseudocode spec files:

- Auth endpoints require correct session handling, secure password storage, robust error UX and graceful OAuth fallback ([`spec/phase_3_auth_pseudocode.md`](spec/phase_3_auth_pseudocode.md)).  
- All Item endpoints (CRUD) must verify ownership, sanitize/validate input, enforce user isolation, and error on missing or invalid input ([`spec/phase_3_inventory_management_pseudocode.md`](spec/phase_3_inventory_management_pseudocode.md)).  
- Automated tests for file type/size (uploads), enum validation, pagination, and cascade delete logic.
- Must pass 6/6 product validation tests (see SIMPLY_EBAY_COMPLETE.md).
- E2E flows: onboarding → login → dashboard → item capture → AI recognition → eBay list → sync.

---

## 3. Key Requirements by Feature

### Splash Screen
- 3-second branded entry (see flow in SIMPLY_EBAY_COMPLETE.md)
- Professional branding; zero interaction until complete

### Login & Auth Flows
- Registration/login must validate all fields, sanitize input, and provide explicit user feedback for errors (400/401/409/500)
- Password policy: format, match, complexity, hash securely
- OAuth: gracefully handle provider failures, link by email if duplicate, return informative error
- Session handling: cookie or header token, BS expiration logic, instant logout
- Privacy: session/user info never leaked, only minimal display

### Gun.js Data Sync
- P2P sync for auth and user data (SIMPLY_EBAY_COMPLETE.md; Gun.js is required, not optional)
- Data changes sync in background when network returns (offline-first/“works without internet, syncs when available”)
- Decentralized: no forced central account required
- Must handle merge conflicts gracefully and never block
- No vendor lock-in: fallback logic/alternate storage supported

### Mobile Dashboard
- Elegant single-page UI, optimized for real devices (≥375px)
- Quick-actions for all flows; one-handed operation
- Live inventory sync; instant reflection of local/Gun.js state
- All actions clearly surfaced (scan, list, edit, remove)
- Component-level constraints: neumorphic soft-shadows and tactile feedback throughout

---

## 4. SPARC Handoff Mapping Table: Requirements & Artifacts

| Doc Name | SPARC Stage | Key Inputs | Outputs / Coverage | Traceable Features & TDD Anchors |
|----------|-------------|------------|--------------------|------------------------------|
| [`docs/architecture.md`](docs/architecture.md) | Specification, Architecture | User stories, constraints | System boundaries, stack, privacy, modularity | All core tech/stack/flow |
| [`docs/SIMPLY_EBAY_COMPLETE.md`](docs/SIMPLY_EBAY_COMPLETE.md) | Completion (Acceptance) | Full flow chart & feature list | UX, Gun.js, privacy, test scenarios, mobile constraints | Splash, onboarding, privacy, mobile |
| [`spec/phase_3_auth_pseudocode.md`](spec/phase_3_auth_pseudocode.md) | Pseudocode, TDD | Auth user stories | Stepwise logic, error handling, TDD test anchors | Login, error UX, OAuth, privacy |
| [`spec/phase_3_inventory_management_pseudocode.md`](spec/phase_3_inventory_management_pseudocode.md) | Pseudocode, TDD | Inventory CRUD flows | Dashboard actions, error logic, must-pass test list | CRUD, sync, dashboard integrity |
| [`docs/phase_3_architecture_plan.md`](docs/phase_3_architecture_plan.md) | Architecture | Data & flow diagrams | Service/module boundaries, P2P data flows | Gun.js sync, fallback logic |

---

76a | ### 🔍 Feature & TDD Anchor Trace Matrix (per SPARC)
76b |
76c | | Feature | User Story Source | Pseudocode/Test Anchor | Acceptance/UX Ref |
76d | |---------|-------------------|------------------------|------------------|
76e | | Splash Screen | SIMPLY_EBAY_COMPLETE.md | N/A (UX only); <br/>timed entry, branding | Usability, branding entered |
76f | | Login/Auth | phase_3_auth_pseudocode.md | All TDD anchors for: <br/>field validation, error states, secure storage, OAuth, feedback | Auth success/failure, error message clarity |
76g | | Gun.js Data Sync | architecture.md,<br/>SIMPLY_EBAY_COMPLETE.md,<br/>phase_3_inventory_management_pseudocode.md | TDD for sync fallback, conflict handling | Live sync, offline, never blocks, merges |
76h | | Mobile Dashboard | phase_3_inventory_management_pseudocode.md | CRUD, inventory sync, single-page flows, error propagation| Responsive layout, action clarity |
76i |
---

## 5. Gaps, Risks, and Ambiguities

- **Gun.js implementation:** No detailed pseudocode or error handler specs for Gun.js sync/merge. Risk: edge cases and mobile P2P instability.
- **Splash/Onboarding:** UI flows specified, but animation/loader timing not described algorithmically.
- **Error UX:** Non-auth endpoints could reuse a documentation pattern for error states/messages; may need a global error-handling UI pattern.
- **Security:**  
  - Data never leaves unless shared: requires strict checks (not fully specified in pseudocode).
  - P2P auth: fallback if Gun.js peer network unreachable.
- **Validation matrix:** Not all platform/flow-edge TDD anchors formally traced through code/tests.
- **Mobile-only constraints:** Docs are clear, but platform-specific accessibility guidelines could be expanded.

---

> **Action Required:**  
> Before implementation, clarify Gun.js merge/error handling, universal error UX patterns, and explicit data-privacy guardrails.

---