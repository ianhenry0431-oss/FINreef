# FINreef

An ocean-themed mobile financial literacy app that teaches budgeting, investing, credit, and saving through interactive tools, quizzes, and lessons.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — start the Expo dev server (mobile)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run typecheck` — typecheck the mobile app
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- Expo (React Native) with expo-router file-based routing
- AsyncStorage for local persistence (no backend dependency)
- pnpm workspaces, Node.js 24, TypeScript 5.9
- Inter font family (400/500/600/700)
- expo-linear-gradient, expo-haptics, @expo/vector-icons (Feather)
- API: Express 5 (shared, not yet used by mobile)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/(tabs)/` — all 5 tab screens
- `artifacts/mobile/context/AppContext.tsx` — global state (budget, profile, quiz, lessons) with AsyncStorage
- `artifacts/mobile/constants/colors.ts` — ocean dark/light theme tokens
- `artifacts/mobile/data/quizData.ts` — 15 financial quiz questions
- `artifacts/mobile/data/learnData.ts` — 16 learn tips across 4 categories
- `artifacts/api-server/` — shared Express API server (health endpoint only)
- `lib/api-spec/openapi.yaml` — API contract (minimal, mobile is frontend-only)

## Features

- **Reef Dashboard** — financial health score, XP/level/streak, budget bars, quick actions, daily tip
- **Budget Builder** — income input, 50/30/20 rule presets, category-level spending tracker
- **Calculators** — compound interest, loan payoff, savings goal, retirement planner
- **Challenge** — 15-question financial quiz with XP rewards, categories, explanations
- **Learn** — 16 expandable lessons in Budgeting / Investing / Credit / Saving with +20 XP on completion

## Architecture decisions

- Frontend-only first build: all state persisted via AsyncStorage; no server calls from mobile
- Dark ocean theme as the primary design language (deep navy + cyan/teal + coral accent)
- AppContext merges saved state with defaults on hydration to handle stale/partial shapes
- Score ring uses colored border (not SVG) for simplicity and cross-platform reliability

## User preferences

_Populate as you build._

## Gotchas

- Metro bundler uses HMR — only restart the workflow when changing dependencies
- `useColors()` accesses `colors.dark` / `colors.light` directly (no cast) to avoid TS errors
- Quiz guard: if `questions[currentIdx]` is undefined the screen shows a safe fallback rather than crashing

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- See the `expo` skill for mobile development guidelines
