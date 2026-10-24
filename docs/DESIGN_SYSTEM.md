# OpenBooks — Design System

**Version:** 0.1  
**Status:** Approved design direction; implementation and cross-platform behavior pending validation  
**Project:** Design Studio / OpenBooks  
**Target platforms:** Windows, macOS, Linux, iOS, Android  
**Technology:** React, TypeScript, CSS, Tauri 2  
**Related documents:** [PRD](./PRD.md) · [Technical Architecture](./ARCHITECTURE.md) · [Add-on Protocol](./ADDON_PROTOCOL.md)  
**Date:** October 2026

> This document specifies the proposed OpenBooks visual language and UI foundation. It is not evidence that the components, accessibility targets, or platform-specific effects have already been implemented or tested.

## 1. Design vision

OpenBooks is a reading and book-discovery application. Its interface should be calm, recognizable, comfortable for extended use, and consistent across desktop and mobile platforms.

Its visual direction combines:

- **OpenAI-inspired restraint:** clear hierarchy, measured spacing, restrained color, and functional interactions.
- **Apple Liquid Glass-inspired materiality:** translucent navigation and floating controls, used sparingly.
- **An independent OpenBooks identity:** Outfit and DM Sans typography, book-cover-led layouts, and accessible light and dark themes.

These are visual references, **not official OpenAI or Apple component libraries**. The OpenBooks UI is independently designed and implemented.

### Principles

1. **Books first.** Covers, titles, authors, and reading content remain the visual focus.
2. **Clarity over ornament.** Depth, translucency, and animation must communicate purpose.
3. **Comfortable reading.** Reader settings operate independently from the surrounding application.
4. **Accessible by design.** Contrast, input targets, focus states, reduced motion, and readable type are first-class requirements.
5. **Consistent, not identical.** Share tokens and components across platforms while adapting navigation and behavior to device context.
6. **Local-first resilience.** Core reading and library views must remain usable without an internet connection.

## 2. Typography

### 2.1 Interface families

| Role | Family | Typical weights | Applications |
| --- | --- | --- | --- |
| Display and headings | **Outfit** | 500, 600; 700 sparingly | App wordmark, page titles, feature headings, prominent book titles |
| Body and controls | **DM Sans** | 400, 500, 600 | Navigation, buttons, settings, descriptions, metadata, forms |

Suggested initial type scale:

| Token | Size | Primary use |
| --- | --- | --- |
| `--font-size-display` | 40px | Prominent feature heading |
| `--font-size-heading-xl` | 32px | Page heading |
| `--font-size-heading-lg` | 24px | Section heading |
| `--font-size-heading-md` | 20px | Subheading |
| `--font-size-body-lg` | 16px | Long-form interface text |
| `--font-size-body` | 14px | Standard UI text |
| `--font-size-caption` | 12px | Supporting metadata, where legible |

Use compact line heights for headings and approximately 1.5 for descriptive text. Respect system text scaling and avoid fixed-height containers that clip enlarged text. These sizes are initial design tokens, not hard accessibility limits.

### 2.2 Embedded e-reader typography

The reading surface has a **separate, user-configurable font system**:

| Choice | Intent |
| --- | --- |
| **Noto Serif** | Proposed default for long-form reading |
| **Castoro** | Literary/editorial serif alternative |
| **DM Sans** | Sans-serif reading option |
| **Outfit** | Geometric sans-serif reading option |
| **Publisher / EPUB original** | Preserve the document's intended fonts when available and authorized |

Reader preferences should include font family, size, line height, paragraph spacing, alignment, margins, and reading theme. Preserve meaningful emphasis, italics, headings, and other essential EPUB semantics when overriding typography. A font change must not remove accessibility information or break complex scripts.

**Localization:** Noto Serif has broad script coverage, but exact subsets and language coverage must be verified in the fonts we ship. Where a selected font lacks glyphs, use a reliable fallback stack.

**Licensing and delivery:** Prefer locally bundled, properly licensed font files, preserving the applicable SIL Open Font License notices and attribution. Do not rely on a remote font CDN for core UI or reading. Do not redistribute publisher-embedded fonts outside their permitted context.

## 3. Color system

Colors are expressed as **semantic tokens**, not hard-coded per component. The following is the initial palette, subject to contrast testing against actual UI states.

