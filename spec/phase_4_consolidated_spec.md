# Phase 4: Consolidated Spec – Login, gun.js, and Integration

## 1. Functional Requirements

- Secure login via eBay OAuth (web/mobile) and optional email/password registration.
- Session management: prevent unauthorized access, support logout on all devices.
- Real-time user data sync (inventory, listings, preferences) via gun.js.
- Only authenticated users may read/write their own data.
- eBay listing creation requires valid session, item ownership, and validated data.
- Image upload: client-side validation, secure upload, error handling, and session token use.
- No business logic in API routes; all logic in `lib/` modules.

## 2. Edge Cases

- Expired/invalid eBay credentials or OAuth callback.
- Network interruption during gun.js sync, OAuth, or image upload.
- Simultaneous logins (conflict resolution).
- User revokes eBay OAuth access from eBay dashboard.
- Data corruption or partial sync in gun.js.
- User logs out on one device but remains logged in elsewhere.
- Duplicate eBay listing attempts for the same item.
- Image upload fails or is invalid (type/size).

## 3. Constraints

- No hard-coded secrets or environment variables in client code.
- All files < 500 lines; logic must be modular and DRY.
- All user inputs validated and sanitized (client and server).
- Secure error handling: never leak stack traces or sensitive info to client.
- gun.js and OAuth flows must be testable with TDD anchors.
- System must be ready for human QA (clear error states, test hooks).
- All business logic in `lib/`, not in API routes.

## 4. Domain Model (Key Entities)

- **User**: id (eBay or internal), email, displayName, avatarUrl, createdAt, lastLogin.
- **Session**: sessionId, userId, createdAt, expiresAt, deviceInfo, isActive.
- **OAuthToken**: userId, provider, accessToken, refreshToken, expiresAt, scopes.
- **GunDataNode**: nodeId, userId, dataType, data, updatedAt.
- **Item**: itemId, userId, itemName, description, images, suggestedPrice, status, aiRecognizedItem.
- **Listing**: listingId, itemId, userId, status, ebayDraftListingId, price, category, condition.

## 5. Module Boundaries & Integration

- **components/auth/**: AuthForm, AuthGuard – UI and logic for authentication, context integration.
- **components/items/**: ImageUploader – Item image upload, validation, feedback.
- **context/AuthContext.js**: Provides authentication state and actions to UI.
- **pages/api/**: REST endpoints for auth, items, test utilities. No business logic; delegate to `lib/`.
- **lib/**: All business logic for auth, gun.js, eBay, image handling.
- **External**: eBay API (OAuth, listing), gun.js (data sync), Supabase (optional).

## 6. Pseudocode Flow (Summary)

### Authentication (OAuth & Registration)
- Validate platform and user input.
- Redirect to eBay OAuth or handle registration.
- On callback, exchange code for tokens, fetch user, create session.
- On registration, validate email/password, hash, create user/session.
- Logout: revoke session, clear tokens.

### gun.js Data Sync
- Initialize gun.js for authenticated user.
- Validate and sync user data (schema-driven).
- Handle sync errors with retry/backoff.

### eBay Listing Creation
- Require valid session and item ownership.
- Validate item data (name, description, images, price).
- Prevent duplicate listings.
- Map item to eBay category/condition.

### Image Upload
- Client-side: validate type/size, preview, upload with session token.
- Server-side: validate, store, associate with item, handle errors.

## 7. Error Handling & Security

- All IDs and tokens validated for format and uniqueness.
- No sensitive tokens stored in browser/localStorage.
- Unauthorized access: deny, log, never leak details.
- Data validation errors: reject write, return clear error.
- Data sync errors: retry with exponential backoff, log securely.
- Session tokens cryptographically secure and expire appropriately.

## 8. Performance & Scalability

- gun.js nodes sharded per user to avoid cross-user data leaks.
- Data sync is incremental, not full reload.
- Session/token checks are O(1) for active flows.

## 9. TDD Anchors (Test Coverage)

- // TEST: User can log in securely and reliably via eBay OAuth or registration.
- // TEST: gun.js data flow is robust, no race conditions or leaks.
- // TEST: No duplicated or unrefactored code paths in login/data sync/listing/image flows.
- // TEST: System ready for human QA (clear errors, test hooks).
- // TEST: All edge/error cases (invalid token, sync failure, unauthorized, data corruption, upload failure) are handled.
- // TEST: All user input is validated and sanitized.
- // TEST: All business logic is in `lib/`, not in API routes.

---
**This consolidated spec supersedes previous phase docs. All implementation and testing must adhere to these unified requirements, models, flows, and constraints.**