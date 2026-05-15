<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# STK Architecture · Apprendre du Vivant

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 (CSS-first `@theme`) · Framer Motion 12 · Zustand 5.

Tailwind v4 has **no** `tailwind.config.ts` — tokens live in `src/app/globals.css` under `@theme`.

## Layered architecture (do not blur the boundaries)

```
src/
├── app/                Next.js routes — pages + layouts only, no business logic
├── components/         UI layer — pure presentation
│   ├── layout/         Header, Footer, OrganicBackground (persistent)
│   ├── ui/             Button, Input — primitives
│   ├── motion/         Reveal — SSR-safe motion primitives
│   └── game/           Card, Board, ValidationModal — game-specific UI
├── stores/             Zustand stores — playerStore, scoreStore, gameStore
├── game-engine/        Pure logic, no React — types, score, shuffle, validation
├── data/               Static content — 22 pairs, 5 levels
└── lib/                Cross-cutting utilities — cn, motion presets, leaderboard
```

Rule: **never** put game logic in `app/` or UI in `game-engine/`. The engine knows nothing about React.

## Score contract (Flora Konan, REGLE DES SCORES.docx)

```
score = max(0, paires × 500 − erreurs × 150 − temps_secondes × 2)
```

- Timer starts on the **"Commencez le Jeu"** click at the end of `/intro` (see `scoreStore.startTimer`).
- Timer never resets between levels.
- Timer stops when the last pair of level 5 is validated (`scoreStore.endTimer`).
- Errors accumulate across all 5 levels.
- The numeric score is computed **exactly once**, on `/leaderboard`, via `calculateEndOfGameScore`.
- The score must **never** be displayed during gameplay. The "Paires: X/N" counter in the gameplay header is a **pair counter**, not a score.

## Anti-patterns (do not repeat from the previous prototype)

1. **No `setState` inside `useEffect`** — the React 19 ESLint rule will fail the build. Derive state with `useMemo`.
2. **No aggressive reset on wrong pair** — always open `ValidationModal` with the soft red `ring-error-soft` utility. Never shake the screen, never flash, never auto-clear the cards.
3. **No `opacity: 0` blocked frames** — use `Reveal` with `immediate` when content must be visible on first paint. The default `Reveal` is SSR-safe.
4. **No gaming aesthetic** — sand, ivory, organic green only. Display font (`Permanent_Marker`) is reserved for the celebratory "GAGNÉ!!" headline.
5. **Don't hard-code the gameplay board pixels** — the definitive maquette of the board isn't locked. Keep `<Board>` flexible.

## Routing

```
/                landing — "Apprendre Du Vivant" + CTA
/pseudo          name input — submits → /intro
/intro           3-step onboarding (Observez / Associez / Comprenez)
                 last step starts the timer + navigates to /levels
/levels          hub with 5 unlock-gated tiles
/play/[level]    gameplay (1..5, SSG'd)
/leaderboard     final score + Google Sheets list (only after N5)
```

## Backend

There is none. The leaderboard speaks to Google Sheets via Apps Script. Wire the URL with `NEXT_PUBLIC_LEADERBOARD_URL`. Without it, `lib/leaderboard.ts` becomes a no-op so the UI can be developed in isolation.

## Assets

- `/public/images/background/organic.jpeg` — official background (from Maquettes).
- `/public/images/cards/` — currently empty. The 44 photos live in `../Images/` as numerically-named screenshots; the mapping to `pairs.ts` is a pending task. While `imageSrc: null`, the `GameCard` falls back to label-only rendering.

## Reference docs

- `../RÈGLES DU JEU.pdf` — the 22 pairs with pedagogical explanations.
- `../REGLE DES SCORES.docx` — score formula + Google Sheets contract.
- `../STK_Jeu-Cahier des charges_IndA-260403.pdf` — intent, audience, art direction.
- `../brand_guidelines_updated.pdf` — typography (Inter Semi-Bold) + palette (#AEA287 / #EAF4DB / #30A280).
- `../Maquettes/` — Landing, Pseudo, Accueil-{1,2,3}, Page jeu-{1..5}, Page Validation, Frame, Frame-1.
