# Project Plan: Simply eBay

**Vision:** Transform garage sale prep into a 2-minute magic trick. Point your camera, get instant AI pricing, and list to eBay – all while keeping your data private and processing everything locally. "Point, estimate, post."

**Core Principles:**
*   **Elegance & Simplicity:** Focus on a streamlined user experience and a lean, efficient architecture. Avoid overengineering.
*   **Local First:** Prioritize local processing for AI, data storage, and user privacy.
*   **Real-time Interaction:** Leverage real-time video processing for object identification.

---

## Development Checklist

### Phase 1: Foundation & Real-time eBay Item Identification ✅ COMPLETED
*   [x] **Adapt SmolVLM Example for eBay Focus:**
    *   [x] Modify the instruction prompt to: "Identify sellable items in this image. For each item, provide: item name, condition, and eBay-worthy description. Focus on electronics, collectibles, furniture, tools, books, and household items with resale value."
    *   [x] Test refined prompting with existing llama.cpp setup
    *   [x] Verify llama.cpp server is running with: `llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF`
*   [x] **Transform to PWA Structure:**
    *   [x] Create `manifest.json` for PWA capabilities
    *   [x] Restructure HTML for mobile-first, thumb-friendly layout
    *   [x] Implement neumorphic design system with CSS custom properties
*   [x] **Enhance UI for eBay Context:**
    *   [x] Replace generic "response" area with "Identified Items" display
    *   [x] Add visual indicators for "sellable" vs "not sellable" items
    *   [x] Design thumb-friendly controls (larger touch targets, bottom navigation)
    *   [x] Implement neumorphic styling with soft shadows and curves
*   [x] **Optimize for Mobile Performance:**
    *   [x] Implement image compression before sending to AI
    *   [x] Add loading states and better error handling
    *   [x] Test camera performance on mobile devices
    *   [x] Ensure responsive design works on both mobile and MacBook

### Phase 2: eBay Integration - "Estimate" ✅ COMPLETED
*   [x] **eBay API Integration (Read-Only):**
    *   [x] Research and obtain eBay API credentials for searching listings and price estimation
    *   [x] Develop functions to query the eBay API based on item descriptions from AI
    *   [x] Implement OAuth token management for eBay API
    *   [x] Add fallback to mock data when API is unavailable
*   [x] **Price Estimation Logic:**
    *   [x] Process eBay API responses to extract relevant pricing information
    *   [x] Calculate average prices from completed listings
    *   [x] Develop logic to determine the "best post" suggestions
*   [x] **Display Estimates in UI:**
    *   [x] Integrate and display estimated sale prices within the neumorphic UI
    *   [x] Show sample recent sales data
    *   [x] Add links to eBay search results
*   [x] **Local Data Store with `gun.js`:**
    *   [x] Integrate `gun.js` into the PWA for local data persistence
    *   [x] Store identified items and price estimates locally
    *   [x] Add recent scanning sessions history feature
*   [x] **Interactive Setup Wizard:**
    *   [x] Build step-by-step eBay API configuration wizard
    *   [x] Add progress indicators and user feedback
    *   [x] Implement credential validation and testing
    *   [x] Create notification system for user guidance

### Phase 3: UX Refinements & Session Management ✅ COMPLETED
*   [x] **Session Management Improvements:**
    *   [x] Fix session loading on app startup - sessions now load automatically
    *   [x] Implement session expiration (1 week maximum) - old sessions filtered out
    *   [x] Change "Hide" to collapse functionality (don't close cards) - sessions collapse content, not remove card
    *   [x] Add proper close buttons to sessions and eBay wizard - X buttons added for proper closure
*   [x] **Settings & Toggles:**
    *   [x] Move raw AI output to settings with toggle checkbox - now controlled via settings menu
    *   [x] Default raw output to hidden but accessible via settings - saves user preference
    *   [x] Preserve user preferences across sessions - localStorage integration
*   [x] **Control Layout Refinement:**
    *   [x] Group bottom buttons in triangular corner layout - implemented frosted glass grouping
    *   [x] Add frosted/gunmetal background with content-under-bridge effect - backdrop blur with transparency
    *   [x] Maintain accessibility while showing underlying content - preserved interaction while showing depth
*   [x] **Modal & Wizard Improvements:**
    *   [x] Clean up eBay wizard styling (reduce border shadow fuzz) - simplified to clean shadows
    *   [x] Add prominent close buttons to all modals - X button in top-right corner
    *   [x] Improve modal accessibility and escape handling - Escape key and click-outside support

### Phase 4: eBay Posting & User Management - "Post"
*   [ ] **eBay API Integration (Write Access):**
    *   [ ] Implement eBay API authentication for posting items (OAuth)
    *   [ ] Develop functionality to create new eBay listings
*   [ ] **User Authentication with `gun.js`:**
    *   [ ] Implement local-first user authentication mechanism
*   [ ] **Email Verification (Optional):**
    *   [ ] Integrate `emailjs` for user verification if required
    *   [ ] Implement environment-based switch for email verification
*   [ ] **Refine "Post" Workflow:**
    *   [ ] Design thumb-friendly workflow for reviewing and confirming posts

### Phase 5: Voice Interaction & Advanced Features
*   [ ] **Voice Interaction:**
    *   [ ] Add voice commands for hands-free operation
    *   [ ] Implement speech-to-text for item descriptions
    *   [ ] Voice confirmation for posting actions
*   [ ] **Advanced Features:**
    *   [ ] Evaluate if object identification accuracy requires local vector store
    *   [ ] If needed, integrate lightweight TensorFlow.js solution

### Phase 6: Refinement, Testing & PWA Optimization
*   [ ] **UI/UX Polish:**
    *   [ ] Refine neumorphic and curvy UI based on user testing
    *   [ ] Ensure all interactions are intuitive and thumb-friendly
*   [ ] **PWA Enhancements:**
    *   [ ] Optimize for performance on mobile and MacBook
    *   [ ] Enhance offline capabilities
    *   [ ] Ensure cross-browser compatibility
*   [ ] **Testing:**
    *   [ ] Conduct thorough testing of all features
*   [ ] **Documentation:**
    *   [ ] Create user-facing instructions and developer documentation

---

This plan aims for an iterative approach, building core functionality first and then layering on enhancements, always keeping simplicity and the user experience at the forefront. Phase 1 is laser-focused on proving the core concept works elegantly before adding complexity.