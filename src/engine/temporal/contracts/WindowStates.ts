/**
 * Window State Models
 * Structural state representations for different window classifications.
 * Pure structural containers, no interpretation or inference.
 * 
 * Note: Window temporal spans are stored in MultiWindowTemporalContract.boundary only.
 * State models track WHEN state was recorded, not the observation period.
 */

/**
 * BaseWindowState
 * Shared structural base for window state records.
 * Tracks creation lifecycle, not observation period (that's in window boundary).
 */
export interface BaseWindowState {
  windowId: string;           // Reference to canonical window
  stateType: "observed" | "baseline" | "reference";
  capturedAt: number;         // When state was recorded (Unix ms)
  version: string;            // Version of state schema
}

/**
 * ObservedWindowState
 * Structural state marker for an observed/current data window.
 * Indicates this window represents observed/actual data.
 */
export interface ObservedWindowState extends BaseWindowState {
  stateType: "observed";
  dataQuality: "verified" | "provisional" | "unverified";
}

/**
 * BaselineWindowState
 * Structural state marker for a baseline/expected/normal window.
 * Indicates the role of this window as a baseline.
 */
export interface BaselineWindowState extends BaseWindowState {
  stateType: "baseline";
  baselineClassification: "expected" | "historical" | "seasonal" | "control";
}

/**
 * ReferenceWindowState
 * Structural state marker for a reference/anchor window.
 * Indicates the role of this window as a reference point.
 */
export interface ReferenceWindowState extends BaseWindowState {
  stateType: "reference";
}

/**
 * WindowState
 * Discriminated union of window state variants.
 * Ensures type safety for state-specific operations.
 */
export type WindowState = 
  | ObservedWindowState
  | BaselineWindowState
  | ReferenceWindowState;

/**
 * StateSnapshot
 * Collection of window states captured together.
 * Useful for atomic state grouping.
 */
export interface StateSnapshot {
  snapshotId: string;
  capturedAt: number;         // When entire snapshot was taken (Unix ms)
  states: WindowState[];
}
