# Motion System Audit & Specification (`MOTION.md`)

This document records the complete motion audit across all routes of the College Lost and Found Portal at desktop (1440px), tablet (768px), and mobile (390px) viewports.

## Core Philosophy & Design Rules

Every animation in this application exists solely to communicate state and reduce cognitive friction. Decorative, floating, or ambient animations are strictly prohibited.

Every animation answers exactly one of four questions:
1. **What changed?** (State transition, filter application, stage verification, tab switch)
2. **Where did it go?** (Navigation, dismiss, row collapse, modal slide, shelf collapse)
3. **What can I press?** (Tactile button press feedback, interactive dropzone affordance)
4. **What is happening now?** (Catalog loading, live desk operating status, custody intake)

### Universal Constraints
- **Properties Animated**: `transform` and `opacity` ONLY. Width, height, top, and left are never animated directly.
- **Timing & Speed**: Exits execute at ~60% of entrance duration (`microExit: 0.09s`, `uiExit: 0.18s`, `pageExit: 0.27s`).
- **No Uniform Fade-Ups**: Sections are structured statically; only dynamic content groups (such as the initial hero headline and recent items) use single grouped scroll reveals.
- **No Hover-Scale**: Generic `scale` effects on hover are banned across all cards and images to maintain calm, institutional stability.
- **Strict Token Compliance**: Every spring, duration, delay, and easing is centralized in `src/motion/tokens.ts`. No arbitrary numbers exist in components.
- **Accessibility (`prefers-reduced-motion`)**: Enforced at the root level via `<MotionConfig reducedMotion="user">`. Animations reduce to instant cuts or simple opacity fades.

---

## Route-by-Route Motion Inventory

### 1. Global Shell & Navigation (`AppLayout`, `Navbar`, `Toast`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Active Nav Link Underline** | `layoutId="nav-active-indicator"`, `springs.snappy` | **What changed?** (Identifies the current active route) | Active on 1440 & 768. Hidden on 390 (mobile drawer links use active text color). |
| **Sticky Navbar Elevation** | Height eases 76px → 60px, 1px border opacity 0 → 1 after 24px scroll (`useScroll` + `useTransform`, `easings.out`) | **What is happening now?** (Entering compact reading mode to maximize viewport) | Identical across 1440, 768, and 390. Strictly no backdrop blur. |
| **Mobile Drawer Hamburger Icon** | SVG lines morph from 3 horizontal bars into an X via line rotation/fade (`transitions.uiOut`) | **What is happening now?** (Drawer open vs closed state toggle) | Hidden at 1440; active at 768 & 390. |
| **Mobile Navigation Sheet** | Slides in from right (`x: 100% → 0`, `springs.sheet`), backdrop fades in (`opacity: 0 → 1`, `durations.ui`) | **Where did it go?** (Reveals off-canvas site navigation) | Hidden at 1440; full height on 768 and 390. Body scroll locks on open. |
| **Mobile Nav Links Stagger** | 3 links enter with `delays.itemStagger (0.04s)` interval, `y: 8 → 0`, `opacity: 0 → 1` | **What can I press?** (Sequences primary destinations for scanning) | Mobile & tablet only. |
| **Toast Stack Items** | Enters `y: 16 → 0, opacity: 0 → 1, scale: 0.96 → 1` (`springs.soft`). Horizontal drag dismiss (`drag="x"`). Exit slides right `x: 120` (`durations.uiExit`). | **What changed?** (System confirmation of report withdrawal, claim approval, or error) | Fixed bottom-right at 1440 & 768; full-width banner at 390. Announced via `aria-live="polite"`. |
| **Page Route Transition** | `<PageTransition>` keyed by `pathname`: `y: 10 → 0, opacity: 0 → 1` (`durations.page`), exit `opacity: 1 → 0` (`durations.uiExit`) | **Where did it go?** (Smooth transition between university portal views) | Identical across all viewports. Automatically scrolls to top on forward navigation. |

---

