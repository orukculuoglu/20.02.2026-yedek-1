# UI REACTIVITY AUDIT — RECOMMENDATIONS APPEAR ONLY ON SECOND RECALCULATE

**Date:** March 8, 2026  
**Phase:** 9.7.1  
**Status:** DOCUMENTED - ROOT CAUSE IDENTIFIED

---

## EXECUTIVE SUMMARY

Recommendations ARE being generated and stored in snapshot on first load, but the React UI component does NOT re-render to display them until a subsequent state change (like the second recalculate button click). This is a **snapshot update isolation issue**, not a timing or generation issue.

---

## A) RECOMMENDATIONS STORAGE VERIFICATION

✅ **YES — Recommendations ARE stored on first run**

**Evidence:**

File: [src/modules/vehicle-state/recommendationOrchestrator.ts](src/modules/vehicle-state/recommendationOrchestrator.ts#L119)

```typescript
// Step 5: Store recommendations and metadata in snapshot
upsertSnapshot(vehicleId, {
  vehicleIntelligenceRecommendations: recommendations,
  vehicleIntelligenceSummary: {
    ...(snapshot.vehicleIntelligenceSummary || {}),
    recommendationCount: recommendations.length,
    highSeverityRecommendationCount: highSeverityCount,
    lastRecommendationsUpdatedAt: now,
  },
  updatedAt: now,
});
```

This `upsertSnapshot()` call successfully:
- Merges recommendations array into snapshot
- Updates metadata counts
- Records timestamp
- Writes to in-memory snapshot Map

---

## B) EXACT FAILURE POINT — UI FAILS TO REACT

**File:** [src/modules/auto-expert/pages/VehicleIntelligencePanel.tsx](src/modules/auto-expert/pages/VehicleIntelligencePanel.tsx#L995)

**Function:** Render IIFE for recommendations:

```typescript
{(() => {
  const recommendations = getVehicleIntelligenceRecommendations(vehicleId);
  const summary = getVehicleIntelligenceSummary(vehicleId);
  return (
    <VehicleRecommendationsPanel
      vehicleId={vehicleId}
      recommendations={recommendations}
      metadata={{
        recommendationCount: summary?.recommendationCount,
        highSeverityRecommendationCount: summary?.highSeverityRecommendationCount,
        lastRecommendationsUpdatedAt: summary?.lastRecommendationsUpdatedAt,
      }}
    />
  );
})()}
```

**Problem Definition:**

This IIFE (Immediately-Invoked Function Expression) executes only during React render cycles. React renders are triggered by:
- ✅ State changes (`setAggregate()`, `setVio()`, `setError()`, etc.)
- ✅ Props changes
- ✅ Parent component re-render
- ❌ NOT by direct memory updates to snapshot Map

When `upsertSnapshot()` is called:
```typescript
snapshotStore.set(vehicleId, updated);  // Direct Map mutation
```

React has **no hook to this event**. The component is not subscribed to snapshot changes.

---

## C) ROOT CAUSE — SNAPSHOT UPDATES DON'T TRIGGER REACT RE-RENDERS

### Why It Works on Second Recalculate But Not First/First

**FIRST LOAD execution order:**

```
TIME  EVENT                                              REACT STATE    UI RENDERS?
─────────────────────────────────────────────────────────────────────────────────────
t0    User clicks "Yükle" (Load)
      + handleLoadVehicle() executes
      
t1    setAggregate(result) called                        aggregate=X    ✅ RENDER #1
      
t2    IIFE reads recommendations from snapshot
      IIFE result: recommendationsArray = []             (EMPTY)
      - snapshot still has NO recommendations
      - orchestrator hasn't finished yet
      
t3    generateAndStoreVehicleRecommendations()          aggregate=X    (no state change)
      starts async
      
t4    Function returns to user
      UI shows: EMPTY panel

t5    (50-500ms passes asynchronously)
      
t6    Orchestrator finishes waiting for summary
      Orchestrator calls:
      upsertSnapshot(vehicleId, {
        vehicleIntelligenceRecommendations: [rec1, rec2...],
        ...
      })
      
t7    snapshot.get(vehicleId) now HAS recommendations    aggregate=X    ❌ NO RENDER
      BUT React doesn't know about this!
      (No state changed, no prop changed, no parent change)
      
t8    UI STILL shows: EMPTY panel
      (Even though snapshot has recommendations)
```

**FIRST RECALCULATE execution order:**

```
TIME  EVENT                                              REACT STATE    UI RENDERS?
─────────────────────────────────────────────────────────────────────────────────────
t0    User clicks "Yeniden Hesapla"

t1    handleRecalculateIntelligence() executes
      setAggregate(refreshed)                           aggregate=Y    ✅ RENDER #2
      
t2    IIFE reads recommendations from snapshot
      IIFE result: recommendationsArray = []             (EMPTY)
      - Previous orchestrator from t6 stored data
      - BUT this render sees: stale or empty
      - (depends on when snapshot was last read)

t3    generateAndStoreVehicleRecommendations()
      starts async (SECOND time)
      
t4    Function returns
      UI shows: EMPTY panel

t5    (50ms)

t6    Orchestrator from t3 finishes
      upsertSnapshot() called with NEW recommendations
      snapshot NOW has recommendations            aggregate=Y    ❌ NO RENDER
      
t7    UI STILL shows: EMPTY panel
```

**SECOND RECALCULATE execution order:**

```
TIME  EVENT                                              REACT STATE    UI RENDERS?
─────────────────────────────────────────────────────────────────────────────────────
t0    User clicks "Yeniden Hesapla" (again)

t1    handleRecalculateIntelligence() executes
      setAggregate(refreshed2)                         aggregate=Z    ✅ RENDER #3
      
t2    IIFE reads recommendations from snapshot
      IIFE result: recommendationsArray = [rec1, rec2...]    ✅ HAS DATA!
      - Previous orchestrator from first-recalc stored it (t6)
      - This render finally sees the recommendations

t3    UI SHOWS: ✅ RECOMMENDATIONS PANEL POPULATED
```

---

## D) ROOT CAUSE CLASSIFICATION

**Primary Root Cause:**  
**Snapshot updates are side effects outside React's state management system.**

**Technical Details:**

1. `upsertSnapshot()` directly mutates `snapshotStore` Map:
   ```typescript
   snapshotStore.set(vehicleId, updated);
   ```

2. This mutation has zero connection to React:
   - Not dispatched through Redux/Context
   - Not triggering any React state setter
   - Not surfacing as a prop change
   - Not attached to any event listener

3. The UI component (`VehicleIntelligencePanel`) has **zero subscription** to snapshot changes:
   - No `useEffect` watching snapshot
   - No `useSyncExternalStore` hook
   - No polling
   - No event listener for snapshot updates

4. Result:
   - Recommendations ARE stored ✅
   - Recommendations ARE in memory ✅
   - UI has NO way to know ❌
   - UI never re-renders to display them ❌
   - Until next state change triggers a render for other reasons

---

## IMPLEMENTATION ARCHITECTURE MISMATCH

**The Problem:**

```
┌─────────────────────────────────────────────────────────┐
│ VehicleIntelligencePanel (React Component)              │
│  ├ State: aggregate, vio, error, ...                    │
│  ├ Render dependencies: [aggregate]                     │
│  └ Renders IIFE that calls:                             │
│     └ getVehicleIntelligenceRecommendations(vehicleId)  │
│        └ reads from snapshotStore Map                   │
└─────────────────────────────────────────────────────────┘
        ↓ (direct function call, not reactive)
┌─────────────────────────────────────────────────────────┐
│ snapshotStore (Plain JavaScript Map)                    │
│  ├ NOT a React state
│  ├ NOT an Observable/Subject
│  ├ NOT connected to React lifecycle
│  └ Updated directly by orchestrator                     │
└─────────────────────────────────────────────────────────┘
        ↓ (direct Map.set(), no listener)
┌─────────────────────────────────────────────────────────┐
│ generateAndStoreVehicleRecommendations()                │
│  └ Calls: upsertSnapshot(vehicleId, {...})             │
│     └ Mutates: snapshotStore.set(videoId, ...)         │
│        └ ❌ Zero notification back to React             │
└─────────────────────────────────────────────────────────┘
```

**What should happen:**

```
Orchestrator stores recommendations
        ↓
Trigger React state update in parent component
        ↓
Parent re-renders
        ↓
IIFE executes again
        ↓
getVehicleIntelligenceRecommendations() called
        ↓
Panel receives new props
        ↓
✅ RECOMMENDATIONS DISPLAY
```

---

## SOLUTIONS (Not Implemented - For Reference)

### Option 1: Callback from Orchestrator (RECOMMENDED)

Update orchestrator signature:
```typescript
export async function generateAndStoreVehicleRecommendations(
  vehicleId: string,
  onStored?: () => void  // Optional callback
): Promise<void> {
  // ... generation logic ...
  
  upsertSnapshot(vehicleId, {...});
  
  // Notify parent component
  if (onStored) {
    onStored();  // Trigger state update in parent
  }
}
```

Usage in VehicleIntelligencePanel:
```typescript
const [recommendationsVersion, setRecommendationsVersion] = useState(0);

const handleRecommendationsStored = () => {
  setRecommendationsVersion(prev => prev + 1);  // Trigger re-render
};

generateAndStoreVehicleRecommendations(vehicleId.trim(), handleRecommendationsStored).catch(...);

// Add dependency to ensure re-render
useEffect(() => {
  // Re-render just happened, IIFE will read fresh recommendations
}, [recommendationsVersion]);
```

**Pros:**
- Minimal changes
- Respects isolation (orchestrator doesn't depend on React)
- Explicit control flow
- Callback pattern is standard

**Cons:**
- Requires parent component integration
- Adds optional parameter to orchestrator

---

### Option 2: useSyncExternalStore Hook (ADVANCED)

Create subscription in component:
```typescript
const recommendations = useSyncExternalStore(
  (callback) => {
    // Subscribe to snapshot changes (requires listener infrastructure)
    const unsubscribe = onSnapshotChange(vehicleId, callback);
    return unsubscribe;
  },
  () => getVehicleIntelligenceRecommendations(vehicleId)
);
```

**Pros:** Reactive pattern, proper subscription management

**Cons:** Requires adding listener infrastructure to snapshot store, breaking change to store architecture

---

### Option 3: Move State to React (NOT RECOMMENDED)

Store recommendations in local state:
```typescript
const [recommendations, setRecommendations] = useState([]);

// After orchestrator stores
const storedRecommendations = getVehicleIntelligenceRecommendations(vehicleId);
setRecommendations(storedRecommendations);
```

**Pros:** Guaranteed to trigger re-render

**Cons:** Violates single-source-of-truth pattern, duplication, harder to maintain

---

## IMPACT ASSESSMENT

**Severity:** MEDIUM
- Recommendations ARE generated correctly ✅
- Recommendations ARE stored correctly ✅
- Only UI display is affected ❌
- Data integrity: NOT at risk ✅
- User experience: Partially broken on first load ❌

**Affected Flows:**
- ❌ First load: recommendations invisible
- ❌ First recalculate: recommendations invisible
- ✅ Second recalculate and beyond: recommendations visible

**Business Impact:**
- Users must click "Yeniden Hesapla" twice to see recommendations
- On page refresh: recommendations visible only after calculation
- Confusing UX

---

## RELATED FILES WITHOUT CHANGES TRACKING

### Updated Files (Phase 9.7.1):
- `src/modules/vehicle-state/recommendationOrchestrator.ts` - Added retry logic for summary availability

### Files NOT Changed (Confirm):
- `src/modules/vehicle-state/vehicleStateSnapshotStore.ts` - Snapshot store unchanged
- `src/modules/data-engine/recommendations/recommendationEngine.ts` - Pure engine unchanged
- `src/modules/auto-expert/pages/VehicleIntelligencePanel.tsx` - Parent component unchanged
- `src/modules/vehicle-intelligence/components/VehicleRecommendationsPanel.tsx` - Panel component unchanged

### Root Cause:
Architectural isolation between:
- **Snapshot tier:** Plain JavaScript Map (non-reactive)
- **UI tier:** React components expecting state-driven updates

Changes to snapshot do not propagate to React, creating reactivity gap.

---

## NEXT STEPS

To fix this issue, a callback pattern should be integrated:

1. Add optional `onStored` callback to `generateAndStoreVehicleRecommendations()`
2. Update VehicleIntelligencePanel to pass callback
3. Callback triggers state update to force re-render
4. IIFE executes, reads fresh recommendations, displays them

**Estimated effort:** ~20 lines of code
**Risk:** LOW (isolated change, no reducer/event pipeline modifications)
**Testing:** Manual - load vehicle, verify recommendations appear on first load

---

## CONCLUSION

The recommendations feature is **functionally complete** but **UI-isolated**. The system generates and stores data correctly, but lacks the reactive bridge back to the UI layer. A simple callback pattern would complete the integration without violating the architectural constraints.

