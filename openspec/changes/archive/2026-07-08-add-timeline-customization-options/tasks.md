## 1. View Configuration

- [x] 1.1 Add per-view `colorMapJson` and `tooltipPropsJson` text options to Timeline and Sequence view option definitions with descriptions that explain the expected JSON formats.
- [x] 1.2 Add a Timeline-only `stackingMode` option that offers `compact` and `one-row-per-bar` behaviors while defaulting to compact.

## 2. Config Parsing And Fallbacks

- [x] 2.1 Implement shared or parallel view-level parsing for color-map JSON so Timeline and Sequence normalize case-insensitive value keys and ignore invalid or non-object input safely.
- [x] 2.2 Implement shared or parallel view-level parsing for tooltip-property JSON so Timeline and Sequence normalize property-name arrays and ignore invalid or non-array input safely.
- [x] 2.3 Thread the parsed color-map, tooltip-property, and stacking-mode values into the existing Timeline and Sequence rendering pipelines without changing default behavior when options are unset.

## 3. Rendering And Layout Behavior

- [x] 3.1 Update color assignment to consult per-view mapped values before the current direct-hex and hashed-palette fallback behavior.
- [x] 3.2 Update tooltip rendering so title and date or range remain visible while extra properties are filtered by the configured allowlist only.
- [x] 3.3 Add a one-row-per-bar Timeline layout strategy in `LayoutEngine` that preserves grouped sections and assigns sequential date-sorted rows within each group.
- [x] 3.4 Ensure grouped and ungrouped Timeline render paths, side-table alignment, and viewport culling continue working with the new stacking mode.

## 4. Verification

- [x] 4.1 Verify Timeline and Sequence views still match current behavior when the new JSON fields are empty or invalid.
- [x] 4.2 Verify mapped and unmapped color values, tooltip allowlists, and invalid JSON fallback cases against the new specs.
- [x] 4.3 Verify Timeline grouped and ungrouped one-row-per-bar mode preserves date ordering, group sections, and compact-mode parity when switched back.
