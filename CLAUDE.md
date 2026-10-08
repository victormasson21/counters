# Counters

Personal PWA that shows the time elapsed since events. Vite, React, TypeScript, pnpm. Data lives in the browser's `localStorage`; there is no backend. Design and plan: `docs/superpowers/`.

## Git

- Commit directly on `main`. This repo has one maintainer and no outside contributors, so a branch and PR add nothing. Revert to branches and PRs if the repo ever takes outside contributions.
- Push as the personal GitHub account: `GH_TOKEN=$(gh auth token --user victormasson21) git push`. The active `gh` account is a work account with no access here.
- A push to `main` deploys to `counters.vicm.dev` through `.github/workflows/deploy.yml`.

## Commands

- `pnpm dev` — dev server on `localhost:5173`
- `pnpm test` — Vitest unit tests on the pure logic in `src/counter.ts`, `src/datetime.ts`, `src/backup.ts`
- `pnpm lint` — oxlint
- `pnpm build` — type-check, then build `dist` with the PWA manifest, icons and service worker

## Data contract

The `localStorage` key `counters` and the export file hold the same JSON array of `Counter` (`src/counter.ts`). A change to that shape breaks existing backups and stored data, so keep `isCounter` accepting the old shape or add a migration.
