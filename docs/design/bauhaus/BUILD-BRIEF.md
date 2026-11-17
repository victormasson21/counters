# Build brief: Bauhaus redesign

You're implementing the redesign in `docs/design/bauhaus/DESIGN.md` in this repo. Read `CLAUDE.md` first, then the whole spec.

## Branch and rollback (overrides CLAUDE.md's "commit on main" for this piece of work)

- Work only on the `design/bauhaus` branch. **Don't commit to `main` and don't push `main`**, because a push to `main` deploys to production.
- The pre-redesign version is tagged `v1-heat-gradient`. Rolling back means redeploying that tag, so don't move or delete it.
- You may push `design/bauhaus` itself (`GH_TOKEN=$(gh auth token --user victormasson21) git push -u origin design/bauhaus`), which doesn't deploy. Merging into `main` is Victor's call.

## Order of work

1. Data: make `palette` optional on read and stop writing it (spec §5 and §8). Add tests in `backup.test.ts` and `counter.test.ts` showing old data and old backups still load.
2. Logic: add a pure `shape.ts` with the colour/shape cycle (§3) and the size/position function (§4, including countdown and goal rules from §8), with unit tests. Keep `intensity` and delete the gradient helpers and `palettes.ts`.
3. Tokens and font: swap Geist for `@fontsource/jost`, and put the colours from §2 in `index.css`.
4. Screens: List, Empty, New, Edit, then the Backup sheet and ⋯ menu restyle. The `.dc.html` prototypes in `docs/design/bauhaus/screens/` show exact values. Read them, but don't copy their templating runtime.
5. Run `pnpm lint`, `pnpm test` and `pnpm build`. All three must pass.
6. Update `CLAUDE.md` (the design spec path and the test list) and add a one-line pointer in `docs/design/design-spec.md` saying it is superseded by the Bauhaus spec.

Commit in small, conventional steps, as the existing history does.

## Done means

- The four screens match the spec at 390 px wide and still work at wider widths.
- Existing data in `localStorage` and existing backup files load without loss.
- Countdowns, past-goal pulse, restart confirmation and backup all still work.
- Lint, tests and build pass on `design/bauhaus`.

When finished, report what changed, anything in the spec you couldn't follow and why, and how to preview the branch (`pnpm dev`).
