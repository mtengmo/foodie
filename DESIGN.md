---
name: Foodie
description: A useful food reference with a Nordic cookbook's warmth.
colors:
  paper: "#faf7ef"
  surface: "#fffdf8"
  surface-2: "#f2ede2"
  ink: "#283b31"
  muted: "#5e6c61"
  line: "#d9d7cb"
  green: "#365a46"
  green-soft: "#e2ebdf"
  berry: "#8f4059"
  berry-soft: "#f3e3e8"
  accent-text: "#782b45"
  ochre: "#bb7a22"
  ochre-soft: "#f3e9d6"
  violet: "#6e638f"
  white: "#fff"
  dark-paper: "#1e2923"
  dark-surface: "#27342c"
  dark-surface-2: "#334138"
  dark-ink: "#f0ede2"
  dark-muted: "#c0c8bc"
  dark-line: "#46544a"
  dark-green: "#b9d1bd"
  dark-green-soft: "#35473a"
  dark-berry-soft: "#49353e"
  dark-accent-text: "#f0b4c3"
  dark-ochre: "#e6b461"
  dark-ochre-soft: "#493d2a"
  dark-violet: "#c2b8e1"
  forest-accent-text: "#234832"
  dark-forest-accent-text: "#d5e4d2"
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(2.2rem, 4.2vw, 3.65rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "1.65rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.83rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  compact: "8px"
  control: "9px"
  quantity: "10px"
  search: "12px"
  panel: "16px"
  circle: "50%"
spacing:
  tight: "8px"
  small: "12px"
  medium: "16px"
  section: "24px"
  wide: "28px"
components:
  button-primary:
    backgroundColor: "{colors.berry}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 17px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 17px"
  button-danger:
    backgroundColor: "{colors.berry-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.control}"
    padding: "0 17px"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.search}"
    height: "58px"
    padding: "0 16px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(22px, 3vw, 38px)"
  choice-active:
    backgroundColor: "{colors.berry-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.control}"
    padding: "0 16px"
---

# Design System: Foodie

## Overview

**Creative North Star: "Nordic Cookbook"**

Foodie pairs warm paper and editorial serif headings with compact, practical controls. Its colour comes from berry navigation, botanical selection surfaces and restrained ochre accents. Search, quantities and readable nutrition stay visually prominent.

**Key Characteristics:**

- Warm paper surfaces with botanical and berry accents.
- Editorial headings paired with precise system sans text.
- Quiet separators, spacious panels and compact controls.
- Responsive layouts with explicit selected and keyboard focus states.

The implementation is code-led. `src/styles/global.css` defines the live values and cascade; `src/App.tsx` defines component behaviour. Tokens above describe the default light berry theme and the actual theme override colours.

## Colors

### Primary

Berry anchors the navigation and primary actions. Accent text is a separate, stronger text colour for selected controls, favourites and back links; do not substitute the filled-button colour indiscriminately.

### Secondary

Botanical green and its soft companion mark selected foods and recipe rows. Protein has its own `--macro-protein` variable: it remains botanical even when the interface accent changes.

### Tertiary

Ochre identifies carbohydrate chart segments, focus rings and notices. Violet identifies fat. Match every chart segment to a textual legend and a quantity.

### Neutral

Paper is the page canvas, surface is the raised reading panel, and surface-2 is a quiet hover or inset layer. Ink carries content; muted carries supporting text; line separates rows and fields.

**The Theme Continuity Rule.** Use the existing CSS variables in new components. Dark mode changes neutrals, chart colours and accent text while retaining berry fills. Forest mode sets berry and berry-soft to the botanical pair and swaps green and green-soft to the berry pair. Dark forest explicitly uses dark-green-soft for berry-soft and dark-forest-accent-text for selected text. Preserve the actual cascade rather than inventing a parallel palette.

## Typography

Fraunces Variable is self-hosted through `@fontsource-variable/fraunces`, with Georgia and serif fallbacks. The body uses the platform system sans stack. There is no separate mono font.

