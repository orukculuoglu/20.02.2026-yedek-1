import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// DEV-only: Expose local event store debug API to console
if (import.meta.env.DEV) {
  import('./src/modules/data-engine/store/localEventStore').then((module) => {
    // Bind all localEventStore API functions
    (window as any).__deStore = {
      appendEvent: module.appendEvent,
      getStoredEvents: module.getStoredEvents,
      getStoreStats: module.getStoreStats,
      clearStoredEvents: module.clearStoredEvents,
      replayToSnapshots: module.replayToSnapshots,
      getFirstStoredEvent: module.getFirstStoredEvent,
      getLastStoredEvent: module.getLastStoredEvent,
    };

    // Helper: Get raw JSON string from localStorage
    (window as any).__deStoreRaw = () => localStorage.getItem('DE_LOCAL_EVENT_STORE_V1');

    // Helper: Quick stats accessor
    (window as any).__deStoreStats = () => (window as any).__deStore.getStoreStats();

    // Helper: Replay all events (dispatches custom event for DataEngine to listen)
    (window as any).__deStoreReplayAll = () => {
      window.dispatchEvent(new CustomEvent('DE_STORE_REPLAY', { detail: { mode: 'all' } }));
    };

    // Helper: Replay vehicle-specific events (dispatches custom event for DataEngine to listen)
    (window as any).__deStoreReplayVehicle = (vehicleId: string | number) => {
      window.dispatchEvent(
        new CustomEvent('DE_STORE_REPLAY', { detail: { mode: 'vehicle', vehicleId: String(vehicleId) } })
      );
    };

    // Helper: Get event type breakdown (returns {eventType: count, ...})
    (window as any).__deStoreEventTypes = () => {
      const events = module.getStoredEvents();
      const breakdown: Record<string, number> = {};
      for (const event of events) {
        const eventType = event.eventType || 'unknown';
        breakdown[eventType] = (breakdown[eventType] || 0) + 1;
      }
      return breakdown;
    };

    // Single console message (no spam)
    console.log('[DE-Store] window.__deStore API ready');
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);