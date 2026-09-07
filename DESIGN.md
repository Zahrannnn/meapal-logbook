# DESIGN.md — Meapal LogBook

## Theme

Light, office-daylight scene: employees log work during the workday on laptops and phones. Light surface, no dark mode yet.

## Color strategy

Restrained. Tinted neutrals plus one brand accent (blue `hsl(221 83% 53%)`) for primary actions, current selection, and state only. Semantic status tokens (success / warning / info / destructive) are reserved for activity status and pace badges, never decoration. Rest-day content drops to muted tones.

## Typography

- Manrope, one family across the product.
- Fixed rem scale, ~1.2 ratio. Labels: 11px bold uppercase tracking-wider in muted-foreground. Numbers: `tabular-nums` always.
- One primary element per surface; hierarchy via weight before size.

## Elevation and shape

- Cards: `rounded-2xl`, 1px `border-border`, no heavy shadows; a single-level card system. Nested cards are wrong; use dividers or a muted panel (`bg-muted/40`) inside.
- The rail/timeline motif (thin vertical line + status dot) is the signature for anything day-ordered.

## Components

shadcn/ui on Radix. Same button vocabulary everywhere (`size="sm"` in cards, `data-icon` icons). DropdownMenu for row actions behind a kebab. Skeletons for loading, `Empty` for empty states, `ConfirmDialog` for destructive guards.

## Motion

150–250 ms, ease-out. Framer Motion for state reveals (rows entering, collapsibles, the period-switch pill). No page-load orchestration, no bounce.

## Copy rules

Plain verbs, sentence-case UI text with uppercase micro-labels, no em dashes, numbers always scoped ("for Thu, Aug 27").