Display is the page heading; headline and title cover panel headings and compact empty-state titles. Selected-food headings use a fluid size (`clamp(1.7rem, 2.6vw, 2.4rem)`). Labels use uppercase only for section dividers. Body copy retains normal case. Numeric quantities use tabular figures, locale formatting and visible units.

**The Readable Quantity Rule.** Keep nutrient values and their units together. Wrap long food and recipe names without squeezing quantity controls.

## Layout

The page is centred with a maximum width of 1440px, fluid horizontal padding and generous bottom space. Desktop food lookup uses unequal columns (`minmax(300px, .88fr)` and `minmax(0, 1.35fr)`) separated by 42px. The search column sticks below the header. Recipe layout uses a narrower list beside a wider editor. Supporting copy is limited to roughly 60 characters per line.

At 900px the food columns and gap tighten. At 680px, the header shortens, search and detail become separate views with a Back link, and recipes become one column. At 390px nutrient rows and recipe quantity fields stack. The update banner stacks at 520px. The supported minimum viewport is 320px. Use min-width:0 and wrapping for long bilingual labels rather than clipping content.

## Elevation & Depth

Depth comes from warm tonal layers, fine separators and a restrained diffuse panel shadow. Reading panels have no outer border in the final cascade; search fields retain a fine border. The sticky navigation has its own low shadow. Avoid repeating raised cards around every nutrient row. Exact shadow, motion and breakpoint values live in the sidecar.

## Shapes

Controls have gently rounded corners, with slightly softer search fields and reading panels. Circular buttons are reserved for compact icon actions and favourites. Food results remain flat separated rows; selection adds a softly rounded tinted surface. Charts use SVG circles, not decorative imagery.

## Components

### Buttons and choices

Primary buttons are berry filled, secondary buttons use surface with a line border, and destructive actions use a soft accent surface. Standard action buttons have a minimum height of 46px and bold labels. Primary hover brightens the fill. Choices and gram presets communicate selection through fill, border and text; preserve their pressed semantics. Disabled controls reduce opacity and use the unavailable cursor.

### Inputs

Search combines a Lucide search icon and an unbordered inner field inside the rounded surface. Its focus-within state changes the border and adds a soft berry ring. Quantity controls keep units outside the editable value, use tabular figures, and show an ochre focus outline around the complete control. Recipe titles are multiline serif fields with an understated bottom rule.

### Navigation and lists

The sticky berry header carries a Fraunces wordmark and outlined leaf mark. Navigation uses compact icon-and-text links with a translucent white active or hover surface. Small screens hide auxiliary tools; the smallest layout hides nav icons to preserve labels. Food and recipe rows use separators, tinted hover states and visible selection.

### Reading panels and nutrition

Panels use generous fluid padding and restrained shadows. Nutrient rows align names with bold tabular values. The signature donut is an inline data SVG with a three-row button legend. Hover, focus and activation coordinate a thicker selected segment (16 versus 13 stroke width) and checkmark; arrow keys, Home and End move legend focus. The chart represents grams of protein, carbohydrate and fat, not energy share. Incomplete totals display a dash and an explicit incomplete label.

### Status and updates

Loading and saving use quiet text status with a small spinner; failures use explicit retry actions. The new-version banner uses a surface panel with a fine border and tonal separation, version label, Update now and Later actions. Settings repeats version status and manual checking. Never reload automatically while recipe drafts, failed saves or pending writes make updating unsafe; show the blocked explanation and disable the update action.

Lucide provides interface icons. Charts and the brand mark use inline SVG. No raster assets ship; do not introduce stock imagery as a requirement of this system. Respect reduced-motion preferences for transitions, scrolling and spinners.

## Do's and Don'ts

### Do:

- **Do** build new surfaces from the existing theme variables.
- **Do** pair chart colour with labels, units and visible selection.
- **Do** preserve keyboard focus, bilingual wrapping and readable quantity fields.
- **Do** keep update actions explicit and protect edits and pending saves.

### Don't:

- **Don't** replace the editorial serif and system sans pairing with a new font system.
- **Don't** use decorative imagery or repeated cards to compete with food data.
- **Don't** infer zero from missing nutrition or describe the gram chart as energy share.
- **Don't** communicate state with colour alone or hide the keyboard focus treatment.
