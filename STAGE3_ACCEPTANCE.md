# Stage 3 Risk Engine Integration - Acceptance Criteria ✅

**Status**: Complete and Compiling | Date: Feb 28, 2026

---

## PROJECT STRUCTURE

```
src/modules/auto-expert/
├── types.ts                           ✅ Updated with RISK_SYNC actions
├── audit.ts                           ✅ Supports RISK_SYNC / RISK_SYNC_FAILED
├── store.ts                           ✅ ExpertReport persistence
├── seed.ts                            ✅ 3 seed reports
├── scoring.stub.ts                    ✅ Score calculation
├── routes.tsx                         ✅ Boot seed with vehicle initialization
│
├── vehicle/
│   ├── vehicleTypes.ts               ✅ Vehicle interface
│   └── vehicleStore.ts               ✅ CRUD + localStorage
│
├── risk/
│   ├── riskPayload.ts                ✅ Payload builder
│   ├── riskClient.ts                 ✅ Mock Risk Engine
│   └── riskSync.ts                   ✅ Orchestration
│
├── pages/
│   ├── OtoEkspertizDashboard.tsx     ✅ KPI dashboard
│   ├── ExpertReportList.tsx          ✅ Report list view
│   └── ExpertReportDetail.tsx        ✅ Detail + finalize + risk sync UI
│
└── components/
    ├── StatusBadge.tsx
    ├── ScorePanel.tsx
    └── ChecklistSectionAccordion.tsx
```

---

## 1. VEHICLE STORE (MOCK) ✅

### File: `vehicle/vehicleTypes.ts`

```typescript
export interface Vehicle {
  id: string;           // vehicleId
  vin: string;
  plate: string;
  model?: string;
  riskScore?: number;   // 0-100, calculated by Risk Engine
  updatedAt?: string;   // ISO timestamp of last update
}
```

### File: `vehicle/vehicleStore.ts`

**Storage Key**: `lent:vehicles:v1`

**Methods**:
- `loadAll()` - Load all vehicles (auto-seed on first run)
- `saveAll()` - Save all vehicles
- `getById(vehicleId)` - Get vehicle by ID
- `upsert(vehicle)` - Create or update
- `setRiskScore(vehicleId, riskScore)` - Update risk score with timestamp
- `delete(vehicleId)` - Delete vehicle

**Auto-Seeding**: 3 seed vehicles created on first initialization
```
veh_1: 34ABC0001 / WF0UXXWPFA0012345 / Fiat Egea
veh_2: 06XYZ0002 / WVWZZZ3CZ9E123456 / Mercedes C200
veh_3: 08ABC0003 / VSSZZZ3DZ9E654321 / Toyota Corolla
```

---

## 2. RISK PAYLOAD BUILDER ✅

### File: `risk/riskPayload.ts`

**Function**: `buildRiskPayload(report, vehicle) → RiskEnginePayload`

**Output Structure**:
```typescript
{
  vehicleId: string;
  vin: string;
  plate: string;
  reportId: string;
  finalizedAt: string;
  expertScore: number;              // 0-100
  riskFlags: string[];              // StructuralRisk | MechanicalRisk | AirbagRisk
  checklistSummary: {
    sections: [
      {
        name: string;
        okCount: number;
        minorCount: number;
        majorCount: number;
        weightedImpactSum: number;
      }
    ];
    totalItems: number;
    okItems: number;
    minorItems: number;
    majorItems: number;
  };
  odometer?: number;
}
```

---

## 3. MOCK RISK CLIENT ✅

### File: `risk/riskClient.ts`

**Function**: `sendToRiskEngine(payload) → Promise<RiskEngineResponse>`

**Response**:
```typescript
{
  riskScore: number;        // 0-100
  reasonFlags: string[];    // Which flags triggered high score
  computedAt: string;       // ISO timestamp
}
```

**Scoring Formula**:
```
riskScore = clamp(
  (100 - expertScore)           // Inverse of expert score
  + (StructuralRisk ? 30 : 0)  // +30 if structural issues
  + (AirbagRisk ? 20 : 0)      // +20 if airbag issues
  + (MechanicalRisk ? 15 : 0)  // +15 if mechanical issues
  + (minorItems * 5)           // +5 per minor item
  + (majorItems * 15),         // +15 per major item
  0, 100
)
```

**Simulation**:
- Network latency: 500-1000ms
- Failure rate: 10% (simulated random failure for error path testing)

---

## 4. RISK SYNC ORCHESTRATION ✅

### File: `risk/riskSync.ts`

**Function**: `syncRiskFromExpertReport(report) → Promise<SyncResult>`

**Success Result**:
```typescript
{
  success: true;
  riskScore: number;
  reason?: undefined;
}
```

**Failure Result**:
```typescript
{
  success: false;
  riskScore?: undefined;
  reason: string;  // Error message
}
```

