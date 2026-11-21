# College Lost and Found Portal

A production-quality campus lost and found repository designed for institutional trust, calm credibility, and verified physical property retrieval workflows.

## Stack

- **Framework**: Vite + React 19 + TypeScript
- **Database & Auth**: Supabase (PostgreSQL with RLS, Storage, Realtime subscriptions)
- **Data Fetching**: TanStack Query (`@tanstack/react-query`) with optimistic updates and rollback
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

## Backend & Database Setup (Supabase)

The portal can run completely against a live Supabase project or seamlessly against the built-in mock backend.

### 1. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK=false
```

When `VITE_USE_MOCK=true` or when credentials are left as placeholders, the portal automatically falls back to the in-memory mock API without errors.

### 2. Database Schema & RLS Migrations

Apply the migration in [supabase/migrations/20261121000000_initial_schema.sql](supabase/migrations/20261121000000_initial_schema.sql) through the Supabase Dashboard SQL Editor or Supabase CLI:

- **Profiles**: `profiles(id, name, role 'student'|'admin', email)` linked to `auth.users`. Includes trigger enforcing `@stjude.edu` university domain.
- **Items**: `items(id, ref_code, type 'lost'|'found', title, description, category, location, occurred_at, status, photo_path, private_detail, reporter_id, held_at, created_at)`.
  - Sequential reference code generator `generate_ref_code()` formatted as `LF-0001`.
- **Claims**: `claims(id, item_id, claimant_id, description, identifying_detail, proof_path, status, reviewed_by, reject_reason, created_at)`.
- **Notifications**: `notifications(id, user_id, text, read, created_at)`.
- **Security & Privacy**:
  - Row Level Security (RLS) enabled across all tables.
  - Public read access queries the `public_items` view, guaranteeing `private_detail` is never exposed to unauthorized users.
  - Claimants can insert and read only their own claims.
  - Staff administrators have full verification privileges.
- **Storage**: `item-photos` bucket for evidence and intake photography, capped at 5MB with client-side image compression.

To populate realistic sample campus items, execute [supabase/seed.sql](supabase/seed.sql).

### 3. Realtime & TanStack Query

- **Realtime Channel**: Subscribes to `public:items` table insertions.
  - On **Home** (`/`), new found items glide into the top of "Handed in today" with a 1.2s amber outline.
  - On **Browse** (`/browse`), new items matching the active filters slide down a `"1 new item. Show"` pill below the toolbar without disturbing the user's active viewport or grid.
- **TanStack Query**: Wraps the unified API gateway with query caching, refetch management, and optimistic mutations with automatic Toast rollback on error.

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

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript check and production build
npm run build
```
