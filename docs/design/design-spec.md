# Counters — design spec (v1: "Refined + heat gradient")

This spec covers the redesign of the four app screens: **List**, **Empty**, **New counter** and **Edit counter**.
Reference prototypes are in `screens/` (see the last section). Where this file and a prototype disagree, **this file wins**.

Out of scope for this build: design Directions A–C, the gradient options board, the logo, and the "Ideas bin" items on the design canvas.

---

## 1. Summary of changes from the current app

| Current | New |
|---|---|
| Centred modal for add/edit | Bottom sheet with grabber, close (X) button, scrim |
| "Unit" dropdown | "Precision" segmented control: Days / Hours / Seconds / 1/100 s |
| "Limit (days)" dropdown defaulting to 0 | Optional "Goal" chips: None / 7 days / 30 days / Custom… |
| Reset + Delete styled like Save | Restart = secondary button; Delete = red bin icon button (with confirm) |
| Gear glyph on card | Pencil icon button (44×44), whole card also tappable |
| "Backup" text link in bottom bar | Header overflow button (⋯) opens a menu containing Backup |
| No header | Header with "Counters" title |
| Plain cream cards | Each card has a colour palette; its gradient deepens the longer the counter runs |
| Ambiguous `01/10/2026` dates | Written-out dates: `Thu 1 Oct, 08:40` |
| Digits jitter while ticking | Tabular numerals |

---

## 2. Design tokens

### Colour (UI chrome)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F4F1EA` | App background, footer |
| `surface` | `#FFFDF8` | Sheets, secondary buttons, chips |
| `field` | `#F7F4EE` | Input / picker fill |
| `segmentTrack` | `#EFEBE2` | Segmented control track |
| `border` | `#E4DFD3` | Footer top border, dividers |
| `fieldBorder` | `#DDD7CA` | Inputs, secondary buttons, chips |
| `dashed` | `#B9B2A3` | "Custom…" chip border (dashed) |
| `grabber` | `#D8D2C4` | Sheet grabber |
| `ink` | `#1C1B18` | Primary text, primary button fill |
| `ink2` | `#3D3A33` | Field labels, header icons |
| `segmentText` | `#4E4A42` | Unselected segment text |
| `muted` | `#6B675E` | Secondary text ("· optional", body copy) |
| `placeholder` | `#8A857A` | Input placeholder |
| `danger` | `#B42318` | Delete icon |
| `dangerBorder` | `#EBC9C4` | Delete button border |
| `scrim` | `rgba(28,27,24,0.42)` | Behind sheets |

### Type

Font: **Geist** (Google Fonts), weights 300/400/500/600/700. Use `font-variant-numeric: tabular-nums` on every timer and number.

| Role | Size / weight / tracking |
|---|---|
| Screen title ("Counters") | 28 / 700 / -0.02em |
| Sheet title | 22 / 700 / -0.01em |
| Card title | 15 / 600 |
| Card timer (main part) | 34 / 700 / -0.025em, line-height 1.05, no wrap |
| Card timer (fractional / unit suffix) | same size, weight 300, 78% opacity |
| Card meta ("Since …") | 13 / 400 |
| Goal caption | 12 / 400 |
| Field label | 14 / 500, colour `ink2` |
| Input text | 17 / 400 |
| Primary button | 17 / 600 |
| Segments, chips | 14 / 500 (selected 600) |
| Empty-state title / body | 22 / 600 · 15 / 400, line-height 1.5 |

### Shape and spacing

- Radii: card 22 · sheet 28 (top corners) · inputs and pickers 14 · buttons 16 · chips 20 (pill) · segmented track 14 / segment 10 · empty-state icon tile 28.
- Screen gutter: 20 px. Gap between cards: 12.
- Card padding: 18 top/bottom, 20 left, 8 right (the edit button sits in the right gutter).
- Sheet padding: 10 top, 20 sides, 28 bottom (24 on Edit). Gap between sheet sections: 14 (New) / 12 (Edit). Label to control: 8 (6 on Edit).
- Heights: inputs 52 (48 on Edit) · primary/secondary buttons 56 · chips 40 · segments 40 (38 on Edit) · swatch 34 inside a 44 hit area.
- **Minimum touch target 44×44 everywhere.**

---

## 3. Colour palettes (counter colours)

