## Why

The side table and timeline bars do not share a single vertical layout contract today. As a result, side table rows end earlier than the bar lanes, and grouped timelines drift further out of alignment because table rows do not account for the same offsets and gaps used by the bar layout.

## What Changes

- Make side table row placement derive from the same layout geometry that positions timeline bars.
- Require side table rows to match the visual lane height used by bars so rows and bars stay aligned from top to bottom.
- Mirror grouped timeline spacing in the side table, including header height, top and bottom offsets, and inter-group gaps.
- Define how side table alignment behaves across supported stacking modes so compact and one-row-per-bar views remain predictable.

## Capabilities

### New Capabilities
- `side-table-row-alignment`: Define the vertical alignment contract between side table rows and timeline bar lanes for grouped and ungrouped views.

### Modified Capabilities
- `timeline-stacking-modes`: Clarify how side table row alignment behaves when the timeline uses compact and one-row-per-bar stacking modes.

## Impact

- Affected code: `src/renderer/SideTableRenderer.ts`, `src/model/LayoutEngine.ts`, `src/SabidurianView.ts`, `src/SequenceView.ts`, and `styles.css`
- Affected behavior: side table height, row positioning, grouped spacing, and row-to-bar alignment in both timeline views
- No API or dependency changes expected
