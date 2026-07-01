# İlk Hecem Anaokulu — Design System

A warm, joyful, premium brand system for **Özel Tuzla İlk Hecem Anaokulu**, a
private kindergarten in Tuzla, İstanbul. The system exists to power a colorful,
trust-building marketing website (and future collateral) whose single most
important job is: **get parents to tap "WhatsApp'tan Bilgi Al" and book a visit.**

The brand must feel **magical and exciting to children** and **professional,
safe and reassuring to parents** at the same time. Pastel-but-vivid color,
rounded everything, gentle floating animation, and large friendly type carry
that dual message.

> Brand tagline: **"Mutlu Çocuklar, Aydınlık Yarınlar"** (Happy Children, Bright Tomorrows)

## Sources & inputs
- `uploads/logo ilk hecem.png` — the only supplied asset (the colorful mascot
  logo). Copied to `assets/logo-ilk-hecem.png` and an edge-flood-filled
  transparent version `assets/logo-ilk-hecem-transparent.png`.
- Written brief (Turkish + English) describing tone, palette, sections,
  programs, and contact details. No codebase, Figma, or live site was provided —
  the visual language below is derived from the **logo** + the brief.

### Contact facts (use verbatim)
- **Adres:** Mimar Sinan, Yeni Sk. No:28, 34950 Tuzla/İstanbul
- **Telefon / WhatsApp:** 0543 862 67 06
- **Konum:** Tuzla / İstanbul
- **Google puanı:** 5.0 / 5 · 9 yorum

### Programs (branş dersleri)
İngilizce · Fen & Doğa Etkinlikleri · Müzik & Ritim · Drama · Satranç ·
Değerler Eğitimi · Atölye Çalışmaları · Robotik & Kodlama

### Website sections
Hero · Hakkımızda · Eğitim Anlayışımız · Branş Dersleri · Neden İlk Hecem ·
Galeri · Veli Yorumları · Sık Sorulan Sorular · İletişim & WhatsApp CTA

---

## CONTENT FUNDAMENTALS

**Language:** Turkish, always. Buttons and section labels are Turkish even in
otherwise-English contexts.