**Process Flow**:
1. Validate report.status === 'Final'
2. Get or create vehicle from vehicleStore
3. Build RiskEnginePayload
4. Send to sendToRiskEngine()
5. Update vehicleStore.setRiskScore()
6. Append RISK_SYNC audit log with riskScore + reasonFlags
7. Return success + riskScore

**Error Handling**:
- On exception: Append RISK_SYNC_FAILED audit log
- Report remains Final (no rollback)
- Return failure + error reason
- Console error logged

---

## 5. AUDIT TRAIL ✅

### File: `types.ts` - Extended AuditAction

```typescript
export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE_ITEM' 
  | 'FINALIZE' 
  | 'RISK_SYNC' 
  | 'RISK_SYNC_FAILED';
```

### File: `audit.ts`

**ExpertAuditLog**:
```typescript
{
  id: string;
  reportId: string;
  action: AuditAction;
  actorId: string;
  at: string;  // ISO timestamp
  meta?: Record<string, unknown>;
}
```

**Audit Events**:
- `RISK_SYNC`: { vehicleId, riskScore, reasonFlags }
- `RISK_SYNC_FAILED`: { vehicleId, reason }

---

## 6. FINALIZE FLOW ✅

### File: `pages/ExpertReportDetail.tsx`

**Async Finalize Process**:

```typescript
const handleFinalize = async () => {
  // 1. Lock report
  report.status = 'Final';
  report.finalizedAt = new Date().toISOString();

  // 2. Recompute score + flags
  recomputeScoreAndFlags(report);

  // 3. Save to store
  reportStore.upsert(report);

  // 4. Audit: FINALIZE
  auditStore.append({
    reportId: report.id,
    action: 'FINALIZE',
    actorId: 'current_user',
  });

  // 5. Update UI (locked)
  setReport({ ...report });
  setFinalizeConfirm(false);

  // 6. Async: Trigger risk sync
  setRiskSyncStatus('syncing');

  const syncResult = await syncRiskFromExpertReport(report);

  if (syncResult.success) {
    setRiskSyncStatus('ok');
    setVehicleRiskScore(syncResult.riskScore);
  } else {
    setRiskSyncStatus('failed');
    setRiskSyncError(syncResult.reason);
    // Report stays Final even if risk sync fails
  }
};
```

**State Variables**:
- `riskSyncStatus`: 'idle' | 'syncing' | 'ok' | 'failed'
- `riskSyncError`: string | null
- `vehicleRiskScore`: number | null

---

## 7. UI COMPONENTS ✅

### ExpertReportDetail.tsx

**Risk Sync Status Badges**:

**Syncing** (Blue):
```
⟳ Araç risk puanı senkronize ediliyor...
```

**Success** (Green):
```
✓ Risk puanı senkronize edildi
Araç Risk Puanı: 42/100
```

**Failed** (Red):
```
⚠ Risk puanı senkronize edilemedi
[Error message]

Not: Rapor kesinleştirilmiştir, ancak risk puanı güncellenememiştir.
```

**Finalize Modal**:
- Confirmation before finalization
- "Raporu Kesinleştir" button triggers async finalize
- Modal closes on success or error

**Report Info**:
- Vehicle plate, VIN
- Created by, created at
- Finalized at (if locked)
- Status badge: Draft | Final

---

## 8. BOOT INITIALIZATION ✅

### File: `routes.tsx` - AutoExpertBoot

**Initialization Steps**:
1. Check if reports exist in localStorage
2. If first run: seed 3 SEED_REPORTS
3. Create audit logs for each seeded report
4. Always initialize vehicleStore (triggers auto-seed)
5. Log initialization complete

```typescript
export function AutoExpertBoot() {
  useEffect(() => {
    const existing = localStorage.getItem('lent:auto-expert:reports:v1');

    if (!existing) {
      console.log('[OtoEkspertiz] Seeding initial reports...');
      reportStore.loadAll();
      for (const report of SEED_REPORTS) {
        auditStore.append({
          reportId: report.id,
          action: 'CREATE',
          actorId: 'system',
        });
      }
      console.log('[OtoEkspertiz] ✓ Seeded 3 initial reports');
    }

    // Always initialize vehicle store
    vehicleStore.loadAll();
    console.log('[OtoEkspertiz] ✓ Vehicle store initialized');
  }, []);

  return null;
}
```

---

