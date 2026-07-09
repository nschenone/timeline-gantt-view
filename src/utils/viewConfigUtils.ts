export type ColorOverrideMap = Record<string, string>;

export function normalizeConfigToken(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function parseColorMapJson(raw: string | null | undefined): ColorOverrideMap | null {
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      return null;
    }

    const normalized: ColorOverrideMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const normalizedKey = normalizeConfigToken(key);
      const color = String(value ?? '').trim();
      if (normalizedKey && color) {
        normalized[normalizedKey] = color;
      }
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

export function parseTooltipPropsJson(raw: string | null | undefined): string[] | null {
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const props = parsed
      .map((value) => normalizeConfigToken(String(value ?? '')))
      .filter(Boolean);

    return props.length > 0 ? Array.from(new Set(props)) : null;
  } catch {
    return null;
  }
}
