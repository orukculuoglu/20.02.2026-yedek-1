/**
 * TEST: Data Engine Indices - getDataEngineIndices Function
 * 
 * This test demonstrates using the new getDataEngineIndices function
 * to fetch risk domain indices with VIO primary source and aggregate fallback.
 * 
 * Usage:
 * 1. Copy code snippets below
 * 2. Paste into React component or browser console
 * 3. Press Enter
 */

// ============ TEST 1: Direct import from dataService ============
// For use in React components or TypeScript modules:

import { getDataEngineIndices } from '../services/dataService';

getDataEngineIndices({
  domain: 'risk',
  vehicleId: '11',
  vin: 'VIN-11',
  plate: '34ABC34'
}).then(result => {
  console.log('✓ Test 1 Result:', result);
  console.log('  Domain:', result?.[0]?.domain);
  console.log('  Count:', result?.length);
}).catch(err => {
  console.error('✗ Test 1 Error:', err.message);
});

// ============ TEST 2: Via React component ============
// Add to your React component:
/*
import { getDataEngineIndices } from '../services/dataService';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [indices, setIndices] = useState(null);
  
  useEffect(() => {
    getDataEngineIndices({
      domain: 'risk',
      vehicleId: '11',
      vin: 'VIN-11',
      plate: '34ABC34'
    })
    .then(result => {
      console.log('✓ Got indices:', result);
      setIndices(result);
    })
    .catch(err => console.error('Error:', err));
  }, []);
  
  return (
    <div>
      {indices ? (
        <pre>{JSON.stringify(indices, null, 2)}</pre>
      ) : (
        'Loading...'
      )}
    </div>
  );
}
*/

// ============ TEST 3: With VIO in localStorage ============
// Pre-condition: Ensure VIO exists in localStorage first
/*
import { saveVIO } from '../src/modules/auto-expert/intelligence/vioStore';
import { getDataEngineIndices } from '../services/dataService';

// Step 1: Create mock VIO
const mockVIO = {
  vehicleId: '11',
  vin: 'VIN-11',
  generatedAt: new Date().toISOString(),
  indexes: [
    { 
      key: 'trustIndex', 
      value: 75, 
      confidence: 85, 
      meta: { 
        confidenceReason: 'High mileage records',
        reasonCodes: ['INSURANCE_DAMAGE_MISMATCH', 'INSURANCE_CLAIM_MISMATCH']
      } 
    },
    { 
      key: 'reliabilityIndex', 
      value: 68, 
      confidence: 78, 
      meta: { reasonCodes: ['OBD_FAULTS'] } 
    },
  ]
};

// Step 2: Save to vioStore
saveVIO('11', mockVIO);

// Step 3: Now call getDataEngineIndices
const result = await getDataEngineIndices({
  domain: 'risk',
  vehicleId: '11',
  vin: 'VIN-11',
  plate: '34ABC34'
});

console.log('✓ Result with VIO source:', result);
// Expected: Uses buildRiskDomainIndicesFromVIO
// Result includes confidence + meta
// Reason codes normalized to ['INSURANCE_DAMAGE_INCONSISTENCY']
*/

// ============ TEST 4: Fallback to Aggregate ============
// Pre-condition: No VIO in localStorage
/*
import { getDataEngineIndices } from '../services/dataService';

// Clear VIO storage to force fallback
localStorage.removeItem('lent:auto-expert:vio:v1');

const result = await getDataEngineIndices({
  domain: 'risk',
  vehicleId: '99',  // New vehicle ID
  vin: 'VVWZZZ3C-2017-999',
  plate: '35XYZ99'
});

console.log('✓ Result with Aggregate fallback:', result);
// Expected: Uses buildRiskDomainIndices
// Result has numeric values, confidence defaults to 50, no metadata
*/

// ============ TEST 5: Error Cases ============
/*
import { getDataEngineIndices } from '../services/dataService';

// Missing vin
try {
  await getDataEngineIndices({
    domain: 'risk',
    vehicleId: '22',
    plate: 'PLATE'
    // Missing vin
  });
} catch (err) {
  console.log('✓ Error caught:', err.message);
  // Expected: "[DataEngineIndices] Risk domain requires: vin"
}

// Unsupported domain
try {
  await getDataEngineIndices({
    domain: 'unknown' as any,
    vehicleId: '22',
    vin: 'VIN',
    plate: 'PLATE'
  });
} catch (err) {
  console.log('✓ Error caught:', err.message);
  // Expected: "[DataEngineIndices] Unsupported domain: unknown"
}
*/

// ============ EXPECTED CONSOLE OUTPUT ============
/*
When VIO exists with duplicate reason codes:
[DataEngineIndices.getIndices] domain="risk", vehicleId="11"
[DataEngineIndices] ✓ Using VIO source for 11
✓ Test 1 Result: [
  {
    domain: 'risk',
    key: 'trustIndex',
    value: 75,
    confidence: 85,
    updatedAt: '2025-02-15T10:30:00Z',
    meta: {
      reasonCodes: ['INSURANCE_DAMAGE_INCONSISTENCY'],  // NORMALIZED!
      confidenceReason: '...'
    }
  },
  ...
]

When VIO doesn't exist (fallback):
[DataEngineIndices.getIndices] domain="risk", vehicleId="11"
[DataEngineIndices] No VIO found, using aggregate fallback for 11
✓ Test 1 Result: [
  {
    domain: 'risk',
    key: 'trustIndex',
    value: 62,
    confidence: 50,
    updatedAt: '2025-02-15T11:00:00Z'
  },
  ...
]
*/

