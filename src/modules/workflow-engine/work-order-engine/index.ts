/**
 * Work Order Engine service layer
 * Deterministic work order creation with title generation
 */

export { WorkOrderEngineService } from './work-order-engine.service';
export { linkWorkOrderRecommendations } from './work-order-recommendation-linker';
export { buildWorkOrderTitle } from './work-order-title-builder';
export type {
  WorkOrderEngineInput,
  WorkOrderEngineResult,
} from './work-order-engine.types';
