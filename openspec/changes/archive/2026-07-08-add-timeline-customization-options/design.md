## Context

This plugin already centralizes the three requested behaviors in clear implementation seams: property-based color selection flows through `SabidurianView` and `SequenceView` into `getColorForValue()`, hover content is assembled in `BarRenderer.showTooltip()`, and row placement is controlled by `LayoutEngine`. That makes the change feasible without introducing a new subsystem, but it still crosses multiple view configuration, parsing, rendering, and layout modules.

The current view option model favors simple per-view fields such as property pickers, toggles, dropdowns, and text values. To keep this change aligned with that model, new customization inputs should be expressed as text-backed JSON fields rather than adding a richer editor UI.

## Goals / Non-Goals

**Goals:**
- Add per-view JSON color override maps for Timeline and Sequence views.
- Add per-view JSON tooltip property allowlists for Timeline and Sequence views.
- Add a Timeline-only stacking mode that supports both the current compact layout and a traditional one-row-per-bar grouped gantt layout.
- Preserve existing behavior as the default when new options are unset or invalid.
- Keep the side table and other existing interactions working without behavioral regression.

**Non-Goals:**
- Adding a graphical editor for color mappings or tooltip fields.
- Changing Sequence layout behavior beyond supporting the new JSON-based color and tooltip settings.
- Reworking Base grouping, side table sorting, or note preview behavior.
- Introducing new persistence formats outside the existing per-view config values.

## Decisions

### 1. Store color overrides as per-view JSON text

The Timeline and Sequence configuration panels will each add a text field for a JSON dictionary whose keys are property values and whose values are CSS colors. Matching will be case-insensitive after trimming so common values like `High`, `high`, and ` high ` resolve consistently.

Rationale:
- It fits the existing view-options model with minimal UI work.
- It keeps mappings local to the view, which matches the user's requirement.
- It can layer cleanly on top of the current fallback hash palette.

Alternatives considered:
- Global plugin-level color maps: rejected because the user asked for per-view control.
- A structured UI editor: rejected because it adds much more configuration surface and implementation complexity than needed.

### 2. Parse JSON in the view layer and pass normalized config downstream

`SabidurianView` and `SequenceView` will parse the raw JSON strings, normalize them into plain JS structures, and pass them into the color and tooltip paths. Invalid JSON will not break rendering; the parser will ignore the malformed config and use current defaults.

Rationale:
- Parsing once per view refresh avoids duplicating validation in render helpers.
- Keeping `colorUtils` and `BarRenderer` focused on behavior instead of raw config parsing keeps responsibilities clear.

Alternatives considered:
- Parsing inside `colorUtils` and `BarRenderer`: rejected because it would duplicate error handling and entangle low-level helpers with config string formats.

### 3. Apply tooltip filtering only to extra properties

The tooltip will continue to always show the note title and date or range block. The JSON array will only control which additional frontmatter properties render in the property loop.

Rationale:
- It preserves the tooltip's core usefulness while satisfying the user's desire to limit noise.
- It avoids turning tooltip composition into a larger templating problem.

Alternatives considered:
- Full tooltip templating: rejected as unnecessary scope expansion.
- Filtering properties upstream in `parseEntries()`: rejected because `entry.properties` is also used by the side table and other render paths.

### 4. Add an alternate Timeline row assignment mode rather than replacing compact packing

`LayoutEngine` will support two row strategies for Timeline views: the existing compact packing mode and a one-row-per-bar mode. In one-row-per-bar mode, entries within each group will be sorted by start date and assigned sequential rows, while the grouped section structure remains unchanged.

Rationale:
- The existing compact behavior is still valuable and should remain available.
- The requested traditional gantt behavior is an alternate layout strategy, not a different data model.
- Keeping the switch in the layout engine minimizes impact on renderers, culling, and grouped section management.

Alternatives considered:
- Replacing compact mode entirely: rejected because it would remove existing efficient behavior.
- Implementing the new mode by faking overlap: rejected because a direct sequential-row strategy is simpler and easier to reason about.

### 5. Keep defaults backward-compatible and failure-tolerant

New view options will default to the current behavior:
- no color override map means hashed palette or direct hex behavior stays unchanged
- no tooltip property list means show all current extra properties
- no stacking mode selection means Timeline stays in compact mode

Rationale:
- Existing views should continue rendering identically unless a user opts in.
- This reduces adoption risk and avoids migration work.

## Risks / Trade-offs

- Invalid JSON can silently confuse users if ignored completely. → Surface a notice or console warning while still falling back safely.
- Case-insensitive value matching may collapse intentionally distinct values. → Normalize consistently and document the behavior in the option description.
- One-row-per-bar mode will consume more vertical space. → Keep it opt-in and preserve compact mode as the default.
- Tooltip allowlists based on property names may drift if displayed names change. → Use normalized frontmatter property keys as the config contract rather than display labels.
- Grouped row order and side table order can diverge if sorting rules differ. → Reuse the same start-date sorting rule for layout and grouped table rendering where needed.

## Migration Plan

No data migration is required. Existing saved views continue using the current defaults until users populate the new JSON fields or switch Timeline stacking mode. Rollback is straightforward: remove the new config values or revert to compact mode.

## Open Questions

- Whether invalid JSON should trigger a visible `Notice` on every refresh or only log once per render cycle.
- Whether tooltip allowlist matching should support both raw keys and display names, or only raw keys for consistency.
