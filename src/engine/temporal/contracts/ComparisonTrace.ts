/**
 * ComparisonTrace.ts
 * Reference-based tracing of comparison result origins.
 * Structural references to source entities; no narrative explanation.
 */

export enum ComparisonTraceSource {
  PAIR = "pair",
  GROUP = "group",
  WINDOW = "window",
  THRESHOLD = "threshold",
  TRACE = "trace",
}

export interface ComparisonTraceReference {
  traceId: string;
  sourceType: ComparisonTraceSource;
  sourceId: string;
  contributionType?: ContributionType;
}

export enum ContributionType {
  PRIMARY = "primary",
  COMPARISON_TARGET = "comparison_target",
  CONTEXT = "context",
  TRIGGER = "trigger",
  AGGREGATE = "aggregate",
}

export interface ComparisonExplanationReferences {
  primarySourceId: string;
  contributingSourceIds: string[];
  traces: ComparisonTraceReference[];
}
