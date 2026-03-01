# VIO Analysis: Vehicle 11 - Risk Domain Explainability

**Generated**: 2026-03-01T17:51:12.903Z  
**VehicleId**: 11  
**Status**: Primary source available (VIO in store)

---

## 1. Data Flow Architecture

```
Request: getDataEngineIndices({ domain:"risk", vehicleId:"11", vin:"VIN-11", plate:"34ABC34" })
    ↓
[DataEngineIndices] Check if VIO exists for vehicleId="11"
    ↓
✓ VIO FOUND in localStorage (generatedAt: 2026-03-01T17:51:12.903Z)
    ↓
buildRiskDomainIndicesFromVIO(vio)
    ↓
Response: DataEngineIndex[] with {domain, key, value, confidence, meta: {reasonCodes, confidenceReason, evidenceSources}}
```

**Note**: Fallback to VehicleAggregate only triggered if VIO not found. With VIO available, primary source always used.

---

## 2. Risk Domain Indices (0-100 Scale)

| Index | Value | Confidence | Severity | Status |
|-------|-------|------------|----------|--------|
| `trustIndex` | 44 | 68% | ⚠️ WARN | Core issue: insurance-damage mismatch |
| `reliabilityIndex` | 80 | 68% | ℹ️ INFO | Generally reliable, OBD faults noted |
| `maintenanceDiscipline` | 62 | 68% | ⚠️ WARN | Irregular service pattern |
| `structuralRisk` | 20 | 53% | ℹ️ INFO | Low (no damage records), low confidence |
| `mechanicalRisk` | 50 | 68% | ⚠️ WARN | OBD faults + repeated error code P0011 |
| `insuranceRisk` | 40 | 68% | ⚠️ WARN | High claim frequency + claim-damage mismatch |

---

## 3. Explainability: Reason Codes by Index

### A) trustIndex (44)
**Primary Issue**: Insurance-damage data inconsistency

**Current Reason Codes (DUPLICATION ISSUE)** ❌:
```typescript
reasonCodes: [
  'INSURANCE_DAMAGE_MISMATCH',      // warns: claims vs damage mismatch
  'INSURANCE_CLAIM_MISMATCH',       // warns: claim count issues
  'INSURANCE_DAMAGE_INCONSISTENCY'  // warns: same root cause again
]
```

**Root Cause**: `claimCount=2, damageCount=0, corrScore=40`
- 2 insurance claims filed
- 0 damage records matched to claims
- Correlation score only 40 (low match)

**Suggested Normalization** ✅:
```typescript
reasonCodes: [
  'INSURANCE_DAMAGE_INCONSISTENCY'  // canonical, covers all 3 aspects
]
// Move MISMATCH variants to meta.detailedReasons if needed
```

---

### B) reliabilityIndex (80)
**Primary Signal**: OBD fault history

**Reason Codes**:
```typescript
reasonCodes: [
  'OBD_FAULTS'  // 2 detected OBD errors, mechanicalRisk=50
]
```

**Evidence**: Error code P0011 (Camshaft Position Timing Over-Advanced) recurring

---

### C) maintenanceDiscipline (62)
**Primary Signal**: Irregular service patterns

**Reason Codes**:
```typescript
reasonCodes: [
  'IRREGULAR_SERVICE_PATTERN'  // regularityScore ≈ 30.13 (scale 0-100)
]
```

**Evidence**: Service intervals not following manufacturer recommendations

---

### D) insuranceRisk (40)
**Primary Signals**: Multiple claims + claim-damage mismatch

**Reason Codes**:
```typescript
reasonCodes: [
  'MULTIPLE_CLAIMS',              // insuranceCount=8 (high frequency)
  'CLAIM_WITHOUT_DAMAGE_RECORD'   // claimCount=2, damageCount=0, matchedEvents=0
]
```

**Evidence**: 8 total insurance transactions, but 2 claims appear orphaned (no matching damage records)

---

### E) mechanicalRisk (50)
**Primary Signals**: OBD history + documented faults

**Reason Codes**:
```typescript
reasonCodes: [
  'OBD_FAULTS'                    // 2 recorded OBD error codes
]
```

**Evidence**: Repeated P0011 (Camshaft Timing), suggests engine control system issues

---

### F) structuralRisk (20)
**Primary Signal**: No damage history recorded

**Reason Codes**:
```typescript
reasonCodes: []  // No alerts; low score because no damage data found
```

**Evidence**: `damageRecords: 0` → structuralRisk=20 (baseline)  
**Confidence Note**: Only 53% confidence (missing damage claim data from external sources)

---

## 4. Cross-Domain Analysis

### Why NO `CROSS_DOMAIN_SUSPICION`?

**Cross-Domain Rule**:
```
IF (odometerAnomaly == true) AND (insurance-damage mismatch != none)
THEN issue CROSS_DOMAIN_SUSPICION
```

**Vehicle 11 Evaluation**:
- `derived.odometerAnomaly` = **false** ✓ (mileage progression normal)
- `insuranceDamageCorrelation.mismatchType` = **"claims_without_damage"** ✓ (mismatch exists)

