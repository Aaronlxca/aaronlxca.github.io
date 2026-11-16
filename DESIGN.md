---
name: Aarón Lozano Portfolio
description: Existing professional, precise, and approachable visual identity.
colors:
  navy: "#102631"
  navy-deep: "#0b1d28"
  navy-soft: "#193946"
  green: "#246d54"
  mint: "#b4edc3"
  lime: "#d3f49b"
  cream: "#f6f8f4"
  mist: "#ecf0ef"
  paper: "#ffffff"
  ink: "#152e34"
  muted: "#52676b"
  line: "#d8e2dd"
  experience: "#204b42"
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(2.1rem, min(4.15vw, 5.55vh), 4.15rem)"
    fontWeight: 790
    lineHeight: 1.08
    letterSpacing: "-0.065em"
  headline:
    fontSize: "clamp(1.95rem, min(3.3vw, 4.8vh), 3.35rem)"
    fontWeight: 765
    lineHeight: 1.12
    letterSpacing: "-0.055em"
  body:
    fontSize: "clamp(1.02rem, 1.5vw, 1.17rem)"
    lineHeight: 1.75
  label:
    fontSize: "0.72rem"
    fontWeight: 820
    letterSpacing: "0.17em"
rounded:
  button: "8px"
  card: "14px"
  panel: "16px"
  about-panel: "18px"
  portrait: "20px"
  pill: "100px"
spacing:
  cta-gap: "12px"
  project-gap: "18px"
  resource-gap: "19px"
  heading-bottom: "21px"
  eyebrow-bottom: "25px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "#19362d"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  button-primary-hover:
    backgroundColor: "#e1f7bd"
  button-outline:
    textColor: "#f7fcf9"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  chapter-next:
    rounded: "{rounded.pill}"
    padding: "9px 14px"
  project-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
  resource-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "28px"
---

# Design System: Aarón Lozano Portfolio

## Overview

This document records the existing implementation, including the A01–A04 accessibility corrections in PR #1, not a proposed redesign. The original `69af386` appearance remains documented in [the historical audit](audit/REPORT.md). Sources are the inline CSS, semantic HTML, interaction script, favicon and rendered homepage. The owner describes its intended character as **professional, precise, and approachable**. The homepage is an ordered six-chapter presentation of José Aarón Lozano Campos’s work in finance, business strategy, technology and sustainability.

The identity combines deep navy and forest green stages with pale neutral chapters, lime highlights, compact bold headings, numbered chapter markers and restrained rounded cards. Content remains the authority: retain names and accents, career history, project attribution and status, confidentiality caveats, planned resources and existing outbound destinations.

**Key Characteristics:**

- Alternating dark and light chapters with a persistent wordmark and navigation.
- A controlled desktop cascade; normal reading and touch scrolling on smaller screens.
- Dense, left-aligned analytical content balanced by generous chapter space.
- Geometric placeholder artwork, thin dividers, softly rounded surfaces and muted supporting text.

## Colors

The frontmatter records exact homepage CSS values. Navy anchors the header and hero; deeper navy closes the contact chapter. Forest green carries Experience, while cream, white and mist distinguish About, Projects and Resources. Lime highlights the hero message, primary actions, active links and progress. Mint accents the wordmark’s dot and portrait caption. Ink and muted teal-gray support reading on light surfaces; light green-gray text supports dark surfaces.

`navy-soft` is declared but currently unused. Several component colors are literals rather than shared tokens: hero glow (`#20473f`), primary-button text (`#19362d`), dark lead text (`#c5dcd6`) and project artwork backgrounds (`#dce7e3`, `#deebe1`, `#dbe4f1`). Do not mistake declared tokens for a fully centralized theme.

The résumé uses the same family, but its `--mint` actually contains the homepage’s lime value, its `--paper` contains cream, and its border/muted colors differ slightly. These are existing aliases and variations, not new brand decisions.

## Typography

All text uses the same sans-serif stack shown above. **Inter is named but no font file or external font stylesheet is loaded.** Actual rendering therefore depends on installed system fonts. Requested numeric weights such as 765, 790 and 820 may resolve to available system weights.

Hero and chapter headings use tight negative tracking, balanced wrapping and compact line heights. Heading size responds to both viewport width and height. Section titles use approximately `1.28rem`; smaller card variants range from `1.08rem` to `1.3rem`. Lead paragraphs use the frontmatter body scale; About uses a smaller `0.97–1.05rem` scale with `1.66` line height and a `65ch` maximum. Card body copy is typically `0.91rem` with roughly `1.6–1.66` line height.

Eyebrows, status labels, card categories and chapter footers use uppercase and expanded tracking. Eyebrows include a short colored rule. Status text reaches `0.67rem`; small-screen portrait captions reach `0.58rem`. Corrected mobile Next links use `0.75rem` and at least `44px` height; mobile chapter footers use `0.74rem`. These are observed values, not a claim that every label meets all accessibility recommendations; see [the audit](audit/REPORT.md).

## Layout

The main container is centered and capped at `1190px`, normally with `44px` side gutters. At widths up to `1080px`, gutters become `35px`; up to `820px`, they become `23px`. The fixed header is `76px` tall, reducing to `66px` at `820px`.

