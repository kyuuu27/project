# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeBlog — full-stack blog platform MVP. Monorepo with npm workspaces: `client` (Next.js 14 App Router) and `server` (Express + MongoDB). Currently running entirely on mock data (no backend required).

## Commands

```bash
# Root (from project1/)
npm run dev          # Run both client and server concurrently
npm run dev:client   # Next.js dev server on port 3000
npm run dev:server   # Express dev server on port 5000 (requires MongoDB)
npm run build        # Build both workspaces
npm run lint         # Lint all workspaces

# Client only (from client/)
npm run dev          # next dev
npm run build        # next build
npm run lint         # next lint

# Server only (from server/)
npm run dev          # tsx watch src/index.ts
npm run build        # tsc
npm run lint         # tsc --noEmit
```

## Architecture

### Dual API Layer

Two modules with **identical function signatures and types**:

| File | Purpose | Import path |
|------|---------|-------------|
| `client/src/lib/api.ts` | Real axios calls to Express backend | `@/lib/api` |
| `client/src/lib/mock-api.ts` | In-memory mock (session-persistent), no backend needed | `@/lib/mock-api` |

All pages and the auth store currently import from `@/lib/mock-api`. To switch to the real backend, globally replace `@/lib/mock-api` with `@/lib/api` in all imports, start MongoDB, and run `npm run dev` from root.

Both modules share the same exported types: `User`, `AuthResponse`, `PostAuthor`, `PostSummary`, `PostDetail`, `PostsResponse`, `PostResponse`, `CreatePostInput`, `CommentData`.

### Mock Data Lifecycle

- `client/src/lib/mock-data.ts` — seed data (3 users, 6 posts, 6 comments)
- `client/src/lib/mock-api.ts` — mutates in-memory arrays; new users/posts/comments persist until page refresh
- Auth uses a fake token (`mock_token_<userId>_<timestamp>`) and tracks `currentUserId` in module scope

### Client State Management

`client/src/store/auth.ts` — Zustand store with `user`, `token`, `isLoading`, `isHydrated`. On login/register: saves to localStorage, updates store. `hydrate()` restores from localStorage on mount via `AuthHydrator` component in `app/layout.tsx`. Logout clears both.

### Client Component Patterns

- All pages are `"use client"` (fetch mock data in useEffect)
- Every data-fetching page handles 3 states: loading (spinner/skeleton), error (AlertCircle + message), empty (CTA or empty message)
- `cn()` from `@/lib/utils` merges Tailwind classes via clsx + tailwind-merge

### Client Path Alias

`@/*` maps to `./src/*` (tsconfig paths). All source files live under `client/src/`, including components. Nothing should go in `client/components/` — it won't resolve via `@/`.

### Shadcn/UI Setup

- `components.json` aliases: `@/components` → `./src/components`, `@/lib/utils` → `./src/lib/utils`, `@/components/ui` → `./src/components/ui`
- Existing UI components: button, card, input, textarea, badge, separator (all in `client/src/components/ui/`)
- To add a new shadcn component: `npx shadcn-ui@latest add <name>` from `client/`

### Server Structure (Express API — not currently active)

```
server/src/
  index.ts           Entry: MongoDB connect, CORS, JSON parser, route registration
  routes/            Express Router per resource (auth, posts, comments)
  controllers/       Request handlers with Zod validation
  models/            Mongoose schemas (User, Post, Comment)
  middleware/auth.ts  requireAuth (mandatory JWT) + optionalAuth (silent pass)
```

API routes: `POST /api/auth/login`, `POST /api/auth/register`, `GET/POST /api/posts`, `GET /api/posts/:id`, `POST /api/posts/:id/like`, `GET/POST /api/comments`.

### Client Routes (App Router)

| Path | File | Description |
|------|------|-------------|
| `/` | `app/page.tsx` | Homepage with post list + pagination |
| `/post/[id]` | `app/post/[id]/page.tsx` | Article detail + Markdown + comments |
| `/write` | `app/write/page.tsx` | Article editor (auth-gated) |
| `/login` | `app/login/page.tsx` | Login form |
| `/register` | `app/register/page.tsx` | Registration form |
| `/profile/[id]` | `app/profile/[id]/page.tsx` | User profile card |

### Key Dependencies

- **UI**: Tailwind CSS 3.4 with CSS variables theming, tailwindcss-animate, Radix UI Slot, Lucide React icons, Shadcn/UI
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter (Prism, oneDark theme)
- **State**: Zustand 4.5
- **Server**: Express 4.21, Mongoose 8.6, Zod 3.23, bcryptjs, jsonwebtoken