**Outcome**: Only **50% of conditions met** → CROSS_DOMAIN_SUSPICION **NOT triggered** ✓ (Correct)

**Interpretation**: While insurance-damage inconsistency is real, it's not paired with odometer anomaly. This suggests issue is likely:
- Legitimate claims not yet linked to damage records in system
- OR claims filed but repairs handled outside damage assessment workflow
- NOT fraudulent mileage rollback or artificial damage inflation

---

## 5. System Risks Identified

### R1: Reason Code Duplication ❌

**Impact**:
- Same root cause (claims ≠ damages) expressed as 3 different codes
- UI explainability becomes "noisy"
- DataEngine indices metadata bloats
- User loses confidence (appears to have multiple separate issues)

**Fix Priority**: **HIGH**  
**Effort**: Low - consolidate to single canonical code per domain

---

### R2: Damage Data Gap Risk ⚠️

**Context**: When `damageCount=0`:
- Could mean: No accidents occurred ✓
- Could mean: Claims filed but SBM hasn't provided damage assessment yet ⚠️

**Current Treatment**: Severity="warn" (appropriate)  
**Risk**: Penalty scaling may over-penalize legitimate claims-in-process

**Recommendation**: Apply lower penalty when:
```
damageCount=0 AND claimCount>0 AND age_of_claims < 30_days
// → penalty=20-30 instead of full penalty
```

---

### R3: Confidence Calibration ✓

**Vehicle 11 Coverage**: ~46%
- Adequate data from: KM history, OBD records, insurance transactions
- Missing data from: External damage databases, real-time diagnostics

**Current Approach**: Confidence defaults to 68% when coverage=46%  
**Assessment**: Reasonable; confidence is not inflated despite missing data

---

## 6. Recommended Normalization

### Before (Current):
```typescript
trustIndex.meta.reasonCodes = [
  'INSURANCE_DAMAGE_MISMATCH',
  'INSURANCE_CLAIM_MISMATCH',
  'INSURANCE_DAMAGE_INCONSISTENCY'  // duplicate information
];
```

### After (Proposed):
```typescript
// trustIndex - Canonical
trustIndex.meta.reasonCodes = [
  'INSURANCE_DAMAGE_INCONSISTENCY'  // covers all aspects
];

// Additional context moved to meta.explanation (if needed)
trustIndex.meta.explanation = {
  claimCount: 2,
  damageCount: 0,
  matchedEvents: 0,
  correspondenceScore: 40,
  details: "Claims filed without matching damage records in system"
};
```

**Benefit**: Single clear reason code, detailed explanation available in meta

---

## 7. Usage Pattern (getDataEngineIndices)

### Call Signature:
```typescript
const indices = await getDataEngineIndices({
  domain: 'risk',
  vehicleId: '11',
  vin: 'VIN-11',
  plate: '34ABC34'
});
```

### Response (VIO Available):
```typescript
[
  {
    domain: 'risk',
    key: 'trustIndex',
    value: 44,
    confidence: 68,
    updatedAt: '2026-03-01T17:51:12.903Z',
    meta: {
      reasonCodes: ['INSURANCE_DAMAGE_INCONSISTENCY'],
      confidenceReason: 'Coverage: 46% (KM history, OBD, insurance partial)',
      evidenceSources: ['insurance_claims', 'damage_records', 'obd_history']
    }
  },
  {
    domain: 'risk',
    key: 'reliabilityIndex',
    value: 80,
    confidence: 68,
    updatedAt: '2026-03-01T17:51:12.903Z',
    meta: {
      reasonCodes: ['OBD_FAULTS'],
      confidenceReason: 'Coverage: 68%',
      evidenceSources: ['obd_history']
    }
  },
  // ... other indices
]
```

### Response (VIO NOT Available - Fallback):
```typescript
// Falls back to VehicleAggregate
const indices = await vehicleIntelligenceStore.getOrBuild('11', 'VIN-11', '34ABC34');
// Returns same structure but:
// - meta is empty or minimal
// - confidence defaults to 50 (aggregate source)
// - no reasonCodes available (numeric-only)
```

---

## 8. Implementation Checklist

- [ ] Consolidate `INSURANCE_DAMAGE_MISMATCH` + `INSURANCE_CLAIM_MISMATCH` → single canonical `INSURANCE_DAMAGE_INCONSISTENCY`
- [ ] Move details to `meta.explanation` object
- [ ] Test normalization doesn't break UI consumers
- [ ] Update reason code documentation
- [ ] Verify confidence scaling works for low-coverage scenarios
- [ ] Add regression test for cross-domain rule (should NOT trigger for vehicle 11)

---

## References

- VIO Store: `src/modules/auto-expert/intelligence/vioStore.ts`
- Indices Engine: `src/modules/data-engine/indicesDomainEngine.ts`
- Data Service: `services/dataEngineIndices.ts`
- Test File: `TEST_GET_DATA_ENGINE_INDICES.ts`
