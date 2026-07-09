## 1. Shared Layout Contract

- [x] 1.1 Identify the layout metadata the side table needs from `LayoutEngine` to mirror bar rows, offsets, group headers, and group gaps.
- [x] 1.2 Update the side table render contract so grouped and ungrouped renders can receive the computed content height and row-positioning data without duplicating layout rules.

## 2. Side Table Positioning

- [x] 2.1 Refactor `SideTableRenderer` to position side table rows from assigned timeline rows instead of normal flow layout.
- [x] 2.2 Update grouped side table rendering so group headers and collapsed groups preserve the same header height and inter-group spacing as the timeline.
- [x] 2.3 Adjust side table CSS so row boxes match bar height while the overall side table body matches the timeline content height.

## 3. View Integration And Verification

- [x] 3.1 Wire the updated side table layout inputs through `SabidurianView` and `SequenceView`.
- [x] 3.2 Verify ungrouped, grouped, collapsed-group, compact, and one-row-per-bar renders keep the side table and bars aligned through the last visible row.
