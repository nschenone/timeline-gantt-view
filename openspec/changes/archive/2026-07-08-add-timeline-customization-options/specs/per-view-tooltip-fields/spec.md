## ADDED Requirements

### Requirement: Views accept per-view tooltip property allowlists
The system SHALL allow Timeline and Sequence views to accept a per-view JSON array that limits which extra entry properties are displayed in hover tooltips.

#### Scenario: Allowed properties are shown in tooltip
- **WHEN** a view defines a valid tooltip property array and an entry contains those properties
- **THEN** the tooltip MUST render only the listed extra properties that have non-empty values

#### Scenario: Unlisted properties are excluded from tooltip
- **WHEN** an entry contains properties that are not present in the configured tooltip property array
- **THEN** the tooltip MUST omit those properties from the extra property section

### Requirement: Core tooltip context remains visible
The system SHALL continue to display the entry title and date or range information regardless of tooltip property filtering.

#### Scenario: Title and range remain visible with filtering enabled
- **WHEN** a view defines a tooltip property array
- **THEN** the tooltip MUST still show the entry title and date or range block before any extra properties

### Requirement: Tooltip filtering does not alter non-tooltip property consumers
The system SHALL apply tooltip property filtering only to hover tooltip rendering and MUST NOT remove properties from other view features that rely on the full property set.

#### Scenario: Side table remains unaffected by tooltip filtering
- **WHEN** a view defines a tooltip property array
- **THEN** the side table MUST continue using its existing property behavior independently of the tooltip filter

### Requirement: Invalid tooltip configuration degrades safely
The system SHALL ignore invalid per-view tooltip property JSON without preventing the view from rendering.

#### Scenario: Invalid JSON preserves current tooltip behavior
- **WHEN** the configured tooltip property text is not valid JSON
- **THEN** the tooltip MUST continue rendering with the current default extra-property behavior

#### Scenario: Non-array JSON is ignored
- **WHEN** the configured tooltip property value parses successfully but is not a JSON array
- **THEN** the system MUST ignore the value and keep the current default extra-property behavior
