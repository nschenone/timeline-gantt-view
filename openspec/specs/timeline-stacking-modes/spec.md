## Purpose

Define supported stacking modes for the Timeline view. TBD.

## Requirements

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

### Requirement: One-row-per-bar mode preserves group sections
The system SHALL preserve existing grouped sections, collapse behavior, and per-group row namespaces when one-row-per-bar mode is enabled.

#### Scenario: Group headers remain separate in one-row-per-bar mode
- **WHEN** grouped Timeline data is rendered in one-row-per-bar mode
- **THEN** each group MUST continue rendering as its own section with its existing header and collapse behavior

### Requirement: One-row-per-bar mode sorts each group by date
The system SHALL sort entries by start date within each visible Timeline group before assigning sequential rows in one-row-per-bar mode.

#### Scenario: Earlier entries appear above later entries within a group
- **WHEN** two entries in the same visible group have different start dates and one-row-per-bar mode is enabled
- **THEN** the entry with the earlier start date MUST be placed in a row above the later entry

#### Scenario: Ungrouped timelines use the same date-sorted sequential rows
- **WHEN** the Timeline view is ungrouped and one-row-per-bar mode is enabled
- **THEN** entries MUST be assigned one row each in start-date order across the full timeline