| Semantic token | Light | Dark |
| --- | --- | --- |
| `--color-background` | `#FAFAFA` | `#101012` |
| `--color-surface` | `#FFFFFF` | `#18181B` |
| `--color-surface-secondary` | `#F1F1F3` | `#222226` |
| `--color-border` | `#E4E4E7` | `#34343B` |
| `--color-text-primary` | `#18181B` | `#FAFAFA` |
| `--color-text-secondary` | `#52525B` | `#B4B4BD` |
| `--color-accent` | `#8E8EA0` | `#AAAABC` |

The muted purple-gray accent is a reference tone, **not a universal text color**. Its legibility on individual backgrounds, including white text on accent-filled buttons, must be tested rather than assumed. Adjust interactive foreground and background pairs to meet contrast requirements.

Define additional semantic pairs for success, warning, danger, and information states before these appear in production. Never use color as the sole indicator of status.

### Theme modes

- **System** (default): follows operating system appearance.
- **Light**.
- **Dark**.

Reader theme is independently selectable. A future **sepia** reading mode is a candidate, not a v0.1 requirement.

## 4. Spacing, shape, and elevation

Base spacing follows an **8px rhythm** with 4px subdivisions where needed.

| Token | Value |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

| Radius token | Value | Preferred use |
| --- | --- | --- |
| `--radius-sm` | 8px | Dense, compact controls |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards, dialogs |
| `--radius-xl` | 24px | Floating surfaces |
| `--radius-full` | 9999px | Circular icons, pills |

Favor whitespace and subtle separation over placing every piece of content inside a raised card. Elevation should indicate an actual layer or interaction.

## 5. Liquid Glass-inspired surfaces

OpenBooks uses a **web-rendered approximation** of translucent, refractive material. There is no official, cross-platform Apple Liquid Glass CSS package and we do not depend on Apple's private visual implementations.

### Appropriate surfaces

- Sidebar and primary navigation
- Top bars and mobile bottom navigation
- Menus, popovers, and contextual controls
- Floating reader toolbar
- Select dialogs or overlays when clarity is preserved

### Avoid on

- Book pages and long reading passages
- Long-form synopses
- Every book card
- Large scrolling regions where blur is expensive
- Uncontrolled image backgrounds where contrast cannot be guaranteed

### Implementation contract

Create a shared `GlassSurface` primitive with semantic surface variants. Its baseline may use `backdrop-filter`, subtle translucent fill, a 1px highlight border, and restrained inner shadow. Optional advanced refraction can be investigated later behind feature detection.

**Required fallbacks:**

- A solid, accessible background when transparency or blur is unavailable.
- Reduced-transparency behavior where supported by the platform or the application's accessibility settings.
- Stable readable foregrounds over all backdrop types.
- Safe degradation on WebView2 (Windows), WebKit (macOS/iOS), and WebKitGTK (Linux), validated on actual devices.
- No dependency on glass effects for discoverability, input, or core reading functionality.

Effects should be benchmarked before broad adoption; never assume identical performance across platforms.

## 6. Components

### 6.1 Accessible UI primitives

Initial candidates:

- `Button`, `IconButton`, `Input`, `SearchField`
- `Select`, `Checkbox`, `Radio`, `Switch`
- `Tooltip`, `Badge`, `Tabs`
- `Dialog`, `DropdownMenu`, `Popover`, `Toast`
- `Skeleton`, `EmptyState`, `GlassSurface`

**Radix UI** is the preferred candidate for accessible headless primitives, styled using OpenBooks tokens. Dependency selection is pending implementation checks; do not mix unrelated full design systems.

### 6.2 Application layout

- `AppShell`
- `Sidebar`
- `TopBar`
- `BottomNavigation`
- `NavigationItem`
- `Breadcrumb` where appropriate

Primary destinations: **Home, Explore, Library, Add-ons, Settings**.

### 6.3 Book-specific components

- `BookCard`: cover, title, author, optional state/actions.
- `BookGrid`: responsive book layout.
- `BookCarousel`: horizontal browsing where appropriate.
- `BookDetails`: description, editions, metadata, availability.
- `ReadingProgress`: current position and completion.
- `ReadingToolbar`: reader appearance and navigation.
- `SourceList`: resources surfaced by user-installed add-ons.
- `AddonCard`: extension metadata, installation and connection state.
- `AvailabilityItem`: storefront, subscription, or library availability.

Book catalog discovery remains built-in as established in the PRD and architecture; optional add-ons supply reading resources under the add-on protocol. Do not conflate catalog listing with permission to distribute a book.

All views require intentional **loading, empty, error, offline, and success states** appropriate to their data sources.

## 7. Iconography

