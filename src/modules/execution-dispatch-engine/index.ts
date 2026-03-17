/**
 * Execution / Dispatch Engine module
 * Layer 8: Converts work orders into enterprise-grade delivery execution structures
 *
 * This module provides:
 * - Foundational dispatch domain model
 * - Target actor model with capabilities and lifecycle
 * - Delivery channel model with endpoints and protocols
 * - Dispatch package model combining intent, actor, and channel
 * - Dispatch engine orchestration and assembly layer
 * - Dispatch runtime core for deterministic execution preparation
 * - Dispatch tracking core for delivery lifecycle & acknowledgement model
 * - Dispatch audit core for snapshot, log & deterministic audit model
 * - Module facade providing grouped access to all capabilities
 * - Cross-layer reference traceability
 * - Deterministic dispatch intent and record entities
 * - Deterministic dispatch target binding contracts
 * - Deterministic delivery binding contracts
 * - Deterministic package contracts for delivery readiness
 * - Deterministic engine orchestration aggregate
 * - Deterministic runtime execution-ready artifacts
 * - Deterministic tracking and acknowledgement artifacts
 * - Deterministic snapshot and audit trail artifacts
 * - Production-safe contracts for dispatch orchestration
 * - Production-safe module API surface
 */

export * from './domain';
export * from './actors';
export * from './channels';
export * from './packages';
export * from './engine';
export * from './runtime';
export * from './tracking';
export * from './audit';
export * from './dispatch-engine.facade';