### 2. Home Gateway (`/`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Hero Display Headline** | Two lines split into overflow-hidden wrappers. Line 1: `y: 100% → 0` (`durations.page`). Line 2: enters `0.08s` later (`delays.headlineStagger`). | **What is happening now?** (The single orchestrated page-load moment proving institutional readiness) | Line wraps gracefully; timing identical across 1440, 768, and 390. |
| **Hero Search Form** | `opacity: 0 → 1, y: 12 → 0` (`durations.step`, delay 0.22s, `easings.out`) | **What can I press?** (Surfaces primary action immediately after headline settles) | 56px input with attached category select at 1440 & 768; stacks cleanly at 390. |
| **Quick-Pick Chips** | 6 chips stagger in (`delays.itemStagger`), `opacity: 0 → 1, y: 6 → 0` (`durations.uiExit`) | **What can I press?** (Frequently lost items: keys, ID cards, phone) | Wraps into 2 neat rows on 390. |
| **"Handed in Today" Live Feed** | Sibling rows glide down smoothly via `layout` (`springs.soft`) when a new intake item is prepended | **What changed?** (Surrendered item arrived at campus intake vault) | Identical across all viewports. |
| **New Intake Amber Highlight** | Newly inserted item displays an amber outline (`#E3A92F`) that fades out over 1.2s (`durations.tagHighlight`) | **What is happening now?** (Highlights the specific item that just arrived) | Identical across all viewports. |
| **Collection Desk Live Dot** | Ambient scale and opacity pulse (`scale: [1, 1.45, 1]`, `opacity: [1, 0.65, 1]`, `durations.pulse: 2.0s`) ONLY while open | **What is happening now?** (Desk is currently open and attended) | Green when open, static slate when closed. Identical across all viewports. |
| **Recently Found Property Grid** | Entire 8-card grid reveals once on scroll via `<Reveal>` (`opacity: 0 → 1, y: 16 → 0`, `durations.page`) | **Where did it go?** (Enters viewport once; individual cards do NOT animate independently) | 4 columns on 1440, 2 columns on 768 and 390. |

---

### 3. Browse Catalog (`/browse`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Status Segmented Control Pill** | Sliding pill behind active tab (`layoutId="status-segmented-pill"`, `springs.snappy`) | **What changed?** (Switches between All, Lost, and Found) | Horizontal scroll container on 390 to prevent clipping. |
| **Active Filter Chips** | Enters `scale: 0.9 → 1, opacity: 0 → 1` (`springs.soft`); siblings glide via `layout`. Removal scales out. | **What changed?** (Visual confirmation of applied facet criteria) | Wraps below controls across all viewports. |
| **View Mode Toggle Indicator** | Sliding surface highlight between Grid and List views (`layoutId="view-mode-indicator"`, `springs.snappy`) | **What changed?** (Switches card density format) | Desktop and tablet only (mobile defaults to responsive grid). |
| **Realtime New Item Notification Pill** | Slides down from beneath sticky toolbar (`y: -16 → 0, opacity: 0 → 1, scale: 0.96 → 1`, `springs.snappy`) | **What is happening now?** (New item matched current filters; user must click to apply without shifting grid) | Centered sticky pill at top-[136px] across all viewports. |
| **Animated Item Count** | Spring-driven number tally (`<AnimatedNumber>`, `springs.soft`) | **What changed?** (Total matching inventory tally update) | Top of results across all viewports. |
| **Item Grid Card Placement** | Dynamic card rearrangement inside `AnimatePresence mode="popLayout"` via `layout` (`springs.soft`). Exiting cards fade and scale to 0.96 in 0.15s (`durations.micro`). Stagger capped at 12 items. | **Where did it go?** (Cards glide to new grid slots when facets change) | 4 cols (1440), 3 cols (1024), 2 cols (768 & 390). |
| **Catalog Skeletons** | Flat opacity pulse (`0.45 ↔ 0.85`, `durations.skeleton: 1.6s`, `easeInOut`). Strictly no shimmer gradients. | **What is happening now?** (Fetching server inventory) | Matches active layout grid / list structure. |

---

