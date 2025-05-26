# Phase 3: Codebase Review Pseudocode Specification

**Purpose:**  
For each module in `components/`, `pages/`, `context/`, and `styles/`, define pseudocode for:
- Major style/flow corrections
- Mobile/PWA compliance improvements
- Testability enhancements
- TDD anchors for each correction

---

## Pseudocode Structure

For each module:
- **Module Purpose & Scope**
- **Major Corrections Needed**
- **Pseudocode for Refactor/Enhancement**
- **TDD Anchors**

---

## Module Inventory

### components/auth/AuthForm.js
### components/auth/AuthGuard.js
### components/camera/LiveCamera.js
### components/camera/MobileCameraInterface.js
### components/camera/ReticleOverlay.js
### components/items/ImageUploader.js
### components/layout/Header.js
### components/layout/Layout.js
### components/layout/StatusIndicators.js

---

### pages/_app.js
### pages/about.js
### pages/dashboard.js
### pages/index.js
### pages/login.js
### pages/onboarding.js
### pages/privacy.js
### pages/splash.js
### pages/terms.js

#### pages/api/auth/login.js
#### pages/api/auth/logout.js
#### pages/api/auth/me.js
#### pages/api/auth/register.js
#### pages/api/items/[itemId].js
#### pages/api/items/index.js
#### pages/api/items/[itemId]/create-ebay-listing.js
#### pages/api/items/[itemId]/recognize.js
#### pages/api/items/[itemId]/suggest-price.js
#### pages/api/items/images/upload.js
#### pages/api/test/ebay-connection.js
#### pages/api/test/gun-sync.js
#### pages/api/test/vector-store.js

#### pages/items/[itemId].js
#### pages/items/index-fixed.js
#### pages/items/index.js
#### pages/items/new.js
#### pages/items/scan.js

---

### context/AuthContext.js

---

### styles/globals-new.css
### styles/globals.css
### styles/globals.css.backup

---

## Example Module Section

### components/auth/AuthForm.js

**Purpose & Scope:**  
Handles user authentication form UI and logic.

**Major Corrections Needed:**  
- Refactor duplicated validation logic  
- Clarify data flow between form state and context  
- Add error boundaries for async submit  
- Ensure mobile-friendly input and offline support  
- Enforce consistent style and accessibility

**Pseudocode:**
- Define explicit data flow: input → validation → context update
- Extract validation to shared utility
- Wrap form in error boundary
- Add mobile input optimizations (touch, viewport)
- Ensure offline feedback for submit
- Apply consistent CSS classes

**TDD Anchors:**  
// TEST: Validation utility rejects invalid emails/passwords  
// TEST: Error boundary displays fallback on async error  
// TEST: Form is usable on mobile (touch, viewport, keyboard)  
// TEST: Form submit works offline and provides feedback  
// TEST: No duplicated validation logic remains

---

_Repeat above structure for each module listed._