## ACCEPTANCE CRITERIA - VERIFICATION ✅

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Finalize locks report | ✅ | report.status = 'Final', isLocked guard prevents edits |
| Risk payload built | ✅ | buildRiskPayload() outputs full structure per spec |
| Payload sent to Risk Engine | ✅ | sendToRiskEngine() called in syncRiskFromExpertReport() |
| Vehicle riskScore computed | ✅ | Mock formula: (100 - expertScore) + flags + items |
| Vehicle riskScore stored | ✅ | vehicleStore.setRiskScore() with updatedAt timestamp |
| Vehicle riskScore visible | ✅ | ExpertReportDetail displays score in success banner |
| Audit contains RISK_SYNC | ✅ | auditStore.append(action: 'RISK_SYNC') on success |
| Audit contains RISK_SYNC_FAILED | ✅ | auditStore.append(action: 'RISK_SYNC_FAILED') on error |
| No blank screens | ✅ | Dashboard with KPIs, List with reports, Detail with locked state |
| Mock Risk Engine (no external API) | ✅ | sendToRiskEngine() is 100% local mock |
| Async finalize flow | ✅ | handleFinalize() is async, awaits syncRiskFromExpertReport() |
| UI feedback during sync | ✅ | Syncing/Success/Failed banners with icons and messages |
| Report stays Final on risk failure | ✅ | No rollback, report.status remains 'Final' |
| Build succeeds | ✅ | npm run build: 2434 modules, ~25s, 0 errors |
| No TypeScript errors | ✅ | get_errors(): No errors found |

---

## CONSOLE OUTPUT EXPECTED

When user finalizes a report:

```
[RiskSync] ✓ Vehicle 34ABC0001: riskScore=52
[UI] Risk sync succeeded: vehicle riskScore=52
```

On simulated failure (10%):

```
[RiskSync] ✗ Vehicle 34ABC0001: [RiskEngine] Mock failure: Simulated network error
[UI] Risk sync failed: [RiskEngine] Mock failure: Simulated network error
```

---

## DATA FLOW DIAGRAM

```
User clicks "Raporu Kesinleştir"
    ↓
Confirmation Modal
    ↓
handleFinalize() begins
    ↓
Set report.status = 'Final' + finalizedAt
    ↓
Recompute score/flags → Save → Audit FINALIZE
    ↓
UI locked (Draft → Final badge)
    ↓
setRiskSyncStatus('syncing') + Blue Banner
    ↓
await syncRiskFromExpertReport(report)
    ├─→ Get/Create vehicle
    ├─→ buildRiskPayload()
    ├─→ sendToRiskEngine() [500-1000ms]
    ├─→ vehicleStore.setRiskScore()
    ├─→ Audit RISK_SYNC
    └─→ return { success, riskScore }
    ↓
Success: Green banner + riskScore display
Failure: Red banner + error message
    ↓
Report remains LOCKED (no edit possible)
Audit trail: [CREATE] → [FINALIZE] → [RISK_SYNC or RISK_SYNC_FAILED]
```

---

## STORAGE STRUCTURE

### localStorage Keys
- `lent:auto-expert:reports:v1` → ExpertReport[]
- `lent:auto-expert:audit:v1` → ExpertAuditLog[]
- `lent:vehicles:v1` → Vehicle[]

### Sample Vehicle After Risk Sync
```json
{
  "id": "veh_1",
  "vin": "WF0UXXWPFA0012345",
  "plate": "34ABC0001",
  "model": "Fiat Egea",
  "riskScore": 52,
  "updatedAt": "2026-02-28T14:32:15.000Z"
}
```

### Sample Audit Entry - RISK_SYNC
```json
{
  "id": "audit_1708009935000_a7b3c8d9e",
  "reportId": "rep_1",
  "action": "RISK_SYNC",
  "actorId": "system",
  "at": "2026-02-28T14:32:15.000Z",
  "meta": {
    "vehicleId": "veh_1",
    "riskScore": 52,
    "reasonFlags": ["StructuralRisk"]
  }
}
```

---

## BUILD & DEPLOYMENT STATUS

```
✅ npm run build: SUCCESS (25.32s)
✅ TypeScript: 0 errors
✅ All 2434 modules transformed
✅ Ready for testing
```

---

## NEXT STEPS (Production)

1. Replace `sendToRiskEngine()` with real API client
2. Add riskScore caching (e.g., 24-hour TTL per vehicle)
3. Enhance dashboard KPIs with real-time risk metrics
4. Add user notifications for risk sync status
5. Implement batch risk scoring for multiple reports

---

## TEST SCENARIO

**User Journey**:
1. Open "Oto Ekspertiz" module
2. Click "Tüm Raporlar" → See 3 seed reports
3. Click report "34ABC0001"
4. Fill some checklist items (change OK/Minor/Major)
5. Click "✓ Raporu Kesinleştir"
6. Confirm in modal
7. See blue "Senkronize ediliyor..." banner (500-1000ms)
8. See green "Risk puanı senkronize edildi ✓ | Puanı: 42/100"
9. Report locked (status = Final, buttons disabled)
10. Verify audit log shows: CREATE → FINALIZE → RISK_SYNC
11. Check localStorage: vehicle.riskScore = 42

**Expected Result**: ✅ Complete end-to-end flow working
