// Type exports
export type {
  CompositePublicationEnvelope,
  CompositeSignalProjection,
  CompositeTimelineProjection,
  CompositeDashboardProjection,
  CompositePublicationResult,
} from './composite-publisher.types';

// Publisher function exports
export { createCompositeProjectionKey } from './composite-publisher.keys';
export { buildCompositeSignalProjection } from './composite-publisher.signal';
export { buildCompositeTimelineProjection } from './composite-publisher.timeline';
export { buildCompositeDashboardProjection } from './composite-publisher.dashboard';
export { buildCompositePublicationEnvelope } from './composite-publisher.envelope';
export { publishCompositeRecord } from './composite-publisher.record';
