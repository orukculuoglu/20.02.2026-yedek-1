/**
 * Component Canonicalization Layer — Phase 5
 *
 * Transform inconsistent component names to canonical forms.
 * Prevents duplicate asset nodes caused by naming variations.
 *
 * PURE FUNCTION: No side effects, no external state access.
 * Input → String transformation → Output (deterministic)
 */

/**
 * Canonical mapping for well-known components.
 * Covers common variations and aliases.
 * First lookup before applying fallback normalization rules.
 */
const COMPONENT_CANONICAL_MAP: Record<string, string> = {
  // Brake components
  brakepads: 'brake_pad',
  brakepad: 'brake_pad',
  brake_pad: 'brake_pad',
  'brake-pad': 'brake_pad',

  // Tire/Tyre variants
  tire: 'tire',
  tyres: 'tire',
  tyre: 'tire',

  // Oil system
  oil_change: 'oil_system',
  oilchange: 'oil_system',
  'oil-change': 'oil_system',
  oil: 'oil_system',

  // Filter
  filter: 'filter',
  filters: 'filter',
};

/**
 * Canonicalize component name to prevent duplicate asset nodes.
 *
 * Process:
 * 1. Trim and lowercase
 * 2. Check canonical map (fast path)
 * 3. Replace dashes with underscores
 * 4. Remove plural suffixes (s, es)
 * 5. Remove descriptive suffixes (REPLACEMENT, CHANGE, etc.)
 * 6. Collapse duplicate underscores
 * 7. Guarantee non-empty result
 *
 * @param component - Raw component name (any case, any format)
 * @returns Canonical component name (lowercase, normalized)
 */
export function canonicalizeComponentName(component: string): string {
  // Step 1: Trim and lowercase
  let canonical = component.trim().toLowerCase();

  // Step 2: Check canonical map first (fast path)
  if (COMPONENT_CANONICAL_MAP[canonical]) {
    return COMPONENT_CANONICAL_MAP[canonical];
  }

  // Step 3: Replace dashes with underscores
  canonical = canonical.replace(/-/g, '_');

  // Step 4: Remove plural suffixes (s, es) if not in map already
  // Only remove if last segment looks like a plural
  if (canonical.endsWith('es')) {
    const withoutEs = canonical.slice(0, -2);
    if (COMPONENT_CANONICAL_MAP[withoutEs]) {
      return COMPONENT_CANONICAL_MAP[withoutEs];
    }
    canonical = withoutEs;
  } else if (canonical.endsWith('s') && !canonical.endsWith('_s')) {
    const withoutS = canonical.slice(0, -1);
    if (COMPONENT_CANONICAL_MAP[withoutS]) {
      return COMPONENT_CANONICAL_MAP[withoutS];
    }
    // Only remove trailing 's' if it looks like a plural (word_s pattern)
    const parts = withoutS.split('_');
    const lastPart = parts[parts.length - 1];
    if (lastPart.length > 1 && !lastPart.match(/^\d+$/)) {
      canonical = withoutS;
    }
  }

  // Step 5: Remove descriptive suffixes
  const descriptiveSuffixes = [
    'replacement',
    'change',
    'inspection',
    'service',
    'maintenance',
    'repair',
  ];

  const parts = canonical.split('_');
  const lastPart = parts[parts.length - 1];

  if (parts.length > 1 && descriptiveSuffixes.includes(lastPart)) {
    canonical = parts.slice(0, -1).join('_');
  }

  // Step 6: Collapse duplicate underscores
  canonical = canonical.replace(/_+/g, '_');

  // Step 7: Trim underscores from edges
  canonical = canonical.replace(/^_+|_+$/g, '');

  // Step 8: Guarantee non-empty result
  return canonical.length > 0 ? canonical : 'component';
}
