/**
 * Enumeration of normalization strategies for score normalization.
 * Determines how raw scores are mapped to the standard 0.0-1.0 range.
 * 
 * - LINEAR: Simple linear mapping from [min, max] to [0, 1]
 * - SIGMOID: S-curve mapping, smooth transitions at boundaries
 * - LOG: Logarithmic mapping for exponential distributions
 * - PERCENTILE: Percentile-based mapping against reference population
 * - BOUNDED: Linear mapping with strict bounds and clamping
 */
export enum NormalizationStrategy {
  LINEAR = 'LINEAR',
  SIGMOID = 'SIGMOID',
  LOG = 'LOG',
  PERCENTILE = 'PERCENTILE',
  BOUNDED = 'BOUNDED',
}
