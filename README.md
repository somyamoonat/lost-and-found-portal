# College Lost and Found Portal

A production-quality campus lost and found repository designed for institutional trust, calm credibility, and verified physical property retrieval workflows.

## Stack

- **Framework**: Vite + React 19 + TypeScript
- **Routing**: React Router (data router with `createBrowserRouter` & `RouterProvider`)
- **Styling**: Tailwind CSS v4 with CSS-first `@theme` design tokens
- **Motion**: Motion (`motion/react`) with spring physics, shared layout transitions, and strict accessibility compliance (`MotionConfig reducedMotion="user"`)
- **Primitives**: Radix UI unstyled primitives (`Dialog`, `Select`, `Tabs`) styled to institutional specification
- **Icons**: Lucide icons configured at `strokeWidth={1.5}`
- **Typography via Fontsource**:
  - `Schibsted Grotesk` (variable) for headlines, body copy, and UI controls
  - `IBM Plex Mono` reserved strictly for physical claim reference codes (e.g., `LF-2041`)

## Visual Direction & Hard Bans

- **Flat Palette (CSS Custom Variables)**:
  - Canvas & Structure: `paper` (`#F4F5F2`), `surface` (`#FFFFFF`), `line` (`#DCDFD8`)
  - Typography: `ink` (`#1A2220`), `ink-muted` (`#5C6762`)
  - Brand & Status: `campus green` (`#1E5B4B`), `green-tint` (`#E3EEE9`), `brick` (`#B24A2F`), `slate` (`#5B6770`)
  - Claim Tag Motif: `tag amber` (`#E3A92F`) used solely for physical intake luggage tags
- **Shape System**: `6px` radius on inputs and buttons, `12px` on cards and sheets, `full radius` (`rounded-full`) exclusively on status chips.
- **Strict Compliance**:
  - Zero gradients (no gradient backgrounds, buttons, text, borders, or glows)
  - Zero purple, violet, indigo, or pink
  - Zero glassmorphism, backdrop blur, or glowing shadows
  - Zero emojis or sparkle icons; zero tracked ALL-CAPS eyebrow labels
  - Sentence case everywhere; plain, active, institutional copy

## Motion System (`src/motion/`)

- `tokens.ts`:
  - Easings: `out [0.22, 1, 0.36, 1]`, `inOut [0.65, 0, 0.35, 1]`
  - Springs: `soft` (`{ stiffness: 260, damping: 30 }`), `snappy` (`{ stiffness: 420, damping: 34 }`), `sheet` (`{ stiffness: 300, damping: 32 }`)
  - Durations: `micro 0.15s`, `ui 0.3s`, `page 0.45s` (exits run at ~60% of entrance duration)
- `variants.ts`: `maskedLine`, `riseIn`, `staggerContainer`, `fadeScale`, `slideSheetRightVariants`, `slideSheetBottomVariants`
- **Primitives**:
  - `<PageTransition>`: Smooth opacity and subtle y entry/exit with `mode="popLayout"`
  - `<Reveal>`: Scroll reveals with `useInView`, `once: true`, and `margin: "-80px"`
  - `<AnimatedNumber>`: Spring-driven numerical counter with `useSpring` and `useTransform`
  - `<Pressable>`: Tactile `whileTap={{ scale: 0.98 }}` spring interaction
  - `<Skeleton>`: Pure flat opacity pulse between 0.45 and 0.85 (no shimmer gradients)
  - `<StatusChip>`: Full-radius status badge whose background, text, and border smoothly morph across lifecycle states
  - `<Toast>`: Context-driven stacked notifications with horizontal swipe-to-dismiss and undo actions
  - `<Dialog>` & `<Sheet>`: Accessible Radix dialogs integrated with `AnimatePresence` and flat neutral overlays

## Routes

- `/` — Institutional home gateway with campus metrics and recent intake showcase
- `/browse` — Public property catalog with search, campus building filters, and item cards
- `/items/:id` — Detailed article custody inspection, verification checklist, and claim initiation
- `/report` — Missing property intake submission form
- `/my-reports` — Claimant tracking records for active and closed reports
- `/admin` — Campus safety custody desk console and release sign-off
- `/sign-in` — University single sign-on (SSO) authentication
- `*` — 404 page featuring the swinging `LF-404` luggage-tag motif on a damped rotation spring
- `/styleguide` — Interactive design and motion system specification laboratory

## Institutional Configuration

All campus-specific text, intake buildings, categories, desk operating hours, and statutory 90-day retention policies are defined in [src/config/college.ts](src/config/college.ts) so the portal can be easily retargeted.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript check and production build
npm run build
```