Use one consistent icon family, with **Phosphor Icons** as the preferred candidate.

- Standardize icon size, weight, and alignment.
- Supply accessible names where an icon alone communicates an action.
- Do not use emoji as functional icons.
- Avoid mixing icon families without a documented reason.

## 8. Responsive navigation

### Desktop

Use a sidebar, central content region, and contextual top bar. Keep reading and forms at sensible content widths rather than stretching full-screen text. Respect native titlebar and window controls on each platform.

### Mobile

Use a compact bottom navigation for essential destinations, with secondary options in contextual menus or dedicated settings. The reader should prioritize text area and conceal secondary controls when appropriate.

### Initial breakpoint guidance

| Range | Intended behavior |
| --- | --- |
| Below 640px | Compact/mobile |
| 640–1023px | Expanded mobile/tablet |
| 1024px and above | Desktop |
| 1440px and above | Wide desktop refinements |

Adjust layouts by actual content constraints, not device names alone. Plan safe areas, orientation changes, virtual keyboard behavior, and touch target sizing.

## 9. Motion and interaction

Motion is restrained, functional, and never required to understand state.

| Token | Initial range | Application |
| --- | --- | --- |
| Fast | 120–160ms | Control feedback |
| Base | 180–240ms | Menus, popovers |
| Slow | 280–360ms | Larger context transitions |

Prioritize opacity and transform for efficient animation. Support `prefers-reduced-motion` and provide instant/static alternatives where requested. Avoid continuous decorative animations and transitions that delay navigation.

## 10. Accessibility

Target **WCAG 2.2 AA** for applicable UI elements, and verify rather than declaring conformance prematurely.

Minimum engineering expectations:

- Sufficient foreground/background contrast for actual states and overlays.
- Visible keyboard focus indicators and logical focus order.
- Screen-reader labels, semantic landmarks, and appropriate roles.
- Touch targets appropriate for mobile; aim for 44 × 44px where practicable.
- Text resizing without clipped or inaccessible controls.
- Reduced motion and reduced-transparency options.
- Information not conveyed only through color.
- Reader controls that preserve EPUB structure and semantics.
- Contrast and keyboard tests in **both light and dark** modes.

For book pages, comfort settings must not override essential structure, language metadata, or navigation landmarks.

## 11. Implementation architecture

Use a theme-token layer and reusable React components. Proposed organization:

```text
src/
  components/
    ui/
    layout/
    books/
  styles/
    tokens.css
    themes.css
    glass.css
    global.css
  assets/
    fonts/
```

Fonts should be self-hosted within the distributed application with their applicable license notices. Use CSS custom properties for semantic design tokens and allow a single theme controller to apply light/dark/system modes.

The reader's settings and typography implementation should remain decoupled from global application chrome. Preference persistence should follow OpenBooks' local-first architecture.

## 12. Delivery roadmap

### Phase 1 — Foundations

- Theme tokens and Outfit / DM Sans self-hosted fonts.
- Noto Serif / Castoro reader font assets and license review.
- Responsive layout primitives, basic controls, iconography.
- Light/dark/system theme switching.

### Phase 2 — Application shell

- `AppShell`, desktop sidebar, mobile navigation, top bar.
- Home, Explore, Library, Add-ons, Settings routes.
- Accessible loading and empty states.

### Phase 3 — Book experiences

- `BookCard`, `BookGrid`, `BookDetails`.
- Availability presentation and reading-resource lists.
- Actual catalog integration, not fabricated ratings or metadata.

### Phase 4 — Reader

- EPUB rendering, chapter navigation, reading progress.
- User fonts and typography controls.
- Local persistence for reading settings.

### Phase 5 — Refinement

- Advanced Liquid Glass evaluation.
- Performance profiling and device testing.
- Accessibility audits and visual polish.

## 13. Acceptance criteria

The first implemented Design System milestone should demonstrate:

1. Consistent semantic tokens and reusable controls.
2. Correct Outfit and DM Sans assignments.
3. Noto Serif as the proposed reader default and Castoro as an available alternative, once reader functionality is implemented.
4. Working light/dark/system themes.
5. Keyboard-usable desktop navigation.
6. Responsive mobile navigation.
7. Glass surfaces with solid-background fallbacks.
8. Reader typography independent of application typography.
9. Accessibility checks for contrast, keyboard and focus states.
10. Usability without advanced visual effects or network connectivity for local features.

---

**Design maxim:** The interface should celebrate the books, never compete with them.
