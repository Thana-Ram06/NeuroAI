# Thinkly — Second Brain AI

## Overview

pnpm workspace monorepo using TypeScript. Thinkly is a personal AI-powered "second brain" web app where users can save thoughts, get AI summaries, and ask questions based on their stored thoughts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/thinkly) — served at `/`
- **API framework**: Express 5 (artifacts/api-server) — served at `/api`
- **Database**: Firebase Firestore (client-side SDK, thoughts stored in `thoughts` collection)
- **AI**: OpenAI gpt-4o-mini (server-side only via `/api/ai/`)
- **Validation**: Zod (`zod/v4`), codegen'd from OpenAPI spec
- **API codegen**: Orval (from OpenAPI spec)

## Architecture

- **Firebase** handles all thought storage/retrieval — client-side with real-time `onSnapshot` subscriptions
- **OpenAI** is called server-side only (API key never exposed to frontend) via two routes:
  - `POST /api/ai/summarize` — summarize all thoughts
  - `POST /api/ai/ask` — ask a question answered from thoughts only
- **Frontend** uses React Query hooks generated from the OpenAPI spec for AI calls

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/thinkly run dev` — run frontend locally
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables / Secrets

- `OPENAI_API_KEY` — OpenAI API key (server-side)
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase API key (injected into Vite via vite.config.ts define)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` — Firebase app ID

## Firestore Structure

```
thoughts/{thoughtId}
  - text: string
  - createdAt: Timestamp
```

## UI Design

- Warm cream/parchment background
- Near-black ink typography
- Muted sage green accent color
- Instrument Serif font for headings, Inter for body
- Centered max-w-3xl layout with generous spacing
- Framer Motion animations on thought cards

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