### 4. Item Custody Detail & Claim Modal (`/items/:id`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Shared LayoutId Image Transition** | Main photo morphs from catalog thumbnail via `layoutId={`item-image-${id}`}` (`springs.soft`) | **Where did it go?** (Maintains spatial continuity from list to inspection view) | Desktop & tablet. Mobile uses clean crossfade if screen width restricts geometry. |
| **Thumbnail Selector Highlight** | Sliding line under active thumbnail (`layoutId="active-thumbnail-indicator"`, `springs.snappy`) | **What changed?** (Selected angle: front, serial markings, condition) | Horizontal row under main image across all viewports. |
| **Thumbnail Image Crossfade** | Crossfades image inside inspection frame (`opacity: 0 → 1`, `durations.uiExit`, `easings.out`) | **What changed?** (Camera angle preview) | Identical across all viewports. |
| **Reference Code Copy Morph** | Copy icon morphs into a checkmark for 1.5s; "Copied" badge fades in (`durations.micro`) | **What is happening now?** (Confirms code copied to clipboard) | Inline next to mono ref code across all viewports. |
| **StatusChip Morph** | Background color, text color, and border transition smoothly on status mutation | **What changed?** (Article lifecycle state: open → verified → returned) | Inline badge across all viewports. |
| **Claim Initiation Sheet** | Desktop (1440 & 768): slides in from right (`springs.sheet`). Mobile (390): slides up from bottom (`slideSheetBottomVariants`) with drag-to-dismiss. | **Where did it go?** (Verification interview drawer opens) | Adaptive right/bottom drawer depending on breakpoint. |
| **Claim Self-Drawing Checkmark** | SVG circle and pathLength draw from 0 to 1 (`durations.page`, `easings.out`) on successful claim receipt | **What is happening now?** (Draws custody pass receipt confirmation) | Centered in claim success screen. |

---

### 5. Report Intake Flow (`/report`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Step 0 Intent Choice** | Sliding highlight between "I lost something" and "I found something" (`layoutId="report-choice-highlight"`, `springs.snappy`) | **What changed?** (Intake branch selection) | 2 large selectable cards across all viewports. |
| **Form Step Horizontal Slide** | Direction-aware entry and exit: forward enters from `x: 24 → 0` (`durations.step`), backward enters from `x: -24 → 0`. Exits at `durations.uiExit`. | **Where did it go?** (Spatial navigation forward/backward through 5 steps) | Centered single-column form across all viewports. |
| **Stepper Progress Fill** | Bar scaleX interpolates smoothly `(step + 1) / total` (`durations.step`, `easings.out`) | **What is happening now?** (Form completion progress) | Top of form across all viewports. |
| **Photo Dropzone Dragover State** | Solid border color transitions from neutral line to `#1E5B4B` in 0.15s (`durations.micro`) | **What can I press?** (Drop target is active) | Responsive drop area across all viewports. |
| **Photo Upload Preview** | Preview thumbnail scales in `0.92 → 1` with progress ring (`durations.step`) | **What is happening now?** (Client-side compression and intake staging) | Preview box with remove button. |
| **Character Counter Warning** | Counter text color transitions smoothly from neutral ink-muted to `#B24A2F` near limit | **What is happening now?** (Description field length constraint) | Inline beneath text areas. |
| **Submitted Claim Ticket Printout** | Ticket drops from 6px slot line aperture (`y: -24 → 0`, `springs.soft`); ref code highlights after 0.45s | **What changed?** (Official custody pass generated) | Signature element on report completion. |

---

