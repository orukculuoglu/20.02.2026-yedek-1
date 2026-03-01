# Recommendation Engine Test Guide

## Overview
The Risk Recommendation Engine (`src/services/recommendationEngine.ts`) provides enterprise-grade structured recommendations for vehicle risk management.

## Quick Test Examples

### Test Case 1: Insurance/Damage Mismatch (CRITICAL)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-001",
  trustIndex: 30,
  reliabilityIndex: 70,
  maintenanceDiscipline: 75,
  reasonCodes: [
    { code: "INSURANCE_DAMAGE_INCONSISTENCY", severity: "HIGH" }
  ]
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-001",
  actionType: "INSURANCE_REVIEW",
  priorityScore: 92, // Increased because trustIndex <= 40 (actually 30)
  recommendation: "Sigorta/hasar kayıtlarında uyumsuzluk var. İnceleme önerilir.",
  reason: "Sigorta-hasar korelasyon uyuşmazlığı",
  reasonCodes: ["INSURANCE_DAMAGE_INCONSISTENCY"],
  explain: [
    "Mismatch reasonCodes detected",
    "Critical trust level: 30.0"
  ],
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

### Test Case 2: Maintenance Discipline Low (HIGH PRIORITY)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-002",
  trustIndex: 65,
  reliabilityIndex: 80,
  maintenanceDiscipline: 50,
  reasonCodes: []
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-002",
  actionType: "MAINTENANCE_CHECK",
  priorityScore: 80, // clamp100(60 + (70 - 50)) = clamp100(80) = 80
  recommendation: "Bakım geçmişi düzensiz görünüyor. Detaylı servis kontrolü önerilir.",
  reason: "maintenanceDiscipline eşik altında",
  reasonCodes: undefined,
  explain: ["Maintenance score: 50.0"],
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

### Test Case 3: KM Anomaly/Rollback (CRITICAL)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-003",
  trustIndex: 55,
  signals: [
    { code: "KM_ROLLBACK_DETECTED", severity: "HIGH", confidence: 0.95 }
  ]
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-003",
  actionType: "DATA_QUALITY_REVIEW",
  priorityScore: 90,
  recommendation: "KM verisinde anomali/rollback şüphesi var. Veri doğrulama önerilir.",
  reason: "Kilometre verisi tutarsız",
  reasonCodes: ["KM_ROLLBACK_DETECTED"],
  explain: ["KM anomaly or rollback signal detected"],
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

### Test Case 4: Reliability Low (MEDIUM PRIORITY)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-004",
  trustIndex: 72,
  reliabilityIndex: 55,
  maintenanceDiscipline: 75
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-004",
  actionType: "DIAGNOSTIC_CHECK",
  priorityScore: 80, // clamp100(65 + (70 - 55)) = clamp100(80) = 80
  recommendation: "Güvenilirlik düşük. Diyagnostik kontrol önerilir.",
  reason: "reliabilityIndex eşik altında",
  reasonCodes: undefined,
  explain: ["Reliability score: 55.0"],
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

### Test Case 5: Low Data Quality (LOW PRIORITY)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-005",
  trustIndex: 85,
  reliabilityIndex: 85,
  maintenanceDiscipline: 85,
  evidenceSourcesCount: 1
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-005",
  actionType: "DATA_QUALITY_REVIEW",
  priorityScore: 60,
  recommendation: "Veri kaynağı yetersiz. Ek veri doğrulaması önerilir.",
  reason: "Yetersiz veri kapsamı",
  reasonCodes: undefined,
  explain: ["Evidence sources: 1"],
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

### Test Case 6: No Action Needed (DEFAULT)
**Input:**
```typescript
const result = buildRiskRecommendation({
  vehicleId: "VH-2026-006",
  trustIndex: 90,
  reliabilityIndex: 90,
  maintenanceDiscipline: 90,
  evidenceSourcesCount: 3
});
```

**Expected Output:**
```typescript
{
  id: "...",
  vehicleId: "VH-2026-006",
  actionType: "NONE",
  priorityScore: 10,
  recommendation: "Aksiyon gerekmiyor.",
  reason: "Risk eşik altında",
  reasonCodes: undefined,
  explain: undefined,
  generatedAt: "2026-03-02T...",
  source: "DATA_ENGINE"
}
```

## Priority Score Interpretation

| Score Range | Level | Color | Meaning |
|------------|-------|-------|---------|
| 85-100 | CRITICAL | Red | Immediate action required |
| 60-84 | HIGH | Orange | Investigate soon |
| 10-59 | LOW | Blue | Monitor or document |
| 0-9 | NONE | Gray | No action needed |

## Rule Priority Order

1. **Insurance/Damage Mismatch** (INSURANCE_REVIEW) → Score: 85-92
   - Highest priority for financial compliance
   - Insurance-related inconsistencies

2. **KM Anomaly/Rollback** (DATA_QUALITY_REVIEW) → Score: 90
   - Fraud/odometer manipulation risk
   - High impact on vehicle value assessment

3. **Maintenance Discipline Low** (MAINTENANCE_CHECK) → Score: 60-90
   - Maintenance history gaps
   - Formula: clamp100(60 + (70 - maintenanceDiscipline))

4. **Reliability Low** (DIAGNOSTIC_CHECK) → Score: 65-90
   - Mechanical health concerns
   - Formula: clamp100(65 + (70 - reliabilityIndex))

5. **Data Quality Low** (DATA_QUALITY_REVIEW) → Score: 60
   - Insufficient evidence sources
   - Low confidence in other metrics

6. **Default** (NONE) → Score: 10
   - Risk within acceptable thresholds
   - No action required

## Integration Points

### Current Usage: OperationalRiskList Component
- Located in `src/modules/data-engine/components/OperationalRiskList.tsx`
- Calls `buildRiskRecommendation()` for each vehicle record
- Displays in UI table with color-coded priority badges
- Shows recommendation text + reason (muted)

### No PII Included
- ✅ All recommendations use `vehicleId` only
- ✅ No VIN/Plaka references anywhere
- ✅ Type-safe and compliant with privacy requirements

## API Contract

```typescript
import { buildRiskRecommendation } from "@/services/recommendationEngine";
import type { RiskRecommendation, RecommendationInput } from "@/types/RiskRecommendation";

// Input is flexible - all fields optional
const recommendation = buildRiskRecommendation({
  vehicleId: "VH-...",
  trustIndex?: number,           // 0-100 or raw decimal
  reliabilityIndex?: number,     // 0-100 or raw decimal
  maintenanceDiscipline?: number, // 0-100 or raw decimal
  reasonCodes?: Array<{ code: string; ... }>,
  signals?: Array<{ code: string; ... }>,
  evidenceSourcesCount?: number
});

// Output is always fully typed
const output: RiskRecommendation = recommendation;
```

## Testing in Dev Console

```typescript
// Copy-paste into browser console to test:
import { buildRiskRecommendation } from "/src/services/recommendationEngine.ts";

// Test 1: Insurance mismatch
buildRiskRecommendation({
  vehicleId: "VH-TEST-001",
  trustIndex: 30,
  reasonCodes: [{ code: "INSURANCE_DAMAGE_INCONSISTENCY" }]
});

// Test 2: Maintenance low
buildRiskRecommendation({
  vehicleId: "VH-TEST-002",
  maintenanceDiscipline: 50
});
```

## No External Dependencies
- ✅ Uses native JavaScript (crypto.randomUUID, Date, RegExp)
- ✅ Zero npm package additions
- ✅ Vite/TypeScript compilation only
