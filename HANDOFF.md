# BRAG App — Handoff for Next Session

## What is BRAG
A personal progress tracking app. A **brag** is a logged moment of proof — something you did that you're proud of (verb: "I bragged that I ran 5 miles today"). The app is built around three core concepts:
- **Board** — a life area container (Fitness, Faith, Career, etc.)
- **Arc** — a focused challenge inside a board (Ironman Training, Read 24 Books)
- **Brag** — an individual logged moment, the core unit everywhere

## Tech Stack
- Next.js 16.2.6 (App Router, client components)
- React 19, TypeScript, Tailwind CSS
- **All data is localStorage only** — no backend yet
- Run with: `npm run dev -- -p 3012` (must use port 3012 to preserve existing local data)
- Repo: https://github.com/valentinocavaricci/Brag

## What Was Built This Session

### UI Polish
- Profile page: smaller name, removed handle/location line, bio unbold + bigger, stats larger
- Nav bar: balanced Brag pill spacing (`mx-2` instead of `ml-2`)
- Color picker on new board: 7 columns, 35 colors including yellow/amber/orange
- Page headers (new board, new brag, edit profile): tightened gap between title and card

### Board Detail Page (`/boards/[slug]/page.tsx`)
- Removed "Full Brag" button from board header
- Empty brag state: ⭐ emoji, fixed button dark mode visibility
- Empty arc state: 🎯 emoji, fixed button dark mode visibility
- Brag composer: polished (separator, bigger avatar, full-width photo preview)
- Brag cards: text-only brags are `text-xl/2xl`, more padding, refined metadata, better action buttons
- Arc form: matches brag composer polish
- Arc cards: show arc `about` description instead of latest brag text (if set)
- Arc cards: navigate to `/boards/[slug]/arcs/[arcSlug]` on tap
- Board page reads `?view=arcs` query param to restore arcs tab on back navigation

### Arc Detail Page (`/boards/[slug]/arcs/[arcSlug]/page.tsx`) — NEW
- Timeline layout: newest at top, oldest at bottom (the "beginning")
- Vertical line + dots connecting entries. Latest dot = black, older = gray
- Each entry labeled `· Latest` or `· Beginning`
- `↓ Beginning` button scrolls to oldest entry
- Three-dot button (top-right of header) opens inline edit panel: change arc title + add "About this arc"
- About text shows on arc card AND in the arc header
- Back button goes to `/boards/${slug}?view=arcs` (funnels up correctly)
- Composer pre-tagged to the arc, no arc selector needed

### Arc Metadata Storage (`/app/lib/arcs.ts`) — NEW
- localStorage key: `brag.arcMeta.v1`
- Stores `{ title?, about? }` per `boardName::arcName`
- `useArcMeta()` hook with `getArcMeta()` and `updateArcMeta()`

### Terminology Standardized
Everything now uses "brag" as the core unit:
- "Journey" → "Brags"
- "Add Proof" → "Add Brag"
- "No proof yet" → "Nothing bragged yet"
- "What's the proof?" → "What did you do?"
- "X proofs" → "X brags"

## What Still Needs to Be Done

### High Priority (UI)
- **Home feed (`/`)** — currently shows mock data, needs to show real brags from localStorage
- **Explore page** — currently static/mock, needs real content
- **Notifications page** — currently mock data only
- **Profile edit page** — form exists but doesn't save to localStorage yet (name, bio, location)
- **Mobile bottom nav** — overall spacing and active states could be refined

### Medium Priority (Features)
- **Brag from arc page with photo** — arc page composer currently text-only (no photo upload)
- **Arc completion** — ability to mark an arc as "Complete" and have it show differently on the board
- **Board ordering** — drag-to-reorder exists on boards page but needs testing
- **Comments sheet** — `CommentsSheet` component exists but doesn't persist comments to localStorage

### Big Next Milestone — Real Backend (Supabase)
The owner wants to actually log in and build a real portfolio to show investors. Current localStorage approach won't work for that.

**Recommended path: Supabase**
- Replace all localStorage with Supabase Postgres tables
- Tables needed: `profiles`, `boards`, `brags`, `arc_meta`, `cheers`, `pins`
- Auth: Supabase Auth (email/password + Google)
- All `useCreatedBoards()`, `useCreatedBrags()` etc. hooks need to become async Supabase queries
- This is a significant refactor but the data model is already clean and well-defined

### Storage Keys (if migrating from localStorage)
- `brag.createdBoards.v1` — boards
- `brag.boardPreferences.v1` — board title/description/cover overrides
- `brag.created.v1` — all brags
- `brag.cheers.v1` — cheered brag IDs
- `brag.pins.v1` — pinned board names
- `brag.arcMeta.v1` — arc title + about descriptions
- `brag-theme` — light/dark preference

## Design Language
- Font: system black (`font-black`) for headings, `font-semibold` for body
- Colors: zinc scale throughout, `bg-[#fbfbfb]` page background
- Cards: `rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100`
- Dark mode: uses `[data-theme="dark"]` on `<html>`, CSS overrides in `globals.css`
- Primary buttons use `.profile-primary-button` class for dark mode support
- Board/arc headers: dark gradient hero with white text, blur overlays

## Key Files
- `app/boards/[slug]/page.tsx` — board detail (brags + arcs tabs)
- `app/boards/[slug]/arcs/[arcSlug]/page.tsx` — arc timeline page
- `app/boards/new/page.tsx` — create board flow
- `app/brags/new/page.tsx` — create brag flow
- `app/profile/page.tsx` — profile with boards grid
- `app/lib/brags.ts` — brag CRUD + hooks
- `app/lib/boards.ts` — board CRUD + hooks
- `app/lib/arcs.ts` — arc metadata hooks
- `app/components/app-nav.tsx` — top + bottom nav
- `app/globals.css` — dark mode overrides, custom component classes
