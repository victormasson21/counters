# Counters — design

## Goal

A personal PWA that shows how long ago events happened. One user, one device at a time. Installed on the phone home screen, served from `counters.vicm.dev`.

## Scope (v1)

- Home page: a list of counter cards and a sticky footer.
- Card: event title, elapsed time in the card's unit, settings button.
- Settings modal: create, edit, reset, delete a counter.
- Backup modal: export and import all counters as a JSON file.
- Offline use and home-screen install.

Out of scope: accounts, cross-device sync, notifications, reordering cards.

## Data

```ts
type Unit = "days" | "seconds" | "centiseconds"

type Counter = {
  id: string          // crypto.randomUUID()
  title: string
  start: number       // epoch ms
  unit: Unit
  limitDays: number   // integer 0–90; 0 disables the limit
}
```

- Store the counters as a JSON array under the `localStorage` key `counters`.
- Call `navigator.storage.persist()` on first load.
- The export file holds the same JSON array.

## Components

| Component       | Responsibility                                                                  |
| --------------- | ------------------------------------------------------------------------------- |
| `App`           | Owns the counters, loads and saves `localStorage`, renders list, footer, modals |
| `CounterCard`   | Shows title, elapsed time, settings button; flashes red past the limit          |
| `SettingsModal` | Native `<dialog>` form to create or edit one counter                            |
| `BackupModal`   | Native `<dialog>` with Export and Import buttons                                |

### Home page

- Cards in a single column, in creation order.
- Empty state: one line of text that points to the Add button.
- Sticky footer: **Add** (primary) opens an empty `SettingsModal`; **Backup** (text link) opens `BackupModal`.

### Settings modal

Fields:

- Title — text, required.
- Start — `datetime-local`, minute precision. New counter default: now.
- Unit — select: days, seconds, centiseconds. New counter default: days.
- Limit — number input, integer 0–90, in days. New counter default: 0.

Buttons:

- **Save** — validates, writes the counter, closes.
- **Cancel** — closes without changes.
- **Reset** (existing counter only) — sets `start` to now, keeps every other saved field, saves, closes.
- **Delete** (existing counter only) — asks for confirmation, removes the counter, closes.

### Backup modal

- **Export** — downloads `counters-YYYY-MM-DD.json` with all counters.
- **Import** — opens a file picker, validates the file, asks for confirmation, replaces all counters.
- An invalid file shows an error message and changes nothing.

Validation: the file must parse as a JSON array, and every item must match `Counter` (types, `unit` in the union, `limitDays` an integer 0–90).

## Display

- Elapsed time = `max(0, now - start)`.
- Format: `Nd HH:MM:SS.cc`. The unit sets where the display stops; each part truncates, never rounds.
  - `days`: `1d`
  - `seconds`: `1d 02:09:01`
  - `centiseconds`: `1d 02:09:01.34`
- The day count has no padding and shows `0d` under one day. Hours, minutes, seconds and centiseconds pad to two digits.
- Centiseconds use a thinner font weight. All digits use `font-variant-numeric: tabular-nums`, so the text does not shift as it ticks.
- Over the limit: `limitDays > 0` and `elapsed > limitDays × 86_400_000`. The counter text flashes red with a CSS animation.

### Clock

One shared clock drives every card. It ticks every 10 ms when any card shows centiseconds, else every 1 s.

## Stack

- Vite, React, TypeScript in strict mode.
- `vite-plugin-pwa` (`generateSW`, `registerType: "autoUpdate"`) for the manifest and service worker.
- CSS Modules plus one global stylesheet with custom properties.
- pnpm, ESLint, Vitest.
- Icons: one SVG plus 192 and 512 PNGs.

## Testing

- Vitest unit tests on pure functions: elapsed formatting per unit, the over-limit check, import validation.
- Manual check in a desktop browser before each push.
- Manual check of the installed PWA on the phone after deploy.

## Deployment

- Git repo `~/Repos/perso/counters`; GitHub repo `victormasson21/counters`.
- `.github/workflows/deploy.yml`: the litcal Pages workflow, built with `pnpm build`, uploading `dist`.
- `public/CNAME` with `counters.vicm.dev`; Vite `base` stays `/`.
- Cloudflare DNS: CNAME `counters` → `victormasson21.github.io`, DNS only.
- GitHub repo settings: Pages source = GitHub Actions, custom domain `counters.vicm.dev`, enforce HTTPS.

## Risks

- Removing the app from the home screen deletes its data. Mitigation: export.
- A different device has separate data. Accepted for v1.
