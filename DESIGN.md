# VEROLA Design System

Source of truth:
- **Tokens:** `src/app/globals.css` (`@theme` block)
- **Components:** `src/components/ui.tsx`
- **Living reference:** `/design-system` (noindex, disallowed in `robots.ts`)

## 1. Colour

Two palettes coexist by design:

| Surface | Palette | Tokens |
|---|---|---|
| Marketing / studio (dark-first) | Neon on ink | `ink`, `ink-2`, `ink-3`, `paper`, `violet`, `cyan`, `magenta`, `gold`, `muted` |
| Configurator, orders, admin (light) | Print blue on paper | `brand`, `brand-deep`, `brand-sky`, `navy`, `surface-soft`, `ink-strong`, `ink-body`, `ink-subtle`, `ink-muted`, `ink-faint` |
| Status | Semantic | `success`, `warning`, `danger`, `amber`, `whatsapp` |

**Rule:** never write a hex value in a class name. Use a token. If a colour is
missing, add it to `@theme` first.

Tailwind utilities are generated automatically, for example `bg-brand`,
`text-ink-muted`, `border-danger/40`.

## 2. Typography

- Display: `font-display` (Syne, falls back to IBM Plex Sans Arabic)
- Body: `font-body` (Inter, falls back to IBM Plex Sans Arabic)
- Arabic UI uses `text-3xl md:text-5xl` headings instead of the Latin `clamp()` scale.

Named small sizes (use these instead of arbitrary `text-[…rem]`):

| Token | Size | Typical use |
|---|---|---|
| `text-lead` | 1.15rem | Lead paragraph |
| `text-body-sm` | 0.95rem | Secondary body |
| `text-small` | 0.8125rem | Labels, badges |
| `text-caption` | 0.72rem | Hints, metadata |
| `text-micro` | 0.68rem | Dense tables, tags |

## 3. Radius & elevation

| Token | Value | Use |
|---|---|---|
| `rounded-inset` | 22px | Inner tiles, swatches |
| `rounded-tile` | 26px | Tiles, preview plates |
| `rounded-card` | 28px | `Card`, glass panels |
| `rounded-panel` | 32px | Large feature panels |
| `rounded-full` | — | Buttons, badges, pills |

| Token | Use |
|---|---|
| `shadow-lift` | Raised cards on light surfaces |
| `shadow-glow-aurora` / `shadow-glow-aurora-hover` | Aurora (primary) button |
| `shadow-glow-brand` | Brand (blue) primary button |

## 4. Motion

- Easing: `ease-press` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Durations: `--duration-fast` 150ms, `--duration-base` 300ms, `--duration-slow` 600ms.
- Always respect `prefers-reduced-motion` (already handled globally in `globals.css`).

## 5. Components (`src/components/ui.tsx`)

| Component | API | Notes |
|---|---|---|
| `Button` | `variant`: `aurora` \| `primary` \| `secondary` \| `glass` \| `ghost` \| `danger` \| `link`; `size`: `sm` \| `md` \| `lg` \| `icon`; `loading`, `fullWidth`, `href`, `disabled`, `ariaLabel` | Loading sets `aria-busy` and disables the button. |
| `buttonClass()` | Returns the class string for non-button elements (links, `<label>`) | |
| `Badge` | `tone`: `neutral` \| `gold` \| `brand` \| `success` \| `warning` \| `danger` \| `info` | `gold` prop is deprecated; use `tone="gold"`. |
| `Card` | `as`, `padded` | Glass surface with `rounded-card`. |
| `Field` | `label`, `required`, `hint`, `error` | Error is announced with `role="alert"`. |
| `inputCls` / `inputErrorCls` | Input classes; add the error class when invalid | Set `aria-invalid="true"` on the input. |
| `Spinner` | `label` (adds `role="status"`) | |
| `EmptyState` | `title`, `description`, `action`, `icon` | |
| `SectionHeading`, `Reveal`, `Accordion`, `Icon`, `Logo` | Existing | |

## 6. Accessibility

- Visible focus ring (`:focus-visible`, cyan). Never remove it.
- Icon-only buttons must pass `ariaLabel`.
- Invalid fields set `aria-invalid` and show the error via `role="alert"`.
- Contrast: check `ink-faint` and `ink-muted` on dark surfaces before using them for body text.

## 7. Adding something new

1. Need a colour, size, radius or shadow? Add a token in `globals.css` first.
2. Need a component variant? Extend the existing component. Do not copy classes.
3. Add it to `/design-system` so the team can see it.
4. Run `npm run typecheck` and `npm run lint`.
