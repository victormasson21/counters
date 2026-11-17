# Counters — design spec v2: Bauhaus

This spec replaces v1 ("Refined + heat gradient"). It covers four screens: **List**, **Empty**, **New counter** and **Edit counter**. Reference prototypes are in `screens/`. Where this file and a prototype disagree, **this file wins**.

Unchanged from v1:

- the data model, except that `palette` is removed (see §5)
- the timer formatting rules
- the "Since …" line rules
- the bottom-sheet behaviour
- the delete and restart confirmations

The app icon is the **shape stack**: a red square, blue circle and yellow triangle on a black baseline, on paper (`#EFE8D8`). It is in `public/icons/`, with a maskable variant scaled to 78% for Android's safe zone.

---

## 1. Concept

Flat Bauhaus primaries on paper, with square corners and heavy black rules. Each counter card has one large geometric shape, cropped by the card's top-right corner like a poster. **The shape grows as the run gets longer.** If the counter has a goal, the shape reaches full size when the goal is hit. Otherwise it reaches full size at one year.

Colour and shape are **not chosen by the user**. They come from the counter's position in the list, so neighbouring cards always differ.

---

## 2. Tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| `paper` | `#EFE8D8` | App background, sheets |
| `card` | `#F8F3E8` | Cards, inputs, unselected options |
| `ink` | `#141414` | Text, borders, rules, primary buttons, selected options |
| `inkMuted` | `#3F3A31` | Secondary text (≥ 7:1 on paper) |
| `red` | `#D2382B` | Shape colour; accent dot in the "New counter" button |
| `yellow` | `#F2B300` | Shape colour |
| `blue` | `#1F4FA3` | Shape colour |
| `danger` | `#B42318` | Delete button border and icon |
| `scrim` | `rgba(20,20,20,0.5)` | Behind sheets |

Primaries are only ever used for shapes, never for text or as a background behind text.

### Type

Font: **Jost** (Google Fonts), weights 400/500/600/700. Use `font-variant-numeric: tabular-nums` on all numbers.

| Role | Style |
|---|---|
| Screen title "counters" / sheet titles / empty title | lowercase, 700, 30 / 28 / 34 px, -0.01em |
| Card title, field labels | UPPERCASE, 600, 12 px, letter-spacing 0.12em |
| Timer (card) | 700, 28 px, -0.02em; fractional/suffix part 400 |
| Meta ("Since …") | 400, 13 px, `inkMuted` |
| Buttons | UPPERCASE, 600, 15–17 px, letter-spacing 0.1em |
| Options (segments, chips) | 600, 15 px |

### Shape and rules

- **No rounded corners anywhere.** The only curves are the circle and half-moon shapes, and the red dot in the button.
- Borders: 2 px `ink` on cards, inputs, segments and chips.
- Rules: 4 px `ink` under the header, above the footer, and on top of sheets.
- Gutter 16 px on the list (20 px in sheets). 12 px between cards.
- Touch targets ≥ 44 px.

---

## 3. Colour and shape assignment

There are four fixed pairs, cycling by list position (index `i`, 0-based):

| `i % 4` | Colour | Shape | SVG path (`viewBox 0 0 100 100`) |
|---|---|---|---|
| 0 | blue | circle | `M50 0A50 50 0 1 1 49.99 0Z` |
| 1 | red | square | `M0 0H100V100H0Z` |
| 2 | yellow | triangle | `M50 0L100 100H0Z` |
| 3 | ink (black) | half-moon | `M0 100A50 50 0 0 1 100 100Z` |

- Reordering or deleting counters shifts the pairs. That is intended.
- The New counter sheet tells the user which pair the new counter will get. Because new counters go to the top (§8), that is always index 0, the **blue circle**. The prototype's "red square" wording predates this.

---

## 4. Shape size and position

```ts
const days = elapsedMs / 864e5;
const span = counter.goalDays ?? 365;                 // goal if set, else one year
const t = Math.min(1, Math.pow(Math.log(1 + days) / Math.log(1 + span), 0.456));
const size = 56 + t * 144;                            // px: 56 → 200
// Absolutely positioned inside the card (overflow: hidden), anchored top-right:
const right = -0.42 * size;                           // px, pushes past the right edge
const top   = -0.28 * size;                           // px, pushes past the top edge
```

- The curve is front-loaded. With no goal, the shape reaches about 38% of its growth at 1 day, 62% at 1 week, 78% at 1 month and 100% at 1 year. With a goal, the same proportions apply across the goal's span.
- The text column has `max-width: 222px` and sits above the shape (`position: relative`). At full size the shape's left edge stops at the text column, so it never sits under text.
- Recompute the size when the timer re-renders. Once a minute is enough for size.

---

## 5. Data model change

Remove `palette` from `Counter`. Colour and shape are derived from list position at render time and are not stored.

---

## 6. Screens

### 6.1 List (`Bauhaus-A-Poster.dc.html`)

