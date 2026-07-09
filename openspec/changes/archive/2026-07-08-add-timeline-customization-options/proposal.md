## Why

The current timeline and sequence views expose a useful set of defaults, but they stop short of the level of per-view customization needed for real planning workflows. Users can color by a property, inspect every property on hover, and benefit from compact row packing, but they cannot define explicit value-to-color rules, limit hover details to a chosen subset, or switch the Timeline view to a more traditional one-row-per-bar gantt layout.

## What Changes

- Add per-view JSON color maps that override hashed palette assignment for selected property values while preserving the current fallback behavior for unmapped values.
- Add per-view tooltip property allowlists so hover content can be limited to an arbitrary subset of frontmatter fields while still showing the note title and date or range.
- Add a Timeline-only stacking mode option that preserves grouped sections but allows one-row-per-bar, date-sorted gantt layout as an alternative to the current compact packing mode.
- Validate invalid JSON configuration gracefully so the view keeps rendering with safe fallbacks.

## Capabilities

### New Capabilities
- `per-view-color-mapping`: Allow each view to provide a JSON dictionary that maps specific property values to explicit bar colors.
- `per-view-tooltip-fields`: Allow each view to provide a JSON array that limits which extra properties are shown in hover tooltips.
- `timeline-stacking-modes`: Allow the Timeline view to switch between compact row packing and one-row-per-bar grouped gantt layout.

### Modified Capabilities

None.

## Impact

- Affected code: `src/viewOptions.ts`, `src/sequenceViewOptions.ts`, `src/SabidurianView.ts`, `src/SequenceView.ts`, `src/utils/colorUtils.ts`, `src/renderer/BarRenderer.ts`, and `src/model/LayoutEngine.ts`
- Affected UX: Timeline and Sequence view configuration, tooltip content, and Timeline row layout behavior
- Dependencies: no new external dependencies are required if JSON parsing and validation remain internal
