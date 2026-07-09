## MODIFIED Requirements

### Requirement: Timeline view supports selectable stacking modes
The system SHALL allow the Timeline view to switch between the current compact row-packing behavior and a one-row-per-bar stacking mode.

#### Scenario: Compact mode preserves current layout behavior
- **WHEN** the Timeline view uses compact stacking mode
- **THEN** entries MUST continue using the existing non-overlapping row-packing strategy
- **AND** side table alignment MUST follow the resulting lane geometry for visible entries

#### Scenario: One-row-per-bar mode assigns a dedicated row to each entry
- **WHEN** the Timeline view uses one-row-per-bar stacking mode
- **THEN** each visible entry MUST be assigned its own row even if it does not overlap neighboring entries
- **AND** the matching side table row MUST align to that entry's dedicated timeline row
