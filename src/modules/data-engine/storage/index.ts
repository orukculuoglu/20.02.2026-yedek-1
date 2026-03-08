/**
 * Data Engine - Storage Module
 * Handles persistence and serialization of vehicle state snapshots
 */

export type { StorageAdapter } from './storageAdapter';
export {
  getStorageAdapter,
} from './storageAdapter';

export {
  loadSnapshotsFromStorage,
  persistSnapshotsToStorage,
  clearPersistedSnapshots,
  getPersistenceStats,
} from './vehicleStateSnapshotPersistence';
