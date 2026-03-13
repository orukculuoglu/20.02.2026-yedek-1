/**
 * Data Engine Work Order Candidate Input
 *
 * Input to the work order candidate preparation engine.
 * Contains execution candidates to be converted to work order candidates.
 *
 * Flows from: Phase 14 (Execution Preparation Engine)
 * Flows to: createWorkOrderCandidates()
 */

import type { DataEngineExecutionCandidateResult } from '../../execution/models/DataEngineExecutionCandidateResult';

/**
 * Input model for work order candidate preparation
 *
 * Direct wrapper of Phase 14 result.
 */
export type DataEngineWorkOrderCandidateInput = DataEngineExecutionCandidateResult;
