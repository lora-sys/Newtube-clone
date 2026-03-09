<div align="center">

<picture>
<img alt="NewTube Logo" src="/logo/logo.png" width="50%" height="50%">
</picture>

<h1 align="center">NewTube Clone</h1>

<p align="center">
  A full-stack YouTube clone built with Next.js 15, tRPC, and modern web technologies
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-code-style">Code Style</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1.6-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

</div>

---

## 📑 Table of Contents

- [📑 Table of Contents](#-table-of-contents)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
  - [Required Environment Variables](#required-environment-variables)
  - [Platform Setup Guide](#platform-setup-guide)
- [🏛️ Architecture](#️-architecture)
  - [System Architecture](#system-architecture)
  - [API Data Flow](#api-data-flow)
  - [Database ER Diagram](#database-er-diagram)
- [💻 Code Style \& Patterns](#-code-style--patterns)
  - [Programming Paradigms](#programming-paradigms)
  - [Project Conventions](#project-conventions)
  - [Naming Conventions](#naming-conventions)
- [🛠️ Tech Stack](#️-tech-stack)
- [📄 License](#-license)

---

## 📁 Project Structure

```
newtube-clone/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Authentication routes group
│   │   ├── 📁 sign-in/              # Sign-in page
│   │   └── 📁 sign-up/              # Sign-up page
│   ├── 📁 (home)/                   # Main application routes
│   │   ├── 📁 feed/                 # Video feed pages
│   │   │   ├── 📁 subscriptions/    # Subscribed channels
│   │   │   └── 📁 trending/         # Trending videos
│   │   ├── 📁 playlists/            # Playlist management
│   │   ├── 📁 search/               # Search functionality
│   │   ├── 📁 users/[userId]/       # User channel pages
│   │   └── 📁 videos/[videoId]/     # Video watch pages
│   ├── 📁 (studio)/                 # Creator studio
│   │   └── 📁 studio/               # Video management & editing
│   └── 📁 api/                      # API routes
│       ├── 📁 trpc/                 # tRPC handlers
│       ├── 📁 uploadthing/          # File upload handlers
│       ├── 📁 users/                # User webhooks
│       └── 📁 videos/               # Video webhooks & workflows
│
├── 📁 components/                   # Shared UI components
│   └── 📁 ui/                       # shadcn/ui components
│
├── 📁 db/                           # Database layer
│   ├── 📄 db.ts                     # Database connection
│   └── 📄 schema.ts                 # Drizzle ORM schema
│
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 use-mobile.tsx            # Mobile detection hook
│   ├── 📄 use-intersection-observer.tsx
��   └── 📄 use-subscription.ts       # Subscription state hook
│
├── 📁 lib/                          # Core libraries & utilities
│   ├── 📄 auth.ts                   # Authentication helpers
│   ├── 📄 mux.ts                    # Mux video SDK
│   ├── 📄 redis.ts                  # Upstash Redis client
│   ├── 📄 ratelimit.ts              # Rate limiting
│   ├── 📄 uploadthing.ts            # File upload utilities
│   ├── 📄 workflow.ts               # QStash workflow client
│   └── 📄 utils.ts                  # Utility functions
│
├── 📁 moubles/                      # Feature modules (domain-driven)
│   ├── 📁 auth/                     # Authentication features
│   ├── 📁 categories/               # Video categories
│   ├── 📁 comments/                 # Comment system
│   ├── 📁 home/                     # Home page features
│   ├── 📁 playlists/                # Playlist management
│   ├── 📁 search/                   # Search functionality
│   ├── 📁 studio/                   # Creator studio
│   ├── 📁 subscriptions/            # Subscription system
│   ├── 📁 suggestions/              # Video suggestions
│   ├── 📁 users/                    # User profiles
│   ├── 📁 video-reactions/          # Likes/dislikes
│   ├── 📁 video-views/              # View tracking
│   └── 📁 videos/                   # Video core features
│
├── 📁 trpc/                         # tRPC configuration
│   ├── 📄 client.tsx                # Client-side tRPC
│   ├── 📄 server.tsx                # Server-side tRPC
│   ├── 📄 init.ts                   # tRPC initialization & middleware
│   ├── 📄 query-client.ts           # TanStack Query config
│   └── 📁 router/                   # API routers
│
├── 📁 migrations/                   # Database migrations
├── 📁 public/                       # Static assets
├── 📁 logo/                         # Architecture diagrams
└── 📁 scripts/                      # Utility scripts
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **Bun** (recommended) or npm/pnpm/yarn
- **PostgreSQL** database (Neon, Supabase, or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/newtube-clone.git
   cd newtube-clone
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your environment variables (see [Environment Variables](#️-environment-variables))

4. **Push database schema**
   ```bash
   bun run db:push
   # or
   npm run db:push
   ```

5. **Seed categories (optional)**
   ```bash
   bun run scripts/seed-categories.ts
   ```

6. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# ==============================================
# Database
# ==============================================
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# ==============================================
# Clerk Authentication
# ==============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_WEBHOOK_SIGNING_SECRET="whsec_xxxxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# ==============================================
# Mux Video Processing
# ==============================================
MUX_TOKEN_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MUX_TOKEN_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
MUX_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ==============================================
# UploadThing (File Uploads)
# ==============================================
UPLOADTHING_TOKEN="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ==============================================
# Upstash Redis & QStash
# ==============================================
UPSTASH_REDIS_REST_URL="https://xxxx-xxxx-xxxx-xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
QSTASH_WORKFLOW_URL="https://your-domain.com"  # Your production domain or ngrok URL

# ==============================================
# AI Services (Optional)
# ==============================================
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# or
ZHIPU_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ==============================================
# Ngrok (Development only)
# ==============================================
NGROK_AUTHTOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Platform Setup Guide

#### 1. 🗄️ PostgreSQL Database (Neon)

**Why Neon?** Serverless PostgreSQL with generous free tier.

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string from **Dashboard → Connection Details**
4. Paste as `DATABASE_URL`

```
Format: postgresql://[user]:[password]@[endpoint].[region].neon.tech/[database]?sslmode=require
```

---

#### 2. 🔐 Clerk Authentication

**Why Clerk?** Complete authentication solution with webhooks.

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. **Get API Keys:**
   - Navigate to **API Keys**
   - Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy `Secret Key` → `CLERK_SECRET_KEY`

4. **Configure Sign-in/Sign-up URLs:**
   - Go to **Paths** in sidebar
   - Set Sign-in URL: `/sign-in`
   - Set Sign-up URL: `/sign-up`

5. **Set up Webhook:**
   - Go to **Webhooks** → **Add Endpoint**
   - Endpoint URL: `https://your-domain.com/api/users/webhook`
   - Subscribe to events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SIGNING_SECRET`

---

#### 3. 🎬 Mux Video Processing

**Why Mux?** Professional video streaming with HLS, auto-generated subtitles.

1. Go to [Mux Dashboard](https://dashboard.mux.com/)
2. Create a new environment (or use the Development environment)
3. **Get API Tokens:**
   - Navigate to **Settings → API Access Tokens**
   - Create a new token with **Full Access**
   - Copy `Token ID` → `MUX_TOKEN_ID`
   - Copy `Token Secret` → `MUX_TOKEN_SECRET`

4. **Set up Webhook:**
   - Go to **Settings → Webhooks**
   - Add a new webhook: `https://your-domain.com/api/videos/webhook`
   - Select events:
     - `video.upload.cancelled`
     - `video.asset.created`
     - `video.asset.ready`
     - `video.asset.errored`
     - `video.track.created`
     - `video.track.ready`
   - Copy the webhook secret → `MUX_WEBHOOK_SECRET`

---

#### 4. 📤 UploadThing

**Why UploadThing?** Simple file uploads for thumbnails and banners.

1. Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
2. Create a new app
3. Copy the API key from **API Keys** → `UPLOADTHING_TOKEN`

---

#### 5. ⚡ Upstash Redis & QStash

**Why Upstash?** Serverless Redis for caching and task queues.

##### Redis Setup:
1. Go to [Upstash Console](https://console.upstash.io/)
2. Create a new Redis database
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

##### QStash Setup:
1. In Upstash Console, go to **QStash**
2. Create a new QStash instance
3. Copy:
   - `QSTASH_URL`
   - `QSTASH_TOKEN`
4. Set `QSTASH_WORKFLOW_URL` to your domain (or ngrok URL for development)

---

#### 6. 🤖 AI Services (Optional)

Used for auto-generating video titles, descriptions, and thumbnails.

##### OpenAI:
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy → `OPENAI_API_KEY`

##### ZhiPu (Alternative):
1. Go to [ZhiPu AI](https://open.bigmodel.cn/)
2. Get API key from console
3. Copy → `ZHIPU_API_KEY`

---

#### 7. 🔗 Ngrok (Development)

**Required for local webhook testing**

1. Go to [Ngrok Dashboard](https://dashboard.ngrok.com/)
2. Get your auth token from **Your Authtoken**
3. Copy → `NGROK_AUTHTOKEN`
4. Run with `bun run dev:all` to start both Next.js and ngrok

---

## 🏛️ Architecture

### System Architecture

The application follows a **three-tier architecture** with modern serverless patterns:

<img src="/logo/architecture.png" alt="System Architecture" width="100%">

**Architecture Layers:**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Presentation** | Next.js 15 (App Router) | SSR/SSG, routing, UI components |
| **API** | tRPC | Type-safe RPC layer with middleware |
| **Data** | PostgreSQL + Drizzle ORM | Persistent storage with type-safe queries |
| **External Services** | Clerk, Mux, UploadThing, Upstash | Authentication, video, uploads, caching |

**Key Design Decisions:**

1. **Server Components by Default** - Most components are server-rendered for optimal performance and SEO
2. **tRPC for Type Safety** - End-to-end type safety from database to frontend
3. **Feature-based Module Structure** - Code organized by domain (moubles/)
4. **Edge-compatible Runtime** - Optimized for Vercel Edge and serverless deployments

---

### API Data Flow

<img src="/logo/apirequestflow.png" alt="API Data Flow" width="100%">

**Request Flow:**

```
Client Component
      │
      │ trpc.videos.getMany.useQuery()
      ▼
┌─────────────────────────────────────────────────────────┐
│  tRPC Client (type-safe)                                │
│  - Automatic serialization (superjson)                  │
│  - Request batching                                     │
└─────────────────────────────────────────────────────────┘
      │
      │ HTTP POST /api/trpc/videos.getMany
      ▼
┌─────────────────────────────────────────────────────────┐
│  protectedProcedure Middleware                          │
│  1. Verify Clerk JWT                                    │
│  2. Get dbUserId (JWT metadata → Redis → Database)     │
│  3. Rate limit check (Upstash)                         │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Route Handler (videos.getMany)                         │
│  - Input validation (Zod)                               │
│  - Business logic                                       │
│  - Database query (Drizzle ORM)                        │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Response                                               │
│  - Type-safe JSON response                              │
│  - Cached by TanStack Query                            │
└─────────────────────────────────────────────────────────┘
```

**Authentication Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    protectedProcedure                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Check JWT for clerkUserId                                   │
│     if (!clerkUserId) → 401 UNAUTHORIZED                        │
│                                                                 │
│  2. Check JWT publicMetadata for dbUserId (optimized path)      │
│     if (dbUserId) → Skip database query                         │
│                                                                 │
│  3. Check Redis cache                                           │
│     key: "user:dbId:{clerkUserId}"                              │
│     if hit → Return cached dbUserId                             │
│                                                                 │
│  4. Query database (fallback)                                   │
│     SELECT * FROM users WHERE clerk_id = ?                      │
│                                                                 │
│  5. Update cache & metadata                                     │
│     - Cache to Redis (TTL: 1 hour)                              │
│     - Update Clerk publicMetadata                               │
│                                                                 │
│  6. Rate limit check                                            │
│     if exceeded → 429 TOO_MANY_REQUESTS                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Database ER Diagram

<img src="/logo/er.png" alt="Database ER Diagram" width="100%">

**Core Tables:**

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | User profiles | 1:N → videos, playlists, comments |
| `videos` | Video metadata | N:1 → users, categories |
| `categories` | Video categories | 1:N → videos |
| `subscriptions` | User subscriptions | N:N users (viewer ↔ creator) |
| `videos_views` | View tracking | N:N users ↔ videos |
| `video_reactions` | Likes/dislikes | N:N users ↔ videos |
| `comments` | Comments & replies | N:1 users, videos; self-referencing |
| `comment_reactions` | Comment reactions | N:N users ↔ comments |
| `playlists` | User playlists | N:1 users |
| `playlist_videos` | Playlist contents | N:N playlists ↔ videos |
| `watch_later` | Watch later list | N:N users ↔ videos |

**Schema Highlights:**

- **Composite Primary Keys** for junction tables (subscriptions, reactions)
- **Self-referencing** in comments table for nested replies
- **Visibility Enums** for videos and playlists (public/private)
- **Cascading Deletes** for data integrity
- **Timestamps** on all tables for soft deletes and auditing

---

## 💻 Code Style & Patterns

### Programming Paradigms

#### 1. **Server Components First**

```tsx
// ✅ Preferred: Server Component for data fetching
// app/(home)/videos/[videoId]/page.tsx
import { HydrateClient, trpc } from "@/trpc/server";

export default async function VideoPage({ params }: { params: { videoId: string } }) {
  // Prefetch data on server
  void trpc.videos.getOne.prefetch({ id: params.videoId });
  
  return (
    <HydrateClient>
      <VideoSection videoId={params.videoId} />
    </HydrateClient>
  );
}
```

```tsx
// ✅ Client Component only when needed
// moubles/videos/ui/components/video-player.tsx
"use client";

import { useState } from "react";

export function VideoPlayer({ playbackId }: { playbackId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  // Interactive logic here
}
```

#### 2. **Type Safety Everywhere**

```tsx
// ✅ Database schema with Drizzle
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  visibility: videoVisiblity("visibility").default("private").notNull(),
});

// ✅ API input validation with Zod
export const videosRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(z.object({
      categoryId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      // input is fully typed
    }),
});
```

#### 3. **Feature-based Module Structure**

```
moubles/
└── videos/                    # One feature = one module
    ├── server/
    │   └── procedures.ts      # tRPC procedures (backend)
    ├── ui/
    │   └── components/        # React components (frontend)
    ├── views/                 # Page-level views
    └── type.ts               # Shared types
```

#### 4. **Error Handling Patterns**

```tsx
// ✅ Error Boundary for component errors
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
  <ErrorFallback error={error} onRetry={resetErrorBoundary} />
)}>
  <VideoSection />
</ErrorBoundary>

// ✅ tRPC error handling
try {
  const { success } = await ratelimit.limit(userId);
  if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
} catch (error) {
  // Handle gracefully
}
```

#### 5. **Optimistic Updates**

```tsx
// ✅ Optimistic UI updates with TanStack Query
const utils = trpc.useUtils();

const mutation = trpc.subscriptions.create.useMutation({
  onMutate: async (input) => {
    // Cancel outgoing refetches
    await utils.subscriptions.getMany.cancel();
    
    // Snapshot previous value
    const previous = utils.subscriptions.getMany.getData();
    
    // Optimistically update
    utils.subscriptions.getMany.setData(undefined, (old) => [...old, input]);
    
    return { previous };
  },
  onError: (err, input, context) => {
    // Rollback on error
    utils.subscriptions.getMany.setData(undefined, context.previous);
  },
});
```

---

### Project Conventions

#### Component Structure

```tsx
// Component file structure
import { componentVariants } from "./variants";  // CVA variants
import { cn } from "@/lib/utils";                 // Class merge utility

interface ComponentProps {
  className?: string;
  // ... other props
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn(componentVariants(), className)}>
      {/* Component content */}
    </div>
  );
}
```

#### Import Order

```tsx
// 1. React/Next imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";

// 3. Internal components
import { Button } from "@/components/ui/button";

// 4. Hooks and utilities
import { useAuth } from "@clerk/nextjs";

// 5. Types
import type { Video } from "@/db/schema";
```

---

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `VideoPlayer`, `SubscriptionButton` |
| **Hooks** | camelCase with `use` prefix | `useIsMobile`, `useSubscription` |
| **Utilities** | camelCase | `formatDuration`, `cn` |
| **Constants** | SCREAMING_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| **Database tables** | snake_case (plural) | `videos`, `video_reactions` |
| **API routes** | camelCase | `getMany`, `createSubscription` |
| **Environment variables** | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `MUX_TOKEN_ID` |
| **File names** | kebab-case | `video-player.tsx`, `use-mobile.tsx` |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.1.6 | React framework with App Router |
| [React](https://react.dev/) | 19.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.1 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | latest | Component library |
| [TanStack Query](https://tanstack.com/query) | 5.x | Server state management |
| [Lucide React](https://lucide.dev/) | latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [tRPC](https://trpc.io/) | 11.x | Type-safe API layer |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.45.1 | Type-safe database ORM |
| [Zod](https://zod.dev/) | 4.x | Schema validation |

### Services & Infrastructure

| Service | Purpose |
|---------|---------|
| [Clerk](https://clerk.com/) | Authentication & user management |
| [Mux](https://mux.com/) | Video processing & streaming |
| [UploadThing](https://uploadthing.com/) | File uploads |
| [Upstash Redis](https://upstash.com/) | Caching & rate limiting |
| [QStash](https://upstash.com/qstash) | Async task queues |
| [Neon](https://neon.tech/) | Serverless PostgreSQL |

### Development Tools

| Tool | Purpose |
|------|---------|
| [Bun](https://bun.sh/) | JavaScript runtime & package manager |
| [ESLint](https://eslint.org/) | Code linting |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Database migrations |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 NewTube Clone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Made with ❤️ by the NewTube Team**

[⬆ Back to Top](#-table-of-contents)

</div>