- **Header:** a three-shape mark (blue circle, red square, yellow triangle, 14 px each), then "counters". A 44 px menu button (three bars) on the right opens a menu containing Backup. A 4 px rule sits under the header.
- **Card:** 2 px border, `card` fill, min-height 124 px, padding 12/16/16. It contains:
  - the shape (§3 and §4)
  - the title row: UPPERCASE title, plus a pencil button at its right end, 44 px wide
  - the timer
  - the "Since …" line
  - a goal block, if a goal is set: a continuous 8 px bar (square ends, track `rgba(20,20,20,.12)`) filled `ink` to the exact percentage of the goal elapsed, followed by `24/30`
- **Footer:** a 4 px rule above it. A full-width `ink` button, 58 px high, reading "NEW COUNTER", with a 22 px red circle holding a paper-coloured plus.

### 6.2 Empty (`BauhausA-Empty.dc.html`)

- Same header and footer as the List.
- **Centre:** an overlapping composition of a red square, a blue circle, a yellow triangle and a black half-moon, all standing on a 4 px black baseline (about 334×250). Below it, "no counters yet" (34/700) and "Track the time since anything." (16, `inkMuted`).

### 6.3 New counter (`BauhausA-New.dc.html`)

A bottom sheet with no rounded corners and a 4 px top rule. Top to bottom:

1. "new counter" and a close (X) button.
2. Name input.
3. Started: date, time, and a black "NOW" button.
4. **Precision:** one bordered strip of four equal options, divided by 2 px rules: Days, Hours, Secs, 1/100. The selected option is filled `ink` with paper text.
5. **Goal · optional, sets when the shape is full size:** square chips for None, 7 days, 30 days, 90 days and Custom…. The selected chip is filled `ink`.
6. **Info strip:** the index-0 shape at 28 px (blue circle), then "New counters go to the top and get the **blue circle**. The others shift along. Colours follow list order."
7. "START COUNTER" primary button.

There is **no colour picker**.

### 6.4 Edit counter (`BauhausA-Edit.dc.html`)

Same sheet pattern. Top to bottom:

1. "edit counter" and X.
2. **Live preview card:** a 108 px high card with the counter's shape and timer, plus a meta line such as `Goal 60 days · 78% size`. The shape resizes immediately when the goal changes (size there is `48 + t × 112` to fit the shorter card).
3. Name, Started, Precision and Goal, prefilled.
4. **Action row:**
   - Delete: a 58 px square with a red border and a bin icon. It asks for confirmation.
   - Restart: secondary, bordered.
   - Save: primary, `ink`.

---

## 7. Accessibility

- Shapes are decorative (`aria-hidden`).
- Text never sits on a primary colour.
- Icon-only buttons have an `aria-label`.
- Precision is a radiogroup. Goal chips use `aria-pressed`.

---

## 8. Decisions carried over from the current app

The current app (tag `v1-heat-gradient`) has behaviour this redesign must keep. Re-skin it as follows:

1. **Countdown:** a future start still counts down with a `-` prefix and reads `Until Thu 24 Dec`. The shape grows *as the date nears*: `t = 1 − intensity(days left)`, using the one-year span, the same reversal the heat gradient used. The goal block stays hidden until the date passes. After the date, the counter counts up as usual and the goal rule in §4 applies.
2. **Past goal:** the goal bar and caption (`34/30`) pulse in `danger` red. Reduced motion shows solid red. The shape stays at full size.
3. **Goal range:** Custom accepts whole days 1–90 (`MAX_GOAL_DAYS`).
4. **Order:** newest first, so a new counter goes to the top and the colour cycle shifts. The info strip in New counter therefore shows the pair for **index 0**, and every existing card moves one step along the cycle.
5. **Font:** bundle Jost through `@fontsource/jost` (weights 400/500/600/700) so it works offline, the way Geist is bundled today. Remove Geist.
6. **Backup sheet and ⋯ menu:** same behaviour, restyled with this spec's tokens.
7. **Light theme only.**

**Data:** stop writing `palette`. Keep old data readable: `parseCounters` and `isCounter` must accept counters with or without `palette`, and existing backups must still import. Don't change the `localStorage` key.

**Removed:** the palette picker, `palettes.ts`, the heat gradient (`cardStyle`, `swatchBackground`, `rampBar`). The `intensity` curve itself stays; §4 uses it.

## 9. Reference prototypes

`screens/` contains the four `.dc.html` files listed in §6. They use a small templating runtime: `{{ }}` holes, `<sc-for>`, `<sc-if>`, and logic in `<script type="text/x-dc">`. **Don't ship or reproduce that runtime.** Read their inline styles for exact values and their `renderVals()` functions for the logic. They are fixed 390×844 mockups, so build the real screens fluid.

Design canvas (private to the owner): https://claude.ai/artifact/W4cTHo8NBgbYcrdxLzJGhv
