/**
 * CompositeMetadata captures calculation context and version information
 * Supports deterministic reproducibility and debugging
 */
export interface CompositeMetadata {
  /**
   * Version of the composite calculation model
   * Example: "1.0.0", "2.1.0"
   */
  modelVersion: string;

  /**
   * Version of the composite schema/structure
   */
  schemaVersion: string;

  /**
   * Name/identifier of the component that generated this composite
   * Example: "CompositeCalculatorV1", "VehicleHealthAggregator"
   */
  generatedBy: string;

  /**
   * Calculation mode (e.g., "deterministic", "streaming", "batch")
   */
  calculationMode: string;

  /**
   * Optional: Hash of inputs for deterministic verification
   */
  deterministicHash?: string;

  /**
   * Optional: Environment where this was calculated (prod, staging, dev)
   */
  environment?: string;
}
