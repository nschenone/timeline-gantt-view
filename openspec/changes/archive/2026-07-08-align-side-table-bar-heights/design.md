## Context

The timeline already has a canonical vertical layout model in `LayoutEngine`. Bars use `getRowY(row)` together with `BAR_HEIGHT`, `ROW_HEIGHT`, `Y_OFFSET`, `GROUP_HEADER_HEIGHT`, and `GROUP_GAP`, while the side table currently renders rows in normal HTML flow with CSS-driven height. That split causes the side table body to be shorter than the SVG timeline, especially in grouped views where the table does not reproduce top and bottom offsets or inter-group gaps.

The change spans shared layout code, both view entry points, the side table renderer, and side table styling. It also needs a clear behavioral boundary for compact stacking mode, where multiple entries can intentionally share a single timeline lane.

## Goals / Non-Goals

**Goals:**
- Make the side table body use the same vertical geometry as the timeline body.
- Ensure grouped and ungrouped timelines keep the side table and bars aligned from the first visible row through the last visible row.
- Preserve scroll sync and existing interaction behavior while fixing row placement.
- Define explicit side table alignment behavior for compact and one-row-per-bar stacking modes.

**Non-Goals:**
- Redesign the side table content model or introduce a new lane-aggregation UI.
- Change bar packing behavior in `LayoutEngine`.
- Add new user-facing controls beyond the existing stacking mode selection.

## Decisions

### Use `LayoutEngine` as the single source of truth for vertical geometry
The side table renderer will stop relying on flow layout for body rows and instead place each visual row from layout metadata already used by the timeline.

Rationale:
- It removes duplicated height rules between CSS and TypeScript.
- It fixes the current drift caused by missing offsets and group gaps.
- It keeps grouped and ungrouped views consistent because both already depend on `LayoutEngine`.

Alternative considered:
- Rebuild the timeline to follow CSS row layout. Rejected because the SVG timeline already depends on explicit pixel geometry for bars, headers, arrows, culling, and interaction hit targets.

### Give the side table body an explicit content height
The side table body will render against a container whose height matches the computed timeline layout height instead of relying on the natural height of appended rows.

Rationale:
- Matching total content height is required for clean scroll sync.
- It ensures bottom alignment even when grouped spacing adds empty vertical regions.

Alternative considered:
- Add top and bottom spacer elements while leaving rows in normal flow. Rejected because it still does not solve group-gap placement or row positioning in a durable way.

### Render side table rows at lane positions with bar-height row boxes
Visible entry rows will be positioned using `entry.row` and `getRowY(entry.row)`, with the row box height matching `BAR_HEIGHT`. The vertical gap between rows will remain the existing lane gap from `ROW_HEIGHT - BAR_HEIGHT`.

Rationale:
- This directly matches the user-visible bar height.
- It keeps the gap owned by the shared layout engine instead of side-table-specific CSS.

Alternative considered:
- Set the table row height to full `ROW_HEIGHT`. Rejected because the request is specifically to match the bar height, and it would visually overstate the row block compared with the bar itself.

### Mirror group header and group gap geometry in the side table
Grouped rendering will position side table group headers from the same group metadata used by the timeline and preserve `GROUP_HEADER_HEIGHT` and `GROUP_GAP` spacing.

Rationale:
- The current grouped drift accumulates because the side table omits those sections.
- The group header Y values already exist and can be reused.

Alternative considered:
- Infer group spacing from DOM height after render. Rejected because it reintroduces layout divergence and depends on browser flow details.

### Treat compact mode as lane-aligned, not guaranteed one-entry-per-visual-row
The contract will guarantee that side table content follows the timeline's lane geometry. Exact one-entry-per-row alignment is guaranteed in `one-row-per-bar` mode. In compact mode, entries that intentionally share a lane may share the same vertical anchor rather than forcing a different layout model.

Rationale:
- This keeps the change small and consistent with existing compact packing behavior.
- It addresses the reported height drift without expanding the feature into a lane-aggregation redesign.

Alternative considered:
- Introduce a new compact-mode side-table aggregation UI. Rejected as too large for this change.

## Risks / Trade-offs

- [Compact-mode shared lanes can still limit readability] -> Document the behavior in specs and keep exact alignment guaranteed in `one-row-per-bar` mode.
- [Absolute positioning may require CSS cleanup for hover and borders] -> Move row sizing rules out of flow-based CSS and keep hover behavior attached to the positioned row elements.
- [Two views share the same renderer] -> Verify the design against both `SabidurianView` and `SequenceView` so they continue to pass the same layout data.
- [Scroll height regressions] -> Set the side table content height from the computed layout height and verify final row visibility at the bottom of grouped and ungrouped timelines.

## Migration Plan

No data migration is required. The change is a render-path update only.

Rollback is straightforward: revert the side table positioning and styling changes if alignment or scroll behavior regresses.

## Open Questions

- Whether compact mode should eventually gain a dedicated lane-based side table presentation remains open, but that is intentionally outside this change.