Each counter stores one palette. A palette has three stops: **light → mid → deep**. Show them in this order in the picker:

| id | Name | Light | Mid | Deep |
|---|---|---|---|---|
| `ember` | Ember | `#FFF1E8` | `#FF8A5B` | `#B3122B` |
| `terracotta` | Terracotta | `#FBEFE6` | `#D9825B` | `#7C2E17` |
| `marigold` | Marigold | `#FFF7DF` | `#FFB020` | `#B23A0B` |
| `honey` | Honey | `#FFF8E6` | `#E8B84A` | `#7A5410` |
| `moss` | Moss | `#F1F6E6` | `#9CC460` | `#24502B` |
| `lagoon` | Lagoon | `#EAF3EE` | `#6FA895` | `#1F4A47` |
| `cobalt` | Cobalt | `#ECF0F4` | `#6F8CAE` | `#1F3550` |
| `berry` | Berry | `#F8ECEE` | `#C7768C` | `#5E1E33` |
| `rosewood` | Rosewood | `#FBF0EC` | `#D58C86` | `#6A1C24` |

Display names may change later (Cobalt → "Denim" and Lagoon → "Eucalyptus" are under consideration). Store the `id`, never the display name.

---

## 4. The heat gradient: exact algorithm

A card's background deepens with elapsed time. The curve is front-loaded: a week reaches about 62%, a month about 78%, and a year 100%.

```ts
type RGB = [number, number, number];
type Palette = [string, string, string]; // light, mid, deep (hex)

const hexToRgb = (h: string): RGB =>
  [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) as RGB;

const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;

/** Sample the palette at t ∈ [0,1]: 0 = light, 0.5 = mid, 1 = deep. */
const ramp = (p: Palette, t: number): RGB => {
  const [a, b, c] = p.map(hexToRgb);
  return t < 0.5 ? mix(a, b, t * 2) : mix(b, c, (t - 0.5) * 2);
};

/** Intensity from elapsed days (fractional). */
export const intensity = (days: number): number =>
  Math.min(1, Math.pow(Math.log(1 + Math.max(0, days)) / Math.log(366), 0.456));

const rgb = (c: RGB) => `rgb(${c.join(',')})`;

/** WCAG relative luminance. */
const luminance = ([r, g, b]: RGB) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export function cardStyle(p: Palette, days: number) {
  const t = intensity(days);
  const mid  = ramp(p, t);        // centre of the card
  const edge = ramp(p, t * 0.4);  // edges stay lighter
  const body = ramp(p, t * 0.72); // where the text sits, used for contrast
  const dark = luminance(body) < 0.28;
  return {
    background: `radial-gradient(130% 170% at 58% 50%, ${rgb(mid)} 0%, ${rgb(edge)} 85%)`,
    color:          dark ? '#FFFFFF' : '#1C1B18',
    secondaryColor: dark ? 'rgba(255,255,255,0.84)' : 'rgba(28,27,24,0.72)',
    goalTrack:      dark ? 'rgba(255,255,255,0.25)' : 'rgba(28,27,24,0.14)',
    shadow: `0 10px 28px -16px ${rgb(mid)}`,
    intensityPct: Math.round(t * 100),
  };
}
```

Reference points (check your implementation against these):

| Elapsed | 1 h | 1 day | 1 week | 2 weeks | 1 month | 1 year |
|---|---|---|---|---|---|---|
| Intensity | ~10% | ~38% | ~62% | ~70% | ~78% | 100% |

Notes:

- Intensity is based on **elapsed time only**, not the goal.
- Recompute the style whenever the timer re-renders. Once a minute is enough for colour.
- The edit (pencil) icon, the timer, the title and the goal-bar fill all use `color`. The "Since …" line and the goal caption use `secondaryColor`.

---

## 5. Timer formatting

Let `d` = whole days, and `h m s cs` = the remainder. Show the `Nd ` prefix only when `d > 0`, except at Days precision.

| Precision | Main part | Suffix (light weight) | Example | Re-render rate |
|---|---|---|---|---|
| Days | `49` | ` days` (` day` if 1) | **49** days | every 60 s |
| Hours | `24d 4h` | ` 46m` | **24d 4h** 46m | every 60 s |
| Seconds | `7d 05:07:48` | — | **7d 05:07:48** | every 1 s |
| 1/100 s | `7d 05:07:48` | `.62` | **7d 05:07:48**.62 | every animation frame (or ~50 ms) |

