# Phase 2: Domain Model – Login & gun.js Integration

## 1. Core Entities

### 1.1 User
- id: string (unique, from eBay)
- email: string (validated, required)
- displayName: string
- avatarUrl: string (optional)
- createdAt: datetime
- lastLogin: datetime

### 1.2 Session
- sessionId: string (unique, secure)
- userId: string (FK to User)
- createdAt: datetime
- expiresAt: datetime
- deviceInfo: string (browser/mobile details)
- isActive: boolean

### 1.3 OAuthToken
- userId: string (FK to User)
- provider: enum (eBay, future providers)
- accessToken: string (never stored client-side)
- refreshToken: string (never stored client-side)
- expiresAt: datetime
- scopes: array of string

### 1.4 GunDataNode
- nodeId: string (unique, per user)
- userId: string (FK to User)
- dataType: enum (inventory, preferences, etc.)
- data: object (validated, schema-driven)
- updatedAt: datetime

## 2. Relationships

- User 1—* Session (one user, many sessions)
- User 1—1 OAuthToken (per provider)
- User 1—* GunDataNode (user owns multiple data nodes)
- Session *—1 User (session belongs to user)
- GunDataNode *—1 User (data node belongs to user)

## 3. Validation & Security

- All IDs must be validated for format and uniqueness.
- Email must be RFC-compliant and verified via OAuth.
- No sensitive tokens stored in browser/localStorage.
- All data written to gun.js must be schema-validated and access-controlled.
- Session tokens must be cryptographically secure and expire appropriately.

## 4. Error Handling

- Invalid/expired OAuth tokens: force re-authentication.
- Data sync errors: retry with exponential backoff, log securely.
- Unauthorized access: deny and log attempt, never leak details.
- Data validation errors: reject write, return clear error.

## 5. Performance & Scalability

- gun.js nodes must be sharded per user to avoid cross-user data leaks.
- Data sync must be incremental and avoid full reloads.
- Session and token checks must be O(1) for active user flows.

## 6. TDD Anchors

// TEST: User entity is created/queried with valid attributes only
// TEST: Session lifecycle (create, expire, revoke) is robust and secure
// TEST: OAuthToken never leaks to client; refresh/expiry handled
// TEST: GunDataNode enforces schema and access control
// TEST: All relationships enforce referential integrity
// TEST: Error and edge cases (invalid token, sync failure, unauthorized) are handled