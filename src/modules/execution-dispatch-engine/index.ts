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
 * - Cross-layer reference traceability
 * - Deterministic dispatch intent and record entities
 * - Deterministic dispatch target binding contracts
 * - Deterministic delivery binding contracts
 * - Deterministic package contracts for delivery readiness
 * - Deterministic engine orchestration aggregate
 * - Production-safe contracts for dispatch orchestration
 */

export * from './domain';
export * from './actors';
export * from './channels';
export * from './packages';
export * from './engine';