- Pad hours, minutes, seconds and centiseconds to 2 digits when they follow a colon.
- Pause ticking while the app is in the background.

**"Since" line** (en-GB, 24-hour clock):

- Today: `Started today, 10:34`
- This year: `Since Thu 1 Oct, 08:40`
- Earlier years: `Since Mon 2 Jun 2025, 08:40`
- At Days precision, leave out the time: `Since Thu 20 Aug`

---

## 6. Data model

```ts
type Precision = 'days' | 'hours' | 'seconds' | 'centis';
type PaletteId = 'ember' | 'terracotta' | 'marigold' | 'honey' | 'moss' | 'lagoon' | 'cobalt' | 'berry' | 'rosewood';

interface Counter {
  id: string;
  title: string;
  startAt: string;          // ISO 8601
  precision: Precision;
  goalDays: number | null;  // null = no goal
  palette: PaletteId;
}
```

**Migrating existing data:**

- Map the old `unit` to `precision`: centiseconds → `centis`, and so on.
- An old limit of `0` becomes `goalDays: null`.
- Give existing counters palettes by rotating through the list in order.

**Backup:** the export and import must include `palette` and `goalDays`. On import, a missing `palette` is assigned by rotation.

---

## 7. Screens

### 7.1 List

- **Header:** "Counters" (left). A 44×44 overflow button (⋯) on the right, `aria-label="Backup and settings"`, opens a menu containing **Backup** (the existing backup feature).
- **Body:** a scrollable list of cards, newest first (keep the current order if one already exists).
- **Card (top to bottom):** title → timer → "Since …" → goal block (only when `goalDays` is set).
  - The goal block is a 6 px bar (radius 3, track `goalTrack`, fill `color`, width = elapsed ÷ goal, capped at 100%), then a caption: `24 of 30 days`.
  - Pencil button top-right, 44×44, `aria-label="Edit counter"`. Tapping the card or the pencil opens Edit.
- **Footer:** top border `border`, padding 12 / 20 / 28. Full-width primary button "+ New counter" (56 high, radius 16, `ink` fill, `surface` text).

### 7.2 Empty

- Same header and footer as the List.
- Centred content: the app logo tile at 96×96 (radius 28). The tile is a flat `#FFE066` with `assets/logo-simple.svg` at 76×76 centred, and shadow `0 16px 32px -18px #B8900A`. *(The `Final-Empty.dc.html` prototype still shows the older gradient tile. Follow this spec.)*
- Title "No counters yet". Body: "Track the time since anything."
- No other explanation or visual (that idea is parked).

### 7.5 Logo / app icon

The mark is a hand-drawn-style lemon slice with a single dark lemon outline (`#4A3A12`) around the rind. It has no inner pith ring and no pale yellow. It sits on a flat background of the same yellow as the rind (`#FFE066`), with no gradient. Assets are in `assets/`. Each SVG uses a 200×200 viewBox with a transparent background, so put the `#FFE066` tile behind it.

**PWA icons:** use the separate `counters-pwa-icons` bundle (ready-made PNGs, manifest and `<head>` tags). Don't regenerate them.

| File | Use |
|---|---|
| `logo-detailed.svg` | Large sizes (≥ 256 px): master 1024 icon, splash, marketing |
| `logo-simple.svg` | Medium sizes (≈ 60–180 px): home-screen icon, empty state, in-app |
| `logo-minimal.svg` | Small sizes (≤ 60 px): spotlight, settings, notifications |

- App icon: the mark at about 80% of the tile width (66% for maskable icons), centred on `#FFE066`.
- Dark-mode icon: same mark on `radial-gradient(circle at 50% 42%, #3A3114, #1C1A12 70%, #121109)`.
- Colours: outline `#4A3A12`, rind and background `#FFE066`, flesh `#FFD437`, juice-cell dashes `#9A7414`.

### 7.3 New counter (bottom sheet)

Opened from "New counter". Scrim behind. Grabber (40×5) at the top. The sheet closes on X, on a tap on the scrim, or on a swipe down.

