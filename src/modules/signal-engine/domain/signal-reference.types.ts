/**
 * Signal reference types for upstream intelligence sources
 */

export interface IndexReference {
  sourceId: string;
  sourceType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CompositeReference {
  sourceId: string;
  sourceType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface EventReference {
  sourceId: string;
  sourceType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface GraphReference {
  sourceId: string;
  sourceType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
