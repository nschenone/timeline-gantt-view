## ADDED Requirements

### Requirement: Views accept per-view color override maps
The system SHALL allow Timeline and Sequence views to accept a per-view JSON dictionary that maps property values from the configured `Color by` field to explicit CSS color values.

#### Scenario: Valid mapped value overrides palette color
- **WHEN** a view has a valid color map and an entry's `Color by` value matches a key in that map
- **THEN** the entry bar MUST use the mapped CSS color instead of the hashed palette color

#### Scenario: Matching is normalized for user-entered values
- **WHEN** the configured map contains a key that differs from the entry value only by surrounding whitespace or letter casing
- **THEN** the system MUST treat the value as a match and apply the mapped color

### Requirement: Unmapped values preserve existing behavior
The system SHALL preserve existing color assignment behavior for values that are not present in the per-view color map.

#### Scenario: Unmapped value falls back to existing color behavior
- **WHEN** an entry has a `Color by` value that is not present in the configured color map
- **THEN** the system MUST assign color using the current direct-hex or hashed-palette behavior

#### Scenario: Missing color map preserves current behavior
- **WHEN** a view does not define a color map
- **THEN** all entries MUST use the current direct-hex or hashed-palette behavior

### Requirement: Invalid color map configuration degrades safely
The system SHALL ignore invalid per-view color map JSON without preventing the view from rendering.

#### Scenario: Invalid JSON does not break the view
- **WHEN** the configured color map text is not valid JSON
- **THEN** the view MUST continue rendering and entries MUST use the current direct-hex or hashed-palette behavior

#### Scenario: Non-dictionary JSON is ignored
- **WHEN** the configured color map parses successfully but is not a JSON object
- **THEN** the system MUST ignore the value and fall back to the current color behavior