1. **Header:** "New counter" and a close (X) button, 44×44.
2. **Name:** text input, placeholder `e.g. Since our last holiday`.
3. **Started:** three controls in one row:
   - date button (`Thu 8 Oct 2026`), which opens the native date picker
   - time button (`13:46`), which opens the native time picker
   - a "Now" button (filled with `ink`), which sets both fields to the current time
   - Default: now.
4. **Colour** (label shows `· {Palette name}`):
   - A horizontally scrolling row of the 9 swatches: 34 px circles in 44 px buttons, filled `radial-gradient(circle, ramp(p,0.8), ramp(p,0.35))`.
   - The selected swatch gets a ring: `0 0 0 2px surface, 0 0 0 4px ink`. Each swatch has `aria-label` = the palette name and `aria-pressed`.
   - Underneath: a 10 px preview bar, `linear-gradient(90deg, ramp(p,0) 0%, ramp(p,.376) 38%, ramp(p,.62) 62%, ramp(p,.78) 78%, ramp(p,1) 100%)`, captioned "Just started" (left) and "Deepens as it runs" (right).
   - Default palette: the next one in the list after the most recently created counter's palette, so a new list stays varied.
5. **Precision:** a segmented control (`role="radiogroup"`). Default: Days.
6. **Goal · optional:** pill chips None / 7 days / 30 days / Custom…. Custom opens a number input for days. Default: None.
7. **Primary button:** "Start counter".

### 7.4 Edit counter (bottom sheet)

Same sheet pattern as New counter. Top to bottom:

1. **Header:** "Edit counter" and X.
2. **Live preview card:** shows the counter in its current gradient, with `Title · NN% intensity` (13/600, `secondaryColor`) and the running timer (30/700). It recolours immediately when another swatch is picked.
3. **Name, Started** (no "Now" button here), **Colour** (no preview bar), **Precision, Goal:** prefilled with the counter's current values.
4. **Action row:**
   - **Delete:** 56×56 icon button, bin icon in `danger`, border `dangerBorder`, `aria-label="Delete counter"`. Opens a confirmation ("Delete "{title}"? This can't be undone.").
   - **Restart:** secondary button with a counter-clockwise arrow icon. Sets `startAt` to now after confirmation, or applies immediately with an Undo toast.
   - **Save:** primary.
5. Closing the sheet without saving discards changes.

---

## 8. Accessibility

- Use real `<button>` and `<input>` elements with labels. Icon-only buttons need an `aria-label`.
- Text contrast is handled by the luminance switch in §4. Don't override the text colour on cards.
- Precision is a radiogroup. Goal chips and swatches use `aria-pressed`.
- Respect the OS text-size setting. The timer may shrink to fit but must never wrap.

---

## 9. Reference prototypes (`screens/`)

These are HTML files from the design canvas:

| File | Screen |
|---|---|
| `Final-List.dc.html` | 7.1 List (timers tick live) |
| `Final-Empty.dc.html` | 7.2 Empty |
| `Final-New.dc.html` | 7.3 New counter (swatches are clickable) |
| `Final-Edit.dc.html` | 7.4 Edit counter (the preview recolours) |
| `Logo-Alt.dc.html` | 7.5 Approved logo (one outline, flat yellow background) |

They use a small templating format: `{{ }}` holes, `<sc-for>` / `<sc-if>`, and logic in `<script type="text/x-dc">`. **Don't ship or reproduce that runtime.**

- Read the inline styles for exact values.
- Read the `renderVals()` functions for the gradient and timer logic. They match §4–5.
- They are fixed-size 390×844 mockups. Build the real screens fluid, keeping the 20 px gutters.

The prototypes are not in this repo.

---

## 10. Decisions (2026-10-08)

These override the sections above where they differ.

1. **Past goal:** the goal bar fill and its caption (`34 of 30 days`) pulse in a danger red. The timer keeps its colour. Reduced motion shows solid red.
2. **Goal range:** Custom accepts whole days 1–90.
3. **Theme:** light only.
4. **Restart:** asks for confirmation, then sets the start to now and saves.
5. **⋯ menu:** a menu, with Backup as its only item for now.
6. **Order:** newest first. A new counter goes to the top.
7. **Swipe down to close:** not built. X and a tap on the scrim close the sheet.
8. **Backup:** opens as a bottom sheet in the same pattern as New and Edit.
9. **Font:** Geist is bundled with the app, so it works offline.
