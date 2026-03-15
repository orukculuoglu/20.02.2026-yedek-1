/**
 * Signal validation schema and utilities
 */

import type { Signal } from './signal.types';
import { SignalStatus, SignalSeverity, SignalPriority, SignalCategory } from './signal.enums';

export class SignalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignalValidationError';
  }
}

export function validateSignal(signal: unknown): asserts signal is Signal {
  if (!signal || typeof signal !== 'object') {
    throw new SignalValidationError('Signal must be an object');
  }

  const s = signal as Record<string, unknown>;

  if (typeof s.signalId !== 'string' || !s.signalId) {
    throw new SignalValidationError('signalId is required and must be a string');
  }

  if (typeof s.avid !== 'string' || !s.avid) {
    throw new SignalValidationError('avid is required and must be a string');
  }

  if (typeof s.signalType !== 'string' || !s.signalType) {
    throw new SignalValidationError('signalType is required and must be a string');
  }

  if (typeof s.status !== 'string' || !Object.values(SignalStatus).includes(s.status as SignalStatus)) {
    throw new SignalValidationError(
      `status must be one of: ${Object.values(SignalStatus).join(', ')}`,
    );
  }

  if (typeof s.severity !== 'string' || !Object.values(SignalSeverity).includes(s.severity as SignalSeverity)) {
    throw new SignalValidationError(
      `severity must be one of: ${Object.values(SignalSeverity).join(', ')}`,
    );
  }

  if (typeof s.priority !== 'string' || !Object.values(SignalPriority).includes(s.priority as SignalPriority)) {
    throw new SignalValidationError(
      `priority must be one of: ${Object.values(SignalPriority).join(', ')}`,
    );
  }

  if (typeof s.signalCategory !== 'string' || !Object.values(SignalCategory).includes(s.signalCategory as SignalCategory)) {
    throw new SignalValidationError(
      `signalCategory must be one of: ${Object.values(SignalCategory).join(', ')}`,
    );
  }

  if (typeof s.confidence !== 'number' || s.confidence < 0 || s.confidence > 1) {
    throw new SignalValidationError('confidence must be a number between 0 and 1');
  }

  if (typeof s.detectedAt !== 'number' || s.detectedAt < 0) {
    throw new SignalValidationError('detectedAt is required and must be a positive number');
  }
}

export function isValidSignal(signal: unknown): signal is Signal {
  try {
    validateSignal(signal);
    return true;
  } catch {
    return false;
  }
}