**Voice:** Warm, sincere, reassuring — like a beloved teacher talking to a
parent. Confident but never corporate or cold. Emotionally led, with concrete
reassurance underneath ("kameralı ve güvenlikli kampüs", "deneyimli
öğretmenler").

**Address:** Speak **to the parent as "siz"** (formal you) — "Okulumuzu Tanıyın",
"Randevu Oluşturun". Speak **about the child with affection** — "çocuğunuz",
"miniklerimiz", "her çocuk". The school refers to itself as **"biz / İlk Hecem"**.

**Casing:** Headlines and buttons use **Title Case Turkish** ("WhatsApp'tan Bilgi
Al", "Neden İlk Hecem?"). Eyebrows above titles are **UPPERCASE** with wide
tracking ("HAKKIMIZDA"). Body is sentence case. Never ALL-CAPS a full sentence.

**Tone examples**
- Hero headline: *"Çocuğunuzun ilk hecesi, mutlu bir başlangıç."*
- Sub: *"Sevgi dolu, güvenli ve oyun temelli bir ortamda keşfederek büyüyoruz."*
- Reassurance: *"Deneyimli öğretmenler, kameralı kampüs, gönül rahatlığı."*
- CTA copy: **"WhatsApp'tan Bilgi Al" · "Okulumuzu Tanıyın" · "Randevu Oluştur" · "Yol Tarifi Al"**

**Emoji:** Avoid in body copy and headlines. The "playfulness" comes from
color, shape, illustration and motion — **not** emoji. (Unicode stars ★ are used
only inside the rating component, drawn as SVG, not as emoji.)

**Punctuation:** Friendly but restrained. Occasional em-dash. No exclamation
spam — one warm "!" at most per block.

---

## VISUAL FOUNDATIONS

**Overall vibe:** A sunny, storybook nursery. Cream paper background, pillowy
white cards floating on it, candy-bright accent colors, soft tinted shadows,
and slow ambient motion (clouds, balloons, stars). Premium = restraint:
lots of whitespace, one or two accent colors per section, never a rainbow
explosion outside the logo and the program grid.

### Color
- **Six brand hues**, all sampled from the logo: **Sky** (`--sky-500 #1f9fde`,
  the primary), **Sunshine** (`--sun-400 #ffc52e`), **Coral**
  (`--coral-400 #ff7561`, the warm accent), **Mint** (`--mint-400 #34c690`),
  **Soft Pink** (`--pink-300 #ff8fb1`), **Grape** (`--grape-400 #9366e4`).
- **Ink** = deep indigo (`--ink-900 #1c1652` / `--ink-800 #271e6b`), taken from
  the logo's outline. **All text is ink, never pure black.**
- **Surfaces** = cream (`--cream-100 #fff8ee` page, white cards). Never a
  stark white page — the cream keeps it warm.
- **WhatsApp green** `#25d366` is reserved exclusively for WhatsApp CTAs.
- **Usage rule:** pick ONE accent hue per section; rotate hues across the
  program grid (sky→coral→mint→sun→pink→grape) so the grid reads as a rainbow
  while each card stays mono. Semantic aliases (`--color-primary`,
  `--color-accent`, `--text-body`, `--surface-card`…) are the everyday handles.

### Type
- **Display = Baloo 2** (chunky, rounded, friendly) for headings, buttons,
  numbers. Weights 400–800. Full Turkish glyph coverage (ç ğ ı İ ö ş ü).
- **Body = Nunito** (soft rounded sans) for paragraphs and UI. Weights 400–800.
- Scale is **generous and fluid** — heroes use `clamp()` up to ~5.25rem.
  Never below ~15px. Headings carry slight negative tracking; eyebrows carry
  wide positive tracking + uppercase.

### Shape, radius & cards
- **Everything is round.** Radii run 8→48px plus full pills and an organic
  `--radius-blob`. Buttons are pills by default. Cards use `--radius-xl` (36px).
- **Cards** = white surface, `1px` hairline indigo border (`--border-card`),
  soft shadow (`--shadow-sm`), optional 6px colored top accent bar, generous
  32px padding. On hover (interactive) they **lift 6–8px** with a larger shadow.

### Shadows
- Always **tinted indigo**, never black: `rgba(39,30,107,…)`. Scale sm→xl plus
  **colored glows** for CTAs (`--shadow-sky`, `--shadow-coral`,
  `--shadow-whatsapp`, `--shadow-sun`) so primary buttons feel like they glow.

### Backgrounds
- Cream base, occasionally washed with **very soft radial color blobs**
  (sky/pink/mint at ~50% opacity, blurred) anchored to corners. Optional faint
  dotted texture. **No** heavy gradients, no bluish-purple SaaS gradients, no
  photographic full-bleed except the hero/gallery imagery.
- **Ambient decoration:** blurred floating blobs, small twinkling dots, simple
  CSS clouds, stars and balloons drift slowly. They live *behind* content at low
  opacity and must never compete with copy.

### Motion
- Friendly and **bouncy**: `--ease-bounce` (overshoot) for buttons/cards,
  `--ease-out` for everything else. Entrances **rise + fade** (`ih-rise`) or
  **pop** (`ih-pop`). Ambient loops: `ih-float`, `ih-bob`, `ih-twinkle`,
  `ih-spin-slow` — all slow (6–7s) and gentle.
- **Hover** = lift + slight scale-up (1.03) + brightness +6%. **Press** = settle
  down + scale-down (0.97). Icons inside program tiles wiggle/rotate on hover.
- Respect `prefers-reduced-motion`: base state is the visible end-state.

### Borders & focus
- Borders are 1–2px, soft (`--border-soft` grey, or hairline indigo on cards).
- **Focus ring** = 4px sky halo (`--focus-ring`) — visible and on-brand.

### Layout
- Container max ~1200px, fluid gutters `clamp(20px,5vw,64px)`. Section vertical
  rhythm `clamp(64px,8vw,128px)`. Mobile-first; hit targets ≥48px (buttons are
  48–60px tall). A floating WhatsApp button is fixed bottom-right on all pages.

---

## ICONOGRAPHY
- **No bespoke icon font was supplied.** The system uses **Lucide** line icons
  (https://lucide.dev) loaded from CDN — clean, rounded, 2px stroke, which sits
  well with Baloo 2 / Nunito's rounded forms. Program tiles map to: İngilizce →
  `globe`, Fen & Doğa → `flask-conical`, Müzik → `music`, Drama → `drama`,
  Satranç → `crown`/chess, Değerler → `heart-handshake`, Atölye → `palette`,
  Robotik → `bot`/`cpu`. **(Substitution flagged — see Caveats.)**
- Icons are passed into components as nodes (`icon={<Globe/>}`), rendered inside
  colored medallions (ProgramCard) or chips (FeatureCard). Stroke icons in
  accent color, ~28–38px.
- **WhatsApp glyph** is the only filled brand icon, drawn as an inline SVG path
  in the official green.
- **Emoji is NOT used** as iconography anywhere. Stars in ratings are SVG.
- The mascot **logo** (two waving children + house + rainbow) is the hero
  illustration — use the real PNG, do not redraw it.

---

## INDEX — what's in this folder

**Foundations**
- `styles.css` — the single entry point consumers link. `@import`s everything below.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `effects.css` · `fonts.css`
- `guidelines/*.html` — specimen cards shown in the Design System tab
  (Colors, Type, Spacing, Brand).

**Components** (`window.LkHecemDesignSystem_4786f7.*`)
- `components/core/` — **Button, Badge, Card, Input, StarRating, Eyebrow, Avatar**
- `components/patterns/` — **ProgramCard, TestimonialCard, FeatureCard**
- Each dir has `*.d.ts` (props), a shared `*.prompt.md` (usage), and a
  `*.card.html` (Design System tab demo).

**UI kit**
- `ui_kits/website/` — full click-through recreation of the marketing site
  (hero → programs → why → gallery → testimonials → FAQ → contact + sticky
  WhatsApp CTA). `index.html` is the assembled page; screens are JSX partials.

**Assets**
- `assets/logo-ilk-hecem.png` (original) · `assets/logo-ilk-hecem-transparent.png`

**Skill**
- `SKILL.md` — makes this design system usable as a downloadable Claude skill.

> Generated files `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`
> are produced by the compiler — do not edit by hand.
