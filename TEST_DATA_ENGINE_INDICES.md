# Data Engine Indices - Test Scenarios

## Test 1: Risk Domain with VIO Available (Primary Source)

```typescript
// Import the function
import { getDataEngineIndices } from '../services/dataEngineIndices';

// Pre-condition: VIO must exist in localStorage
// Assume vioStore.getVIO('11') returns a valid VehicleIntelligenceOutput

const result = await getDataEngineIndices({
  domain: 'risk',
  vehicleId: '11',
  vin: 'WBALZ7C5-2018-001',
  plate: '34ABC34'
});

console.log('Test 1 - VIO Source:');
console.log('Expected: buildRiskDomainIndicesFromVIO called');
console.log('Console should show: [DataEngineIndices.getIndices] domain="risk", vehicleId="11"');
console.log('Console should show: ✓ Using VIO source for 11');
console.log('Result:', result);

// Expected output:
// {
//   domain: 'risk',
//   key: 'trustIndex',      // from VIO.indexes
//   value: 75,
//   confidence: 85,
//   updatedAt: '2025-02-15T10:30:00Z',
//   meta?: { confidenceReason, reasonCodes, evidenceSources }
// }
```

## Test 2: Risk Domain without VIO (Fallback to Aggregate)

```typescript
// Import the function
import { getDataEngineIndices } from '../services/dataEngineIndices';

// Pre-condition: Clear VIO storage to force fallback
// localStorage.removeItem('lent:auto-expert:vio:v1');

const result = await getDataEngineIndices({
  domain: 'risk',
  vehicleId: '99',  // New vehicle without VIO
  vin: 'VVWZZZ3C-2017-999',
  plate: '35XYZ99'
});

console.log('Test 2 - Aggregate Fallback:');
console.log('Expected: buildRiskDomainIndices called');
console.log('Console should show: [DataEngineIndices.getIndices] domain="risk", vehicleId="99"');
console.log('Console should show: No VIO found, using aggregate fallback for 99');
console.log('Result:', result);

// Expected output (no metadata):
// {
//   domain: 'risk',
//   key: 'trustIndex',
//   value: 62,
//   confidence: 50,        // Default confidence for aggregate
//   updatedAt: '2025-02-15T11:00:00Z'
//   // meta: undefined (aggregate doesn't have metadata)
// }
```

## Test 3: Error Case - Missing Required Parameters

```typescript
// Missing vin and plate
try {
  await getDataEngineIndices({
    domain: 'risk',
    vehicleId: '22'
    // Missing vin, plate
  });
} catch (err) {
  console.log('Error caught:', err.message);
  // Expected: [DataEngineIndices] Risk domain requires: vin, plate
}
```

## Test 4: Error Case - Unsupported Domain

```typescript
try {
  await getDataEngineIndices({
    domain: 'unsupported' as any,
    vehicleId: '33',
    vin: 'VIN',
    plate: 'PLATE'
  });
} catch (err) {
  console.log('Error caught:', err.message);
  // Expected: [DataEngineIndices] Unsupported domain: unsupported
}
```

## Implementation Summary

### File Changed
- **services/dataEngineIndices.ts** - Added `getDataEngineIndices()` function

### Function Signature
```typescript
export async function getDataEngineIndices(params: {
  domain: 'risk' | 'part';
  vehicleId?: string;
  vin?: string;
  plate?: string;
}): Promise<DataEngineIndex[]>
```

### Logic Flow
1. **Risk Domain**:
   - Validates vehicleId, vin, plate are provided
   - Tries VIO first: `vioStore.getVIO(vehicleId)`
   - If VIO exists: returns `buildRiskDomainIndicesFromVIO(vio)`
   - If no VIO: falls back to `vehicleIntelligenceStore.getOrBuild(vehicleId, vin, plate)`
   - Returns `buildRiskDomainIndices(aggregate)`

2. **Part Domain**:
   - Returns empty array (placeholder, existing behavior maintained)

3. **Error Handling**:
   - Throws clear error for missing parameters
   - Throws clear error for unsupported domains
   - Logs all operations with vehicleId and source

### Console Logs
- `[DataEngineIndices.getIndices] domain="____", vehicleId="____"`
- `[DataEngineIndices] ✓ Using VIO source for ____`
- `[DataEngineIndices] No VIO found, using aggregate fallback for ____`
- `[DataEngineIndices] Error fetching risk indices for ____: ____`

### Build Status
✅ **npm run build**: **21.68s** - **PASSED** (No TypeScript errors)