Each chapter has at least one small viewport height (`100svh`). Default top padding is header height plus `58px`; the corrected column layout uses `28px` bottom padding (`25px` at widths up to `820px`). The main content uses automatic block margins to center within available space; a separate footer/Next row follows it with an `18px` margin, a `16px` gap (`10px` on mobile) and the same horizontal container as the content. This row stays in normal flow and scrolls with long content; it must not overlay paragraphs or cards. The hero pairs text and a portrait; About pairs long-form biography and a three-step approach panel; Experience pairs introduction/metrics and job history; Projects and Resources each use three columns; Contact pairs invitation and connection links.

At `1080px`, desktop gaps and navigation tighten. At `820px`, the menu replaces horizontal navigation, major pairs stack, and card grids become two columns. At `620px`, cards become one column, hero buttons span the container, and the portrait moves above the introduction at a maximum width of `185px` (otherwise `275px` on tablet and `380px` on desktop). The `821px+` short-screen rule applies at heights up to `710px`, reducing headings, portrait size and panel spacing.

With a fine pointer, width at least `821px`, height at least `560px`, and no reduced-motion preference, the desktop mode fixes the stage and translates the entire main element between six viewport-height chapters. Each chapter can scroll internally if necessary; inactive chapters become inert. Otherwise the document scrolls normally. Up to `820px`, normal scrolling uses proximity snapping, chapter reveal effects and a six-step progress bar.

## Elevation & Depth

Alternating chapter tones provide the main depth. The hero adds a green radial wash over a navy gradient. The fixed header uses a translucent navy fill and `14px` backdrop blur. The portrait has a substantial neutral shadow (`0 30px 80px rgba(0,0,0,.24)`), the About panel a faint green shadow (`0 18px 65px rgba(30,61,48,.06)`), and projects a faint shadow (`0 15px 40px rgba(20,52,37,.035)`). Borders and dividers carry most structural separation.

## Shapes

Buttons have gently rounded corners; project/resource cards are rounder, and larger panels and portrait containers softer still. Next links and focus tags are pills. Side navigation uses tiny circular dots connected by a vertical line in desktop cascade mode. Portrait artwork combines circular accents and an outlined human silhouette; project artwork uses circles, rings and large analytical labels.

## Components

- **Wordmark and navigation:** `aaron.lozano`, bold with tight tracking and a mint dot. Header links are muted until hover/current state, then lime. Résumé is outlined. The mobile Menu/Close button updates `aria-expanded`; Escape and navigation selections close the menu.
- **Primary and outline actions:** minimum height `49px`, compact bold labels and `12px` gaps. Primary actions use lime; outline actions use a thin contextual border. Hover lifts buttons `2px`. Focus-visible links, buttons and disclosure summaries receive a `3px` green outline with `4px` offset.
- **Chapter navigation:** top links, six labeled side dots, and Next links on chapters 1–5. Desktop dot tooltips appear on hover/focus. Current navigation uses `aria-current="true"`. Numbered chapter footers and Next controls share a normal-flow row. Footer text is fully opaque: muted ink on light chapters, `#c5dcd6` on navy chapters, and `#dfede5` on Experience. Explicit chapter navigation and browser history focus the destination heading; the skip link focuses Home and bypasses repeated navigation. Keyboard headings use a `3px` green/lime focus-visible outline with `7px` offset, and Escape returns focus from an open menu to Menu. Wheel scrolling does not move keyboard focus.
- **Cascade motion:** stage translation lasts `.82s` with `cubic-bezier(.72,0,.23,1)`; input locks for `880ms`. Incoming content animates opacity, blur and a `30px` vertical displacement, with a `.1s` delay. Active chapters grow a top rule. Small-screen reveals use `22px` displacement, `1.5px` blur and `.65–.8s` timing. Reduced motion disables the desktop deck and CSS smooth scrolling, though the JavaScript navigation still requests smooth scrolling in its non-deck path.
- **About panel and metrics:** numbered approach rows use separators; three metric boxes use lime numerals and descriptive labels. Do not alter the meaning of the 65 → 35 → 25 funnel.
- **Project cards:** category artwork, explicit stage, title, summary and native `details/summary`. A plus changes to a minus when expanded. Full copy remains available in the document; there is no modal.
- **Resource cards:** two whole-card external links and one dashed, noninteractive planned-material card. Hover lifts the cards `3px`. External links use new tabs with `noopener noreferrer`.
- **Contact panel:** translucent rounded enclosure with three full-width connection rows. The public email is explicitly forthcoming; do not invent one.
- **Portrait:** an intentionally labeled reserved image area, not an actual photograph. Preserve its honest status until the owner supplies an approved asset.
- **Résumé:** a separate static page with matching branding, native job disclosures, filter buttons and a print action. Its full visual audit is outside the homepage scope.

## Do's and Don'ts

- **Do** preserve the navy/green/lime identity, wordmark, chapter order, existing copy and working interactions.
- **Do** treat measured CSS and current screenshots as the source for faithful maintenance.
- **Do** distinguish documentation of current behavior from recommendations in the audit.
- **Don't** replace the typeface, palette, page composition or chapter behavior as part of this audit.
- **Don't** add unsupported credentials, outcomes, a portrait, contact details or completed-project claims.
- **Don't** migrate the static HTML/CSS/JavaScript site to a framework for documentation or testing.
