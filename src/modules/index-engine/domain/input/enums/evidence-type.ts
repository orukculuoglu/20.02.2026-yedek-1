/**
 * Enumeration of evidence types that can be packaged in IndexInputEvidence.
 * Categorizes the nature and source of evidence being provided to calculators.
 * 
 * - MEASUREMENT: Direct quantitative measurement or metric
 * - SIGNAL: Derived signal from Vehicle Intelligence Graph
 * - EVENT: Discrete event or occurrence
 * - PATTERN: Detected pattern or trend
 * - COMPARISON: Comparative assessment (vs. baseline, fleet average, etc.)
 * - STATUS: Current state or status indicator
 * - DIAGNOSTIC: Diagnostic code or error condition
 * - ESTIMATION: Estimated or inferred value
 */
export enum EvidenceType {
  MEASUREMENT = 'MEASUREMENT',
  SIGNAL = 'SIGNAL',
  EVENT = 'EVENT',
  PATTERN = 'PATTERN',
  COMPARISON = 'COMPARISON',
  STATUS = 'STATUS',
  DIAGNOSTIC = 'DIAGNOSTIC',
  ESTIMATION = 'ESTIMATION',
}
