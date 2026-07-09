## ADDED Requirements

### Requirement: Side table uses timeline vertical geometry
The system SHALL position side table content from the same vertical layout geometry used to render timeline bars.

#### Scenario: Ungrouped side table matches timeline content height
- **WHEN** an ungrouped timeline is rendered with the side table visible
- **THEN** the side table body MUST use the same total content height as the timeline body
- **AND** the side table MUST preserve the timeline's top and bottom offsets

#### Scenario: Grouped side table preserves timeline section spacing
- **WHEN** a grouped timeline is rendered with the side table visible
- **THEN** the side table MUST preserve each group's header height and inter-group gap used by the timeline layout
- **AND** the final side table content height MUST match the grouped timeline content height

### Requirement: Side table rows match bar lane presentation
The system SHALL render each visible side table row at the visible entry's lane position and match the bar's visual height.

#### Scenario: Visible row matches bar height
- **WHEN** an entry is visible in the side table and timeline
- **THEN** the side table row for that entry MUST use the same visual height as the rendered bar

#### Scenario: Visible row uses lane anchor
- **WHEN** an entry is assigned a timeline row
- **THEN** the side table row MUST be positioned from that assigned row's vertical anchor rather than normal document flow

### Requirement: Collapsed groups omit entry rows without breaking alignment
The system SHALL keep side table and timeline alignment when a group is collapsed.

#### Scenario: Collapsed group shows header only
- **WHEN** a group is collapsed
- **THEN** the side table MUST render the group header without rendering that group's entry rows
- **AND** the side table MUST still preserve the gap that follows the collapsed group in the timeline layout
