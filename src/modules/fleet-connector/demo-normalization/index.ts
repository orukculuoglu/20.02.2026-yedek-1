/**
 * Fleet Normalization Demo Module
 * 
 * Pure demo composition for external-to-normalized normalization flow.
 * 
 * Exports:
 * - FleetNormalizationDemoRuntimeInput: Input structure for the demo runner
 * - FleetNormalizationDemoResult: Result structure
 * - runFleetNormalizationDemo: Demo normalization function
 */

export type { FleetNormalizationDemoRuntimeInput } from './fleet-normalization-demo-runner.input';

export type {
  FleetNormalizationDemoResult,
} from './fleet-normalization-demo-runner.result';

export { runFleetNormalizationDemo } from './fleet-normalization-demo-runner';
