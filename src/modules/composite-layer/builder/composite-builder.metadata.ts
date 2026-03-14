/**
 * Metadata creation for composite records
 * Generates deterministic builder metadata
 */

import type { CompositeType } from '../core/composite.enums';
import type { CompositeMetadata } from '../core/composite.metadata';

/**
 * Create builder metadata for composite record
 *
 * Metadata fields:
 * - modelVersion: "1.0.0"
 * - schemaVersion: recordVersion
 * - generatedBy: "CompositeRecordBuilder"
 * - calculationMode: "deterministic"
 *
 * @param compositeType - The composite type
 * @param recordVersion - Schema version
 * @param createdAt - When the record was created
 * @returns Composite metadata for the record
 */
export function createCompositeBuilderMetadata(
  _compositeType: CompositeType,
  recordVersion: string,
  _createdAt: string,
): CompositeMetadata {
  return {
    modelVersion: '1.0.0',
    schemaVersion: recordVersion,
    generatedBy: 'CompositeRecordBuilder',
    calculationMode: 'deterministic',
  };
}