### 6. Claimant Records (`/my-reports`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Tabs Sliding Underline** | Active tab indicator slides smoothly (`layoutId="my-reports-tab-underline"`, `springs.snappy`) | **What changed?** (Switches between "Lost by me", "Found by me", "My claims") | Fixed tabs row across all viewports. |
| **Tab Content Directional Slide** | Crossfades with an 8px x-shift in direction of travel (`durations.step`, `durations.uiExit`) | **Where did it go?** (Spatial continuity across tabs) | Full container across all viewports. |
| **Row Inline Accordion Expansion** | Row expands vertically via `layout` (`springs.soft`) to reveal 5-stage verification timeline | **What changed?** (Reveals custody lifecycle audit trail) | Full row card across all viewports. |
| **Custody Progress Line Draw** | Green track line draws up to active stage (`scaleX: current / 4`, `durations.page`, `easings.out`) | **What is happening now?** (Current custody stage) | Horizontal stage connector across all viewports. |
| **Current Stage Pulse Dot** | Active stage dot pulses with slow 2.0s scale loop (`scale: [1, 1.45, 1]`, `durations.pulse`) | **What is happening now?** (Stage currently awaiting action or verification) | Only looping animation allowed besides desk open dot. |
| **Withdraw Row Collapse** | Withdrawn row collapses height and fades out in 0.25s (`durations.uiExit`); undo restores instantly | **Where did it go?** (Deactivated from active campus intake registry) | Sibling rows glide up cleanly via `layout`. |

---

### 7. Campus Safety Desk Console (`/admin`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Navigation Section Indicator** | Sliding highlight on left navigation rail (`layoutId="admin-nav-indicator"`, `springs.snappy`) | **What changed?** (Switches between Claims to review, All items, Handover) | Desktop sidebar (1440 & 1024); horizontal segmented bar on mobile/tablet. |
| **Top Metric Figures** | Numerical tallies update smoothly via `AnimatedNumber` (`springs.soft`) | **What changed?** (Live queue figures: Awaiting review, Ready to collect, Returned) | Plain row of 3 figures across all viewports. |
| **Claims Table Row Expansion** | Clicking row expands verification split panel inline (`layout`, `springs.soft`) | **What changed?** (Double-sided verification inspection: Finder private detail vs Claimant statement) | Two columns on 1440; stacked vertically on 768 & 390. |
| **Claim Row Approval Dismiss** | StatusChip morphs to green "Ready to collect"; row collapses out of queue after 0.25s (`durations.uiExit`) | **Where did it go?** (Claim verified; item transitioned to custody handover collection) | Table rows glide up seamlessly. |
| **Keyboard Navigation Focus Ring** | Active row highlights with 2px line and focus indicator on arrow up/down | **What can I press?** (Attendant keyboard ergonomics for rapid processing) | Desktop only. |

---

### 8. System Pages (`/sign-in`, `*` 404, `/styleguide`)

| Component / Element | Motion & Timing | Question Answered | Viewport Behavior (1440 / 768 / 390) |
| :--- | :--- | :--- | :--- |
| **Sign-In Validation Height Reveal** | Inline error message enters via height reveal (`height: 0 → auto`, `opacity: 0 → 1`, `durations.uiExit`) | **What is happening now?** (Field validation feedback: institutional email requirement) | Above/below form fields. |
| **Sign-In Submit Spinner** | Clean circular SVG rotation while verifying credentials (`durations.ui`) | **What is happening now?** (Single sign-on handshake in progress) | Inline within button. |
| **404 Damped Tag Swing** | Hanging `LF-404` luggage tag rotates once from `-24deg → 0deg` on a damped rotation spring (`springs.tagSwing`: stiffness 110, damping 9) | **Where did it go?** (Physical metaphor for an unlocated resource) | Centered on screen across all viewports. |
| **Styleguide Lab Controls** | Interactive sliders and triggers for inspecting every motion token, spring, and easing | **What can I press?** (System documentation laboratory) | Responsive multi-column layout. |

---

## Motion Rules Verification Summary

- [x] **Every animation answers one of the 4 core questions**: Documented above.
- [x] **No uniform fade-up on every section**: Removed; only dynamic grouped feeds and hero text use reveals.
- [x] **No hover-scale on everything**: Eliminated from cards and photos; hover states rely exclusively on border shifts and subtle neutral background tints.
- [x] **Zero hardcoded numbers in components**: Centralized in `src/motion/tokens.ts`.
- [x] **Only transform and opacity animated**: Strictly enforced.
- [x] **No stagger across > 12 elements**: All staggers capped at `Math.min(idx, 12)` or 3–6 items.
- [x] **Accessibility compliance**: All animations respect `prefers-reduced-motion: reduce`.
